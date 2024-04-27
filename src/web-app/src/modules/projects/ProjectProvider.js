import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {ProjectService} from "./ProjectService";

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState(() => {
        const savedProjects = localStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : [];
    });

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects ?? []));
    }, [projects]);

    const addProject = (newProject) => {
        newProject.id = uuidv4();
        setProjects([...projects, newProject]);
        ProjectService.postProject(newProject)
    };

    useEffect(() => {
        ProjectService.fetchProjects()
            .then(data => setProjects(data ?? []));
    }, []);

    const removeProject = (projectId) => {
        const updatedProjects = projects.filter((project) => project.id !== projectId);
        setProjects(updatedProjects);
    };

    const findProjectById = (id) => {
        return projects.find(project => project.id === id);
    }

    const findProjectsBySolutionId = (solutionId) => {
        return projects.filter(project => project.solutionId === solutionId);
    }

    const value = {
        projects,
        addProject,
        removeProject,
        findProjectById,
        findProjectsBySolutionId
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export { ProjectProvider, ProjectContext };