import React, { useState, useEffect } from "react";
import * as api from "../VerificationService";

export default function NewRunDialog({ onClose, onRun }) {
  const [suites, setSuites] = useState([]);
  const [suite, setSuite] = useState("");
  const [scenario, setScenario] = useState("");
  const [mode, setMode] = useState("default");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.listSuites().then(setSuites).catch(() => {});
  }, []);

  const currentSuite = suites.find((s) => s.name === suite);
  const scenarios = currentSuite?.scenarios || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      await onRun({ suite, scenario, mode });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-subtle rounded-md p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-text-primary mb-6">New Verification Run</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Suite</label>
            <select
              value={suite}
              onChange={(e) => { setSuite(e.target.value); setScenario(""); }}
              className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-text-primary"
              required
            >
              <option value="">Select suite...</option>
              {suites.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-text-primary"
              required
              disabled={!suite}
            >
              <option value="">Select scenario...</option>
              {scenarios.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-text-primary"
            >
              <option value="default">Default (logs only)</option>
              <option value="validation">Validation (record + report)</option>
              <option value="discovery">Discovery (screenshots + UX audit)</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={running}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all min-h-[44px] flex items-center justify-center"
            >
              {running ? "Running..." : "Run"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border-subtle text-text-secondary rounded-sm hover:text-text-primary transition-all min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
