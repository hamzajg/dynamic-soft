import {Link} from "react-router-dom";
import React from "react";
import {StatusBadge} from "../../../ui/Shared";

const ProjectsTable = ({projects}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated/50">
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Project Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Tags</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Teams</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
                {projects.map((project, index) => (
                    <tr key={index} className="hover:bg-surface-elevated/40 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                            <Link to={"/projects/" + project.id + "/diagrams"} className="text-text-primary font-bold hover:text-accent transition-colors tracking-tight">
                                {project.name}
                            </Link>
                        </td>
                        <td className="px-6 py-5 text-text-secondary text-sm font-medium">
                            {project.description}
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1.5">
                                {project.tags.map((tag, i) => (
                                    <StatusBadge key={i} color="accent">{tag.name}</StatusBadge>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-text-secondary text-xs">
                            {project.teamMembers.map(m => m.name).join(", ")}
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                                <button className="text-accent hover:text-accent-hover text-[10px] font-bold tracking-widest uppercase transition-colors px-3 py-1.5 rounded-sm hover:bg-accent/5">
                                    EDIT
                                </button>
                                <button className="text-danger hover:text-danger/80 text-[10px] font-bold tracking-widest uppercase transition-colors px-3 py-1.5 rounded-sm hover:bg-danger/5">
                                    REMOVE
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {(!projects || projects.length === 0) && (
            <div className="py-24 text-center text-text-tertiary italic text-sm font-medium">
                No projects found in this solution.
            </div>
        )}
    </div>
);

export {ProjectsTable};