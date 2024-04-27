import {Tooltip} from "flowbite-react";

const PaletteItem = ({ label, color, id, onDoubleClick }) => {
    return (
        <div
            className="m-2 bg-[#0077b6] rounded-md p-6 cursor-pointer flex justify-center items-center hover:bg-[#005b8d]"
            style={{backgroundColor: color}}
            onDoubleClick={(event) =>
                onDoubleClick(event, {id, label, color, type: 'customNode'})
            }
        >
            <Tooltip content="">
                <span className="text-white font-semibold">{label}</span>
            </Tooltip>
        </div>
    );
};

export {PaletteItem};