import {Button, Drawer, Select, Textarea, TextInput} from "flowbite-react";
import React, {useContext, useState} from "react";
import {DiagramsContext} from "../DiagramProvider";

const DiagramForm = ({projectId, showRightPanel, setShowRightPanel}) => {
    const {addDiagram} = useContext(DiagramsContext);

    const [formData, setFormData] = useState({id: '', projectId: projectId, name: '', description: '', type: ''});
    const types = [{id: "event-storming-big-picture", name: "Event Storming Big Picture"},
        {id: "event-storming-design-level", name: "Event Storming Design Level"},
        {id: "event-modeling", name: "Event Modeling"},
        {id: "specification-by-example", name: "Specification by Example"},
        {id: "uml-sequence-diagram", name: "UML Sequence Diagram"},
        {id: "orm-entity-diagram", name: "ORM Entity Diagram"}]

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        addDiagram(formData);
        setFormData({id: '', projectId: projectId, name: '', description: '', type: ''});
        setShowRightPanel(false);
    };
    return (
        <Drawer open={showRightPanel} onClose={() => setShowRightPanel(false)} position="right">
            <Drawer.Header title="Create Diagram" />
            <Drawer.Items>
                <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="diagramName"
                                   className="text-sm font-medium text-gray-900 dark:text-white">
                                Diagram Name
                            </label>
                        </div>
                        <TextInput
                            id="diagramName"
                            placeholder="Enter diagram name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="diagramDescription"
                                   className="text-sm font-medium text-gray-900 dark:text-white">
                                Diagram Description
                            </label>
                        </div>
                        <Textarea
                            id="diagramDescription"
                            placeholder="Enter diagram description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="diagramType"
                                   className="text-sm font-medium text-gray-900 dark:text-white">
                                Diagram Type
                            </label>
                        </div>
                        <Select id="diagramType" value={formData.type}
                                required={true}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="">Select Type</option>
                            {types.map((type, key) => (
                                <option value={type.id} key={key}>{type.name}</option>
                            ))}
                        </Select>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                        <Button type="submit">Create Diagram</Button>
                    </div>
                </form>
            </Drawer.Items>
        </Drawer>
    )
}

export {DiagramForm};