import React from "react";
import { IconArrowsDiagonalMinimize, IconCode, IconMaximize, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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
    {
        id: "dev-tools",
        icon: <IconCode size={16} />,
        onClick: () => (window as any).electronAPI?.toggleDevTools?.(),
        title: "Herramientas de desarrollador",
        className: "hover:!bg-violet-500 hover:!text-white",
    },
];
export default function TitleBar() {
    return (
        <header id="title-bar" className="drag bg-titlebar fixed top-0 right-0 left-0 z-100 flex h-10 items-center justify-between border-b border-sidebar-border px-4 select-none">
            <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                    <span className="text-[10px] font-black text-white">Z</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-white/90">ZuriHZ</span>
            </div>

            <div className="no-drag flex items-center gap-0.5">
                {windowControls.map(({ id, icon, onClick, title, className }) => (
                    <button key={id} id={id} onClick={onClick} title={title} aria-label={title} className={cn("flex h-7 w-8 items-center justify-center rounded-md text-white/60 transition-all duration-200", "hover:bg-white/10 hover:text-white", className)}>
                        {icon}
                    </button>
                ))}
            </div>
        </header>
    );
}
