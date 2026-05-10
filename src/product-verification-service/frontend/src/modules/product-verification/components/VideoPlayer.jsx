import React, { useRef, useState, useEffect, useCallback } from "react";
import { getRunVideoUrl, getRunFrames, getRunFrameUrl, uploadFrame, deleteFrame } from "../LocalProjectService";

export default function VideoPlayer({ runId, onFrameExtracted }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [frames, setFrames] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [batchExtracting, setBatchExtracting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekInput, setSeekInput] = useState("");
  const [batchInterval, setBatchInterval] = useState(5);
  const [deleting, setDeleting] = useState(null);

  const loadFrames = useCallback(() => {
    getRunFrames(runId).then(setFrames).catch(() => {});
  }, [runId]);

  useEffect(() => {
    const url = getRunVideoUrl(runId);
    setVideoUrl(url);
    loadFrames();
  }, [runId, loadFrames]);

  const extractCurrentFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    setExtracting(true);
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const name = `frame_manual_${Math.round(currentTime)}s_${Date.now()}.jpg`;
      await uploadFrame(runId, blob, name);
      loadFrames();
      if (onFrameExtracted) onFrameExtracted({ name, time: currentTime, blob });
    } catch (err) {
      console.error("Frame extraction failed:", err);
    } finally {
      setExtracting(false);
    }
  };

  const extractBatch = async () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setBatchExtracting(true);
    const total = Math.floor(video.duration);
    const step = batchInterval;
    const originalTime = video.currentTime;
    try {
      for (let t = 0; t <= total; t += step) {
        video.currentTime = t;
        await new Promise((resolve) => {
          video.onseeked = resolve;
          if (Math.abs(video.currentTime - t) < 0.1) resolve();
        });
        await new Promise((r) => setTimeout(r, 150));
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
        const name = `frame_auto_${t}s_${Date.now()}.jpg`;
        await uploadFrame(runId, blob, name);
      }
      loadFrames();
      video.currentTime = originalTime;
      if (onFrameExtracted) onFrameExtracted({ batch: true });
    } catch (err) {
      console.error("Batch extraction failed:", err);
    } finally {
      setBatchExtracting(false);
    }
  };

  const handleDelete = async (name) => {
    setDeleting(name);
    try {
      await deleteFrame(runId, name);
      loadFrames();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSeek = () => {
    const video = videoRef.current;
    if (!video) return;
    const secs = parseFloat(seekInput);
    if (!isNaN(secs) && secs >= 0 && secs <= (video.duration || 0)) {
      video.currentTime = secs;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1);
    return `${m}:${sec.padStart(4, "0")}`;
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {videoUrl ? (
        <div className="bg-black rounded overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="w-full max-h-[500px]"
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="bg-background border border-border-subtle rounded p-8 text-center text-text-secondary">
          No video recording available for this run.
        </div>
      )}

      {videoUrl && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="text-xs text-text-secondary font-mono">
              {fmt(currentTime)} / {fmt(videoRef.current?.duration || 0)}
            </span>
            <input
              type="text"
              value={seekInput}
              onChange={(e) => setSeekInput(e.target.value)}
              placeholder="Seek (seconds)"
              className="w-24 bg-background border border-border-subtle rounded px-2 py-1 text-xs text-text-primary"
              onKeyDown={(e) => e.key === "Enter" && handleSeek()}
            />
            <button
              onClick={handleSeek}
              className="px-2 py-1 text-xs bg-background border border-border-subtle rounded hover:border-accent"
            >
              Go
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <button
              onClick={extractCurrentFrame}
              disabled={extracting}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-background font-medium rounded text-sm disabled:opacity-50"
            >
              {extracting ? "Extracting..." : "Extract Frame"}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary">Batch every</span>
              <input
                type="number"
                min={1}
                max={60}
                value={batchInterval}
                onChange={(e) => setBatchInterval(parseInt(e.target.value) || 5)}
                className="w-16 bg-background border border-border-subtle rounded px-2 py-1 text-xs text-text-primary"
              />
              <span className="text-xs text-text-secondary">s</span>
              <button
                onClick={extractBatch}
                disabled={batchExtracting}
                className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 rounded text-sm disabled:opacity-50"
              >
                {batchExtracting ? "Extracting..." : "Extract All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {frames.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">
            Extracted Frames ({frames.length})
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {frames.map((name) => (
              <div
                key={name}
                className="border border-border-subtle rounded overflow-hidden group relative"
              >
                <img
                  src={getRunFrameUrl(runId, name)}
                  alt={name}
                  className="w-full h-20 object-cover"
                />
                <div className="p-1">
                  <p className="text-[10px] text-text-secondary truncate" title={name}>
                    {name}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(name)}
                  disabled={deleting === name}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-danger"
                  title="Delete frame"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
