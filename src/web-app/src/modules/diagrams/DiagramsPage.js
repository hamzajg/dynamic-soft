import React, {useContext, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {DiagramsContext} from "./DiagramProvider";
import {ProjectContext} from "../projects/ProjectProvider";
import {DiagramForm, DiagramsTable} from "./components";
import {Banner, PageHeader, ContentCard} from "../../ui/Shared";

const DiagramsPage = () => {
    const {id} = useParams();
    const {findProjectById} = useContext(ProjectContext);
    const {findDiagramsByProjectId} = useContext(DiagramsContext);
    const navigate = useNavigate();
    const project = findProjectById(id)
    const projectDiagrams = findDiagramsByProjectId(id);
    const [showRightPanel, setShowRightPanel] = useState(false);

    if (!project) {
        navigate("/solutions");
        return null;
    }

    return (
        <div className="animate-fade-in">
            <Banner 
                title={project.name} 
                subtitle={project.description} 
                tag="Project" 
            />

            <PageHeader 
                title="DIAGRAMS" 
                subtitle="Visual models for this project." 
                actionLabel="+ ADD DIAGRAM" 
                onAction={() => setShowRightPanel(true)} 
            />

            <ContentCard noPadding={true}>
                <DiagramsTable projectDiagrams={projectDiagrams} />
            </ContentCard>

            <DiagramForm projectId={id} showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default DiagramsPage;
