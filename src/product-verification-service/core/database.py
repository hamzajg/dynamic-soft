import aiosqlite
import os
from pathlib import Path

from core.config import Config


class Database:
    def __init__(self, db_path=None):
        self.db_path = db_path or Config.DATABASE_PATH
        self._conn = None

    async def connect(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._conn = await aiosqlite.connect(self.db_path)
        self._conn.row_factory = aiosqlite.Row
        await self._migrate()

    async def disconnect(self):
        if self._conn:
            await self._conn.close()

    async def _migrate(self):
        await self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS verification_runs (
                id              TEXT PRIMARY KEY,
                suite           TEXT NOT NULL,
                scenario        TEXT NOT NULL,
                mode            TEXT NOT NULL DEFAULT 'default',
                status          TEXT NOT NULL DEFAULT 'queued',
                passed          INTEGER DEFAULT 0,
                failed          INTEGER DEFAULT 0,
                total           INTEGER DEFAULT 0,
                duration_ms     INTEGER DEFAULT 0,
                output_dir      TEXT NOT NULL,
                report_path     TEXT,
                started_at      TEXT,
                finished_at     TEXT,
                error_message   TEXT,
                command         TEXT,
                created_at      TEXT DEFAULT (datetime('now'))
            );
            
            CREATE TABLE IF NOT EXISTS local_projects (
                id              TEXT PRIMARY KEY,
                name            TEXT NOT NULL,
                path            TEXT NOT NULL UNIQUE,
                framework       TEXT NOT NULL,
                test_files      TEXT,  -- JSON array
                test_count      INTEGER DEFAULT 0,
                created_at      TEXT DEFAULT (datetime('now')),
                last_synced_at  TEXT
            );

            CREATE TABLE IF NOT EXISTS run_tests (
                run_id          TEXT NOT NULL,
                test_file       TEXT NOT NULL,
                status          TEXT NOT NULL DEFAULT 'queued',
                passed          INTEGER DEFAULT 0,
                failed          INTEGER DEFAULT 0,
                total           INTEGER DEFAULT 0,
                duration_ms     INTEGER DEFAULT 0,
                output_dir      TEXT,
                PRIMARY KEY (run_id, test_file)
            );

            CREATE TABLE IF NOT EXISTS frame_annotations (
                id              TEXT PRIMARY KEY,
                run_id          TEXT NOT NULL,
                frame_name      TEXT NOT NULL,
                shapes          TEXT DEFAULT '[]',
                description     TEXT DEFAULT '',
                created_at      TEXT DEFAULT (datetime('now')),
                updated_at      TEXT DEFAULT (datetime('now'))
            );
        """)

        # Migration: add command column to existing tables
        try:
            await self._conn.execute("ALTER TABLE verification_runs ADD COLUMN command TEXT")
        except Exception:
            pass  # column already exists

        await self._conn.commit()

    async def insert_run(self, run_id, suite, scenario, mode, output_dir, command=None):
        await self._conn.execute(
            "INSERT INTO verification_runs (id, suite, scenario, mode, status, output_dir, started_at, command) "
            "VALUES (?, ?, ?, ?, 'running', ?, datetime('now'), ?)",
            (run_id, suite, scenario, mode, output_dir, command),
        )
        await self._conn.commit()

    async def finish_run(self, run_id, status, passed, failed, total, duration_ms, report_path=None, error_message=None):
        await self._conn.execute(
            "UPDATE verification_runs SET status=?, passed=?, failed=?, total=?, "
            "duration_ms=?, report_path=?, error_message=?, finished_at=datetime('now') "
            "WHERE id=?",
            (status, passed, failed, total, duration_ms, report_path, error_message, run_id),
        )
        await self._conn.commit()

    async def get_run(self, run_id):
        cur = await self._conn.execute("SELECT * FROM verification_runs WHERE id=?", (run_id,))
        row = await cur.fetchone()
        return dict(row) if row else None

    async def list_runs(self, suite=None, mode=None, status=None, limit=50, offset=0):
        query = "SELECT * FROM verification_runs WHERE 1=1"
        params = []
        if suite:
            query += " AND suite=?"
            params.append(suite)
        if mode:
            query += " AND mode=?"
            params.append(mode)
        if status:
            query += " AND status=?"
            params.append(status)
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        cur = await self._conn.execute(query, params)
        rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def delete_run(self, run_id):
        await self._conn.execute("DELETE FROM verification_runs WHERE id=?", (run_id,))
        await self._conn.commit()

    async def update_run(self, run_id, **kwargs):
        fields = []
        values = []
        for key, value in kwargs.items():
            fields.append(f"{key}=?")
            values.append(value)
        values.append(run_id)
        query = f"UPDATE verification_runs SET {', '.join(fields)} WHERE id=?"
        await self._conn.execute(query, values)
        await self._conn.commit()

    # Local Projects
    async def insert_local_project(self, project_data):
        import json
        await self._conn.execute(
            """INSERT INTO local_projects (id, name, path, framework, test_files, test_count, created_at, last_synced_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                project_data["id"],
                project_data["name"],
                project_data["path"],
                project_data["framework"],
                json.dumps([f.model_dump() if hasattr(f, 'model_dump') else f for f in project_data.get("test_files", [])]),
                project_data["test_count"],
                project_data["created_at"],
                project_data.get("last_synced_at")
            )
        )
        await self._conn.commit()

    async def get_local_project(self, project_id):
        cur = await self._conn.execute("SELECT * FROM local_projects WHERE id=?", (project_id,))
        row = await cur.fetchone()
        if row:
            return self._parse_project_row(row)
        return None

    async def list_local_projects(self):
        cur = await self._conn.execute("SELECT * FROM local_projects ORDER BY created_at DESC")
        rows = await cur.fetchall()
        return [self._parse_project_row(r) for r in rows]

    async def update_local_project(self, project_id, project_data):
        import json
        await self._conn.execute(
            """UPDATE local_projects SET framework=?, test_files=?, test_count=?, last_synced_at=?
               WHERE id=?""",
            (
                project_data["framework"],
                json.dumps([f.model_dump() if hasattr(f, 'model_dump') else f for f in project_data.get("test_files", [])]),
                project_data["test_count"],
                project_data.get("last_synced_at"),
                project_id
            )
        )
        await self._conn.commit()

    async def delete_local_project(self, project_id):
        await self._conn.execute("DELETE FROM local_projects WHERE id=?", (project_id,))
        await self._conn.commit()

    def _parse_project_row(self, row):
        import json
        data = dict(row)
        if data.get("test_files"):
            try:
                data["test_files"] = json.loads(data["test_files"])
            except json.JSONDecodeError:
                data["test_files"] = []
        return data

    # Per-test results
    async def insert_test_result(self, run_id, test_file, status, passed=0, failed=0, total=0, duration_ms=0, output_dir=""):
        await self._conn.execute(
            """INSERT OR REPLACE INTO run_tests (run_id, test_file, status, passed, failed, total, duration_ms, output_dir)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (run_id, test_file, status, passed, failed, total, duration_ms, output_dir),
        )
        await self._conn.commit()

    async def get_test_results(self, run_id):
        cur = await self._conn.execute(
            "SELECT * FROM run_tests WHERE run_id=? ORDER BY test_file", (run_id,)
        )
        rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def delete_test_results(self, run_id):
        await self._conn.execute("DELETE FROM run_tests WHERE run_id=?", (run_id,))
        await self._conn.commit()

    # Frame annotations
    async def save_annotation(self, ann_id, run_id, frame_name, shapes, description):
        import json
        await self._conn.execute(
            """INSERT OR REPLACE INTO frame_annotations (id, run_id, frame_name, shapes, description, updated_at)
               VALUES (?, ?, ?, ?, ?, datetime('now'))""",
            (ann_id, run_id, frame_name, json.dumps(shapes), description),
        )
        await self._conn.commit()

    async def get_annotation(self, run_id, frame_name):
        cur = await self._conn.execute(
            "SELECT * FROM frame_annotations WHERE run_id=? AND frame_name=?", (run_id, frame_name)
        )
        row = await cur.fetchone()
        if row:
            data = dict(row)
            import json
            if data.get("shapes"):
                try:
                    data["shapes"] = json.loads(data["shapes"])
                except json.JSONDecodeError:
                    data["shapes"] = []
            return data
        return None

    async def list_annotations(self, run_id):
        cur = await self._conn.execute(
            "SELECT * FROM frame_annotations WHERE run_id=? ORDER BY frame_name", (run_id,)
        )
        rows = await cur.fetchall()
        result = []
        import json
        for r in rows:
            data = dict(r)
            if data.get("shapes"):
                try:
                    data["shapes"] = json.loads(data["shapes"])
                except json.JSONDecodeError:
                    data["shapes"] = []
            result.append(data)
        return result


db = Database()


async def get_db():
    return db
