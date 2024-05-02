import React, { createContext, useState } from 'react';

const AuthenticationContext = createContext();

const AuthenticationProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

export { AuthenticationProvider, AuthenticationContext };