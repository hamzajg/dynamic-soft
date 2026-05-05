import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BoardPage from './BoardPage';
import { BoardsContext } from './BoardProvider';
import { DiagramsContext } from '../diagrams/DiagramProvider';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock React Flow since it requires DOM measurements
jest.mock('react-flow-renderer', () => ({
  __esModule: true,
  default: () => <div data-testid="react-flow-mock"></div>,
  Background: () => <div />,
  Controls: () => <div />,
  MiniMap: () => <div />,
  useNodesState: (initial) => {
      const [nodes, setNodes] = React.useState(initial);
      return [nodes, setNodes, jest.fn()];
  },
  useEdgesState: (initial) => {
      const [edges, setEdges] = React.useState(initial);
      return [edges, setEdges, jest.fn()];
  },
  Position: { Right: 'right', Left: 'left' },
  addEdge: jest.fn()
}));

// Mock CodeEditor since it might have issues in JSDOM
jest.mock('@uiw/react-textarea-code-editor', () => ({
    __esModule: true,
    default: (props) => <textarea placeholder={props.placeholder} value={props.value} onChange={props.onChange} data-testid="code-editor-mock" />
}));

const renderWithContext = (component) => {
    const mockBoardsContext = {
        saveFlowModel: jest.fn(),
        findBoardById: jest.fn().mockReturnValue({ nodes: [], edges: [] }),
        handleSaveDiagramAsCodeChange: jest.fn(),
        generateJsonModel: jest.fn().mockReturnValue({ nodes: [], edges: [] }),
    };

    const mockDiagramsContext = {
        findDiagramById: jest.fn().mockReturnValue({ id: '1', name: 'Test Diagram', type: 'event-modeling' }),
    };

    return render(
        <MemoryRouter initialEntries={['/board/1']}>
            <BoardsContext.Provider value={mockBoardsContext}>
                <DiagramsContext.Provider value={mockDiagramsContext}>
                    <Routes>
                        <Route path="/board/:id" element={component} />
                    </Routes>
                </DiagramsContext.Provider>
            </BoardsContext.Provider>
        </MemoryRouter>
    );
};

describe('BoardPage', () => {
    it('renders BoardPage with mocked providers', () => {
        renderWithContext(<BoardPage />);
        expect(screen.getByText('Test Diagram')).toBeInTheDocument();
        expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });

    it('shows JSON validation error on malformed input', () => {
        renderWithContext(<BoardPage />);
        const codeEditor = screen.getByTestId('code-editor-mock');
        
        fireEvent.change(codeEditor, { target: { value: '{"invalid": true}' } });
        
        expect(screen.getByText('JSON must contain "nodes" and "edges" arrays.')).toBeInTheDocument();
    });
});
