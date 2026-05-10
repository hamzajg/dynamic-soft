import React, { useState } from "react";
import * as localProjectService from "../LocalProjectService";

export default function RunConfigDialog({ project, onClose, onRun }) {
  const [selectedTests, setSelectedTests] = useState(
    project.preSelectedTest ? [project.preSelectedTest] : []
  );
  const [mode, setMode] = useState("default");
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [running, setRunning] = useState(false);

  const toggleTest = (testPath) => {
    setSelectedTests((prev) =>
      prev.includes(testPath)
        ? prev.filter((t) => t !== testPath)
        : [...prev, testPath]
    );
  };

  const toggleAll = () => {
    if (selectedTests.length === project.test_files.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(project.test_files.map((t) => t.path));
    }
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i, field, val) => {
    const updated = [...envVars];
    updated[i] = { ...updated[i], [field]: val };
    setEnvVars(updated);
  };

  const canRecord = project.framework === "playwright";

  const handleRun = async () => {
    setRunning(true);
    try {
      const envMap = {};
      envVars.forEach((e) => {
        if (e.key.trim()) envMap[e.key.trim()] = e.value;
      });
      const result = await localProjectService.runLocalProject(project.id, {
        testFiles: selectedTests,
        mode,
        envVars: envMap,
      });
      onRun(result);
      onClose();
    } catch (err) {
      alert(`Run failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-subtle rounded-md p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Run Tests: {project.name}
        </h2>

        {/* Test selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Test Files
          </label>
          <div className="max-h-40 overflow-y-auto border border-border-subtle rounded p-2 space-y-1">
            <label className="flex items-center space-x-2 text-sm cursor-pointer text-text-primary">
              <input
                type="checkbox"
                checked={selectedTests.length === project.test_files.length}
                onChange={toggleAll}
              />
              <span className="font-medium">Select All ({project.test_files.length} tests)</span>
            </label>
            {project.test_files.map((test) => (
              <label
                key={test.path}
                className="flex items-center space-x-2 text-sm cursor-pointer text-text-secondary hover:text-text-primary ml-4"
              >
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.path)}
                  onChange={() => toggleTest(test.path)}
                />
                <span className="font-mono">{test.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mode selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="default"
                checked={mode === "default"}
                onChange={() => setMode("default")}
              />
              <div>
                <span className="text-sm text-text-primary font-medium">Default</span>
                <p className="text-xs text-text-secondary">Fast execution, logs only</p>
              </div>
            </label>
            <label className={`flex items-center space-x-2 cursor-pointer ${!canRecord ? "opacity-50" : ""}`}>
              <input
                type="radio"
                name="mode"
                value="validation"
                checked={mode === "validation"}
                onChange={() => setMode("validation")}
                disabled={!canRecord}
              />
              <div>
                <span className="text-sm text-text-primary font-medium">Validation</span>
                <p className="text-xs text-text-secondary">
                  {canRecord
                    ? "Video recording + AI analysis report"
                    : "Requires Playwright framework (not available for {project.framework})"}
                </p>
              </div>
            </label>
            <label className={`flex items-center space-x-2 cursor-pointer ${!canRecord ? "opacity-50" : ""}`}>
              <input
                type="radio"
                name="mode"
                value="discovery"
                checked={mode === "discovery"}
                onChange={() => setMode("discovery")}
                disabled={!canRecord}
              />
              <div>
                <span className="text-sm text-text-primary font-medium">Discovery</span>
                <p className="text-xs text-text-secondary">
                  {canRecord
                    ? "Screenshots + UX audit report"
                    : "Requires Playwright framework (not available for {project.framework})"}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Env vars editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Environment Variables
          </label>
          <div className="space-y-2">
            {envVars.map((ev, i) => (
              <div key={i} className="flex space-x-2">
                <input
                  type="text"
                  value={ev.key}
                  onChange={(e) => updateEnvVar(i, "key", e.target.value)}
                  placeholder="KEY"
                  className="flex-1 bg-background border border-border-subtle rounded px-2 py-1 text-sm text-text-primary font-mono"
                />
                <input
                  type="text"
                  value={ev.value}
                  onChange={(e) => updateEnvVar(i, "value", e.target.value)}
                  placeholder="value"
                  className="flex-[2] bg-background border border-border-subtle rounded px-2 py-1 text-sm text-text-primary font-mono"
                />
                <button
                  onClick={() => removeEnvVar(i)}
                  className="px-2 text-danger hover:text-danger/80 text-sm"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addEnvVar}
              className="text-xs text-accent hover:text-accent-hover"
            >
              + Add variable
            </button>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-border-subtle">
          <button
            onClick={handleRun}
            disabled={running}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all min-h-[44px] disabled:opacity-50"
          >
            {running ? "Running..." : `Run ${selectedTests.length > 0 ? selectedTests.length : "all"} test(s)`}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border-subtle text-text-secondary rounded-sm hover:text-text-primary transition-all min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
