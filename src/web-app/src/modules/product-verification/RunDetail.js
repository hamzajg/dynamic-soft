import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, ContentCard } from "../../ui/Shared";
import RunStatusBadge from "./components/RunStatusBadge";
import LogViewer from "./components/LogViewer";
import ScreenshotGallery from "./components/ScreenshotGallery";
import ReportViewer from "./components/ReportViewer";
import * as api from "./VerificationService";

const TABS = ["overview", "log", "screenshots", "report"];

export default function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRun(id).then(setRun).catch(() => navigate("/verification")).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-text-secondary">Loading...</div>;
  if (!run) return <div className="text-danger">Run not found</div>;

  return (
    <div>
      <PageHeader
        title={`${run.suite} / ${run.scenario}`}
        subtitle={
          <span className="flex items-center space-x-3">
            <RunStatusBadge status={run.status} />
            <span className="text-text-secondary">{run.mode} mode</span>
            <span className="text-text-secondary">{(run.duration_ms / 1000).toFixed(1)}s</span>
          </span>
        }
      />

      <ContentCard noPadding className="mb-6">
        <div className="flex border-b border-border-subtle">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
                tab === t
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </ContentCard>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContentCard>
            <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Passed</span><span className="text-success font-bold">{run.passed}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Failed</span><span className="text-danger font-bold">{run.failed}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Total</span><span className="font-bold">{run.total}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Duration</span><span>{(run.duration_ms / 1000).toFixed(1)}s</span></div>
            </div>
          </ContentCard>
          <ContentCard>
            <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Suite</span><span>{run.suite}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Scenario</span><span>{run.scenario}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Mode</span><span>{run.mode}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Status</span><span><RunStatusBadge status={run.status} /></span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Started</span><span className="text-xs">{run.started_at}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Finished</span><span className="text-xs">{run.finished_at}</span></div>
            </div>
          </ContentCard>
          {run.error_message && (
            <ContentCard className="md:col-span-2">
              <h3 className="text-sm uppercase tracking-wider text-danger mb-3">Error</h3>
              <pre className="text-sm text-danger font-mono">{run.error_message}</pre>
            </ContentCard>
          )}
        </div>
      )}

      {tab === "log" && <LogViewer runId={run.id} suite={run.suite} scenario={run.scenario} />}
      {tab === "screenshots" && <ScreenshotGallery runId={run.id} suite={run.suite} scenario={run.scenario} />}
      {tab === "report" && <ReportViewer runId={run.id} suite={run.suite} scenario={run.scenario} />}
    </div>
  );
}
