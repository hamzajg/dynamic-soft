import React, {useCallback, useContext, useEffect, useState, useMemo} from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Position,
    useEdgesState,
    useNodesState
} from 'react-flow-renderer';
import {v4 as uuidv4} from "uuid";
import {useParams} from "react-router-dom";
import {BoardsContext} from "./BoardProvider";
import {DiagramsContext} from "../diagrams/DiagramProvider";
import CodeEditor from "@uiw/react-textarea-code-editor";
import {AIChatDialog, CustomNode, PaletteItem} from "./components";
import { FiDatabase, FiUser, FiZap, FiPlay, FiSearch, FiShield, FiCheckCircle, FiArrowRight, FiCode, FiMessageSquare, FiX } from "react-icons/fi";

// Context for UI state that nodes need access to without triggering nodeTypes re-renders
export const BoardUIContext = React.createContext();

const nodeTypes = {
    custom: CustomNode
};

function BoardPage() {
    const {id} = useParams();
    const {saveFlowModel, findBoardById, handleSaveDiagramAsCodeChange, generateJsonModel} = useContext(BoardsContext);
    const {findDiagramById} = useContext(DiagramsContext);
    const [diagramCode, setDiagramCode] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [codeLensNodeId, setCodeLensNodeId] = useState(null);
    const diagram = findDiagramById(id);

    const handleSaveNodeCode = useCallback((updatedNode) => {
        setNodes((nds) => {
            const newNodes = nds.map((node) => 
                node.id === updatedNode.id ? { ...node, ...updatedNode } : node
            );
            // Trigger save after state update
            setTimeout(() => {
                saveFlowModel(id, newNodes, edges);
                setDiagramCode(JSON.stringify(generateJsonModel(id, newNodes, edges), undefined, 2));
            }, 0);
            return newNodes;
        });
    }, [id, edges, saveFlowModel, generateJsonModel, setDiagramCode, setNodes]);

    const handleAskAIForNode = useCallback((node) => {
        setIsAIChatOpen(true);
    }, []);

    const toggleCodeLens = useCallback((nodeId) => {
        setCodeLensNodeId(prev => prev === nodeId ? null : nodeId);
    }, []);

    useEffect(() => {
        const storedModel = findBoardById(id);
        if (storedModel) {
            const {nodes, edges} = storedModel;
            setNodes(nodes);
            setEdges(edges);
        }
    }, [setNodes, setEdges, findBoardById, id]); // eslint-disable-line react-hooks/exhaustive-deps

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onInit = useCallback((instance) => setReactFlowInstance(instance), []);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onToggleCodeLens = useCallback((nodeId) => {
        setCodeLensNodeId(prev => prev === nodeId ? null : nodeId);
    }, []);

    const onPaneClick = useCallback((event) => {
        // Detect double click manually
        if (event.detail === 2) {
            if (!reactFlowInstance) return;

            const reactFlowBounds = event.target.closest('.react-flow').getBoundingClientRect();
            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNodeId = uuidv4();
            const newNode = {
                id: newNodeId,
                type: "custom",
                data: { label: "New Node", color: "#1e88e5" },
                position,
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                style: { backgroundColor: "#1e88e5" },
            };

            setNodes((nds) => {
                const updatedNodes = nds.concat(newNode);
                // Save state after update
                setTimeout(() => {
                    saveFlowModel(id, updatedNodes, edges);
                    setDiagramCode(JSON.stringify(generateJsonModel(id, updatedNodes, edges), undefined, 2));
                }, 0);
                return updatedNodes;
            });
            setSelectedNodeId(newNodeId);
            setCodeLensNodeId(newNodeId);
        } else {
            setSelectedNodeId(null);
            setCodeLensNodeId(null);
        }
    }, [reactFlowInstance, edges, id, saveFlowModel, generateJsonModel, setNodes, setSelectedNodeId, setCodeLensNodeId, setDiagramCode]);

    const onPaletteItemDoubleClick = (event, element) => {
        if (element.type === 'customNode') {
            const newNodeId = uuidv4();
            const newNode = {
                id: newNodeId,
                type: "custom",
                data: {label: element.label, color: element.color},
                position: {x: event.clientX - 100, y: event.clientY - 50},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                style: {backgroundColor: element.color},
            };
            
            setNodes((nds) => nds.concat(newNode));
            setSelectedNodeId(newNodeId);
            setCodeLensNodeId(newNodeId);

            const updatedNodes = [...nodes, newNode];
            saveFlowModel(id, updatedNodes, edges);
            setDiagramCode(JSON.stringify(generateJsonModel(id, updatedNodes, edges), undefined, 2));
        }
    };

    const handleDiagramCodeChange = (event) => {
        setDiagramCode(event.target.value);
        if (!event.target.value.trim()) {
            setJsonError('');
            return;
        }
        try {
            const parsedFlow = JSON.parse(event.target.value);
            if (!parsedFlow || typeof parsedFlow !== 'object') throw new Error('Invalid structure');
            if (!Array.isArray(parsedFlow.nodes) || !Array.isArray(parsedFlow.edges)) {
                setJsonError('JSON must contain "nodes" and "edges" arrays.');
                return;
            }
            setJsonError('');
            setNodes(parsedFlow.nodes);
            setEdges(parsedFlow.edges)
            saveFlowModel(id, parsedFlow.nodes, parsedFlow.edges);
        } catch (error) {
            setJsonError('Invalid JSON format.');
            console.error('Error parsing JSON:', error);
        }
    };

    const onNodesChanged = (events) => {
        onNodesChange(events);
    };

    const onNodeDragStop = useCallback(() => {
        saveFlowModel(id, nodes, edges);
        setDiagramCode(JSON.stringify(generateJsonModel(id, nodes, edges), undefined, 2));
    }, [id, nodes, edges, saveFlowModel, generateJsonModel, setDiagramCode]);

    const onNodesDeleted = (deletedNode) => {
        const newNodes = deleteElements(nodes, deletedNode);
        setNodes(newNodes);
        setEdges([])
        saveFlowModel(id, newNodes, edges);
        setDiagramCode(JSON.stringify(generateJsonModel(id, newNodes, edges), undefined, 2))
    }

    const deleteElements = (origin, toDelete) => {
        const idsToDelete = toDelete.map(item => item.id);
        return origin.filter(item => !idsToDelete.includes(item.id));
    }

    const handleAIAction = (action) => {
        if (action.type === 'ADD_NODE') {
            const newNode = {
                id: uuidv4(),
                type: 'custom',
                height: '30px',
                data: { label: action.payload.label, color: action.payload.color },
                position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                style: { backgroundColor: action.payload.color },
            };
            const newNodes = [...nodes, newNode];
            setNodes(newNodes);
            saveFlowModel(id, newNodes, edges);
            setDiagramCode(JSON.stringify(generateJsonModel(id, newNodes, edges), undefined, 2));
        }
    };


    const codeLensNode = useMemo(() => 
        nodes.find(n => n.id === codeLensNodeId), 
        [nodes, codeLensNodeId]
    ); // We still need this for context, but it's not rendered here anymore

    return (
        <BoardUIContext.Provider value={{ 
            codeLensNodeId, 
            toggleCodeLens, 
            onSave: handleSaveNodeCode, 
            onAskAI: handleAskAIForNode 
        }}>
            <div className="h-[calc(100vh-64px)] overflow-hidden relative bg-background">
                {/* Main Board Area */}
                <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesDelete={onNodesDeleted}
                onNodesChange={onNodesChanged}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodeDragStop={onNodeDragStop}
                snapToGrid={true}
                snapGrid={[15, 15]}
                nodeTypes={nodeTypes}
            >
                <MiniMap
                    className="!bg-surface-elevated !border-border-subtle !rounded-md"
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'custom':
                                return node.data.color;
                            default:
                                return '#1a2640';
                        }
                    }}
                    maskColor="rgba(12, 18, 32, 0.7)"
                />
                <Controls className="!bg-surface-elevated !border-border-subtle !fill-accent !shadow-lg" />
                <Background color="rgba(0, 212, 255, 0.04)" gap={20}/>
            </ReactFlow>

            {/* Floating Info */}
            <div className="absolute top-6 left-24 p-4 bg-surface/80 backdrop-blur-md border border-border-subtle rounded-md pointer-events-none shadow-xl z-20">
                <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Active Diagram</div>
                <div className="text-sm font-bold text-text-primary uppercase tracking-tight">{diagram?.name || 'Untitled Diagram'}</div>
            </div>

            {/* Compact Floating Palette (Left) */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 bg-surface/90 backdrop-blur-xl p-3 rounded-xl border border-border-subtle shadow-2xl">
                {diagram?.type === 'specification-by-example' ? <>
                    <PaletteItem id="given" label="Given" color="#bf9000" icon={FiCheckCircle} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="when" label="When" color="#1e88e5" icon={FiArrowRight} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="then" label="Then" color="#ff9800" icon={FiCheckCircle} onDoubleClick={onPaletteItemDoubleClick}/>
                </> : <>
                    <PaletteItem id="event" label="Event" color="#ff9800" icon={FiZap} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="command" label="Command" color="#1e88e5" icon={FiPlay} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="query" label="Query" color="#6aa84f" icon={FiSearch} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="aggregate" label="Aggregate" color="#bf9000" icon={FiDatabase} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="actor" label="Actor" color="#F7C93F" icon={FiUser} onDoubleClick={onPaletteItemDoubleClick}/>
                    <PaletteItem id="policy" label="Policy" color="#CB73FC" icon={FiShield} onDoubleClick={onPaletteItemDoubleClick}/></> }
            </div>

            {/* Top Right Actions */}
            <div className="absolute top-6 right-6 z-20 flex gap-3">
                <button 
                    onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
                    className="p-3 bg-surface/90 backdrop-blur-md border border-border-subtle rounded-lg shadow-xl text-text-primary hover:text-accent hover:bg-surface-hover transition-all"
                    title="Toggle Diagram as Code"
                >
                    <FiCode className="text-xl" />
                </button>
            </div>

            {/* Overlay Drawer: Diagram as Code */}
            <div className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-96 bg-surface/95 backdrop-blur-2xl border-l border-border-subtle shadow-2xl z-40 transition-transform duration-300 transform ${isCodeDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-elevated/50">
                    <div className="flex items-center gap-2">
                        <FiCode className="text-accent" />
                        <span className="text-xs font-bold tracking-[0.15em] text-text-primary uppercase">Diagram as Code</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => handleSaveDiagramAsCodeChange(diagram, diagramCode)}
                            disabled={!diagram}
                            className={`px-4 py-1.5 text-background text-[10px] font-bold rounded-sm uppercase transition-all shadow-md active:scale-95 ${!diagram ? 'bg-text-tertiary cursor-not-allowed opacity-50' : 'bg-accent hover:bg-accent-hover'}`}
                        >
                            Save
                        </button>
                        <button onClick={() => setIsCodeDrawerOpen(false)} className="text-text-tertiary hover:text-white transition-colors">
                            <FiX className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Optional: Focused Node View */}
                {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (
                    <div className="p-4 bg-accent/5 border-b border-border-subtle animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Focused Node JSON</div>
                            <button 
                                onClick={() => setSelectedNodeId(null)}
                                className="text-[10px] text-text-tertiary hover:text-white uppercase"
                            >
                                Clear focus
                            </button>
                        </div>
                        <CodeEditor 
                            value={JSON.stringify(nodes.find(n => n.id === selectedNodeId), null, 2)}
                            language="json"
                            readOnly
                            padding={10}
                            style={{
                                backgroundColor: "rgba(0,0,0,0.2)",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "#f0f4f8",
                                borderRadius: "4px"
                            }}
                        />
                    </div>
                )}

                <div className="overflow-y-auto h-[calc(100%-60px)] relative">
                    {jsonError && (
                        <div className="absolute top-0 left-0 w-full bg-red-900/40 text-red-400 font-medium tracking-wide text-[10px] p-2 z-10 border-b border-red-500/30 break-words">
                            {jsonError}
                        </div>
                    )}
                    <CodeEditor 
                        className="min-h-full"
                        value={diagramCode}
                        language="json"
                        placeholder="Model JSON will appear here..."
                        onChange={handleDiagramCodeChange}
                        padding={15}
                        style={{
                            backgroundColor: "transparent",
                            fontSize: "12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#f0f4f8"
                        }}
                    />
                </div>
            </div>

            {/* Floating AI Chat Panel */}
            {isAIChatOpen && (
                <div className="absolute bottom-24 right-6 w-[400px] h-[550px] bg-surface/95 backdrop-blur-3xl border border-border-subtle rounded-2xl shadow-2xl shadow-accent/10 z-30 flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-elevated/50">
                        <div className="flex items-center gap-2">
                            <FiMessageSquare className="text-accent" />
                            <span className="text-xs font-bold tracking-[0.15em] text-text-primary uppercase">AI Assistant</span>
                        </div>
                        <button onClick={() => setIsAIChatOpen(false)} className="text-text-tertiary hover:text-white transition-colors">
                            <FiX className="text-xl" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                        <AIChatDialog onAIAction={handleAIAction} selectedNode={nodes.find(n => n.id === selectedNodeId)} />
                    </div>
                </div>
            )}

            {/* AI Assistant FAB */}
            <button 
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                className="absolute bottom-6 right-6 p-4 rounded-full bg-accent hover:bg-accent-hover text-background shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95 z-30 flex items-center justify-center"
                title="AI Assistant"
            >
                {isAIChatOpen ? <FiX className="text-2xl" /> : <FiMessageSquare className="text-2xl" />}
            </button>
            </div>
        </BoardUIContext.Provider>
    );
}

export default BoardPage;