import React, {useContext, useState} from 'react';
import {Button, Card} from 'flowbite-react';
import {ProjectContext} from "./ProjectProvider";
import {useNavigate, useParams} from "react-router-dom";
import {SolutionContext} from "../solutions/SolutionProvider";
import domains from "../solutions/Domains.json";
import {ProjectForm, ProjectsTable} from "./components";

const ProjectsPage = () => {
    const {id} = useParams();
    const {findSolutionById} = useContext(SolutionContext);
    const solution = findSolutionById(id)
    const navigate = useNavigate();
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {findProjectsBySolutionId} = useContext(ProjectContext);
    const projects = findProjectsBySolutionId(id)

    const handleAddProject = () => {
        setShowRightPanel(true);
    };

    if (!solution) {
        navigate("/solutions");
    }

    return (
        <div className="p-6">
            <Card className="mb-2">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {solution.name}
                </h5>
                <p>Domain: {domains.find(d => d.id == solution.domain).name}</p>
                <p>Description: {solution.description}</p>
            </Card>
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Projects (Other Names: Modules, Bounded Context)</h1>
                <Button color="blue" onClick={handleAddProject}>Add Project</Button>
            </div>

            <ProjectsTable projects={projects} />

            <ProjectForm solutionId={id} showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default ProjectsPage;
