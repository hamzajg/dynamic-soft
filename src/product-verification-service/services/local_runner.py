import os
import json
import uuid
import asyncio
import shutil
import time
from pathlib import Path
from typing import Dict, List, Optional, Callable
from datetime import datetime
from models.local_project import TestFramework
from core.config import Config
from core.database import db
from services import result_parser


class LocalRunner:
    """Runs tests using the project's native test runner."""

    def __init__(self, ws_broadcast: Optional[Callable] = None):
        self.ws_broadcast = ws_broadcast or (lambda run_id, msg: None)

    async def run(
        self,
        project_path: str,
        framework: TestFramework,
        test_files: Optional[List[str]] = None,
        mode: str = "default",
        env_vars: Optional[Dict[str, str]] = None,
        run_id: Optional[str] = None
    ) -> dict:
        run_id = run_id or uuid.uuid4().hex[:12]
        path = Path(project_path).resolve()
        project_name = path.name

        if not test_files:
            test_files = []

        # Create a parent output dir for this run
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_output = Path(Config.OUTPUT_DIR) / "local" / f"{project_name}_{ts}_{run_id}"
        base_output.mkdir(parents=True, exist_ok=True)

        # Update the queued run with actual output_dir and set running status
        await db.update_run(
            run_id=run_id,
            output_dir=str(base_output),
            status="running",
            started_at=datetime.now().isoformat()
        )

        test_results = []

        try:
            # Determine which tests to run
            if test_files:
                targets = test_files
            else:
                targets = [None]

            for test_file in targets:
                result = await self._run_single(
                    run_id=run_id,
                    base_output=base_output,
                    project_path=path,
                    project_name=project_name,
                    framework=framework,
                    test_file=test_file,
                    mode=mode,
                    env_vars=env_vars
                )
                test_results.append(result)

            # After all tests, run analysis if mode != default
            if mode != "default" and Config.ANALYSIS_ENABLED:
                await self._run_analysis(path, base_output, project_name, mode)

            # Aggregate results
            total_passed = sum(r.get("passed", 0) for r in test_results)
            total_failed = sum(r.get("failed", 0) for r in test_results)
            total_total = sum(r.get("total", 0) for r in test_results)
            total_duration = sum(r.get("duration_ms", 0) for r in test_results)
            any_failed = any(r.get("status") == "failed" for r in test_results)
            any_error = any(r.get("status") == "error" for r in test_results)

            overall_status = "error" if any_error else ("failed" if any_failed else "passed")

            await db.update_run(
                run_id=run_id,
                status=overall_status,
                passed=total_passed,
                failed=total_failed,
                total=total_total,
                duration_ms=total_duration
            )

            return {
                "run_id": run_id,
                "status": overall_status,
                "test_results": test_results,
                "passed": total_passed,
                "failed": total_failed,
                "total": total_total,
                "duration_ms": total_duration
            }

        except Exception as e:
            await db.update_run(
                run_id=run_id,
                status="error",
                error_message=str(e)
            )
            return {
                "run_id": run_id,
                "status": "error",
                "error": str(e),
                "test_results": test_results
            }

    async def _run_single(
        self,
        run_id: str,
        base_output: Path,
        project_path: Path,
        project_name: str,
        framework: TestFramework,
        test_file: Optional[str],
        mode: str,
        env_vars: Optional[Dict[str, str]]
    ) -> dict:
        test_label = test_file if test_file else "all"
        safe_label = test_label.replace("/", "_").replace("\\", "_").replace(".", "_")
        output_dir = base_output / safe_label
        output_dir.mkdir(parents=True, exist_ok=True)

        log_path = output_dir / "test.log"

        try:
            cmd, env = self._build_command(project_path, framework, test_file, output_dir, mode, env_vars)

            proc = await asyncio.create_subprocess_exec(
                *cmd,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=str(project_path),
            )

            with open(log_path, "w") as log_file:
                async for line in proc.stdout:
                    line_str = line.decode("utf-8", errors="replace") if isinstance(line, bytes) else line
                    log_file.write(line_str)
                    log_file.flush()
                    await self.ws_broadcast(run_id, json.dumps({"type": "log", "test": test_label, "line": line_str}))

            await proc.wait()
            passed = proc.returncode == 0
            status = "passed" if passed else "failed"

            self._collect_project_artifacts(project_path, base_output)
            result_parser.write_results_json(log_path, output_dir, framework)
            results = result_parser.parse_results(output_dir, framework, passed)
            await result_parser.store_test_results(run_id, test_label, status, results, str(output_dir))

            return {
                "test_file": test_label,
                "status": status,
                "passed": results.get("passed", 0),
                "failed": results.get("failed", 0),
                "total": results.get("total", 0),
                "duration_ms": results.get("duration_ms", 0)
            }

        except Exception as e:
            await db.insert_test_result(
                run_id=run_id,
                test_file=test_label,
                status="error",
                error_message=str(e)
            )
            return {
                "test_file": test_label,
                "status": "error",
                "error": str(e)
            }

    def _collect_project_artifacts(self, project_path: Path, base_output: Path):
        """Copy analysis artifacts from the project's test-results into the service output dir."""
        for candidate in [project_path / "e2e" / "test-results", project_path / "test-results"]:
            if candidate.exists() and candidate.is_dir():
                src_dir = candidate
                break
        else:
            return

        now = time.time()
        for item in src_dir.iterdir():
            if item.is_dir():
                for f in item.rglob("*"):
                    if f.is_file() and f.stat().st_mtime > now - 120:
                        rel = f.relative_to(src_dir)
                        dest = base_output / rel
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(f, dest)

    def _find_project_artifacts(self, project_path: Path, pattern: str) -> list:
        """Find artifacts in the project's test-results directory."""
        for candidate in [project_path / "e2e" / "test-results", project_path / "test-results"]:
            if candidate.exists():
                return sorted(candidate.rglob(pattern))
        return []

    async def _run_analysis(self, project_path: Path, base_output: Path, project_name: str, mode: str):
        """Run analysis pipeline on test output."""
        try:
            from analysis.pipeline import run_analysis, run_discovery

            # Collect video — check both service output and project test-results
            video_path = None
            for f in list(base_output.rglob("*.webm")) + self._find_project_artifacts(project_path, "*.webm"):
                video_path = f
                break

            # Collect screenshots
            screenshots = sorted(
                list(base_output.rglob("screenshot_*.png")) +
                self._find_project_artifacts(project_path, "screenshot_*.png")
            )

            log_path = None
            for f in list(base_output.rglob("test.log")) + self._find_project_artifacts(project_path, "test.log"):
                log_path = f
                break

            if mode == "discovery":
                if screenshots:
                    discovery_frames = []
                    for sp in screenshots:
                        from analysis.models import Frame
                        discovery_frames.append(Frame(path=str(sp), timestamp_seconds=0.0, context=""))
                    await asyncio.to_thread(
                        run_discovery, discovery_frames, str(log_path) if log_path else "",
                        str(base_output), ""
                    )
            elif mode == "validation":
                if video_path and video_path.exists():
                    await asyncio.to_thread(
                        run_analysis, str(video_path), str(log_path) if log_path else "",
                        str(base_output), project_name, mode, None
                    )
                elif screenshots:
                    from analysis.models import Frame
                    inline = [Frame(path=str(sp), timestamp_seconds=float(i), context="")
                              for i, sp in enumerate(screenshots)]
                    await asyncio.to_thread(
                        run_analysis, "", str(log_path) if log_path else "",
                        str(base_output), project_name, mode, None, inline
                    )
        except Exception:
            pass

    def _build_command(
        self,
        path: Path,
        framework: TestFramework,
        test_file: Optional[str],
        output_dir: Path,
        mode: str,
        env_vars: Optional[Dict[str, str]] = None
    ) -> tuple:
        """Build the test command based on framework."""
        env = os.environ.copy()
        env["OUTPUT_DIR"] = str(output_dir)
        env["TEST_MODE"] = mode
        env["CI"] = "true"
        env["ANALYSIS_ENABLED"] = "false"

        if mode == "validation":
            env["RECORD_SCREEN"] = "true"
        elif mode == "discovery":
            env["CAPTURE_SCREENSHOTS"] = "true"

        # Apply custom env vars
        if env_vars:
            for k, v in env_vars.items():
                env[k] = v

        abs_test_file = None
        if test_file and test_file != "all":
            if os.path.isabs(test_file):
                abs_test_file = test_file
            else:
                abs_test_file = str(path / test_file)

        if framework == TestFramework.PLAYWRIGHT:
            # Detect Python-based Playwright tests (pytest + pytest-playwright)
            is_python = abs_test_file and abs_test_file.endswith('.py')
            has_pytest_ini = (path / "pytest.ini").exists() or (path / "e2e" / "pytest.ini").exists()
            if is_python or has_pytest_ini:
                pytest_path = str(path / "e2e" / "venv" / "bin" / "pytest")
                if not os.path.exists(pytest_path):
                    pytest_path = "pytest"
                cmd = [pytest_path]
                if abs_test_file:
                    cmd.append(abs_test_file)
                cmd.extend(["-v", "--tb=short"])
            else:
                cmd = ["npx", "playwright", "test", "--reporter=json"]
                if abs_test_file:
                    cmd.append(abs_test_file)
                cmd.extend(["--output", str(output_dir / "playwright-output")])

        elif framework == TestFramework.CYPRESS:
            cmd = ["npx", "cypress", "run", "--reporter", "json"]
            if abs_test_file:
                cmd.extend(["--spec", abs_test_file])

        elif framework == TestFramework.VITEST:
            cmd = ["npx", "vitest", "run", "--reporter", "json"]
            if abs_test_file:
                cmd.append(abs_test_file)

        elif framework == TestFramework.JEST:
            cmd = ["npx", "jest", "--json"]
            if abs_test_file:
                cmd.append(abs_test_file)
        else:
            is_python = abs_test_file and abs_test_file.endswith('.py')
            if is_python:
                cmd = ["pytest"]
                if abs_test_file:
                    cmd.append(abs_test_file)
                cmd.extend(["-v", "--tb=short"])
            else:
                cmd = ["npm", "test"]

        return cmd, env


