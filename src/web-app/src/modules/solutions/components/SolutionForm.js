import {Drawer, Select, Textarea, TextInput} from "flowbite-react";
import domains from "../Domains.json";
import React, {useContext, useState} from "react";
import {SolutionContext} from "../SolutionProvider";

const SolutionForm = ({showRightPanel, setShowRightPanel}) => {
    const {addSolution} = useContext(SolutionContext);
    const [formData, setFormData] = useState({id: '', name: '', description: '', domain: ''});

    const handleSubmit = (e) => {
        e.preventDefault();
        addSolution({...formData, id: Date.now().toString()});
        setFormData({id: '', name: '', description: '', domain: ''});
        setShowRightPanel(false);
    };

    return (<Drawer 
        open={showRightPanel} 
        onClose={() => setShowRightPanel(false)} 
        position="right"
        style={{ top: '64px' }}
        className="bg-surface border-l border-border-subtle w-full max-w-md"
    >
        <div className="p-6 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary tracking-tight">CREATE SOLUTION</h3>
            <button onClick={() => setShowRightPanel(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <Drawer.Items className="p-0">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="space-y-2">
                    <label htmlFor="solutionName" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                        Solution Name
                    </label>
                    <TextInput
                        id="solutionName"
                        placeholder="e.g. Retail Transformation 2026"
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
                    <label htmlFor="solutionDescription" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                        Description
                    </label>
                    <Textarea
                        id="solutionDescription"
                        placeholder="What problem does this solution solve?"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        required={true}
                        className="bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50 rounded-md"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="solutionDomain" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                        Domain
                    </label>
                    <Select
                        id="solutionDomain"
                        required={true}
                        value={formData.domain}
                        onChange={e => setFormData({...formData, domain: e.target.value})}
                        theme={{
                            field: {
                                select: {
                                    base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                                    colors: {
                                        gray: "bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20"
                                    }
                                }
                            }
                        }}
                    >
                        <option value="">Select Domain</option>
                        {domains.map((domain, key) => (
                            <option value={domain.id} key={key}>{domain.name}</option>
                        ))}
                    </Select>
                </div>
                <div className="pt-6">
                    <button 
                        type="submit"
                        className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/20 min-h-[44px] flex items-center justify-center uppercase tracking-widest"
                    >
                        CREATE SOLUTION
                    </button>
                </div>
            </form>
        </Drawer.Items>
    </Drawer>)
}

export {SolutionForm};