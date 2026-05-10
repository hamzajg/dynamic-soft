import React from "react";
import RunStatusBadge from "./RunStatusBadge";

export default function RunTestTable({ tests }) {
  if (!tests || tests.length === 0) {
    return <div className="text-sm text-text-secondary py-4">No test results available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase">
            <th className="text-left py-2 px-3 font-medium">Test File</th>
            <th className="text-center py-2 px-3 font-medium">Status</th>
            <th className="text-right py-2 px-3 font-medium">Passed</th>
            <th className="text-right py-2 px-3 font-medium">Failed</th>
            <th className="text-right py-2 px-3 font-medium">Total</th>
            <th className="text-right py-2 px-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.test_file} className="border-b border-border-subtle/50 hover:bg-background/50">
              <td className="py-2 px-3 text-text-primary font-mono text-xs">{test.test_file}</td>
              <td className="py-2 px-3 text-center">
                <RunStatusBadge status={test.status} />
              </td>
              <td className="py-2 px-3 text-right text-success">{test.passed ?? "-"}</td>
              <td className="py-2 px-3 text-right text-danger">{test.failed ?? "-"}</td>
              <td className="py-2 px-3 text-right text-text-secondary">{test.total ?? "-"}</td>
              <td className="py-2 px-3 text-right text-text-secondary text-xs">
                {test.duration_ms ? `${(test.duration_ms / 1000).toFixed(1)}s` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
