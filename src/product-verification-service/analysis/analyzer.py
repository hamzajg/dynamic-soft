from abc import ABC, abstractmethod

from .models import AnalysisResult, Frame


class VideoAnalyzer(ABC):

    @abstractmethod
    def analyze(
        self, video_path: str, log_path: str, frames: list[Frame]
    ) -> AnalysisResult:
        ...
