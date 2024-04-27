import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {SolutionService} from "./SolutionService";
import {Utilities} from "../../utilities/Utillties";

const SolutionContext = createContext();

const SolutionProvider = ({ children }) => {
    const [solutions, setSolutions] = useState(() => {
        const savedSolutions = localStorage.getItem('solutions');
        return savedSolutions ? JSON.parse(savedSolutions) : [];
    });

    useEffect(() => {
        localStorage.setItem('solutions', JSON.stringify(solutions ?? []));
    }, [solutions]);

    const addSolution = (newSolution) => {
        newSolution.id = uuidv4();
        setSolutions([...solutions, newSolution]);
        SolutionService.postSolution(newSolution)
    };

    useEffect(() => {
        SolutionService.fetchSolutions()
            .then(data => setSolutions(data ?? []));
    }, []);

    const findSolutionById = (id) => {
        return solutions.find(solution => solution.id === id);
    }

    const handleGenerateProject = async (project, settings) => {
        const metadata = {...project,
            frameworkVersion: "1.0.0",
            settings: settings,
            openApiSpecFilePath: "open-apis-specs.yml",
            domainEventModelFilePath: "domain-context-event-modeling.json",
            domainSpecificationModelFilePath: "domain-context-specification-by-example.json",
        }

        try {
            const defaultPath =  project.name + ".zip";

            const response = await SolutionService.callSwaggerCodeGen(metadata)
            const reader = new FileReader();
            reader.onload = () => {
                window.postMessage({type: "createProject", filePath: defaultPath, fileContent: reader.result}, '*');
            };
            reader.readAsArrayBuffer(response);

            await Utilities.showSaveFilePickerFor(defaultPath, response)
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }

    const handleSaveMetadata = async (project, settings) => {
        const defaultPath =  "metadata.json";
        const metadata = {...project,
            frameworkVersion: "1.0.0",
            settings: settings,
            openApiSpecFilePath: "open-apis-specs.yml",
            domainEventModelFilePath: "domain-context-event-modeling.json",
            domainSpecificationModelFilePath: "domain-context-specification-by-example.json",
        }
        const metadataContent = JSON.stringify(metadata, undefined, 2);
        window.postMessage({type: "createFile", filePath: "metadata.json", fileContent: metadataContent}, '*');
        await Utilities.showSaveFilePickerFor(defaultPath, metadataContent)
    };

    const value = {
        solutions,
        addSolution,
        findSolutionById,
        handleSaveMetadata,
        handleGenerateProject
    };

    return <SolutionContext.Provider value={value}>{children}</SolutionContext.Provider>;
};

export { SolutionProvider, SolutionContext };