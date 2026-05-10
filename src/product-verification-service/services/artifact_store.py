import os
import json
from pathlib import Path

from core.config import Config


class ArtifactStore:
    def __init__(self):
        self.output_dir = Path(Config.OUTPUT_DIR)

    def list_runs_dir(self, suite=None):
        if suite:
            suite_dir = self.output_dir / suite
            if not suite_dir.exists():
                return []
            return sorted(
                [d.name for d in suite_dir.iterdir() if d.is_dir()],
                reverse=True,
            )
        runs = []
        for suite_dir in self.output_dir.iterdir():
            if suite_dir.is_dir():
                for run_dir in suite_dir.iterdir():
                    if run_dir.is_dir():
                        runs.append((suite_dir.name, run_dir.name))
        return sorted(runs, key=lambda x: x[1], reverse=True)

    def run_dir(self, suite, scenario_ts):
        return self.output_dir / suite / scenario_ts

    def list_files(self, suite, scenario_ts, subdir=None):
        base = self.run_dir(suite, scenario_ts)
        if subdir:
            base = base / subdir
        if not base.exists():
            return []
        return [f.name for f in base.iterdir() if f.is_file()]

    def read_file(self, suite, scenario_ts, filename):
        path = self.run_dir(suite, scenario_ts) / filename
        if not path.exists():
            return None
        return path.read_bytes()

    def read_text(self, suite, scenario_ts, filename):
        path = self.run_dir(suite, scenario_ts) / filename
        if not path.exists():
            return None
        return path.read_text()

    def screenshot_path(self, suite, scenario_ts, filename):
        return str(self.run_dir(suite, scenario_ts) / filename)

    def video_path(self, suite, scenario_ts):
        for f in self.run_dir(suite, scenario_ts).iterdir():
            if f.suffix == ".webm":
                return str(f)
        return None

    def frame_path(self, suite, scenario_ts, filename):
        return str(self.run_dir(suite, scenario_ts) / "frames" / filename)
