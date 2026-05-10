import React, { useState, useCallback } from "react";
import { getRunFrameUrl, analyzeFrame } from "../../LocalProjectService";
import FrameEditor from "../FrameEditor";
import ScreenshotGallery from "../ScreenshotGallery";

export default function ResultsGallery({ runId, frames, screenshots, frameAnnotations, isLocal, onRefresh }) {
  const [editingFrame, setEditingFrame] = useState(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);

  const handleAnalyzeAll = useCallback(async () => {
    setAnalyzingAll(true);
    for (const name of frames) {
      try {
        await analyzeFrame(runId, name);
      } catch {}
    }
    setAnalyzingAll(false);
    if (onRefresh) onRefresh();
  }, [runId, frames, onRefresh]);

  const hasFrames = frames.length > 0;
  const hasScreenshots = isLocal ? screenshots.length > 0 : true;

  if (!hasFrames && !hasScreenshots) {
    return <p className="text-text-secondary text-sm">No gallery artifacts available.</p>;
  }

  return (
    <div className="space-y-6">
      {editingFrame ? (
        <section>
          <FrameEditor
            runId={runId}
            frameName={editingFrame}
            onClose={() => { setEditingFrame(null); if (onRefresh) onRefresh(); }}
          />
        </section>
      ) : (
        <>
          {hasFrames && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm uppercase tracking-wider text-text-secondary">Frames ({frames.length})</h4>
                {frames.length > 1 && (
                  <button onClick={handleAnalyzeAll} disabled={analyzingAll}
                    className="px-3 py-1 text-xs border border-accent text-accent hover:bg-accent/10 rounded disabled:opacity-50">
                    {analyzingAll ? "Analyzing..." : "Analyze All"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {frames.map((name) => {
                  const desc = frameAnnotations[name] || "";
                  return (
                    <button key={name} onClick={() => setEditingFrame(name)}
                      className="border border-border-subtle rounded overflow-hidden hover:border-accent transition-colors text-left group relative">
                      <img src={getRunFrameUrl(runId, name)} alt={name} className="w-full h-28 object-cover" />
                      <div className="p-2">
                        <p className="text-xs text-text-secondary font-mono truncate">{name}</p>
                        {desc ? (
                          <p className="text-[10px] text-text-secondary mt-1 line-clamp-2">{desc}</p>
                        ) : (
                          <p className="text-[10px] text-text-tertiary mt-1 italic">No description</p>
                        )}
                      </div>
                      {desc && <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-success" title="Has description" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {hasScreenshots && (
            <section>
              <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-3">
                Screenshots ({screenshots.length})
              </h4>
              {isLocal
                ? <ScreenshotGallery runId={runId} local onOpenEditor={(file) => setEditingFrame(file)} />
                : <ScreenshotGallery runId={runId} suite="" scenario="" />
              }
            </section>
          )}
        </>
      )}
    </div>
  );
}
