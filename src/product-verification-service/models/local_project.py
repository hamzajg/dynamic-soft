from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum


class TestFramework(str, Enum):
    PLAYWRIGHT = "playwright"
    CYPRESS = "cypress"
    VITEST = "vitest"
    JEST = "jest"
    UNKNOWN = "unknown"


class TestFile(BaseModel):
    path: str
    name: str


class LocalProjectSuite(BaseModel):
    id: str
    type: str = "local"
    name: str
    path: str
    framework: TestFramework
    test_files: List[TestFile]
    test_count: int
    created_at: str
    last_synced_at: Optional[str] = None


class ScanRequest(BaseModel):
    path: str


class ScanResult(BaseModel):
    path: str
    framework: TestFramework
    test_files: List[TestFile]
    test_count: int
    config_found: bool
    config_path: Optional[str] = None


class RunOptions(BaseModel):
    test_files: List[str] = []
    mode: str = "default"
    env_vars: Dict[str, str] = {}


class TestResult(BaseModel):
    run_id: str
    test_file: str
    status: str = "queued"
    passed: int = 0
    failed: int = 0
    total: int = 0
    duration_ms: int = 0
    output_dir: str = ""


class FrameAnnotation(BaseModel):
    id: str
    run_id: str
    frame_name: str
    shapes: List[dict] = []
    description: str = ""
    created_at: str = ""
    updated_at: str = ""


class FrameAnnotationSave(BaseModel):
    shapes: List[dict] = []
    description: str = ""


class FrameAnalyzeRequest(BaseModel):
    backend: Optional[str] = None
    model: Optional[str] = None
