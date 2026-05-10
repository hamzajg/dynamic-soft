from dataclasses import dataclass, field


@dataclass
class Frame:
    path: str
    timestamp_seconds: float
    context: str = ""


@dataclass
class AnalysisResult:
    test_suite: str = ""
    test_case: str = ""
    test_timestamp: str = ""
    duration_seconds: float = 0.0
    pass_fail: str = "UNKNOWN"
    log_summary: str = ""
    frames_analyzed: int = 0
    errors_found: list = field(default_factory=list)
    screenshots_analysis: list = field(default_factory=list)
    overall_assessment: str = ""
    recommendations: list = field(default_factory=list)
    raw_ai_output: str = ""
    report_path: str = ""
    analyzer_used: str = ""
