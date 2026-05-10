import os
import socket
import subprocess
import tempfile
import time
from datetime import datetime

from .analyzer import VideoAnalyzer
from .models import AnalysisResult
from .config import AnalysisConfig
from .extract_frames import get_video_duration


class OpencodeAnalyzer(VideoAnalyzer):

    def __init__(self, model=None, extra_flags=None):
        self.model = model or AnalysisConfig.OPENCODE_MODEL
        extra = extra_flags or []
        if AnalysisConfig.OPENCODE_FLAGS:
            extra.extend(AnalysisConfig.OPENCODE_FLAGS.split())
        self.extra_flags = extra

    def analyze(self, video_path, log_path, frames, log_summary=None, frame_descriptions=None):
        log_summary = log_summary or self._summarize_log(log_path)
        duration = get_video_duration(video_path)
        prompt = self._build_prompt(log_summary, duration, frame_descriptions)

        port = self._find_free_port()
        server_proc = self._start_server(port)
        try:
            result = self._call_opencode(prompt, port, log_path)
        finally:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_proc.kill()

        err = (result.stderr or "").strip()
        has_payment_error = "payment" in err.lower() or "billing" in err.lower()
        if result.returncode != 0 or has_payment_error:
            return self._make_result(
                log_summary, frames, video_path, log_path,
                overall=f"ERROR: opencode-cli exited {result.returncode}: {err[:500]}",
                status="ERROR",
            )

        analysis_text = result.stdout.strip()
        if not analysis_text:
            analysis_text = "(empty response)"

        errors = self._extract_errors(log_summary)
        return self._make_result(
            log_summary, frames, video_path, log_path,
            overall=analysis_text,
            status="FAIL" if errors else "PASS",
            errors=errors,
            raw=analysis_text,
        )

    def _start_server(self, port):
        proc = subprocess.Popen(
            ["opencode-cli", "serve", "--port", str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self._wait_for_server(port)
        return proc

    def _wait_for_server(self, port, timeout=20):
        deadline = time.time() + timeout
        while time.time() < deadline:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                if s.connect_ex(("127.0.0.1", port)) == 0:
                    time.sleep(1)
                    return
            time.sleep(0.5)
        raise TimeoutError(f"opencode server on port {port} did not start within {timeout}s")

    def _call_opencode(self, prompt, port, log_path):
        prompt_file = tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", delete=False,
        )
        prompt_file.write(prompt)
        prompt_path = prompt_file.name
        prompt_file.close()

        cmd = [
            "opencode-cli", "run",
            "Analyze the attached prompt and files following its instructions.",
        ]
        cmd.extend(["--attach", f"http://127.0.0.1:{port}"])
        cmd.extend(["--dangerously-skip-permissions"])
        cmd.extend(["--model", self.model])
        for flag in self.extra_flags:
            if flag != "--dangerously-skip-permissions":
                cmd.append(flag)
        cmd.extend(["-f", prompt_path])
        if log_path and os.path.exists(log_path):
            cmd.extend(["-f", log_path])

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=300,
            )
        except subprocess.TimeoutExpired:
            result = subprocess.CompletedProcess(cmd, 1, "", "TIMEOUT")
        except FileNotFoundError:
            result = subprocess.CompletedProcess(cmd, 1, "", "opencode-cli not found on PATH")
        finally:
            try:
                os.unlink(prompt_path)
            except OSError:
                pass

        return result

    def _find_free_port(self):
        for port in range(4099, 4199):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", port)) != 0:
                    return port
        return 0

    def _summarize_log(self, log_path):
        if not os.path.exists(log_path):
            return "(log file not found)"
        kw = ["ACTION:", "NAVIGATION:", "CLICK:", "ASSERTION", "ERROR:", "COMMAND:"]
        lines = []
        with open(log_path) as f:
            for line in f:
                s = line.strip()
                if any(k in s for k in kw):
                    lines.append(s)
        return "\n".join(lines[-120:]) if lines else "(empty log)"

    def _build_prompt(self, log_summary, duration, frame_descriptions=None):
        desc_section = ""
        if frame_descriptions:
            desc_section = "## Frame Descriptions\n" + "\n\n".join(frame_descriptions) + "\n\n"
        return (
            f"You are an e2e test analyst. Analyze this test recording.\n\n"
            f"Test duration: {duration:.1f}s\n"
            f"Frames analyzed: {len(frame_descriptions) if frame_descriptions else 0}\n\n"
            f"{desc_section}"
            f"## Log Summary\n{log_summary}\n\n"
            f"Instructions:\n"
            f"1. Review the frame descriptions (text descriptions of what the UI showed).\n"
            f"2. Cross-reference frame content with log actions.\n"
            f"3. Identify any errors, failures, or UI issues.\n"
            f"4. Provide a brief overall assessment (3-5 sentences).\n"
            f"5. List actionable recommendations if issues were found."
        )

    def _extract_errors(self, log_summary):
        return [
            line.strip()
            for line in log_summary.split("\n")
            if "[FAIL]" in line or line.startswith("ERROR:")
        ]

    def _make_result(self, log_summary, frames, video_path, log_path,
                     overall="", status="UNKNOWN", errors=None, raw=""):
        name = os.path.splitext(os.path.basename(video_path))[0]
        parts = name.split("_", 2)
        return AnalysisResult(
            test_suite=parts[0] if parts else "",
            test_case=name,
            test_timestamp=datetime.now().strftime("%Y%m%d_%H%M%S"),
            duration_seconds=get_video_duration(video_path),
            pass_fail=status,
            log_summary=log_summary,
            frames_analyzed=len(frames),
            errors_found=errors or [],
            overall_assessment=overall,
            raw_ai_output=raw,
            analyzer_used="opencode",
        )
