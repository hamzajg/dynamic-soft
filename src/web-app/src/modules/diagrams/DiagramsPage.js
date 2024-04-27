import React, {useContext, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Card} from "flowbite-react";
import {DiagramsContext} from "./DiagramProvider";
import {ProjectContext} from "../projects/ProjectProvider";
import {DiagramForm, DiagramsTable} from "./components";

const DiagramsPage = () => {
    const {id} = useParams();
    const {findProjectById} = useContext(ProjectContext);
    const {findDiagramsByProjectId} = useContext(DiagramsContext);
    const navigate = useNavigate();
    const project = findProjectById(id)
    const projectDiagrams = findDiagramsByProjectId(id);
    const [showRightPanel, setShowRightPanel] = useState(false);

    const handleAddDiagram = () => {
        setShowRightPanel(true);
    };

    if (!project) {
        navigate("/projects");
    }

    return (
        <div className="p-6">
            <Card className="mb-2">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {project.name}
                </h5>
                <p>Description: {project.description}</p>
            </Card>
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Diagrams</h1>
                <Button color="blue" onClick={handleAddDiagram}>Add Diagram</Button>
            </div>

            <DiagramsTable projetcDiagrams={projectDiagrams} />

            <DiagramForm projectId={id} showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default DiagramsPage;
