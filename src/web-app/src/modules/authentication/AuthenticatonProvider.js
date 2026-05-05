import React, { createContext, useState, useEffect } from 'react';

const AuthenticationContext = createContext();

const AuthenticationProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('mock_jwt_token');
        if (token) {
            setIsAuthenticated(true);
            setUser({ email: 'user@dynamicsoft.cloud', name: 'Demo User' });
        }
    }, []);

    const login = async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('mock_jwt_token', 'mock.jwt.token.12345');
                setIsAuthenticated(true);
                setUser({ email: email || 'user@dynamicsoft.cloud', name: 'Demo User' });
                resolve();
            }, 800);
        });
    };

    const logout = () => {
        localStorage.removeItem('mock_jwt_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

export { AuthenticationProvider, AuthenticationContext };