import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {TeamService} from "./TeamService";

const TeamContext = createContext();

const TeamProvider = ({ children }) => {
    const [teams, setTeams] = useState(() => {
        const savedTeams = localStorage.getItem('teams');
        return savedTeams ? JSON.parse(savedTeams) : [];
    });

    useEffect(() => {
        localStorage.setItem('teams', JSON.stringify(teams ?? []));
    }, [teams]);

    const addTeam = (newTeam) => {
        newTeam.id = uuidv4();
        setTeams([...teams, newTeam]);
        TeamService.postTeam(newTeam)
    };

    useEffect(() => {
        TeamService.fetchTeams()
            .then(data => setTeams(data ?? []));
    }, []);

    const removeTeam = (id) => {
        const updatedTeams = teams.filter((team) => team.id !== id);
        setTeams(updatedTeams);
    };

    const value = {
        teams,
        addTeam,
        removeTeam
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export { TeamProvider, TeamContext };