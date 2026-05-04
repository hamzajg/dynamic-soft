import {Button, Drawer, Select, Textarea, TextInput} from "flowbite-react";
import React, {useContext, useState} from "react";
import {DiagramsContext} from "../DiagramProvider";

const DiagramForm = ({projectId, showRightPanel, setShowRightPanel}) => {
    const {addDiagram} = useContext(DiagramsContext);

    const [formData, setFormData] = useState({id: '', projectId: projectId, name: '', description: '', type: ''});
    const types = [
        {id: "event-storming-big-picture", name: "Event Storming Big Picture"},
        {id: "event-storming-design-level", name: "Event Storming Design Level"},
        {id: "event-modeling", name: "Event Modeling"},
        {id: "specification-by-example", name: "Specification by Example"},
        {id: "uml-sequence-diagram", name: "UML Sequence Diagram"},
        {id: "orm-entity-diagram", name: "ORM Entity Diagram"}
    ]

    const handleSubmit = (e) => {
        e.preventDefault();
        addDiagram({...formData, id: Date.now().toString(), projectId});
        setFormData({id: '', projectId: projectId, name: '', description: '', type: ''});
        setShowRightPanel(false);
    };

    return (
        <Drawer 
            open={showRightPanel} 
            onClose={() => setShowRightPanel(false)} 
            position="right"
            className="bg-surface border-l border-border-subtle w-full max-w-md"
        >
            <div className="p-6 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary tracking-tight">CREATE DIAGRAM</h3>
                <button onClick={() => setShowRightPanel(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <Drawer.Items className="p-0">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-2">
                        <label htmlFor="diagramName" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Diagram Name
                        </label>
                        <TextInput
                            id="diagramName"
                            placeholder="e.g. Checkout Flow"
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
                        <label htmlFor="diagramDescription" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Description
                        </label>
                        <Textarea
                            id="diagramDescription"
                            placeholder="Describe what this diagram models..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required={true}
                            className="bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50 rounded-md"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="diagramType" className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                            Diagram Type
                        </label>
                        <Select 
                            id="diagramType" 
                            value={formData.type}
                            required={true}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                            <option value="">Select Type</option>
                            {types.map((type, key) => (
                                <option value={type.id} key={key}>{type.name}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="pt-6">
                        <button 
                            type="submit"
                            className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/20 min-h-[44px] flex items-center justify-center uppercase tracking-widest"
                        >
                            CREATE DIAGRAM
                        </button>
                    </div>
                </form>
            </Drawer.Items>
        </Drawer>
    )
}

export {DiagramForm};