import React, { useState, useEffect } from "react";
import { ContentCard } from "../../../ui/Shared";
import { getLog } from "../VerificationService";

export default function LogViewer({ runId, suite, scenario }) {
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!runId || !suite || !scenario) return;
    setLoading(true);
    getLog(runId, suite, scenario)
      .then(setLog)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [runId, suite, scenario]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading log...</p></ContentCard>;
  if (error) return <ContentCard><p className="text-danger">Error: {error}</p></ContentCard>;

  return (
    <ContentCard noPadding>
      <pre className="p-4 text-xs font-mono text-text-secondary overflow-auto max-h-[600px] leading-relaxed whitespace-pre-wrap">
        {log || "(empty log)"}
      </pre>
    </ContentCard>
  );
}
