import React, { useState } from "react";
import * as localProjectService from "../LocalProjectService";

export default function RunDrawer({ project, testFile, onClose, onRun }) {
  const [mode, setMode] = useState("default");
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [running, setRunning] = useState(false);

  const canRecord = project.framework === "playwright";

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i, field, val) => {
    const updated = [...envVars];
    updated[i] = { ...updated[i], [field]: val };
    setEnvVars(updated);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const envMap = {};
      envVars.forEach((e) => { if (e.key.trim()) envMap[e.key.trim()] = e.value; });
      const result = await localProjectService.runLocalProject(project.id, {
        testFiles: testFile ? [testFile] : [],
        mode,
        envVars: envMap,
      });
      onRun(result);
    } catch (err) {
      alert(`Run failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-surface border-l border-border-subtle shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <h2 className="text-lg font-bold text-text-primary">Run Configuration</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl leading-none">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div>
              <p className="text-sm text-text-secondary mb-1">Test</p>
              <p className="text-sm text-text-primary font-mono">{testFile || "All tests"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Mode</label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="radio" name="mode" value="default" checked={mode === "default"}
                    onChange={() => setMode("default")} className="mt-1" />
                  <div>
                    <span className="text-sm text-text-primary font-medium">Default</span>
                    <p className="text-xs text-text-secondary">Fast execution, logs only</p>
                  </div>
                </label>
                <label className={`flex items-start space-x-3 cursor-pointer ${!canRecord ? "opacity-50" : ""}`}>
                  <input type="radio" name="mode" value="validation" checked={mode === "validation"}
                    onChange={() => setMode("validation")} disabled={!canRecord} className="mt-1" />
                  <div>
                    <span className="text-sm text-text-primary font-medium">Validation</span>
                    <p className="text-xs text-text-secondary">
                      {canRecord ? "Video recording + AI analysis report" : "Requires Playwright"}
                    </p>
                  </div>
                </label>
                <label className={`flex items-start space-x-3 cursor-pointer ${!canRecord ? "opacity-50" : ""}`}>
                  <input type="radio" name="mode" value="discovery" checked={mode === "discovery"}
                    onChange={() => setMode("discovery")} disabled={!canRecord} className="mt-1" />
                  <div>
                    <span className="text-sm text-text-primary font-medium">Discovery</span>
                    <p className="text-xs text-text-secondary">
                      {canRecord ? "Screenshots + UX audit report" : "Requires Playwright"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Environment Variables</label>
              <div className="space-y-2">
                {envVars.map((ev, i) => (
                  <div key={i} className="flex space-x-2">
                    <input type="text" value={ev.key} onChange={(e) => updateEnvVar(i, "key", e.target.value)}
                      placeholder="KEY" className="flex-1 bg-background border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary font-mono" />
                    <input type="text" value={ev.value} onChange={(e) => updateEnvVar(i, "value", e.target.value)}
                      placeholder="value" className="flex-[2] bg-background border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary font-mono" />
                    <button onClick={() => removeEnvVar(i)} className="px-2 text-danger hover:text-danger/80">X</button>
                  </div>
                ))}
                <button onClick={addEnvVar} className="text-xs text-accent hover:text-accent-hover">+ Add variable</button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border-subtle flex space-x-3">
            <button onClick={handleRun} disabled={running}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all disabled:opacity-50">
              {running ? "Running..." : "Run"}
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 border border-border-subtle text-text-secondary rounded-sm hover:text-text-primary transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
