import React, { useState, useEffect, useCallback } from "react";
import { ContentCard } from "../../../ui/Shared";
import { listScreenshots } from "../VerificationService";
import { getRunScreenshots, getRunScreenshotUrl } from "../LocalProjectService";

export default function ScreenshotGallery({ runId, suite, scenario, local, onOpenEditor }) {
  const [screenshots, setScreenshots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runId) return;
    setLoading(true);
    const fetch = local ? getRunScreenshots(runId) : listScreenshots(runId, suite, scenario);
    Promise.resolve(fetch).then(setScreenshots).catch(() => {}).finally(() => setLoading(false));
  }, [runId, suite, scenario, local]);

  const openLightbox = (file, idx) => {
    setSelected(file);
    setSelectedIdx(idx);
  };

  const closeLightbox = () => {
    setSelected(null);
    setSelectedIdx(-1);
  };

  const goPrev = useCallback(() => {
    if (selectedIdx > 0) {
      setSelected(screenshots[selectedIdx - 1]);
      setSelectedIdx(selectedIdx - 1);
    }
  }, [selectedIdx, screenshots]);

  const goNext = useCallback(() => {
    if (selectedIdx < screenshots.length - 1) {
      setSelected(screenshots[selectedIdx + 1]);
      setSelectedIdx(selectedIdx + 1);
    }
  }, [selectedIdx, screenshots]);

  useEffect(() => {
    if (selected === null) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, goPrev, goNext]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading...</p></ContentCard>;
  if (screenshots.length === 0) return null;

  const screenshotUrl = (file) =>
    local ? getRunScreenshotUrl(runId, file) : `/api/v1/verifications/${runId}/screenshots/${file}?suite=${suite}&scenario=${scenario}`;

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Screenshots ({screenshots.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screenshots.map((file, idx) => (
          <div key={file}
            onClick={() => openLightbox(file, idx)}
            className="cursor-pointer border border-border-subtle rounded overflow-hidden hover:border-accent transition-colors group relative">
            <img src={screenshotUrl(file)} alt={file} className="w-full h-32 object-cover" />
            <div className="p-2 text-xs text-text-secondary font-mono truncate">{file}</div>
            {onOpenEditor && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenEditor(file); }}
                className="absolute top-1 right-1 px-2 py-0.5 bg-accent text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 select-none">
          {selectedIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl flex items-center justify-center transition-colors">
              &#8249;
            </button>
          )}
          {selectedIdx < screenshots.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl flex items-center justify-center transition-colors">
              &#8250;
            </button>
          )}
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <img src={screenshotUrl(selected)} alt={selected}
              className="max-w-full max-h-[85vh] object-contain rounded" />
            <div className="mt-2 flex items-center space-x-4 text-xs text-white/60">
              <span>{selectedIdx + 1} / {screenshots.length}</span>
              <span className="font-mono">{selected}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
