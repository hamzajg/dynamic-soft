import os
import re
import logging
import sys
import pytest
from datetime import datetime
from playwright.sync_api import sync_playwright

TEST_MODE = os.getenv("TEST_MODE", "default")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "")
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
RECORD_SCREEN = os.getenv("RECORD_SCREEN", "false").lower() == "true"
SUPPORTED_MODES = ("default", "validation", "discovery")


def _is_batch_mode():
    return os.getenv("ANALYSIS_FRAME_ANALYZER_MODE", "single") == "batch"


def _capture_screenshots():
    return TEST_MODE == "discovery" or (TEST_MODE == "validation" and _is_batch_mode())


class LoggedPage:
    def __init__(self, page, logger, result_dir=None):
        self._page = page
        self.logger = logger
        self._logger = logger
        self._result_dir = result_dir
        self._screenshots = []

    def screenshot(self, name=None):
        if not self._result_dir:
            return None
        label = (name or f"step_{len(self._screenshots)}").replace(" ", "_")
        ts = datetime.now().strftime("%H%M%S%f")
        filename = f"screenshot_{label}_{ts}.png"
        path = os.path.join(self._result_dir, filename)
        self._page.screenshot(path=path)
        context = {
            "url": self._page.url,
            "title": self._page.title(),
            "label": label,
        }
        self._screenshots.append((path, context))
        self.logger.action(f"Screenshot: {filename} ({self._page.url})")
        return path

    def goto(self, url, **kwargs):
        self.logger.action(f"Navigating to {url}")
        result = self._page.goto(url, **kwargs)
        self.logger.action(f"Page loaded: {url}")
        self._page.wait_for_timeout(1500)
        if _capture_screenshots():
            self.screenshot(name=f"nav_{url.strip('/').replace('/', '_') or 'home'}")
        return result

    def click(self, selector, **kwargs):
        self.logger.click(selector)
        result = self._page.click(selector, **kwargs)
        if _capture_screenshots():
            label = selector.replace(" ", "_")[:40]
            self.screenshot(name=f"click_{label}")
        return result

    def fill(self, selector, value, **kwargs):
        result = self._page.fill(selector, value, **kwargs)
        if _capture_screenshots():
            self.screenshot(name=f"fill_{selector.replace(' ', '_')[:30]}")
        return result

    def query_selector(self, selector, **kwargs):
        return self._page.query_selector(selector, **kwargs)

    def text_content(self, selector, **kwargs):
        return self._page.text_content(selector, **kwargs)

    def wait_for_selector(self, selector, **kwargs):
        return self._page.wait_for_selector(selector, **kwargs)

    def wait_for_url(self, pattern, **kwargs):
        return self._page.wait_for_url(pattern, **kwargs)

    def wait_for_load_state(self, state, **kwargs):
        return self._page.wait_for_load_state(state, **kwargs)

    def wait_for_timeout(self, timeout):
        return self._page.wait_for_timeout(timeout)

    def title(self):
        return self._page.title()

    def go_back(self, **kwargs):
        return self._page.go_back(**kwargs)

    def set_viewport_size(self, size):
        return self._page.set_viewport_size(size)

    def evaluate(self, expression, **kwargs):
        return self._page.evaluate(expression, **kwargs)

    def on(self, event, handler):
        return self._page.on(event, handler)

    def close(self, **kwargs):
        return self._page.close(**kwargs)

    @property
    def url(self):
        return self._page.url

    @property
    def request(self):
        return self._page.request

    @property
    def video(self):
        return self._page.video

    def __getattr__(self, name):
        return getattr(self._page, name)


class TestLogger:
    def __init__(self, test_name, log_file=None):
        self.test_name = test_name
        self.log_file = log_file

    def _log(self, level, message):
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        line = f"[{ts}] [e2e.{self.test_name}] {level}: {message}"
        print(line, file=sys.stderr)
        if self.log_file:
            with open(self.log_file, "a") as f:
                f.write(line + "\n")

    def action(self, msg):
        self._log("INFO", f"ACTION: {msg}")

    def navigation(self, msg):
        self._log("INFO", f"NAVIGATION: {msg}")

    def click(self, selector):
        self._log("INFO", f"CLICK: {selector}")

    def assertion(self, description, passed=True):
        status = "PASS" if passed else "FAIL"
        self._log("INFO", f"ASSERTION: {description} [{status}]")

    def error(self, msg):
        self._log("ERROR", msg)

    def debug(self, msg):
        self._log("DEBUG", msg)

    def command(self, cmd):
        self._log("INFO", f"COMMAND: {cmd}")


@pytest.fixture(scope="session")
def browser_instance():
    with sync_playwright() as p:
        launch_options = {"headless": HEADLESS}
        browser = p.chromium.launch(**launch_options)
        yield browser
        browser.close()


@pytest.fixture
def logged_page(request, browser_instance):
    node = request.node
    raw_name = node.name
    test_case = raw_name.replace("test_", "").replace("[", "_").replace("]", "")

    file_path = getattr(node, "fspath", None)
    if file_path:
        file_name = os.path.basename(str(file_path))
        test_suite = re.sub(r"^test_", "", re.sub(r"\.py$", "", file_name))
    else:
        test_suite = "unknown"

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_prefix = f"{test_suite}_{test_case}_{timestamp}"

    result_dir = OUTPUT_DIR if OUTPUT_DIR else os.path.join(os.path.dirname(__file__), "..", "output", test_suite, f"{test_case}_{timestamp}")
    os.makedirs(result_dir, exist_ok=True)

    log_file_path = os.path.join(result_dir, "test.log")
    test_logger = TestLogger(test_case, log_file=log_file_path)

    context_kwargs = {"base_url": "http://localhost:3010"}
    if RECORD_SCREEN:
        context_kwargs["record_video_dir"] = result_dir
        context_kwargs["record_video_size"] = {"width": 1280, "height": 720}
    context = browser_instance.new_context(**context_kwargs)
    page = context.new_page()
    logged = LoggedPage(page, test_logger, result_dir=result_dir)
    logged._log_prefix = log_prefix
    logged._context = context
    yield logged
    discovery_screenshots = list(logged._screenshots) if _capture_screenshots() else []
    page.close()
    if RECORD_SCREEN and page.video:
        video_path = page.video.path()
        if video_path:
            final_video = os.path.join(result_dir, f"{log_prefix}.webm")
            try:
                os.rename(video_path, final_video)
            except OSError:
                pass
    context.close()
