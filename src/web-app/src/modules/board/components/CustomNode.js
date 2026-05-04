import React, {useContext, useState} from "react";
import {Handle, Position} from "react-flow-renderer";
import {useParams} from "react-router-dom";
import {BoardsContext} from "../BoardProvider";

const CustomNode = ({ id, data }) => {
    const boardId = useParams().id;
    const {findBoardById} = useContext(BoardsContext);
    const diagram = findBoardById(boardId);
    const [labelText, setLabelText] = useState(data.label);

    const handleInputChange = (event) => {
        setLabelText(event.target.value);
        if (diagram && diagram.nodes) {
            updateNodeLabel(diagram.nodes, id, event.target.value);
        }
    };

    const updateNodeLabel = (nodes, id, newLabel) => {
        const index = nodes.findIndex(node => node.id === id);
        if (index !== -1) {
            nodes[index].data.label = newLabel;
        }
        return nodes;
    }

    return (
        <div className="rounded-sm shadow-xl transition-all hover:scale-105 active:scale-95 group relative"
             style={{
                 backgroundColor: data.color,
                 padding: '12px 24px',
                 minWidth: '120px',
                 minHeight: '44px',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 border: '1px solid rgba(255,255,255,0.1)'
             }}
        >
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white/50 !border-none" />
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/50 !border-none" />
            
            <input 
                style={{ backgroundColor: "transparent", border: "none", outline: "none", textAlign: 'center'}}
                type="text" 
                value={labelText} 
                onChange={handleInputChange}
                className="text-white font-bold text-xs tracking-tight uppercase w-full"
            />
            
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white/50 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/50 !border-none" />
        </div>
    );
};

export {CustomNode};