import aiosqlite
import os
from pathlib import Path

from .config import Config


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
                created_at      TEXT DEFAULT (datetime('now'))
            );
        """)
        await self._conn.commit()

    async def insert_run(self, run_id, suite, scenario, mode, output_dir):
        await self._conn.execute(
            "INSERT INTO verification_runs (id, suite, scenario, mode, status, output_dir, started_at) "
            "VALUES (?, ?, ?, ?, 'running', ?, datetime('now'))",
            (run_id, suite, scenario, mode, output_dir),
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


db = Database()


async def get_db():
    return db
