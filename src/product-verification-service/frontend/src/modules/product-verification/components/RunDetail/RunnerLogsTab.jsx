import React from "react";
import LogViewer from "../LogViewer";

const ACTIVE_STATUSES = new Set(["queued", "running"]);

export default function RunnerLogsTab({ runId, isLocal, suite, scenario, runStatus }) {
  const isActive = ACTIVE_STATUSES.has(runStatus);

  return (
    <div>
      <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-4">
        Runner Logs {isActive && <span className="text-accent ml-2">(live)</span>}
      </h3>
      {isLocal
        ? <LogViewer runId={runId} local stream={isActive} />
        : <LogViewer runId={runId} suite={suite} scenario={scenario} />
      }
    </div>
  );
}
