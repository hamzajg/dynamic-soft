import React from "react";
import { useNavigate } from "react-router-dom";
import RunStatusBadge from "./RunStatusBadge";

export default function RunTable({ runs }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-text-secondary uppercase tracking-wider text-xs">
            <th className="text-left py-3 px-2">Suite</th>
            <th className="text-left py-3 px-2">Scenario</th>
            <th className="text-left py-3 px-2">Mode</th>
            <th className="text-left py-3 px-2">Status</th>
            <th className="text-right py-3 px-2">Passed</th>
            <th className="text-right py-3 px-2">Failed</th>
            <th className="text-right py-3 px-2">Duration</th>
            <th className="text-right py-3 px-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr
              key={run.id}
              onClick={() => navigate(`/verification/runs/${run.id}`)}
              className="border-b border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <td className="py-3 px-2 font-medium">{run.suite}</td>
              <td className="py-3 px-2">{run.scenario}</td>
              <td className="py-3 px-2 text-text-secondary">{run.mode}</td>
              <td className="py-3 px-2"><RunStatusBadge status={run.status} /></td>
              <td className="py-3 px-2 text-right text-success">{run.passed}</td>
              <td className="py-3 px-2 text-right text-danger">{run.failed}</td>
              <td className="py-3 px-2 text-right text-text-secondary">{(run.duration_ms / 1000).toFixed(1)}s</td>
              <td className="py-3 px-2 text-right text-text-secondary text-xs">
                {run.created_at ? run.created_at.slice(0, 16).replace("T", " ") : "-"}
              </td>
            </tr>
          ))}
          {runs.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-text-secondary">No verification runs yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
