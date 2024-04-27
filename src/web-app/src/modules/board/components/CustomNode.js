import React, {useContext, useState} from "react";
import {Handle} from "react-flow-renderer";
import {useParams} from "react-router-dom";
import {BoardsContext} from "../BoardProvider";

const CustomNode = ({ id, data }) => {
    const boardId = useParams().id;
    const {findBoardById} = useContext(BoardsContext);
    const diagram = findBoardById(boardId);
    const [labelText, setLabelText] = useState(data.label);

    const handleInputChange = (event) => {
        setLabelText(event.target.value);
        const {nodes} = diagram;
        updateNodeLabel(nodes, id, event.target.value);
    };

    const updateNodeLabel = (nodes, id, newLabel) => {
        const index = nodes.findIndex(node => node.id === id);
        if (index !== -1) {
            nodes[index].data.label = newLabel;
        } else {
            console.error(`Node with id ${id} not found.`);
        }
        return nodes;
    }

    return (
        <div className="m-2 bg-[#0077b6] rounded-md p-6 cursor-pointer flex justify-center items-center hover:bg-[#005b8d]"
             style={{
                 backgroundColor: data.color,
                 color: '#fff',
                 fontWeight: 'bold',
             }}
        >
            <Handle type="target" position="left" />
            <Handle type="target" position="top" />
            <input style={{ backgroundColor: "transparent", border: "none", outline: "none"}}
                type="text" value={labelText} onChange={handleInputChange}
                className="text-white font-semibold"
            />
            <Handle type="source" position="right" />
            <Handle type="source" position="bottom" />
        </div>
    );
};

export {CustomNode};