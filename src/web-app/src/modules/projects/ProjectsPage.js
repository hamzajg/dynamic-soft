import React, {useContext, useState} from 'react';
import {ProjectContext} from "./ProjectProvider";
import {useNavigate, useParams} from "react-router-dom";
import {SolutionContext} from "../solutions/SolutionProvider";
import domains from "../solutions/Domains.json";
import {ProjectForm, ProjectsTable} from "./components";
import {Banner, PageHeader, ContentCard} from "../../ui/Shared";

const ProjectsPage = () => {
    const {id} = useParams();
    const {findSolutionById} = useContext(SolutionContext);
    const solution = findSolutionById(id)
    const navigate = useNavigate();
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {findProjectsBySolutionId} = useContext(ProjectContext);
    const projects = findProjectsBySolutionId(id)

    if (!solution) {
        navigate("/solutions");
        return null;
    }

    const domainName = domains.find(d => d.id === solution.domain)?.name || 'Other';

    return (
        <div className="animate-fade-in">
            <Banner 
                title={solution.name} 
                subtitle={solution.description} 
                tag={domainName} 
            />

            <PageHeader 
                title="PROJECTS" 
                subtitle="Modules / Bounded Contexts" 
                actionLabel="+ ADD PROJECT" 
                onAction={() => setShowRightPanel(true)} 
            />

            <ContentCard noPadding={true}>
                <ProjectsTable projects={projects} />
            </ContentCard>

            <ProjectForm solutionId={id} showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default ProjectsPage;
