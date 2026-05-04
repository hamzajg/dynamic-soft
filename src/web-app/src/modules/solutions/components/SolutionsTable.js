import {Link} from "react-router-dom";
import domains from "../Domains.json";
import React from "react";
import {StatusBadge} from "../../../ui/Shared";

const SolutionsTable = ({solutions}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated/50">
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Solution Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Domain</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
                {solutions?.map((solution, index) => (
                    <tr key={index} className="hover:bg-surface-elevated/40 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                            <Link to={"/solutions/" + solution.id + "/projects"} className="text-text-primary font-bold hover:text-accent transition-colors tracking-tight">
                                {solution.name}
                            </Link>
                        </td>
                        <td className="px-6 py-5 text-text-secondary text-sm font-medium">
                            {solution.description}
                        </td>
                        <td className="px-6 py-5">
                            <StatusBadge>
                                {domains.find(d => d.id == solution.domain)?.name || 'Other'}
                            </StatusBadge>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <button className="text-accent hover:text-accent-hover text-[10px] font-bold tracking-widest uppercase transition-colors px-3 py-1.5 rounded-sm hover:bg-accent/5">
                                EDIT
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {(!solutions || solutions.length === 0) && (
            <div className="py-24 text-center text-text-tertiary italic text-sm font-medium">
                No solutions found. Create your first one to get started.
            </div>
        )}
    </div>
);

export {SolutionsTable}