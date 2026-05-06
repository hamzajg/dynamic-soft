import React, {useContext, useState, useEffect} from "react";
import {Handle, Position, useUpdateNodeInternals} from "react-flow-renderer";
import {useParams} from "react-router-dom";
import {BoardsContext} from "../BoardProvider";
import { FiCode, FiSave, FiZap } from "react-icons/fi";
import CodeEditor from "@uiw/react-textarea-code-editor";
import {BoardUIContext} from "../BoardPage";

// Mapping of semantic types to colors for easy switching
const paletteStyles = {
    'Event': '#ff9800',
    'Command': '#1e88e5',
    'Query': '#6aa84f',
    'Aggregate': '#bf9000',
    'Actor': '#F7C93F',
    'Policy': '#CB73FC',
    'Given': '#bf9000',
    'When': '#1e88e5',
    'Then': '#ff9800'
};

const CustomNode = ({ id, data, selected }) => {
    const { codeLensNodeId, toggleCodeLens, onSave, onAskAI } = useContext(BoardUIContext);
    const isCodeLensOpen = codeLensNodeId === id;
    const updateNodeInternals = useUpdateNodeInternals();
    
    useEffect(() => {
        updateNodeInternals(id);
    }, [isCodeLensOpen, id, updateNodeInternals]);

    const boardId = useParams().id;
    const {findBoardById} = useContext(BoardsContext);
    const diagram = findBoardById(boardId);
    const getCurrentType = () => {
        const color = data.color?.toLowerCase();
        return Object.keys(paletteStyles).find(key => paletteStyles[key].toLowerCase() === color) || 'Custom';
    };

    const [nodeCode, setNodeCode] = useState(JSON.stringify({
        label: data.label,
        type: getCurrentType()
    }, null, 2));

    useEffect(() => {
        setNodeCode(JSON.stringify({
            label: data.label,
            type: getCurrentType()
        }, null, 2));
    }, [data.label, data.color, isCodeLensOpen]);

    const handleInputChange = (event) => {
        const newLabel = event.target.value;
        onSave({
            id,
            data: { ...data, label: newLabel }
        });
    };

    const handleLocalSave = (e) => {
        e.stopPropagation();
        try {
            const parsed = JSON.parse(nodeCode);
            const newColor = paletteStyles[parsed.type] || data.color;
            
            onSave({
                id,
                data: {
                    ...data,
                    label: parsed.label,
                    color: newColor
                },
                style: {
                    ...data.style,
                    backgroundColor: newColor
                }
            });
            toggleCodeLens(id);
        } catch (err) {
            console.error("Invalid JSON", err);
        }
    };

    return (
        <div className={`relative perspective-1000 w-[120px] h-[44px] ${isCodeLensOpen ? 'w-[320px] h-[280px]' : ''} transition-all duration-500 ease-in-out`}>
            <div className={`w-full h-full relative transition-transform duration-700 preserve-3d ${isCodeLensOpen ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE (Node View) */}
                <div className={`absolute inset-0 backface-hidden rounded-sm shadow-xl flex items-center justify-center border border-white/10 group ${selected ? 'ring-2 ring-accent' : ''}`}
                     style={{ backgroundColor: data.color }}
                >
                    <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white/50 !border-none" />
                    <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/50 !border-none" />
                    
                    <input 
                        style={{ backgroundColor: "transparent", border: "none", outline: "none", textAlign: 'center'}}
                        type="text" 
                        value={data.label} 
                        onChange={handleInputChange}
                        className="text-white font-bold text-xs tracking-tight uppercase w-full px-2"
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCodeLens(id);
                        }}
                        className={`absolute -top-3 -right-3 p-1.5 rounded-full bg-surface-elevated border border-border-subtle shadow-lg text-text-primary hover:text-accent transition-all opacity-0 group-hover:opacity-100 ${isCodeLensOpen ? 'opacity-100 text-accent' : ''}`}
                        title="Edit Node Code"
                    >
                        <FiCode className="text-xs" />
                    </button>
                    
                    <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white/50 !border-none" />
                    <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/50 !border-none" />
                </div>

                {/* BACK SIDE (Code Editor) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-surface-elevated/95 backdrop-blur-2xl border border-border-subtle rounded-xl shadow-2xl flex flex-col`}>
                    <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface/50 shrink-0">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-[10px] font-bold tracking-widest text-text-primary uppercase">Quick Edit</span>
                            </div>
                            <div className="text-[8px] text-text-tertiary uppercase mt-0.5">
                                {Object.keys(paletteStyles).join(' • ')}
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleCodeLens(id); }} className="text-text-tertiary hover:text-white transition-colors">
                            <FiCode className="text-sm" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-auto relative min-h-[150px]">
                        <CodeEditor
                            value={nodeCode}
                            language="json"
                            onChange={(evn) => setNodeCode(evn.target.value)}
                            padding={12}
                            style={{
                                backgroundColor: "transparent",
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "#f0f4f8",
                                minHeight: "100%"
                            }}
                        />
                    </div>

                    <div className="p-2 bg-surface/50 border-t border-border-subtle flex gap-2 shrink-0">
                        <button 
                            onClick={handleLocalSave}
                            className="flex-grow flex items-center justify-center gap-2 py-1.5 bg-accent text-background text-[10px] font-bold rounded-md uppercase hover:bg-accent-hover transition-all shadow-md active:scale-95"
                        >
                            <FiSave /> Save
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAskAI({id, data}); }}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-surface-hover text-accent border border-accent/20 text-[10px] font-bold rounded-md uppercase hover:bg-accent/10 transition-all active:scale-95"
                        >
                            <FiZap /> AI
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export {CustomNode};