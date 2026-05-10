import React from "react";
import RunStatusBadge from "../RunStatusBadge";

function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center space-x-1.5 bg-background border border-border-subtle rounded px-3 py-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`text-sm font-bold ${color || "text-text-primary"}`}>{value}</span>
    </div>
  );
}

export default function RunHeader({ run, isLocal }) {
  const duration = run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—";

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {run.suite}{run.scenario && run.scenario !== "all" ? ` / ${run.scenario}` : ""}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <RunStatusBadge status={run.status} />
            <span className="text-xs text-text-secondary uppercase tracking-wider">{run.mode} mode</span>
            {isLocal && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">local</span>}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <StatChip label="Passed" value={run.passed || 0} color="text-success" />
          <StatChip label="Failed" value={run.failed || 0} color="text-danger" />
          <StatChip label="Total" value={run.total || 0} />
          <StatChip label="Duration" value={duration} />
        </div>
      </div>

      {run.command && (
        <div className="bg-background border border-border-subtle rounded px-3 py-2">
          <code className="text-xs font-mono text-text-secondary">{run.command}</code>
        </div>
      )}

      <div className="flex items-center space-x-4 text-xs text-text-secondary">
        {run.started_at && <span>Started: {run.started_at}</span>}
        {run.finished_at && <span>Finished: {run.finished_at}</span>}
      </div>

      {run.error_message && (
        <div className="bg-danger/5 border border-danger/20 rounded p-3">
          <p className="text-sm text-danger font-mono whitespace-pre-wrap">{run.error_message}</p>
        </div>
      )}
    </div>
  );
}
