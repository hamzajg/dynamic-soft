import React, {createContext, useState, useEffect} from 'react';
import {v4 as uuidv4} from "uuid";
import {DiagramService} from "./DiagramService";

const DiagramsContext = createContext();

const DiagramsProvider = ({children}) => {
    const [diagrams, setDiagrams] = useState(() => {
        const savedDiagrams = localStorage.getItem('diagrams');
        return savedDiagrams ? JSON.parse(savedDiagrams) : [];
    });

    useEffect(() => {
        localStorage.setItem('diagrams', JSON.stringify(diagrams ?? []));
    }, [diagrams]);

    const addDiagram = (newDiagram) => {
        newDiagram.id = uuidv4();
        newDiagram.createdAt = new Date().toISOString();
        newDiagram.updatedAt = new Date().toISOString();
        setDiagrams([...diagrams, newDiagram]);
        DiagramService.postDiagram(newDiagram)
    };

    useEffect(() => {
        DiagramService.fetchDiagrams()
            .then(data => setDiagrams(data ?? []));
    }, []);

    const removeDiagram = (diagramId) => {
        setDiagrams(diagrams.filter(diagram => diagram.id !== diagramId));
    };

    const findDiagramsByProjectId = (projectId) => {
        return diagrams.filter(diagram => diagram.projectId === projectId);
    }

    const findDiagramById = (id) => {
        return diagrams.find(diagram => diagram.id === id);
    }

    const value = {
        diagrams,
        addDiagram,
        removeDiagram,
        findDiagramsByProjectId,
        findDiagramById
    };

    return <DiagramsContext.Provider value={value}>{children}</DiagramsContext.Provider>;

};

export {DiagramsProvider, DiagramsContext};