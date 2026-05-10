import React, { useState, useEffect } from "react";
import { ContentCard } from "../../../ui/Shared";
import { getRunResults } from "../LocalProjectService";

const STATUS_ICONS = {
  passed: "\u2713",
  failed: "\u2717",
  error: "!",
  skipped: "\u2014",
  xpass: "\u2713",
  xfail: "x",
};

const STATUS_COLORS = {
  passed: "text-success",
  failed: "text-danger",
  error: "text-danger",
  skipped: "text-text-secondary",
  xpass: "text-warning",
  xfail: "text-warning",
};

export default function ResultsViewer({ runId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!runId) return;
    setLoading(true);
    getRunResults(runId)
      .then(setResults)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading results...</p></ContentCard>;
  if (error) return <ContentCard><p className="text-danger">Error: {error.message || error}</p></ContentCard>;
  if (!results || !results.results || results.results.length === 0) {
    return <ContentCard><p className="text-text-secondary">No structured results available.</p></ContentCard>;
  }

  return (
    <ContentCard>
      <div className="space-y-4">
        <div className="flex space-x-4 text-sm">
          <span>Total: <strong>{results.total}</strong></span>
          <span className="text-success">Passed: <strong>{results.passed}</strong></span>
          {results.failed > 0 && <span className="text-danger">Failed: <strong>{results.failed}</strong></span>}
          {results.errors > 0 && <span className="text-danger">Errors: <strong>{results.errors}</strong></span>}
          <span className="text-text-secondary">Duration: <strong>{(results.duration_ms / 1000).toFixed(1)}s</strong></span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase">
              <th className="text-left py-2 pr-3 font-medium">Test</th>
              <th className="text-right py-2 pl-3 font-medium w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.results.map((r, i) => (
              <tr key={i} className="border-b border-border-subtle/50">
                <td className="py-2 pr-3 font-mono text-sm">{r.name}</td>
                <td className={`py-2 pl-3 text-right font-medium ${STATUS_COLORS[r.status] || "text-text-secondary"}`}>
                  {STATUS_ICONS[r.status] || "?"} {r.status.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );
}
