import {Button, Drawer, Textarea, TextInput} from "flowbite-react";
import Multiselect from "multiselect-react-dropdown";
import React, {useContext, useState} from "react";
import {ProjectContext} from "../ProjectProvider";
import {TeamContext} from "../../teams/TeamsProvider";

const ProjectForm = ({solutionId, showRightPanel, setShowRightPanel}) => {
    const {addProject} = useContext(ProjectContext);
    const {teams} = useContext(TeamContext);

    const [formData, setFormData] = useState({id: '', name: '', description: '', tags: [], teamMembers: [], solutionId: solutionId});
    const [selectedValues, setSelectedValues] = useState([]);
    const [tags, setTags] = useState([{name: "DDD", id: 1}, {name: "Clean Architecture", id: 2}])

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        addProject(formData);
        setFormData({id: '', name: '', description: '', tags: [], teamMembers: [], solutionId: solutionId});
        setSelectedValues([])
        setShowRightPanel(false);
    };

    return (
        <Drawer open={showRightPanel} onClose={() => setShowRightPanel(false)} position="right">
            <Drawer.Header title="Create Project" />
            <Drawer.Items>
                <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="projectName" className="text-sm font-medium text-gray-900 dark:text-white">
                                Project Name
                            </label>
                        </div>
                        <TextInput
                            id="projectName"
                            placeholder="Enter project name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="projectDescription"
                                   className="text-sm font-medium text-gray-900 dark:text-white">
                                Project Description
                            </label>
                        </div>
                        <Textarea
                            id="projectDescription"
                            placeholder="Enter project description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="projectTags" className="text-sm font-medium text-gray-900 dark:text-white">
                                Project Tags
                            </label>
                        </div>
                        <Multiselect
                            id="projectTags"
                            options={tags.filter(opt => !selectedValues.includes(opt))}
                            displayValue="name"
                            selectedValues={formData.tags}
                            onSelect={(list, value) => {
                                setFormData({...formData, tags: [...formData.tags, value]})
                                setSelectedValues([...selectedValues, value])
                            }}/>
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="projectTeams" className="text-sm font-medium text-gray-900 dark:text-white">
                                Project Teams
                            </label>
                        </div>

                        <Multiselect
                            id="projectTeams"
                            options={teams.filter(opt => !selectedValues.includes(opt))}
                            displayValue="name"
                            selectedValues={formData.teamMembers}
                            onSelect={(list, value) => {
                                setFormData({...formData, teamMembers: [...formData.teamMembers, value]})
                                setSelectedValues([...selectedValues, value])
                            }}/>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
            </Drawer.Items>
        </Drawer>
    )
}

export {ProjectForm};