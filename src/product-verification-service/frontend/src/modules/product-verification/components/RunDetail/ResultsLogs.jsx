import React, { useState, useEffect } from "react";
import { getRunLog } from "../../LocalProjectService";
import { getLog } from "../../VerificationService";

export default function ResultsLogs({ runId, isLocal, suite, scenario, testFile }) {
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!runId) return;
    setLoading(true);
    const logType = isLocal ? "detail" : undefined;
    const fetch = isLocal ? getRunLog(runId, testFile, logType) : getLog(runId, suite, scenario);
    Promise.resolve(fetch)
      .then(setLog)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [runId, isLocal, suite, scenario, testFile]);

  if (loading) return <p className="text-text-secondary text-sm">Loading test log...</p>;
  if (error) return <p className="text-danger text-sm">Failed to load log</p>;

  return (
    <div>
      <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Detailed Test Log</h4>
      <pre className="bg-background border border-border-subtle rounded p-4 text-xs font-mono text-text-secondary overflow-auto max-h-[600px] leading-relaxed whitespace-pre-wrap">
        {log || "(empty log)"}
      </pre>
    </div>
  );
}
