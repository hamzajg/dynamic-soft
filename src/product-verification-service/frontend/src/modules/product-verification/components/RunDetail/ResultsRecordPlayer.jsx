import React from "react";
import VideoPlayer from "../VideoPlayer";

export default function ResultsRecordPlayer({ runId, onFramesExtracted }) {
  return (
    <div>
      <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Video Recording</h4>
      <VideoPlayer runId={runId} onFrameExtracted={onFramesExtracted} />
    </div>
  );
}
