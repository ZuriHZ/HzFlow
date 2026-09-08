import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconFolderPlus, IconLoader2 } from "@tabler/icons-react";
import ProjectCard from "@/features/projects/components/ProjectCard";

interface ProjectGridProps {
    projects: Project[];
    isLoading: boolean;
    onOpenInVSCode: (path: string) => void;
    onOpenInTerminal: (path: string) => void;
    onOpenInExplorer: (path: string) => void;
    onRemove: (id: string) => void;
    onAddProject: () => void;
}

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-white/10" />
                    <div className="mt-2 h-3 w-48 rounded bg-white/5" />
                </div>
                <div className="h-5 w-14 rounded-full bg-white/5" />
            </div>
            <div className="mb-4 h-3 w-24 rounded bg-white/5" />
            <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-lg bg-white/5" />
                ))}
            </div>
        </div>
    );
}

export default function ProjectGrid({
    projects,
    isLoading,
    onOpenInVSCode,
    onOpenInTerminal,
    onOpenInExplorer,
    onRemove,
    onAddProject,
}: ProjectGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16"
            >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
                    <IconFolderPlus size={28} className="text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/50">
                    No hay proyectos aún
                </p>
                <p className="mt-1 text-xs text-white/30">
                    Agrega tu primer proyecto para comenzar
                </p>
                <button
                    onClick={onAddProject}
                    className="mt-6 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                >
                    Agregar Proyecto
                </button>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onOpenInVSCode={onOpenInVSCode}
                        onOpenInTerminal={onOpenInTerminal}
                        onOpenInExplorer={onOpenInExplorer}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
