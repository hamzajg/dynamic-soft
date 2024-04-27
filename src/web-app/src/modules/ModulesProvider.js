import React, {createContext} from 'react';
import {ProjectProvider} from './projects/ProjectProvider';
import {DiagramsProvider} from "./diagrams/DiagramProvider";
import {BoardsProvider} from "./board/BoardProvider";
import {TeamProvider} from "./teams/TeamsProvider";
import {SolutionProvider} from "./solutions/SolutionProvider";

const ModulesContext = createContext();

const ModulesProvider = ({children}) => {
    return (
        <ModulesContext.Provider value={{}}>
            <TeamProvider>
                <SolutionProvider>
                    <ProjectProvider>
                        <DiagramsProvider>
                            <BoardsProvider>
                                {children}
                            </BoardsProvider>
                        </DiagramsProvider>
                    </ProjectProvider>
                </SolutionProvider>
            </TeamProvider>
        </ModulesContext.Provider>
    );
};

export {ModulesContext, ModulesProvider};