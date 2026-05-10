import React, { useState, useEffect } from "react";
import { ContentCard } from "../../../ui/Shared";
import { listScreenshots, screenshotUrl } from "../VerificationService";

const API_BASE = process.env.REACT_APP_VERIFICATION_API || "http://localhost:8083";

export default function ScreenshotGallery({ runId, suite, scenario }) {
  const [screenshots, setScreenshots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runId || !suite || !scenario) return;
    setLoading(true);
    listScreenshots(runId, suite, scenario)
      .then(setScreenshots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [runId, suite, scenario]);

  if (loading) return <ContentCard><p className="text-text-secondary">Loading...</p></ContentCard>;
  if (screenshots.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Screenshots ({screenshots.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screenshots.map((file) => (
          <div
            key={file}
            onClick={() => setSelected(file)}
            className="cursor-pointer border border-border-subtle rounded overflow-hidden hover:border-accent transition-colors"
          >
            <img
              src={`${API_BASE}/api/v1/verifications/${runId}/screenshots/${file}?suite=${suite}&scenario=${scenario}`}
              alt={file}
              className="w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
        >
          <img
            src={`${API_BASE}/api/v1/verifications/${runId}/screenshots/${selected}?suite=${suite}&scenario=${scenario}`}
            alt={selected}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
