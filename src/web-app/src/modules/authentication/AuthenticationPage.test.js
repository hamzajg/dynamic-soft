import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthenticationPage from './AuthenticationPage';
import { AuthenticationContext } from './AuthenticatonProvider';

const renderPage = (contextOverrides = {}) => {
    const context = {
        isAuthenticated: false,
        user: null,
        login: jest.fn().mockResolvedValue(undefined),
        register: jest.fn().mockResolvedValue(undefined),
        logout: jest.fn(),
        ...contextOverrides,
    };

    return render(
        <MemoryRouter>
            <AuthenticationContext.Provider value={context}>
                <AuthenticationPage />
            </AuthenticationContext.Provider>
        </MemoryRouter>
    );
};

const fillRegistration = () => {
    fireEvent.click(screen.getByRole('button', { name: /create identity/i }));
    fireEvent.change(screen.getByPlaceholderText('your-username'), { target: { value: 'ada' } });
    fireEvent.change(screen.getByPlaceholderText('user@dynamicsoft.cloud'), { target: { value: 'ada@dynamicsoft.cloud' } });
    fireEvent.change(screen.getByPlaceholderText('Ada'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByPlaceholderText('Lovelace'), { target: { value: 'Lovelace' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
};

describe('AuthenticationPage', () => {
    it('signs in with the entered username and password', async () => {
        const login = jest.fn().mockResolvedValue(undefined);
        renderPage({ login });

        fireEvent.change(screen.getByPlaceholderText('your-username'), { target: { value: 'ada' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
        fireEvent.click(screen.getByRole('button', { name: /authorize access/i }));

        await waitFor(() => expect(login).toHaveBeenCalledWith('ada', 'secret'));
    });

    it('registers a new identity from the Create Identity form', async () => {
        const register = jest.fn().mockResolvedValue(undefined);
        renderPage({ register });

        fillRegistration();
        fireEvent.click(screen.getByRole('button', { name: /provision identity/i }));

        await waitFor(() => expect(register).toHaveBeenCalledWith({
            username: 'ada',
            password: 'secret',
            email: 'ada@dynamicsoft.cloud',
            firstName: 'Ada',
            lastName: 'Lovelace',
        }));
    });

    it('surfaces the identity error message when registration conflicts', async () => {
        const register = jest.fn().mockRejectedValue(new Error('Username already taken'));
        renderPage({ register });

        fillRegistration();
        fireEvent.click(screen.getByRole('button', { name: /provision identity/i }));

        expect(await screen.findByText('Username already taken')).toBeInTheDocument();
    });
});
