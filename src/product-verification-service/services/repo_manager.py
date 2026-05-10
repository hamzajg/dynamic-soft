import os
import sys
import time
import signal
import shutil
import subprocess
from pathlib import Path

from core.config import Config


class RepoManager:
    def __init__(self, workspace_dir=None):
        self.workspace_dir = workspace_dir or os.path.join(Config.OUTPUT_DIR, "repos")
        self._processes = []

    def ensure_services(self, suite_config):
        for repo_cfg in suite_config.repos:
            repo_dir = self._ensure_repo(repo_cfg)
            for svc in repo_cfg.services:
                self._setup_service(repo_dir, svc)
                self._start_service(repo_dir, svc)
        self._wait_all_ready(suite_config)

    def stop_services(self, suite_config):
        for proc in reversed(self._processes):
            try:
                if sys.platform != "win32":
                    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                else:
                    proc.terminate()
                proc.wait(timeout=10)
            except Exception:
                if proc.poll() is None:
                    if sys.platform != "win32":
                        os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
                    else:
                        proc.kill()
        self._processes = []

    def _ensure_repo(self, repo_cfg):
        repo_name = repo_cfg.url.rstrip("/").split("/")[-1].replace(".git", "")
        clone_dir = os.path.join(self.workspace_dir, repo_name)

        if os.path.exists(os.path.join(clone_dir, ".git")):
            subprocess.run(
                ["git", "-C", clone_dir, "pull"],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30,
            )
        else:
            if os.path.exists(clone_dir):
                shutil.rmtree(clone_dir)
            os.makedirs(self.workspace_dir, exist_ok=True)
            subprocess.run(
                ["git", "clone", repo_cfg.url, clone_dir],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
            )
        return clone_dir

    def _setup_service(self, repo_dir, svc):
        svc_dir = os.path.join(repo_dir, svc.path) if svc.path != "." else repo_dir
        if not svc.setup:
            return
        subprocess.run(
            svc.setup.split(),
            cwd=svc_dir, check=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
        )

    def _start_service(self, repo_dir, svc):
        if not svc.start:
            return
        svc_dir = os.path.join(repo_dir, svc.path) if svc.path != "." else repo_dir
        env = os.environ.copy()
        if svc.port:
            env["PORT"] = str(svc.port)
        env["BROWSER"] = "none"

        proc = subprocess.Popen(
            svc.start.split(),
            cwd=svc_dir, env=env,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            preexec_fn=os.setsid if sys.platform != "win32" else None,
        )
        self._processes.append(proc)

    def _wait_all_ready(self, suite_config, timeout=90):
        import httpx
        for repo_cfg in suite_config.repos:
            for svc in repo_cfg.services:
                if not svc.port:
                    continue
                url = f"http://localhost:{svc.port}/"
                start = time.time()
                while time.time() - start < timeout:
                    try:
                        r = httpx.get(url, timeout=5)
                        if r.status_code < 500:
                            break
                    except Exception:
                        pass
                    time.sleep(1)
