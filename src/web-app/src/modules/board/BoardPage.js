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
        <div className="flex h-screen">
            <div className="w-64 bg-gray-800 text-white">
                <Sidebar>
                    <Sidebar.Logo href="#" img="" className="tracking-tight text-gray-900 dark:text-white">
                        {diagram?.type === 'specification-by-example' ? 'BDD' : 'Event Modeling'} Palette
                    </Sidebar.Logo>
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                            {diagram?.type === 'specification-by-example' ? <>
                                <PaletteItem id="given" label="Given" color="#bf9000" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="when" label="When" color="#1e88e5" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="given" label="Then" color="#ff9800" onDoubleClick={onPaletteItemDoubleClick}/>
                            </> : <>
                                <PaletteItem id="event" label="Event" color="#ff9800" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="command" label="Commad" color="#1e88e5" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="query" label="Query" color="#6aa84f" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="aggrigate" label="Aggrigate" color="#bf9000" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="actor" label="Actor" color="#F7C93F" onDoubleClick={onPaletteItemDoubleClick}/>
                                <PaletteItem id="policy" label="Policy" color="#CB73FC" onDoubleClick={onPaletteItemDoubleClick}/></> }
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            </div>

            <div className="flex-grow bg-gray-100 relative">
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
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'input':
                                    return '#ff9800';
                                case 'custom':
                                    return node.data.color;
                                default:
                                    return '#eee';
                            }
                        }}
                    />
                    <Controls/>
                    <Background color="#aaa" gap={16}/>
                </ReactFlow>
            </div>

            <div className="w-64 bg-gray-800 text-white">
                <Sidebar>
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                            <Accordion>
                                <Accordion.Panel>
                                    <Accordion.Title>Diagram as Code</Accordion.Title>
                                    <Accordion.Content>
                                        <Button className="aling-right mb-2" onClick={() => handleSaveDiagramAsCodeChange(diagram, diagramCode)}>Save</Button>
                                        <CodeEditor className="h-screen"
                                            value={diagramCode}
                                            language="json"
                                            placeholder="type code here or diagram code will generated here"
                                            onChange={handleDiagramCodeChange}
                                            padding={15}
                                            rows={50}
                                            style={{
                                                backgroundColor: "#333",
                                                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
                                            }}
                                        />
                                    </Accordion.Content>
                                </Accordion.Panel>
                                <Accordion.Panel>
                                    <Accordion.Title>Prompt AI</Accordion.Title>
                                    <Accordion.Content>
                                        <AIChatDialog/>
                                    </Accordion.Content>
                                </Accordion.Panel>
                            </Accordion>
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            </div>
        </div>
    );
}

export default BoardPage;