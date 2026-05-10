import React, { useState } from "react";
import { ContentCard } from "../../../../ui/Shared";
import ResultsReport from "./ResultsReport";
import ResultsGallery from "./ResultsGallery";
import ResultsRecordPlayer from "./ResultsRecordPlayer";
import ResultsLogs from "./ResultsLogs";

export default function ResultsTab({ run, isLocal, frames, screenshots, frameAnnotations, testResults, runId, suite, scenario, onRefresh }) {
  const [subTab, setSubTab] = useState("report");

  const hasVideo = isLocal;
  const hasFrames = frames.length > 0;
  const hasScreenshots = isLocal ? screenshots.length > 0 : true;

  const subTabs = [
    { id: "report", label: "Report" },
    ...(hasFrames || hasScreenshots ? [{ id: "gallery", label: `Gallery (${frames.length + screenshots.length})` }] : []),
    ...(hasVideo ? [{ id: "record", label: "Record Player" }] : []),
    { id: "logs", label: "Logs" },
  ];

  return (
    <ContentCard noPadding>
      <div className="flex border-b border-border-subtle overflow-x-auto px-4">
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              subTab === t.id
                ? "text-accent border-b-2 border-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {subTab === "report" && (
          <ResultsReport runId={runId} isLocal={isLocal} testResults={testResults} suite={suite} scenario={scenario} />
        )}
        {subTab === "gallery" && (
          <ResultsGallery runId={runId} frames={frames} screenshots={screenshots}
            frameAnnotations={frameAnnotations} isLocal={isLocal} onRefresh={onRefresh} />
        )}
        {subTab === "record" && (
          <ResultsRecordPlayer runId={runId} onFramesExtracted={onRefresh} />
        )}
        {subTab === "logs" && (
          <ResultsLogs runId={runId} isLocal={isLocal} suite={suite} scenario={scenario}
            testFile={testResults?.[0]?.test_file} />
        )}
      </div>
    </ContentCard>
  );
}
