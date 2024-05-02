import React from 'react';
import HomePage from "./modules/home/HomePage";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Layout from "./ui/Layout";
import ProjectsPage from "./modules/projects/ProjectsPage";
import {ModulesProvider} from "./modules/ModulesProvider";
import DiagramsPage from "./modules/diagrams/DiagramsPage";
import BoardPage from "./modules/board/BoardPage";
import TeamsPage from "./modules/teams/TeamsPage";
import SolutionsPage from "./modules/solutions/SolutionsPage";
import PrivateRoute from "./utilities/PrivateRoute";
import AuthenticationPage from "./modules/authentication/AuthenticationPage";

const App = () => {
    return (
        <Router>
            <Layout>
                <ModulesProvider>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/authentication" element={<AuthenticationPage/>}/>
                        <Route path="/solutions" element={<PrivateRoute component={<SolutionsPage/>} />}/>
                        <Route path="/solutions/:id/projects" element={<PrivateRoute component={<ProjectsPage/>} />}/>
                        <Route path="/teams" element={<PrivateRoute component={<TeamsPage/>} />}/>
                        <Route path="/projects/:id/diagrams" element={<PrivateRoute component={<DiagramsPage/>} />}/>
                        <Route path="/projects/:id/diagrams/:id/board" element={<PrivateRoute component={<BoardPage/>} />}/>
                    </Routes>
                </ModulesProvider>
            </Layout>
        </Router>
    );
};

export default App;