import {Drawer, Textarea, TextInput} from "flowbite-react";
import Multiselect from "multiselect-react-dropdown";
import React, {useContext, useState} from "react";
import {ProjectContext} from "../ProjectProvider";
import {TeamContext} from "../../teams/TeamsProvider";

const ProjectForm = ({solutionId, showRightPanel, setShowRightPanel}) => {
    const {addProject} = useContext(ProjectContext);
    const {teams} = useContext(TeamContext);

    const [formData, setFormData] = useState({id: '', name: '', description: '', tags: [], teamMembers: [], solutionId: solutionId});
    const [selectedValues, setSelectedValues] = useState([]); // eslint-disable-line no-unused-vars
    const [tags] = useState([{name: "DDD", id: 1}, {name: "Clean Architecture", id: 2}]); // eslint-disable-line no-unused-vars

    const handleSubmit = (e) => {
        e.preventDefault();
        addProject({...formData, id: Date.now().toString(), solutionId});
        setFormData({id: '', name: '', description: '', tags: [], teamMembers: [], solutionId: solutionId});
        setSelectedValues([])
        setShowRightPanel(false);
    };

    return (
        <Drawer 
            open={showRightPanel} 
            onClose={() => setShowRightPanel(false)} 
            position="right"
            style={{ top: '64px' }}
            className="bg-surface border-l border-border-subtle w-full max-w-md"
        >
            <div className="p-6 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary tracking-tight">CREATE PROJECT</h3>
                <button onClick={() => setShowRightPanel(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <Drawer.Items className="p-0">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-2">
                        <label htmlFor="projectName" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Project Name
                        </label>
                        <TextInput
                            id="projectName"
                            placeholder="e.g. Inventory Service"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required={true}
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
                        <label htmlFor="projectDescription" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Description
                        </label>
                        <Textarea
                            id="projectDescription"
                            placeholder="Describe the bounded context..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required={true}
                            className="bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50 rounded-md"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="projectTags" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Project Tags
                        </label>
                        <Multiselect
                            id="projectTags"
                            options={tags}
                            displayValue="name"
                            selectedValues={formData.tags}
                            onSelect={(list, value) => {
                                setFormData({...formData, tags: list})
                            }}
                            onRemove={(list, value) => {
                                setFormData({...formData, tags: list})
                            }}
                            style={{
                                chips: { background: '#00d4ff', color: '#0c1220', fontWeight: 'bold' },
                                searchBox: { background: '#1f2d45', border: '1px solid rgba(100, 180, 255, 0.12)', borderRadius: '8px' },
                                optionContainer: { background: '#121b2e', border: '1px solid rgba(100, 180, 255, 0.12)' },
                                option: { color: '#f0f4f8' }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="projectTeams" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Project Teams
                        </label>
                        <Multiselect
                            id="projectTeams"
                            options={teams}
                            displayValue="name"
                            selectedValues={formData.teamMembers}
                            onSelect={(list, value) => {
                                setFormData({...formData, teamMembers: list})
                            }}
                            onRemove={(list, value) => {
                                setFormData({...formData, teamMembers: list})
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
                        <button 
                            type="submit"
                            className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/20 min-h-[44px] flex items-center justify-center uppercase tracking-widest"
                        >
                            CREATE PROJECT
                        </button>
                    </div>
                </form>
            </Drawer.Items>
        </Drawer>
    )
}

export {ProjectForm};