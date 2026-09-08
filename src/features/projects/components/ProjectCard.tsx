import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    IconBrandVisualStudio,
    IconTerminal,
    IconFolderOpen,
    IconTrash,
    IconGitBranch,
    IconArrowUp,
    IconArrowDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const stackColors: Record<string, string> = {
    react: "from-blue-500 to-cyan-400",
    vue: "from-green-500 to-emerald-400",
    angular: "from-red-500 to-orange-400",
    svelte: "from-orange-500 to-amber-400",
    nextjs: "from-gray-700 to-gray-900",
    nodejs: "from-green-600 to-green-400",
    python: "from-yellow-500 to-blue-500",
    default: "from-violet-500 to-purple-400",
};

interface ProjectCardProps {
    project: Project;
    onOpenInVSCode: (path: string) => void;
    onOpenInTerminal: (path: string) => void;
    onOpenInExplorer: (path: string) => void;
    onRemove: (id: string) => void;
}

export default function ProjectCard({
    project,
    onOpenInVSCode,
    onOpenInTerminal,
    onOpenInExplorer,
    onRemove,
}: ProjectCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const stackGradient =
        stackColors[project.stack?.toLowerCase()] || stackColors.default;

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return "Ahora mismo";
            if (diffMins < 60) return `Hace ${diffMins}m`;
            if (diffHours < 24) return `Hace ${diffHours}h`;
            if (diffDays < 7) return `Hace ${diffDays}d`;
            return date.toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
            });
        } catch {
            return "N/A";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-white/90">
                        {project.name}
                    </h3>
                    <p className="mt-1 truncate text-xs text-white/40">
                        {project.path}
                    </p>
                </div>
                {project.stack && (
                    <div
                        className={cn(
                            "ml-3 shrink-0 rounded-full bg-linear-to-br px-2.5 py-0.5 text-[10px] font-medium text-white",
                            stackGradient,
                        )}
                    >
                        {project.stack}
                    </div>
                )}
            </div>

            {(project.gitBranch || project.gitAhead !== undefined || project.gitBehind !== undefined) && (
                <div className="mb-3 flex items-center gap-2 text-xs text-white/50">
                    <IconGitBranch size={14} className="text-white/40" />
                    <span>{project.gitBranch || "detached"}</span>
                    {project.gitAhead !== undefined && project.gitAhead > 0 && (
                        <span className="flex items-center gap-0.5 text-emerald-400">
                            <IconArrowUp size={12} />
                            {project.gitAhead}
                        </span>
                    )}
                    {project.gitBehind !== undefined && project.gitBehind > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400">
                            <IconArrowDown size={12} />
                            {project.gitBehind}
                        </span>
                    )}
                </div>
            )}

            <div className="mb-4 text-[11px] text-white/30">
                Último acceso: {formatDate(project.lastAccessed)}
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onOpenInVSCode(project.path)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
                    title="Abrir en VS Code"
                >
                    <IconBrandVisualStudio size={16} />
                </button>
                <button
                    onClick={() => onOpenInTerminal(project.path)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
                    title="Abrir en Terminal"
                >
                    <IconTerminal size={16} />
                </button>
                <button
                    onClick={() => onOpenInExplorer(project.path)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
                    title="Abrir en Explorer"
                >
                    <IconFolderOpen size={16} />
                </button>

                <div className="flex-1" />

                {showConfirm ? (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                onRemove(project.id);
                                setShowConfirm(false);
                            }}
                            className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-medium text-red-400 transition-all hover:bg-red-500/30"
                        >
                            Eliminar
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="rounded-lg px-2.5 py-1 text-[11px] text-white/40 transition-all hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Eliminar proyecto"
                    >
                        <IconTrash size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
