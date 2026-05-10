import React from "react";
import RunTestTable from "../RunTestTable";
import ResultsViewer from "../ResultsViewer";
import ReportViewer from "../ReportViewer";

export default function ResultsReport({ runId, isLocal, testResults, suite, scenario }) {
  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Per-Test Results</h4>
        <RunTestTable tests={testResults} />
      </section>

      <section>
        <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Structured Results</h4>
        <ResultsViewer runId={runId} />
      </section>

      <section>
        <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Analysis Report</h4>
        {isLocal
          ? <ReportViewer runId={runId} local />
          : <ReportViewer runId={runId} suite={suite} scenario={scenario} />
        }
      </section>
    </div>
  );
}
