import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIChatDialog } from './AIChatDialog';

describe('AIChatDialog', () => {
    it('renders initial state and placeholder message', () => {
        render(<AIChatDialog />);
        expect(screen.getByText(/I am your architecture assistant/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Refactor this aggregate/i)).toBeInTheDocument();
    });

    it('handles user input and triggers onAIAction on add node request', async () => {
        const onAIActionMock = jest.fn();
        render(<AIChatDialog onAIAction={onAIActionMock} />);

        const input = screen.getByPlaceholderText(/Refactor this aggregate/i);
        const button = screen.getByRole('button', { name: /SEND PROMPT/i });

        fireEvent.change(input, { target: { value: 'add a new node' } });
        fireEvent.click(button);

        expect(screen.getByText('add a new node')).toBeInTheDocument();
        expect(screen.getByText('Thinking...')).toBeInTheDocument();

        await waitFor(() => {
            expect(onAIActionMock).toHaveBeenCalledWith({
                type: 'ADD_NODE',
                payload: { label: 'AI Node', color: '#CB73FC' }
            });
            expect(screen.getByText(/I have added a new "AI Node" to your diagram/i)).toBeInTheDocument();
        });
    });
});
