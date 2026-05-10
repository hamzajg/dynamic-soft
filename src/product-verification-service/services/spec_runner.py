import os
import re
import subprocess
import uuid
from datetime import datetime
from pathlib import Path

from core.config import Config
from core.database import db


class SpecRunner:
    def __init__(self, repo_manager, ws_broadcast=None):
        self.repo_manager = repo_manager
        self.ws_broadcast = ws_broadcast or (lambda run_id, msg: None)
        self.service_dir = Path(__file__).parent.parent

    async def run(self, suite_config, scenario, mode):
        run_id = uuid.uuid4().hex[:12]
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        suite_dir = Path(Config.OUTPUT_DIR) / suite_config.name
        suite_dir.mkdir(parents=True, exist_ok=True)
        output_dir = suite_dir / f"{scenario}_{ts}"
        output_dir.mkdir(parents=True, exist_ok=True)

        await db.insert_run(run_id, suite_config.name, scenario, mode, str(output_dir))

        log_path = output_dir / "test.log"

        try:
            self.repo_manager.ensure_services(suite_config)

            env = os.environ.copy()
            env["TEST_MODE"] = mode
            env["OUTPUT_DIR"] = str(output_dir)
            env["RECORD_SCREEN"] = "true" if mode == "validation" else "false"
            env["HEADLESS"] = "true"

            pytest_args = [
                sys.executable, "-m", "pytest",
                str(self.service_dir / "tests" / f"{scenario}.py"),
                "-v",
            ]

            proc = subprocess.Popen(
                pytest_args,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                cwd=str(self.service_dir),
            )

            passed = failed = total = 0
            with open(log_path, "w") as logfile:
                for line in iter(proc.stdout.readline, b""):
                    decoded = line.decode("utf-8", errors="replace")
                    logfile.write(decoded)
                    logfile.flush()
                    self.ws_broadcast(run_id, decoded)

            proc.wait()
            duration_ms = int((datetime.now() - datetime.strptime(ts, "%Y%m%d_%H%M%S")).total_seconds() * 1000)

            self.repo_manager.stop_services(suite_config)

            passed, failed, total = self._parse_results(log_path)
            status = "passed" if proc.returncode == 0 and failed == 0 else "failed"

            report_path = None
            if mode != "default" and Config.ANALYSIS_ENABLED:
                report_path = await self._run_analysis(log_path, output_dir, mode)

            await db.finish_run(
                run_id, status, passed, failed, total,
                duration_ms, report_path=report_path,
            )

        except Exception as e:
            await db.finish_run(
                run_id, "error", 0, 0, 0, 0,
                error_message=str(e),
            )
            raise

        return run_id

    async def _run_analysis(self, log_path, output_dir, mode):
        import sys as _sys
        _sys.path.insert(0, str(self.service_dir))

        report_path = output_dir / "analysis.md"

        if mode == "discovery":
            from analysis.pipeline import run_discovery
            frames = self._collect_screenshots(output_dir)
            result = run_discovery(
                frames=frames, log_path=str(log_path),
                output_path=str(report_path),
            )
        else:
            from analysis.pipeline import run_analysis
            video = self._find_video(output_dir)
            inline_frames = None
            if video:
                video_path = video
            else:
                video_path = ""
                frames = self._collect_screenshots(output_dir)
                if frames:
                    inline_frames = frames
            result = run_analysis(
                video_path=video_path, log_path=str(log_path),
                output_path=str(report_path), mode=mode,
                inline_frames=inline_frames,
            )
        return str(report_path) if result else None

    def _find_video(self, output_dir):
        for f in Path(output_dir).iterdir():
            if f.suffix == ".webm":
                return str(f)
        return None

    def _collect_screenshots(self, output_dir):
        from analysis.models import Frame
        frames = []
        for f in sorted(Path(output_dir).iterdir()):
            if f.suffix == ".png" and f.name.startswith("screenshot_"):
                frames.append(Frame(
                    path=str(f), timestamp_seconds=0.0,
                    context=f"URL: | Label: {f.stem}",
                ))
        return frames

    def _parse_results(self, log_path):
        passed = failed = total = 0
        pattern = re.compile(r"(PASSED|FAILED|ERROR)")
        try:
            with open(log_path) as f:
                for line in f:
                    m = pattern.search(line)
                    if m:
                        status = m.group(1)
                        total += 1
                        if status == "PASSED":
                            passed += 1
                        else:
                            failed += 1
        except FileNotFoundError:
            pass
        return passed, failed, total
