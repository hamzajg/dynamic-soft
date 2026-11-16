import React, { createContext, useState, useEffect } from 'react';
import { getAuthToken, decodeJwtPayload, isTokenExpired, identityFetch } from '../api/client';

const AuthenticationContext = createContext();

const AuthenticationProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    const applyToken = (token) => {
        const payload = decodeJwtPayload(token);
        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
        setUser({
            username: payload?.upn || payload?.sub || 'user',
            name: payload?.upn || payload?.sub || 'User',
        });
    };

    useEffect(() => {
        const token = getAuthToken();
        if (token && !isTokenExpired(token)) {
            applyToken(token);
        } else if (token) {
            localStorage.removeItem('auth_token');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (username, password) => {
        const response = await identityFetch('/api/identity/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.message || 'Invalid username or password');
        }
        const { token } = await response.json();
        applyToken(token);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
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
