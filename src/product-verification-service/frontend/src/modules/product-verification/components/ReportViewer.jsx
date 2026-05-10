import React, { useState, useEffect } from "react";
import { ContentCard } from "../../../ui/Shared";
import { getReport } from "../VerificationService";
import { getRunReport } from "../LocalProjectService";

export default function ReportViewer({ runId, suite, scenario, local }) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!runId) return;
    setLoading(true);
    const fetch = local ? getRunReport(runId) : getReport(runId, suite, scenario);
    Promise.resolve(fetch)
      .then(setReport)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [runId, suite, scenario, local]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading report...</p></ContentCard>;
  if (error) return <ContentCard><p className="text-text-secondary">No report available</p></ContentCard>;
  if (!report) return null;

  return (
    <ContentCard>
      <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
        {report}
      </pre>
    </ContentCard>
  );
}
