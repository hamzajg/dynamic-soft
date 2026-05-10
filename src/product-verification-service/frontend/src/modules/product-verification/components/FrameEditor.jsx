import React, { useRef, useState, useEffect, useCallback } from "react";
import { getRunFrameUrl, getFrameAnnotation, saveFrameAnnotation, analyzeFrame } from "../LocalProjectService";

const TOOLS = [
  { id: "rect", label: "\u2B1B Rect" },
  { id: "ellipse", label: "\u25CB Ellipse" },
  { id: "arrow", label: "\u2192 Arrow" },
  { id: "freehand", label: "\u270E Freehand" },
];

const COLOR_PRESETS = [
  "#FF0000", "#00AA00", "#0066FF", "#FF8800", "#AA00FF",
  "#FF00AA", "#00AAAA", "#888888", "#FFCC00", "#000000",
];

const ANALYSIS_BACKENDS = [
  { id: "", label: "Default" },
  { id: "ollama", label: "Ollama" },
  { id: "opencode", label: "Opencode" },
];

export default function FrameEditor({ runId, frameName, onClose }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [activeTool, setActiveTool] = useState("rect");
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [description, setDescription] = useState("");
  const [rawAnalysis, setRawAnalysis] = useState("");
  const [freehandPoints, setFreehandPoints] = useState([]);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [activeColor, setActiveColor] = useState("#FF0000");
  const [shapeLabel, setShapeLabel] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [analysisBackend, setAnalysisBackend] = useState("");
  const [analysisModel, setAnalysisModel] = useState("");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = getRunFrameUrl(runId, frameName);

    getFrameAnnotation(runId, frameName).then((ann) => {
      if (ann && ann.shapes) setShapes(ann.shapes);
      if (ann && ann.description) setDescription(ann.description);
    }).catch(() => {});
  }, [runId, frameName]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const hitTest = (pos) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      const margin = 8;
      if (s.type === "rect") {
        if (pos.x >= Math.min(s.x, s.x + s.w) - margin && pos.x <= Math.max(s.x, s.x + s.w) + margin &&
            pos.y >= Math.min(s.y, s.y + s.h) - margin && pos.y <= Math.max(s.y, s.y + s.h) + margin)
          return i;
      } else if (s.type === "ellipse") {
        const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
        const rx = Math.abs(s.w / 2) + margin, ry = Math.abs(s.h / 2) + margin;
        if (((pos.x - cx) ** 2) / (rx ** 2) + ((pos.y - cy) ** 2) / (ry ** 2) <= 1)
          return i;
      } else if (s.type === "arrow") {
        const dx = pos.x - s.x, dy = pos.y - s.y;
        const len = Math.sqrt(s.w * s.w + s.h * s.h);
        if (len === 0) continue;
        const dot = (dx * s.w + dy * s.h) / len;
        if (dot >= 0 && dot <= len + margin) {
          const perp = Math.abs(-s.h * dx + s.w * dy) / len;
          if (perp <= 10 + margin) return i;
        }
      } else if (s.type === "freehand" && s.points) {
        for (const p of s.points) {
          if (Math.abs(pos.x - p.x) <= margin && Math.abs(pos.y - p.y) <= margin)
            return i;
        }
      }
    }
    return -1;
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    if (e.shiftKey || activeTool === "select") {
      const idx = hitTest(pos);
      setSelectedIdx(idx >= 0 ? idx : null);
      return;
    }
    setSelectedIdx(null);
    setDrawing(true);
    const label = shapeLabel.trim() || "";
    const base = { color: activeColor, label };
    if (activeTool === "freehand") {
      setFreehandPoints([pos]);
      setCurrentShape({ type: "freehand", points: [pos], ...base });
    } else {
      setCurrentShape({ type: activeTool, x: pos.x, y: pos.y, w: 0, h: 0, ...base });
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing || !currentShape) return;
    const pos = getPos(e);
    if (currentShape.type === "freehand") {
      const updated = { ...currentShape, points: [...freehandPoints, pos] };
      setFreehandPoints((prev) => [...prev, pos]);
      setCurrentShape(updated);
    } else {
      setCurrentShape({
        ...currentShape,
        w: pos.x - currentShape.x,
        h: pos.y - currentShape.y,
      });
    }
    drawCanvas([...shapes, currentShape]);
  };

  const handleMouseUp = () => {
    if (!drawing || !currentShape) return;
    setDrawing(false);
    setShapes((prev) => [...prev, currentShape]);
    setCurrentShape(null);
    setFreehandPoints([]);
  };

  const drawCanvas = (allShapes, highlightIdx = selectedIdx) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    allShapes.forEach((s, i) => {
      const isSelected = i === highlightIdx;
      ctx.strokeStyle = s.color || "#FF0000";
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.fillStyle = s.color ? s.color.replace(")", ", 0.15)").replace("rgb", "rgba").replace(/^#[0-9a-f]{6}$/i, (m) => {
        const r = parseInt(m.slice(1, 3), 16);
        const g = parseInt(m.slice(3, 5), 16);
        const b = parseInt(m.slice(5, 7), 16);
        return `rgba(${r},${g},${b},0.15)`;
      }) : "rgba(255, 0, 0, 0.15)";

      ctx.beginPath();
      if (s.type === "rect") {
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeRect(s.x, s.y, s.w, s.h);
      } else if (s.type === "ellipse") {
        const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
        ctx.ellipse(cx, cy, Math.abs(s.w / 2), Math.abs(s.h / 2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (s.type === "arrow") {
        const dx = s.w, dy = s.h;
        const angle = Math.atan2(dy, dx);
        const headLen = 15;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx, s.y + dy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s.x + dx, s.y + dy);
        ctx.lineTo(s.x + dx - headLen * Math.cos(angle - 0.4), s.y + dy - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(s.x + dx - headLen * Math.cos(angle + 0.4), s.y + dy - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = s.color || "#FF0000";
        ctx.fill();
        ctx.stroke();
      } else if (s.type === "freehand" && s.points) {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
        ctx.stroke();
      }

      if (s.label) {
        ctx.fillStyle = s.color || "#FF0000";
        ctx.font = "bold 13px monospace";
        ctx.fillText(s.label, s.x + 6, s.y - 6);
      }

      if (isSelected) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        if (s.type === "rect") ctx.strokeRect(s.x - 2, s.y - 2, s.w + 4, s.h + 4);
        else if (s.type === "ellipse") {
          const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
          ctx.strokeRect(cx - Math.abs(s.w / 2) - 2, cy - Math.abs(s.h / 2) - 2, Math.abs(s.w) + 4, Math.abs(s.h) + 4);
        }
        ctx.setLineDash([]);
      }
    });
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = Math.min(imgSize.w, 800);
      canvas.height = canvas.width * (imgSize.h / imgSize.w);
      drawCanvas(shapes);
    }
  }, [image, shapes, imgSize]);

  useEffect(() => {
    if (image && canvasRef.current && currentShape) drawCanvas([...shapes, currentShape]);
  }, [currentShape]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFrameAnnotation(runId, frameName, shapes, description);
      alert("Annotations saved.");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setRawAnalysis("");
    try {
      const result = await analyzeFrame(runId, frameName, { backend: analysisBackend || undefined, model: analysisModel || undefined });
      const desc = result.description || "No description generated.";
      setRawAnalysis(desc);
      setDescription(desc);
    } catch (err) {
      setRawAnalysis("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteSelected = () => {
    if (selectedIdx === null) return;
    setShapes((prev) => prev.filter((_, i) => i !== selectedIdx));
    setSelectedIdx(null);
  };

  const clearShapes = () => { setShapes([]); setSelectedIdx(null); };

  const undoLast = () => {
    setShapes((prev) => prev.slice(0, -1));
    setSelectedIdx(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedIdx !== null) deleteSelected();
    }
    if (e.key === "Escape") setSelectedIdx(null);
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-primary font-mono">{frameName}</h4>
        <button onClick={onClose} className="text-xs text-text-secondary hover:text-text-primary">Close</button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
        {TOOLS.map((tool) => (
          <button key={tool.id} onClick={() => setActiveTool(tool.id)}
            className={`px-3 py-1 text-xs rounded ${
              activeTool === tool.id ? "bg-accent text-background" : "bg-background border border-border-subtle text-text-secondary hover:border-accent"
            }`}>{tool.label}</button>
        ))}
        <span className="text-xs text-text-secondary mx-1">|</span>
        {COLOR_PRESETS.map((c) => (
          <button key={c} onClick={() => setActiveColor(c)}
            className={`w-5 h-5 rounded-full border-2 ${activeColor === c ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: c }} title={c} />
        ))}
        <div className="flex-1" />
        <button onClick={undoLast} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary" title="Undo last shape">Undo</button>
        <button onClick={clearShapes} className="px-2 py-1 text-xs text-danger hover:text-danger/80" title="Clear all shapes">Clear</button>
        {selectedIdx !== null && (
          <button onClick={deleteSelected} className="px-2 py-1 text-xs bg-danger text-white rounded hover:bg-danger/80" title="Delete selected shape">
            Delete
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input type="text" value={shapeLabel} onChange={(e) => setShapeLabel(e.target.value)}
          placeholder="Shape label (optional)"
          className="flex-1 bg-background border border-border-subtle rounded px-2 py-1 text-xs text-text-primary" />
        {selectedIdx !== null && (
          <span className="text-xs text-text-secondary">Selected: #{selectedIdx + 1}</span>
        )}
      </div>

      <div className="border border-border-subtle rounded overflow-hidden bg-black/10">
        <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          className="w-full cursor-crosshair" />
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
        <span className="text-xs text-text-secondary">Analyze with:</span>
        <select value={analysisBackend} onChange={(e) => setAnalysisBackend(e.target.value)}
          className="bg-background border border-border-subtle rounded px-2 py-1 text-xs text-text-primary">
          {ANALYSIS_BACKENDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <input type="text" value={analysisModel} onChange={(e) => setAnalysisModel(e.target.value)}
          placeholder="Model (e.g. llava)"
          className="w-28 bg-background border border-border-subtle rounded px-2 py-1 text-xs text-text-primary" />
      </div>

      {rawAnalysis && (
        <div>
          <label className="block text-xs text-text-secondary mb-1">AI Analysis Output</label>
          <pre className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-xs text-text-secondary font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {rawAnalysis}
          </pre>
        </div>
      )}

      <div>
        <label className="block text-xs text-text-secondary mb-1">Frame Description (editable)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-sm text-text-primary resize-none"
          placeholder="AI-generated or manual description of this frame..." />
      </div>

      <div className="flex space-x-3">
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-background font-medium rounded text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save Annotations"}
        </button>
        <button onClick={handleAnalyze} disabled={analyzing}
          className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 rounded text-sm disabled:opacity-50">
          {analyzing ? `Analyzing (${analysisBackend || "default"})...` : "Analyze Frame"}
        </button>
      </div>
    </div>
  );
}
