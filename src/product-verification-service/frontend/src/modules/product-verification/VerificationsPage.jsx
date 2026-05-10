import React, { useEffect, useState } from "react";
import { PageHeader, ContentCard } from "../../ui/Shared";
import { VerificationProvider, useVerification } from "./VerificationProvider";
import RunTable from "./components/RunTable";
import ImportProjectDialog from "./components/ImportProjectDialog";
import ProjectCard from "./components/ProjectCard";
import * as localProjectService from "./LocalProjectService";

function Dashboard() {
  const { runs, loading, fetchRuns } = useVerification();
  const [showImport, setShowImport] = useState(false);
  const [localProjects, setLocalProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    fetchRuns();
    loadLocalProjects();
  }, [fetchRuns]);

  const loadLocalProjects = async () => {
    setLoadingProjects(true);
    try {
      const projects = await localProjectService.listLocalProjects();
      setLocalProjects(projects);
    } catch (err) {
      console.error("Failed to load local projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleImportProject = async () => {
    await loadLocalProjects();
  };

  const handleSyncProject = async (projectId) => {
    try {
      await localProjectService.syncLocalProject(projectId);
      await loadLocalProjects();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await localProjectService.deleteLocalProject(projectId);
      await loadLocalProjects();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Verification"
        subtitle="Specification end-to-end verification runs"
        actionLabel="Import Project"
        onAction={() => setShowImport(true)}
      />

      <ContentCard className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Local Projects</h2>
        {loadingProjects ? (
          <div className="text-text-secondary">Loading projects...</div>
        ) : localProjects.length === 0 ? (
          <div className="text-text-secondary text-center py-8">
            No local projects imported yet. Click "Import Project" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSync={handleSyncProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </ContentCard>

      <ContentCard noPadding>
        {loading ? (
          <div className="p-6 text-text-secondary">Loading...</div>
        ) : (
          <RunTable runs={runs} />
        )}
      </ContentCard>

      {showImport && (
        <ImportProjectDialog
          onClose={() => setShowImport(false)}
          onImport={handleImportProject}
        />
      )}
    </div>
  );
}

export default function VerificationsPage() {
  return (
    <VerificationProvider>
      <Dashboard />
    </VerificationProvider>
  );
}
