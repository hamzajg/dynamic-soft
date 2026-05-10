import React, { useState, useEffect, useRef } from "react";
import { ContentCard } from "../../../ui/Shared";
import { getLog } from "../VerificationService";
import { getRunLog } from "../LocalProjectService";

const WS_BASE = `ws://${window.location.hostname}:${window.location.port}`;

export default function LogViewer({ runId, suite, scenario, local, stream }) {
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const preRef = useRef(null);

  const fetchLog = () => {
    if (!runId) return;
    setLoading(true);
    const p = local ? getRunLog(runId) : getLog(runId, suite, scenario);
    Promise.resolve(p).then(setLog).catch(setError).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!runId) return;

    if (stream) {
      setLoading(false);
      setError(null);

      const wsUrl = local
        ? `${WS_BASE}/api/v1/local-projects/runs/${runId}/ws`
        : `${WS_BASE}/api/v1/verifications/${runId}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "log" && msg.line) {
            setLog((prev) => prev + msg.line);
          }
        } catch {
          setLog((prev) => prev + event.data);
        }
      };

      wsRef.current.onerror = () => fetchLog();
      wsRef.current.onclose = () => fetchLog();

      return () => {
        if (wsRef.current) wsRef.current.close();
      };
    } else {
      setLog("");
      fetchLog();
    }
  }, [runId, suite, scenario, local, stream]);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [log]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading log...</p></ContentCard>;
  if (error) return <ContentCard><p className="text-danger">Error: {error}</p></ContentCard>;

  return (
    <ContentCard noPadding>
      <pre ref={preRef} className="p-4 text-xs font-mono text-text-secondary overflow-auto max-h-[600px] leading-relaxed whitespace-pre-wrap">
        {log || "(empty log)"}
      </pre>
    </ContentCard>
  );
}
