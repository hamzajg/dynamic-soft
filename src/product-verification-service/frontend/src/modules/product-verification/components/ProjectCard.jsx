import React from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../../ui/Shared";

export default function ProjectCard({ project, onSync, onDelete }) {
  const navigate = useNavigate();

  const getFrameworkIcon = (framework) => {
    const icons = {
      playwright: "\uD83C\uDFAD",
      cypress: "\uD83C\uDF32",
      vitest: "\u26A1",
      jest: "\uD83C\uDCCF",
    };
    return icons[framework] || "\u2753";
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-md p-4 hover:border-accent transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getFrameworkIcon(project.framework)}</span>
          <div>
            <h3 className="font-medium text-text-primary">{project.name}</h3>
            <p className="text-xs text-text-secondary truncate max-w-[200px]">{project.path}</p>
          </div>
        </div>
        <StatusBadge color="accent">local</StatusBadge>
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
        <span>{project.test_count} tests</span>
        <span className="text-xs">
          Last synced: {project.last_synced_at
            ? new Date(project.last_synced_at).toLocaleDateString()
            : "Never"}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/projects/${project.id}/tests`)}
          className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover text-background rounded transition-colors font-medium"
        >
          View Tests
        </button>
        <button
          onClick={() => onSync(project.id)}
          className="px-3 py-1.5 text-xs bg-background border border-border-subtle rounded hover:border-accent transition-colors"
        >
          Sync
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="px-3 py-1.5 text-xs text-danger hover:bg-danger/10 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
