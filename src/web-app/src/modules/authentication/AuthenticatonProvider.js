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

    // Registers a new identity, then signs it in. The identity service
    // returns 201 + a Location header (no token), so registration is only
    // half the flow — we immediately log in to finish it.
    const register = async ({ username, password, email, firstName, lastName }) => {
        const response = await identityFetch('/api/identity/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, firstName, lastName }),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.message || 'Registration failed');
        }
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

export { AuthenticationProvider, AuthenticationContext };
