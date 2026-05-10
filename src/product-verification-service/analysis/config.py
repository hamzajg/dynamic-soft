import os


class AnalysisConfig:
    TEST_MODE = os.getenv("TEST_MODE", "default")
    ENABLED = os.getenv("ANALYSIS_ENABLED", str(TEST_MODE != "default").lower()) == "true"
    MODE = os.getenv("ANALYSIS_MODE", "") or TEST_MODE
    IS_DISCOVERY = MODE == "discovery"
    IS_VALIDATION = MODE == "validation"

    ANALYZER = os.getenv("ANALYSIS_ANALYZER", "opencode")

    FRAME_ANALYZER_BACKEND = os.getenv("ANALYSIS_FRAME_ANALYZER_BACKEND", "ollama")
    FRAME_ANALYZER_MODEL = os.getenv("ANALYSIS_FRAME_ANALYZER_MODEL", "llava")
    FRAME_ANALYZER_MODE = os.getenv("ANALYSIS_FRAME_ANALYZER_MODE", "single")
    FRAME_ANALYZER_BATCH_MODEL = os.getenv("ANALYSIS_FRAME_ANALYZER_BATCH_MODEL", "llama3.2-vision")

    FRAME_INTERVAL = int(os.getenv("ANALYSIS_FRAME_INTERVAL", "5"))
    MAX_FRAMES = int(os.getenv("ANALYSIS_MAX_FRAMES", "20"))

    OPENCODE_MODEL = os.getenv("ANALYSIS_OPENCODE_MODEL", "opencode/big-pickle")
    OPENCODE_FLAGS = os.getenv("ANALYSIS_OPENCODE_FLAGS", "--dangerously-skip-permissions")

    OLLAMA_MODEL = os.getenv("ANALYSIS_OLLAMA_MODEL", "llava")
    OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")

    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:8000")
    REQUEST_TIMEOUT = int(os.getenv("ANALYSIS_REQUEST_TIMEOUT", "180"))

    UX_MODEL = os.getenv("ANALYSIS_UX_MODEL", "")

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    REPORT_DIR = os.path.join(os.path.dirname(BASE_DIR), "output", "reports")
    FRAME_DIR = os.path.join(REPORT_DIR, "frames")
