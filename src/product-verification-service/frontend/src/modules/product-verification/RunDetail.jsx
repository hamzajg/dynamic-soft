import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRunData from "./components/RunDetail/hooks/useRunData";
import RunHeader from "./components/RunDetail/RunHeader";
import RunnerLogsTab from "./components/RunDetail/RunnerLogsTab";
import ResultsTab from "./components/RunDetail/ResultsTab";

const PRIMARY_TABS = ["runner logs", "results"];

export default function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { run, testResults, frames, frameAnnotations, screenshots, isLocal, loading, refreshArtifacts } = useRunData(id, navigate);
  const [tab, setTab] = useState("runner logs");

  if (loading) return <div className="text-text-secondary p-6">Loading...</div>;
  if (!run) return <div className="text-danger p-6">Run not found</div>;

  return (
    <div>
      <RunHeader run={run} isLocal={isLocal} />

      <div className="flex border-b border-border-subtle mb-6">
        {PRIMARY_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
              tab === t
                ? "text-accent border-b-2 border-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "runner logs" && (
        <RunnerLogsTab runId={run.id} isLocal={isLocal} suite={run.suite} scenario={run.scenario} runStatus={run.status} />
      )}

      {tab === "results" && (
        <ResultsTab
          run={run} isLocal={isLocal}
          frames={frames} screenshots={screenshots}
          frameAnnotations={frameAnnotations}
          testResults={testResults}
          runId={run.id} suite={run.suite} scenario={run.scenario}
          onRefresh={refreshArtifacts}
        />
      )}
    </div>
  );
}
