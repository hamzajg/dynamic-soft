import React from 'react';
import HomePage from "./modules/home/HomePage";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from "./ui/Layout";
import ProjectsPage from "./modules/projects/ProjectsPage";
import {ModulesProvider} from "./modules/ModulesProvider";
import DiagramsPage from "./modules/diagrams/DiagramsPage";
import BoardPage from "./modules/board/BoardPage";
import TeamsPage from "./modules/teams/TeamsPage";
import SolutionsPage from "./modules/solutions/SolutionsPage";

const App = () => {
    return (
        <Router>
            <Layout>
                <ModulesProvider>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/solutions" element={<SolutionsPage/>}/>
                        <Route path="/solutions/:id/projects" element={<ProjectsPage/>}/>
                        <Route path="/teams" element={<TeamsPage/>}/>
                        <Route path="/projects/:id/diagrams" element={<DiagramsPage/>}/>
                        <Route path="/projects/:id/diagrams/:id/board" element={<BoardPage/>}/>
                    </Routes>
                </ModulesProvider>
            </Layout>
        </Router>
    );
};

export default App;