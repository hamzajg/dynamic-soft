import {Button, Drawer, Select, Textarea, TextInput} from "flowbite-react";
import domains from "../Domains.json";
import React, {useContext, useState} from "react";
import {SolutionContext} from "../SolutionProvider";

const SolutionForm = ({showRightPanel, setShowRightPanel}) => {
    const {addSolution} = useContext(SolutionContext);
    const [formData, setFormData] = useState({id: '', name: '', description: '', domain: ''});

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        addSolution(formData);
        setFormData({id: '', name: '', description: '', domain: ''});
        setShowRightPanel(false);
    };

    return (<Drawer open={showRightPanel} onClose={() => setShowRightPanel(false)} position="right">
        <Drawer.Header title="Create Solution" />
        <Drawer.Items>
            <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
                <div>
                    <div className="mb-2 block">
                        <label htmlFor="solutionName" className="text-sm font-medium text-gray-900 dark:text-white">
                            Solution Name
                        </label>
                    </div>
                    <TextInput
                        id="solutionName"
                        placeholder="Enter solution name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required={true}
                    />
                </div>
                <div>
                    <div className="mb-2 block">
                        <label htmlFor="solutionDescription"
                               className="text-sm font-medium text-gray-900 dark:text-white">
                            Solution Description
                        </label>
                    </div>
                    <Textarea
                        id="solutionDescription"
                        placeholder="Enter solution description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        required={true}
                    />
                </div>
                <div>
                    <div className="mb-2 block">
                        <label htmlFor="projectTags" className="text-sm font-medium text-gray-900 dark:text-white">
                            Solution Domain
                        </label>
                    </div>
                    <Select
                        id="projectTeams"
                        required={true}
                        value={formData.domain}
                        onChange={e => setFormData({...formData, domain: e.target.value})}>
                        <option value="">Select Domain</option>
                        {domains.map((domain, key) => (
                            <option value={domain.id} key={key}>{domain.name}</option>
                        ))}
                    </Select>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                    <Button type="submit">Create Solution</Button>
                </div>
            </form>
        </Drawer.Items>
    </Drawer>)
}

export {SolutionForm};