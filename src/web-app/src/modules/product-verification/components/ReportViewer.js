import React, { useState, useEffect } from "react";
import { ContentCard } from "../../../ui/Shared";
import { getReport } from "../VerificationService";

export default function ReportViewer({ runId, suite, scenario }) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!runId || !suite || !scenario) return;
    setLoading(true);
    getReport(runId, suite, scenario)
      .then(setReport)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [runId, suite, scenario]);

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
