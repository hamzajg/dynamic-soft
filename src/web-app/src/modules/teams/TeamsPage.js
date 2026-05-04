import React, {useContext, useState} from 'react';
import {TextInput, Textarea, Drawer} from 'flowbite-react';
import {TeamContext} from "./TeamsProvider";
import Multiselect from 'multiselect-react-dropdown';
import {PageHeader, ContentCard, StatusBadge} from "../../ui/Shared";

const TeamsPage = () => {
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {addTeam, teams} = useContext(TeamContext);
    const [formData, setFormData] = useState({id: '', name: '', description: '', guild: '', members: []});
    const [options, setOptions] = useState([{name: "Hamza Jguerim", id: 1}, {name: "Joe Doe", id: 2}]);

    const handleSubmit = (e) => {
        e.preventDefault();
        addTeam({...formData, id: Date.now().toString()});
        setFormData({id: '', name: '', description: '', guild: '', members: []});
        setShowRightPanel(false);
    };

    return (
        <div className="animate-fade-in">
            <PageHeader 
                title="TEAMS" 
                subtitle="Organize your workforce into Tribes and Guilds." 
                actionLabel="+ NEW TEAM" 
                onAction={() => setShowRightPanel(true)} 
            />

            <ContentCard noPadding={true}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle bg-surface-elevated/50">
                                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Team Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Tribe/Guild</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase">Members</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-text-tertiary uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/30">
                            {teams?.map((team, index) => (
                                <tr key={index} className="hover:bg-surface-elevated/40 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap text-text-primary font-bold tracking-tight">{team.name}</td>
                                    <td className="px-6 py-5 text-text-secondary text-sm font-medium">{team.description}</td>
                                    <td className="px-6 py-5">
                                        <StatusBadge color="accent">
                                            {team.guild}
                                        </StatusBadge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex -space-x-2">
                                            {team.members.map((m, i) => (
                                                <div key={i} className="w-9 h-9 rounded-full bg-surface-elevated border-2 border-surface flex items-center justify-center text-[11px] text-accent font-bold shadow-sm" title={m.name}>
                                                    {m.name.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
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
                    {(!teams || teams.length === 0) && (
                        <div className="py-24 text-center text-text-tertiary italic text-sm font-medium">
                            No teams found. Organize your workforce to get started.
                        </div>
                    )}
                </div>
            </ContentCard>

            <Drawer 
                open={showRightPanel} 
                onClose={() => setShowRightPanel(false)} 
                position="right" 
                className="bg-surface border-l border-border-subtle w-full max-w-md"
            >
                <div className="p-6 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">CREATE TEAM</h3>
                    <button onClick={() => setShowRightPanel(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <Drawer.Items className="p-0">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Team Name</label>
                            <TextInput
                                placeholder="e.g. Core Engine"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                theme={{
                                    field: {
                                        input: {
                                            base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                                            colors: {
                                                gray: "bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50"
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Description</label>
                            <Textarea
                                placeholder="Describe the team's mission..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                required
                                className="bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50 rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Tribe/Guild</label>
                            <TextInput
                                placeholder="e.g. Architecture"
                                value={formData.guild}
                                onChange={(e) => setFormData({...formData, guild: e.target.value})}
                                required
                                theme={{
                                    field: {
                                        input: {
                                            base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                                            colors: {
                                                gray: "bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50"
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Add Members</label>
                            <Multiselect
                                options={options}
                                displayValue="name"
                                selectedValues={formData.members}
                                onSelect={(list, value) => {
                                    setFormData({...formData, members: list})
                                }}
                                onRemove={(list, value) => {
                                    setFormData({...formData, members: list})
                                }}
                                style={{
                                    chips: { background: '#00d4ff', color: '#0c1220', fontWeight: 'bold' },
                                    searchBox: { background: '#1f2d45', border: '1px solid rgba(100, 180, 255, 0.12)', borderRadius: '8px' },
                                    optionContainer: { background: '#121b2e', border: '1px solid rgba(100, 180, 255, 0.12)' },
                                    option: { color: '#f0f4f8' }
                                }}
                            />
                        </div>
                        <div className="pt-6">
                            <button type="submit" className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/20 min-h-[44px] flex items-center justify-center uppercase tracking-widest">
                                CREATE TEAM
                            </button>
                        </div>
                    </form>
                </Drawer.Items>
            </Drawer>
        </div>
    );
};

export default TeamsPage;
