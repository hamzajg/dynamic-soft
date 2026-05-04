import {Link} from "react-router-dom";
import React from "react";
import {StatusBadge} from "../../../ui/Shared";

const DiagramsTable = ({projectDiagrams}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated/50">
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Diagram Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Updated</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
                {projectDiagrams?.map((diagram, index) => (
                    <tr key={index} className="hover:bg-surface-elevated/40 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap text-text-primary font-bold tracking-tight">
                            {diagram.name}
                        </td>
                        <td className="px-6 py-5 text-text-secondary text-sm font-medium">
                            {diagram.description}
                        </td>
                        <td className="px-6 py-5">
                            <StatusBadge color="success">{diagram.type}</StatusBadge>
                        </td>
                        <td className="px-6 py-5 text-text-tertiary text-xs font-mono">
                            {diagram.updatedAt}
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                                <Link
                                    to={"/projects/" + diagram.projectId + "/diagrams/" + diagram.id + "/board"}
                                    className="text-background bg-accent hover:bg-accent-hover text-[10px] font-bold tracking-widest uppercase transition-colors px-4 py-1.5 rounded-sm shadow-sm"
                                >
                                    OPEN BOARD
                                </Link>
                                <button className="text-accent hover:text-accent-hover text-[10px] font-bold tracking-widest uppercase transition-colors px-3 py-1.5 rounded-sm hover:bg-accent/5 border border-accent/20">
                                    EDIT
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {(!projectDiagrams || projectDiagrams.length === 0) && (
            <div className="py-24 text-center text-text-tertiary italic text-sm font-medium">
                No diagrams found for this project.
            </div>
        )}
    </div>
);

export {DiagramsTable};