import base64
import json
import os
import socket
import subprocess
import tempfile
import time
import urllib.request
from abc import ABC, abstractmethod

from .models import Frame
from .config import AnalysisConfig


def _ollama_headers():
    headers = {"Content-Type": "application/json"}
    key = AnalysisConfig.OLLAMA_API_KEY
    if key:
        headers["Authorization"] = f"Bearer {key}"
    return headers


class FrameAnalyzer(ABC):
    """Vision-based analyzer that describes UI screenshots from frames."""

    @abstractmethod
    def describe_frames(self, frames: list[Frame]) -> list[str]:
        ...


class OllamaFrameAnalyzer(FrameAnalyzer):
    """Free default: uses Ollama vision models locally."""

    def __init__(self, model=None, spec_context=""):
        self.model = model or AnalysisConfig.FRAME_ANALYZER_MODEL
        self.spec_context = spec_context
        self._base = AnalysisConfig.OLLAMA_BASE_URL
        self.endpoint = f"{self._base}/api/chat"

    def describe_frames(self, frames):
        if not self._ollama_running():
            return [f"[Ollama server not running. Start: ollama serve]" for _ in frames]
        if not self._model_available():
            return [f"[Model '{self.model}' not pulled. Run: ollama pull {self.model}]" for _ in frames]
        return [self._describe(f) for f in frames]

    def _describe(self, frame):
        with open(frame.path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        parts = [
            "You are analyzing a screenshot from an automated e2e test.",
        ]
        if self.spec_context:
            parts.append(
                "The test specification (source code) that generated this recording:\n"
                f"{self.spec_context}"
            )
        if frame.context:
            parts.append(
                "What the test was doing at this point:\n"
                f"{frame.context}"
            )
        parts.append(
            "Describe the UI screenshot accurately based on this context. "
            "Focus on what page is shown, what elements are visible, "
            "and what state the application is in."
        )
        prompt = "\n\n".join(parts)
        payload = json.dumps({
            "model": self.model,
            "messages": [{
                "role": "user",
                "content": prompt,
                "images": [b64],
            }],
            "stream": False,
        }).encode()
        req = urllib.request.Request(
            self.endpoint, data=payload,
            headers=_ollama_headers(),
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read())
                return result.get("message", {}).get("content", "").strip()
        except Exception as e:
            return f"[Ollama error: {e}]"

    def compare_models(self, frames, models):
        results = {}
        for model in models:
            self.model = model
            if not self._model_available():
                results[model] = f"(not pulled)"
                continue
            descriptions = []
            for frame in frames:
                descriptions.append(self._describe(frame))
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

    def _ollama_running(self):
        try:
            req = urllib.request.Request(
                f"{self._base}/api/tags", headers=_ollama_headers(),
            )
            urllib.request.urlopen(req, timeout=3)
            return True
        except Exception:
            return False

    def _model_available(self):
        try:
            req = urllib.request.Request(
                f"{self._base}/api/tags", headers=_ollama_headers(),
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read())
            return any(m["name"].startswith(self.model) for m in data.get("models", []))
        except Exception:
            return False


class OpencodeFrameAnalyzer(FrameAnalyzer):
    """Premium: uses opencode-cli with a vision-capable model."""

    def __init__(self, model=None, extra_flags=None, spec_context=""):
        self.model = model or AnalysisConfig.OPENCODE_MODEL
        self.extra_flags = extra_flags or []
        self.spec_context = spec_context

    def describe_frames(self, frames):
        if not frames:
            return []

        frame_list = "\n".join(
            f"- {os.path.basename(f.path)} (t={f.timestamp_seconds:.0f}s)"
            + (f" — context: {f.context[:120]}" if f.context else "")
            for f in frames
        )
        parts = [
            "You are a UI screenshot analyst. Below are screenshots extracted "
            "from an automated e2e test recording.",
        ]
        if self.spec_context:
            parts.append(
                "The test specification (source code) that generated this recording:\n"
                f"{self.spec_context}"
            )
        parts.append(
            "Frames:\n"
            f"{frame_list}\n\n"
            "For each image, describe: (1) what page or screen is shown, "
            "(2) what UI elements are visible, (3) what state the application "
            "appears to be in. Use the provided spec and log context to ground "
            "your descriptions."
        )
        prompt = "\n\n".join(parts)

        port = self._find_free_port()
        server_proc = self._start_server(port)
        try:
            result = self._call_opencode(prompt, port, frames)
        finally:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_proc.kill()

        if result.returncode != 0:
            return [f"[Opencode error: {result.stderr[:200]}]" for _ in frames]
        text = result.stdout.strip()
        return [text] if text else ["(empty response)"]

    def _start_server(self, port):
        proc = subprocess.Popen(
            ["opencode-cli", "serve", "--port", str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        deadline = time.time() + 20
        while time.time() < deadline:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                if s.connect_ex(("127.0.0.1", port)) == 0:
                    time.sleep(1)
                    return
            time.sleep(0.5)
        raise TimeoutError("opencode server did not start")

    def _call_opencode(self, prompt, port, frames):
        pf = tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False)
        pf.write(prompt)
        ppath = pf.name
        pf.close()

        cmd = [
            "opencode-cli", "run",
            "Analyze the attached prompt and images.",
            "--attach", f"http://127.0.0.1:{port}",
            "--dangerously-skip-permissions",
            "--model", self.model,
            "-f", ppath,
        ]
        for f_ in frames:
            cmd.extend(["-f", f_.path])

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        except subprocess.TimeoutExpired:
            result = subprocess.CompletedProcess(cmd, 1, "", "TIMEOUT")
        except FileNotFoundError:
            result = subprocess.CompletedProcess(cmd, 1, "", "opencode-cli not found")
        finally:
            try:
                os.unlink(ppath)
            except OSError:
                pass
        return result

    def _find_free_port(self):
        for port in range(4099, 4199):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", port)) != 0:
                    return port
        return 0


class BatchOllamaFrameAnalyzer(FrameAnalyzer):
    """Sends all frames in a single API call for holistic analysis."""

    def __init__(self, model=None, spec_context=""):
        self.model = model or AnalysisConfig.FRAME_ANALYZER_BATCH_MODEL
        self.spec_context = spec_context
        self._base = AnalysisConfig.OLLAMA_BASE_URL
        self.endpoint = f"{self._base}/api/chat"

    def describe_frames(self, frames):
        if not frames:
            return []
        if not self._ollama_running():
            return [f"[Ollama server not running. Start: ollama serve]"]
        if not self._model_available():
            return [f"[Model '{self.model}' not pulled. Run: ollama pull {self.model}]"]
        return [self._describe_batch(frames)]

    def _describe_batch(self, frames):
        parts = [f"You are analyzing {len(frames)} screenshots from an e2e test."]
        if self.spec_context:
            parts.append(f"Test specification:\n{self.spec_context}")
        parts.append(
            "These screenshots were captured in chronological order during test execution. "
            "Review the entire sequence holistically and describe:\n"
            "1. What pages/screens were visited and in what order\n"
            "2. The user flow through the application\n"
            "3. Any UI issues, inconsistencies, or problems visible across frames\n"
            "4. The overall state of the application at each step\n\n"
            "Be specific — reference frame contexts, URLs, and visible elements."
        )
        context_lines = []
        for i, f in enumerate(frames):
            label = f.context[:200] if f.context else f"(no context)"
            context_lines.append(f"Frame {i+1}: {label}")
        parts.append("Frame order:\n" + "\n".join(context_lines))

        user_msg = {
            "role": "user",
            "content": "\n\n".join(parts),
            "images": [],
        }
        for f in frames:
            with open(f.path, "rb") as fh:
                b64 = base64.b64encode(fh.read()).decode()
            user_msg["images"].append(b64)

        payload = json.dumps({
            "model": self.model,
            "messages": [user_msg],
            "stream": False,
        }).encode()
        req = urllib.request.Request(
            self.endpoint, data=payload,
            headers=_ollama_headers(),
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read())
                return result.get("message", {}).get("content", "").strip()
        except Exception as e:
            return f"[Batch analysis error: {e}]"

    def _ollama_running(self):
        try:
            req = urllib.request.Request(
                f"{self._base}/api/tags", headers=_ollama_headers(),
            )
            urllib.request.urlopen(req, timeout=3)
            return True
        except Exception:
            return False

    def _model_available(self):
        try:
            req = urllib.request.Request(
                f"{self._base}/api/tags", headers=_ollama_headers(),
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read())
            return any(m["name"].startswith(self.model) for m in data.get("models", []))
        except Exception:
            return False


def create_frame_analyzer(backend=None, model=None, spec_context=""):
    backend = (backend or AnalysisConfig.FRAME_ANALYZER_BACKEND).lower()
    mode = AnalysisConfig.FRAME_ANALYZER_MODE
    if mode == "batch":
        batch_model = model or AnalysisConfig.FRAME_ANALYZER_BATCH_MODEL
        if backend == "opencode":
            return OpencodeFrameAnalyzer(model=model, spec_context=spec_context)
        return BatchOllamaFrameAnalyzer(model=batch_model, spec_context=spec_context)
    if backend == "opencode":
        return OpencodeFrameAnalyzer(model=model, spec_context=spec_context)
    return OllamaFrameAnalyzer(model=model, spec_context=spec_context)
