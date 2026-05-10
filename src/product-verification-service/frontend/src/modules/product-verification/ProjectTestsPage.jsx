import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, ContentCard } from "../../ui/Shared";
import * as localProjectService from "./LocalProjectService";

export default function ProjectTestsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localProjectService.listLocalProjects().then((projects) => {
      const p = projects.find((pr) => pr.id === projectId);
      if (p) setProject(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="text-text-secondary p-6">Loading...</div>;
  if (!project) return <div className="text-danger p-6">Project not found</div>;

  const frameworkIcons = { playwright: "\uD83C\uDFAD", cypress: "\uD83C\uDF32", vitest: "\u26A1", jest: "\uD83C\uDCCF" };

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={`${project.framework} \u2022 ${project.test_count} tests \u2022 ${project.path}`}
        actionLabel="Back to Projects"
        onAction={() => navigate("/")}
      />

      <ContentCard>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase">
              <th className="text-left py-3 px-4 font-medium">Test File</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {project.test_files && project.test_files.length > 0 ? (
              project.test_files.map((test) => (
                <tr
                  key={test.path}
                  className="border-b border-border-subtle/50 hover:bg-background/50 cursor-pointer"
                  onClick={() => navigate(`/projects/${projectId}/tests/${encodeURIComponent(test.path)}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <span>{frameworkIcons[project.framework] || "\u2753"}</span>
                      <div>
                        <span className="text-text-primary font-mono text-sm">{test.name}</span>
                        <p className="text-xs text-text-secondary font-mono truncate max-w-md">{test.path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${projectId}/tests/${encodeURIComponent(test.path)}`);
                      }}
                      className="px-3 py-1 text-xs bg-accent hover:bg-accent-hover text-background rounded transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-8 text-center text-text-secondary">No test files found</td>
              </tr>
            )}
          </tbody>
        </table>
      </ContentCard>
    </div>
  );
}
