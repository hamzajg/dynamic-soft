import {Tooltip} from "flowbite-react";

const PaletteItem = ({ label, color, id, onDoubleClick }) => {
    return (
        <div
            className="rounded-sm p-4 cursor-pointer flex justify-center items-center transition-all hover:translate-x-1 hover:shadow-lg hover:shadow-black/20 border border-white/10 select-none group active:scale-95"
            style={{backgroundColor: color}}
            onDoubleClick={(event) =>
                onDoubleClick(event, {id, label, color, type: 'customNode'})
            }
        >
            <Tooltip content="Double-click to add" placement="right">
                <span className="text-white font-bold text-xs uppercase tracking-widest">{label}</span>
            </Tooltip>
        </div>
    );
};

export {PaletteItem};