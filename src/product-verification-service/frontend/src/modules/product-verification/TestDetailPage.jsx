import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, ContentCard } from "../../ui/Shared";
import RunStatusBadge from "./components/RunStatusBadge";
import RunDrawer from "./components/RunDrawer";
import * as localProjectService from "./LocalProjectService";

export default function TestDetailPage() {
  const { projectId, testPath } = useParams();
  const navigate = useNavigate();
  const decodedPath = decodeURIComponent(testPath);

  const [project, setProject] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const loadData = async () => {
    try {
      const projects = await localProjectService.listLocalProjects();
      const p = projects.find((pr) => pr.id === projectId);
      if (!p) return;

      setProject(p);
      const test = p.test_files?.find((t) => t.path === decodedPath);
      if (test) setTestInfo(test);

      // Load recent runs and check per-test results
      const runTests = [];
      const allRuns = await localProjectService.listAllRuns();
      if (allRuns) {
        for (const run of allRuns) {
          const tests = await localProjectService.getRunTests(run.id).catch(() => []);
          const match = tests.find((t) => t.test_file === decodedPath);
          if (match) {
            runTests.push({ ...run, test_result: match });
          }
        }
      }
      setRuns(runTests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [projectId, testPath]);

  const handleRunComplete = async (result) => {
    setShowDrawer(false);
    setRunLoading(true);
    if (result && result.run_id) {
      navigate(`/runs/${result.run_id}`);
    }
    await loadData();
    setRunLoading(false);
  };

  if (loading) return <div className="text-text-secondary p-6">Loading...</div>;
  if (!project || !testInfo) return <div className="text-danger p-6">Test not found</div>;

  return (
    <div>
      <PageHeader
        title={testInfo.name}
        subtitle={`${project.name} \u2022 ${project.framework}`}
        actionLabel="Back to Tests"
        onAction={() => navigate(`/projects/${projectId}/tests`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ContentCard>
          <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Test Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">File</span>
              <span className="font-mono text-xs text-right max-w-[200px] truncate">{testInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Path</span>
              <span className="font-mono text-xs text-right max-w-[200px] truncate">{testInfo.path}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Project</span>
              <span>{project.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Framework</span>
              <span>{project.framework}</span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setShowDrawer(true)}
                disabled={runLoading}
                className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all disabled:opacity-50"
              >
                {runLoading ? "Running..." : "Run Test"}
              </button>
            </div>
          </div>
        </ContentCard>

        <ContentCard className="lg:col-span-2">
          <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-3">
            Run History ({runs.length})
          </h3>
          {runs.length === 0 ? (
            <div className="text-text-secondary text-center py-8 text-sm">
              No runs yet for this test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase">
                    <th className="text-left py-2 pr-3 font-medium">Run ID</th>
                    <th className="text-center py-2 px-3 font-medium">Status</th>
                    <th className="text-right py-2 px-3 font-medium">Mode</th>
                    <th className="text-right py-2 px-3 font-medium">Passed</th>
                    <th className="text-right py-2 px-3 font-medium">Failed</th>
                    <th className="text-right py-2 px-3 font-medium">Duration</th>
                    <th className="text-right py-2 pl-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-border-subtle/50 hover:bg-background/50 cursor-pointer"
                      onClick={() => navigate(`/runs/${run.id}`)}
                    >
                      <td className="py-2 pr-3 font-mono text-xs text-text-secondary">{run.id}</td>
                      <td className="py-2 px-3 text-center">
                        <RunStatusBadge status={run.status} />
                      </td>
                      <td className="py-2 px-3 text-right text-text-secondary text-xs">{run.mode}</td>
                      <td className="py-2 px-3 text-right text-success">
                        {run.test_result?.passed ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-danger">
                        {run.test_result?.failed ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-text-secondary text-xs">
                        {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "-"}
                      </td>
                      <td className="py-2 pl-3 text-right text-text-secondary text-xs">
                        {run.created_at ? new Date(run.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>

      {showDrawer && (
        <RunDrawer
          project={project}
          testFile={decodedPath}
          onClose={() => setShowDrawer(false)}
          onRun={handleRunComplete}
        />
      )}
    </div>
  );
}
