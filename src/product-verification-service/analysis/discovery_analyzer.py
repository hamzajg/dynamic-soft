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


DISCOVERY_CATEGORIES = [
    "UX Improvements",
    "UI Representation Bugs",
    "Optimization Opportunities",
    "Consistency Issues",
    "Alternative Suggestions",
]


class DiscoveryAnalyzer(VideoAnalyzer):

    def __init__(self, model=None, extra_flags=None, ux_model=None):
        self.model = model or AnalysisConfig.OPENCODE_MODEL
        self.ux_model = ux_model or AnalysisConfig.UX_MODEL or None
        extra = extra_flags or []
        if AnalysisConfig.OPENCODE_FLAGS:
            extra.extend(AnalysisConfig.OPENCODE_FLAGS.split())
        self.extra_flags = extra

    def analyze(self, video_path, log_path, frames, log_summary=None, frame_descriptions=None, spec_context=""):
        log_summary = log_summary or self._summarize_log(log_path)
        duration = get_video_duration(video_path)

        # Stage 1: Main discovery analysis
        main_result = self._run_discovery(log_summary, duration, frame_descriptions, spec_context, log_path)
        if not main_result:
            return self._make_result(
                log_summary, frames, video_path, log_path,
                overall="ERROR: Discovery analysis returned no output",
                status="ERROR",
            )

        # Stage 2: Delegated UX deep-dive if ux_model is configured
        ux_deep = ""
        if self.ux_model and main_result:
            ux_deep = self._delegate_ux(log_summary, duration, frame_descriptions, spec_context, log_path)

        combined = main_result
        if ux_deep:
            combined += f"\n\n## UX Deep-Dive (delegated to {self.ux_model})\n{ux_deep}"

        errors = self._extract_errors(log_summary)
        return self._make_result(
            log_summary, frames, video_path, log_path,
            overall=combined,
            status="PASS",
            errors=errors,
            raw=combined,
        )

    def _run_discovery(self, log_summary, duration, frame_descriptions, spec_context, log_path):
        prompt = self._build_discovery_prompt(log_summary, duration, frame_descriptions, spec_context)
        port = self._find_free_port()
        server_proc = self._start_server(port)
        try:
            result = self._call_opencode(prompt, port, log_path, self.model)
        finally:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_proc.kill()
        if result.returncode != 0:
            return None
        return result.stdout.strip()

    def _delegate_ux(self, log_summary, duration, frame_descriptions, spec_context, log_path):
        prompt = self._build_ux_prompt(log_summary, duration, frame_descriptions, spec_context)
        port = self._find_free_port()
        server_proc = self._start_server(port)
        try:
            result = self._call_opencode(prompt, port, log_path, self.ux_model)
        finally:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_proc.kill()
        if result.returncode != 0:
            return ""
        return result.stdout.strip()

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

    def _call_opencode(self, prompt, port, log_path, model):
        prompt_file = tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", delete=False,
        )
        prompt_file.write(prompt)
        prompt_path = prompt_file.name
        prompt_file.close()

        cmd = [
            "opencode-cli", "run",
            "Analyze the attached prompt following its instructions.",
        ]
        cmd.extend(["--attach", f"http://127.0.0.1:{port}"])
        cmd.extend(["--dangerously-skip-permissions"])
        cmd.extend(["--model", model])
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
        for port in range(4199, 4299):
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

    def _build_discovery_prompt(self, log_summary, duration, frame_descriptions, spec_context):
        desc_section = ""
        if frame_descriptions:
            desc_section = "## Frame Descriptions\n" + "\n\n".join(frame_descriptions) + "\n\n"
        spec_section = ""
        if spec_context:
            spec_section = f"## Test Specification\n{spec_context}\n\n"
        return (
            f"You are a UI/UX discovery analyst. Review this test recording "
            f"and identify insights beyond pass/fail validation.\n\n"
            f"Test duration: {duration:.1f}s\n"
            f"Frames analyzed: {len(frame_descriptions) if frame_descriptions else 0}\n\n"
            f"{spec_section}"
            f"{desc_section}"
            f"## Log Summary\n{log_summary}\n\n"
            f"Analyze the following dimensions and provide findings for each:\n\n"
            f"### UX Improvements\n"
            f"- Navigation flow, information architecture, user clarity\n"
            f"- Accessibility, affordances, interaction patterns\n"
            f"- Suggestions to improve user experience\n\n"
            f"### UI Representation Bugs\n"
            f"- Visual inconsistencies, alignment, spacing, typography\n"
            f"- Rendering issues, missing elements, layout breaks\n"
            f"- Responsive or cross-browser concerns visible in screenshots\n\n"
            f"### Optimization Opportunities\n"
            f"- Page load indicators, perceived performance\n"
            f"- Content structure, asset loading patterns\n"
            f"- Code or architecture improvements inferred from behavior\n\n"
            f"### Consistency Issues\n"
            f"- Design language consistency across pages\n"
            f"- Naming, terminology, and behavior consistency\n"
            f"- Navigation and interaction pattern consistency\n\n"
            f"### Alternative Suggestions\n"
            f"- How could this UI be improved?\n"
            f"- What patterns from modern web apps could apply?\n"
            f"- Feature or flow suggestions based on observed content\n\n"
            f"Format your response with clear section headers. "
            f"Be specific and reference frame timestamps and log lines where applicable."
        )

    def _build_ux_prompt(self, log_summary, duration, frame_descriptions, spec_context):
        desc_section = ""
        if frame_descriptions:
            desc_section = "## Frame Descriptions\n" + "\n\n".join(frame_descriptions) + "\n\n"
        spec_section = ""
        if spec_context:
            spec_section = f"## Test Specification\n{spec_context}\n\n"
        return (
            f"You are a senior product design consultant. Review this application's "
            f"screenshots and provide UX-focused recommendations.\n\n"
            f"Test duration: {duration:.1f}s\n"
            f"Frames analyzed: {len(frame_descriptions) if frame_descriptions else 0}\n\n"
            f"{spec_section}"
            f"{desc_section}"
            f"## Log Summary\n{log_summary}\n\n"
            f"Focus exclusively on:\n"
            f"1. Information architecture and navigation improvements\n"
            f"2. Conversion funnel optimization\n"
            f"3. Accessibility and inclusive design\n"
            f"4. Content hierarchy and readability\n"
            f"5. User flow and task completion paths\n\n"
            f"Provide actionable, prioritized recommendations."
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
            analyzer_used=f"discovery/{self.model}",
        )
