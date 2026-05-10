import base64
import json
import os
import subprocess
import urllib.request
from datetime import datetime

from .analyzer import VideoAnalyzer
from .models import AnalysisResult, Frame
from .config import AnalysisConfig
from .extract_frames import get_video_duration


OLLAMA_BASE = AnalysisConfig.OLLAMA_BASE_URL
OLLAMA_ENDPOINT = f"{OLLAMA_BASE}/api/chat"

def _ollama_headers():
    headers = {"Content-Type": "application/json"}
    key = AnalysisConfig.OLLAMA_API_KEY
    if key:
        headers["Authorization"] = f"Bearer {key}"
    return headers


class OllamaAnalyzer(VideoAnalyzer):

    def __init__(self, model=None):
        self.model = model or AnalysisConfig.OLLAMA_MODEL

    def analyze(self, video_path, log_path, frames):
        if not self._ollama_running():
            return self._make_result(
                frames, video_path, log_path,
                overall="ERROR: Ollama server not running. Start with: ollama serve",
                status="ERROR",
            )

        if not self._model_available():
            return self._make_result(
                frames, video_path, log_path,
                overall=f"ERROR: Model '{self.model}' not pulled. Run: ollama pull {self.model}",
                status="ERROR",
            )

        log_summary = self._summarize_log(log_path)

        descriptions = []
        for frame in frames:
            desc = self._describe_frame(frame)
            descriptions.append(f"### Frame at t={frame.timestamp_seconds:.0f}s\n{desc}")

        combined = self._synthesize(log_summary, descriptions)
        errors = self._extract_errors(log_summary)

        return self._make_result(
            frames, video_path, log_path,
            overall=combined,
            log_summary=log_summary,
            status="FAIL" if errors else "PASS",
            errors=errors,
            raw="\n\n".join(descriptions) + "\n\n" + combined,
        )

    def compare_models(self, video_path, log_path, frames, models):
        results = {}
        for model in models:
            self.model = model
            if not self._model_available():
                results[model] = f"(not pulled)"
                continue
            descriptions = []
            for frame in frames:
                descriptions.append(self._describe_frame(frame))
            results[model] = descriptions
        return self._format_comparison(results, models, frames)

    def _format_comparison(self, results, models, frames):
        lines = ["# Ollama Model Comparison\n"]
        for i, frame in enumerate(frames):
            lines.append(f"## Frame {i + 1} (t={frame.timestamp_seconds:.0f}s)\n")
            for model in models:
                desc = results.get(model, "(error)")
                if isinstance(desc, list) and i < len(desc):
                    lines.append(f"### {model}\n{desc[i]}\n")
                else:
                    lines.append(f"### {model}\n{desc}\n")
        return "\n".join(lines)

    def _describe_frame(self, frame):
        with open(frame.path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")

        payload = json.dumps({
            "model": self.model,
            "messages": [{
                "role": "user",
                "content": (
                    "Describe this UI screenshot in detail. "
                    "What page is shown, what elements are visible, "
                    "and what state is the application in?"
                ),
                "images": [b64],
            }],
            "stream": False,
        }).encode()

        req = urllib.request.Request(
            OLLAMA_ENDPOINT,
            data=payload,
            headers=_ollama_headers(),
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read())
                return result.get("message", {}).get("content", "").strip()
        except Exception as e:
            return f"[Error: {e}]"

    def _synthesize(self, log_summary, descriptions):
        desc_text = "\n\n".join(descriptions)
        prompt = (
            f"Based on the following e2e test log and frame descriptions, "
            f"provide a brief overall assessment (3-5 sentences) of what happened "
            f"and list any actionable recommendations.\n\n"
            f"Log:\n{log_summary}\n\n"
            f"Frame descriptions:\n{desc_text}"
        )

        payload = json.dumps({
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        }).encode()

        req = urllib.request.Request(
            OLLAMA_ENDPOINT,
            data=payload,
            headers=_ollama_headers(),
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read())
                return result.get("message", {}).get("content", "").strip()
        except Exception as e:
            return f"[Synthesis error: {e}]"

    def _ollama_running(self):
        try:
            req = urllib.request.Request(
                f"{OLLAMA_BASE}/api/tags", headers=_ollama_headers(),
            )
            urllib.request.urlopen(req, timeout=3)
            return True
        except Exception:
            return False

    def _model_available(self):
        try:
            req = urllib.request.Request(
                f"{OLLAMA_BASE}/api/tags", headers=_ollama_headers(),
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read())
            return any(m["name"].startswith(self.model) for m in data.get("models", []))
        except Exception:
            return False

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

    def _extract_errors(self, log_summary):
        return [
            line.strip()
            for line in log_summary.split("\n")
            if "[FAIL]" in line or line.startswith("ERROR:")
        ]

    def _make_result(self, frames, video_path, log_path,
                     overall="", log_summary="", status="UNKNOWN",
                     errors=None, raw=""):
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
            analyzer_used=f"ollama/{self.model}",
        )
