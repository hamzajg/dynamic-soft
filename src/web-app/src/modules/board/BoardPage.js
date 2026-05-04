import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Accordion, Button, Sidebar} from 'flowbite-react';
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

// we define the nodeTypes outside of the component to prevent re-renderings
const nodeTypes = {custom: (props) => <CustomNode {...props}/>};
function BoardPage() {
    const {id} = useParams();
    const {saveFlowModel, findBoardById, handleSaveDiagramAsCodeChange, generateJsonModel} = useContext(BoardsContext);
    const {findDiagramById} = useContext(DiagramsContext);
    const [diagramCode, setDiagramCode] = useState('');
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const diagram = findDiagramById(id);

    useEffect(() => {
        const storedModel = findBoardById(id);
        if (storedModel) {
            const {nodes, edges} = storedModel;
            setNodes(nodes);
            setEdges(edges);
        }
    }, [setNodes, setEdges]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onInit = useCallback((instance) => setReactFlowInstance(instance), []);

    const onPaletteItemDoubleClick = (event, element) => {
        if (element.type === 'customNode') {
            const newNodeId = uuidv4();
            setNodes((nodes) =>
                nodes.concat({
                    id: newNodeId,
                    type: "custom",
                    height: '30px',
                    data: {label: element.label, color: element.color},
                    position: {x: event.clientX - 100, y: event.clientY - 50},
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    style: {backgroundColor: element.color},
                })
            );
        }
    };

    const handleDiagramCodeChange = (event) => {
        setDiagramCode(event.target.value);
        try {
            const parsedFlow = JSON.parse(event.target.value);
            setNodes(parsedFlow.nodes);
            setEdges(parsedFlow.edges)
            saveFlowModel(id, parsedFlow.nodes, parsedFlow.edges);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };

    const onNodesChanged = (events) => {
        onNodesChange(events);
        events.
        filter(event => event.type !== 'remove').
        forEach(() => {
            saveFlowModel(id, nodes, edges);
            setDiagramCode(JSON.stringify(generateJsonModel(id, nodes, edges), undefined, 2))
        })
    }

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

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-6 lg:-m-10">
            {/* Left Sidebar: Palette */}
            <div className="w-72 bg-surface border-r border-border-subtle flex flex-col shadow-xl">
                <div className="p-8 border-b border-border-subtle bg-surface-elevated/30">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-2">Modeling Tools</h3>
                    <h2 className="text-lg font-bold text-text-primary tracking-tight">
                        {diagram?.type === 'specification-by-example' ? 'BDD Palette' : 'Event Modeling'}
                    </h2>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {diagram?.type === 'specification-by-example' ? <>
                            <PaletteItem id="given" label="Given" color="#bf9000" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="when" label="When" color="#1e88e5" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="then" label="Then" color="#ff9800" onDoubleClick={onPaletteItemDoubleClick}/>
                        </> : <>
                            <PaletteItem id="event" label="Event" color="#ff9800" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="command" label="Command" color="#1e88e5" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="query" label="Query" color="#6aa84f" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="aggregate" label="Aggregate" color="#bf9000" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="actor" label="Actor" color="#F7C93F" onDoubleClick={onPaletteItemDoubleClick}/>
                            <PaletteItem id="policy" label="Policy" color="#CB73FC" onDoubleClick={onPaletteItemDoubleClick}/></> }
                    </div>
                    <div className="pt-8">
                        <p className="text-[10px] text-text-tertiary font-medium leading-relaxed italic">
                            Double-click an item to add it to the board. Drag to move, connect handles to link.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Board Area */}
            <div className="flex-grow bg-background relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesDelete={onNodesDeleted}
                    onNodesChange={onNodesChanged}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={onInit}
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
                    <Controls className="!bg-surface-elevated !border-border-subtle !fill-accent !shadow-lg"/>
                    <Background color="rgba(0, 212, 255, 0.04)" gap={20}/>
                </ReactFlow>

                {/* Floating Info */}
                <div className="absolute top-6 left-6 p-4 bg-surface/80 backdrop-blur-md border border-border-subtle rounded-md pointer-events-none shadow-xl">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Active Diagram</div>
                    <div className="text-sm font-bold text-text-primary uppercase tracking-tight">{diagram?.name || 'Untitled Diagram'}</div>
                </div>
            </div>

            {/* Right Sidebar: Code & AI */}
            <div className="w-80 bg-surface border-l border-border-subtle flex flex-col shadow-xl">
                <Accordion className="border-none divide-y divide-border-subtle" alwaysOpen={true}>
                    <Accordion.Panel>
                        <Accordion.Title className="bg-surface hover:bg-surface-hover text-xs font-bold tracking-[0.15em] text-text-primary uppercase py-5 px-6 focus:ring-0">
                            Diagram as Code
                        </Accordion.Title>
                        <Accordion.Content className="bg-surface-elevated/30 p-0 border-none">
                            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-elevated/50">
                                <span className="text-[10px] text-text-tertiary font-bold tracking-widest">JSON MODEL</span>
                                <button 
                                    onClick={() => handleSaveDiagramAsCodeChange(diagram, diagramCode)}
                                    className="px-4 py-1.5 bg-accent text-background text-[10px] font-bold rounded-sm uppercase hover:bg-accent-hover transition-all shadow-md active:scale-95"
                                >
                                    Save
                                </button>
                            </div>
                            <div className="overflow-hidden border-b border-border-subtle">
                                <CodeEditor 
                                    className="min-h-[300px]"
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
                        </Accordion.Content>
                    </Accordion.Panel>
                    <Accordion.Panel>
                        <Accordion.Title className="bg-surface hover:bg-surface-hover text-xs font-bold tracking-[0.15em] text-text-primary uppercase py-5 px-6 focus:ring-0">
                            AI Assistant
                        </Accordion.Title>
                        <Accordion.Content className="bg-surface-elevated/30 p-6 border-none">
                            <AIChatDialog/>
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>
            </div>
        </div>
    );
}

export default BoardPage;