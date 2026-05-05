import {Tooltip} from "flowbite-react";

const PaletteItem = ({ label, color, id, icon: Icon, onDoubleClick }) => {
    return (
        <Tooltip content={label + " (Double-click to add)"} placement="right">
            <div
                className="w-12 h-12 rounded-lg cursor-pointer flex justify-center items-center transition-all hover:translate-x-1 hover:shadow-lg hover:shadow-black/40 border border-white/20 select-none group active:scale-95 shrink-0"
                style={{backgroundColor: color}}
                onDoubleClick={(event) =>
                    onDoubleClick(event, {id, label, color, type: 'customNode'})
                }
            >
                {Icon ? <Icon className="text-white text-xl drop-shadow-md" /> : <span className="text-white font-bold text-[10px] uppercase drop-shadow-md">{label.substring(0, 2)}</span>}
            </div>
        </Tooltip>
    );
};

export {PaletteItem};