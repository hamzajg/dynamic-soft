from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VerificationRun(BaseModel):
    id: str
    suite: str
    scenario: str
    mode: str = "default"
    status: str = "queued"
    passed: int = 0
    failed: int = 0
    total: int = 0
    duration_ms: int = 0
    output_dir: str = ""
    report_path: Optional[str] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[str] = None


class TriggerRunRequest(BaseModel):
    suite: str
    scenario: str
    mode: str = "default"


class TriggerRunResponse(BaseModel):
    run_id: str
    status: str = "queued"
    message: str = ""
