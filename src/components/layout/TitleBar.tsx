import React from "react";
import {
    IconArrowsDiagonalMinimize,
    IconMaximize,
    IconX,
} from "@tabler/icons-react";

interface WindowControl {
    id: string;
    icon: React.ReactNode;
    onClick: () => void;
    title: string;
    className?: string;
}

const windowControls: WindowControl[] = [
    {
        id: "minimize-btn",
        icon: <IconArrowsDiagonalMinimize size={16} />,
        onClick: () => (window as any).electronAPI?.minimize?.(),
        title: "Minimizar",
    },
    {
        id: "maximize-btn",
        icon: <IconMaximize size={16} />,
        onClick: () => (window as any).electronAPI?.maximize?.(),
        title: "Maximizar",
    },
    {
        id: "close-btn",
        icon: <IconX size={16} />,
        onClick: () => (window as any).electronAPI?.close?.(),
        title: "Cerrar",
        className: "hover:!bg-red-500 hover:!text-white",
    },
];

export default function TitleBar() {
    return (
        <header
            id="title-bar"
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between h-10 px-4 select-none"
            style={{
                background:
                    "linear-gradient(90deg, #0f0a1e 0%, #1a1035 50%, #2d1b69 100%)",
                WebkitAppRegion: "drag" as any,
                borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
            }}
        >
            {/* Left: App name with glow */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-[10px] font-black text-white">Z</span>
                </div>
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                    ZuriHZ
                </span>
            </div>

            {/* Right: Window controls */}
            <div
                className="flex items-center gap-0.5"
                style={{ WebkitAppRegion: "no-drag" as any }}
            >
                {windowControls.map(
                    ({ id, icon, onClick, title, className }) => (
                        <button
                            key={id}
                            id={id}
                            onClick={onClick}
                            title={title}
                            aria-label={title}
                            className={`w-8 h-7 flex items-center justify-center text-white/60 
                            hover:text-white hover:bg-white/10 rounded-md transition-all duration-200
                            ${className || ""}`}
                        >
                            {icon}
                        </button>
                    ),
                )}
            </div>
        </header>
    );
}
