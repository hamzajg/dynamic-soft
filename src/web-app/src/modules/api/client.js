const API_BASE = 'http://localhost:8081';
const IDENTITY_BASE = 'http://localhost:8080';
const TOKEN_KEY = 'auth_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

// Decode a JWT payload without verifying it (verification happens server-side).
export const decodeJwtPayload = (token) => {
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

export const isTokenExpired = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
};

const unauthorized = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign('/authentication');
};

// fetch wrapper for web-apis (:8081) — attaches the identity Bearer token.
export const apiFetch = async (path, options = {}) => {
    const headers = { ...(options.headers || {}) };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (response.status === 401) unauthorized();
    return response;
};

// fetch wrapper for the identity service (:8080) — no Bearer token needed.
export const identityFetch = (path, options = {}) =>
    fetch(`${IDENTITY_BASE}${path}`, options);
