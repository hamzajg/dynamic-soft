import React, { useState } from "react";
import { ContentCard } from "../../../ui/Shared";
import * as localProjectService from "../LocalProjectService";

export default function ImportProjectDialog({ onClose, onImport }) {
  const [projectPath, setProjectPath] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectFolder = async () => {
    try {
      // Check if File System Access API is available
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read'
        });
        if (dirHandle) {
          // File System Access API doesn't expose full paths for security
          // We need to use the directory handle directly
          // For now, we'll show a message that full path access is needed
          setError('File System Access API selected folder, but full path is required. Please enter path manually.');
          return;
        }
      } else {
        // Fallback: show input field with instructions
        setError('File System Access API not available. Please enter path manually.');
      }
    } catch (err) {
      setError(`Failed to select folder: ${err.message}`);
    }
  };

  const handleScan = async () => {
    if (!projectPath.trim()) {
      setError("Please enter a project path");
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const result = await localProjectService.scanLocalProject(projectPath);
      setScanResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async () => {
    if (!scanResult) return;

    try {
      await localProjectService.importLocalProject(projectPath);
      onImport();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const getFrameworkIcon = (framework) => {
    const icons = {
      playwright: "🎭",
      cypress: "🌲",
      vitest: "⚡",
      jest: "🃏",
    };
    return icons[framework] || "❓";
  };

  
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-subtle rounded-md p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-text-primary mb-6">Import Local Project</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Project Path</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="Select a folder or enter path"
                className="flex-1 bg-background border border-border-subtle rounded px-3 py-2 text-text-primary"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-background font-medium rounded text-sm"
              >
                Browse...
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-sm">
              {error}
            </div>
          )}

          {scanResult && (
            <ContentCard className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFrameworkIcon(scanResult.framework)}</span>
                  <span className="font-medium text-text-primary">{scanResult.framework}</span>
                  {scanResult.config_found && (
                    <span className="text-xs text-success">✓ Config found</span>
                  )}
                </div>
                <span className="text-sm text-text-secondary">{scanResult.test_count} tests</span>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {scanResult.test_files.slice(0, 10).map((test) => (
                  <div key={test.path} className="text-xs text-text-secondary font-mono">
                    {test.path}
                  </div>
                ))}
                {scanResult.test_files.length > 10 && (
                  <div className="text-xs text-text-tertiary">
                    ... and {scanResult.test_files.length - 10} more
                  </div>
                )}
              </div>
            </ContentCard>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleScan}
              disabled={scanning || !projectPath.trim()}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all min-h-[44px] flex items-center justify-center"
            >
              {scanning ? "Scanning..." : "Scan"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-border-subtle text-text-secondary rounded-sm hover:text-text-primary transition-all min-h-[44px]"
            >
              Cancel
            </button>
            {scanResult && (
              <button
                onClick={handleImport}
                className="px-6 py-2.5 bg-success hover:bg-success-hover text-background font-bold rounded-sm transition-all min-h-[44px] flex items-center justify-center"
              >
                Import Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
