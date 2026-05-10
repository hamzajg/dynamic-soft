import os


class Config:
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8083"))

    OUTPUT_DIR = os.getenv("OUTPUT_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output"))

    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3010").split(",") if o.strip()]

    DATABASE_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(OUTPUT_DIR), "verifications.db"))

    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:8000")
    OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")

    ANALYSIS_ENABLED = os.getenv("ANALYSIS_ENABLED", "true").lower() == "true"
    FRAME_ANALYZER_BACKEND = os.getenv("ANALYSIS_FRAME_ANALYZER_BACKEND", "ollama")
    FRAME_ANALYZER_MODE = os.getenv("ANALYSIS_FRAME_ANALYZER_MODE", "single")
    FRAME_ANALYZER_MODEL = os.getenv("ANALYSIS_FRAME_ANALYZER_MODEL", "llava")
    FRAME_ANALYZER_BATCH_MODEL = os.getenv("ANALYSIS_FRAME_ANALYZER_BATCH_MODEL", "llama3.2-vision")
    FRAME_INTERVAL = int(os.getenv("ANALYSIS_FRAME_INTERVAL", "5"))
    MAX_FRAMES = int(os.getenv("ANALYSIS_MAX_FRAMES", "20"))
    OPENCODE_MODEL = os.getenv("ANALYSIS_OPENCODE_MODEL", "opencode/big-pickle")
    OPENCODE_FLAGS = os.getenv("ANALYSIS_OPENCODE_FLAGS", "--dangerously-skip-permissions")
