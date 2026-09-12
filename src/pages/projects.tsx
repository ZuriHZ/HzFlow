import { IconFolder, IconSearch } from "@tabler/icons-react";
import { motion } from "framer-motion";
import React from "react";
import AddProjectDialog from "@/features/projects/components/AddProjectDialog";
import ProjectGrid from "@/features/projects/components/ProjectGrid";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { cn } from "@/lib/utils";

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export default function Projects() {
    const {
        projects,
        isLoading,
        searchQuery,
        selectedStack,
        uniqueStacks,
        stats,
        addProject,
        removeProject,
        openInVSCode,
        openInTerminal,
        openInExplorer,
        setSearchQuery,
        setSelectedStack,
    } = useProjects();

    return (
        <div className="flex flex-col gap-8">
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
            >
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <IconFolder size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">
                                Mis Proyectos Locura
                            </h1>
                            <p className="text-sm text-white/40">
                                Organiza y accede a tus proyectos de desarrollo
                            </p>
                        </div>
                    </div>
                    <AddProjectDialog onAdd={addProject} />
                </div>
                <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
            </motion.section>

            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
                <div className="relative flex-1">
                    <IconSearch
                        size={16}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar proyectos..."
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-10 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>

                {uniqueStacks.length > 0 && (
                    <select
                        value={selectedStack}
                        onChange={(e) => setSelectedStack(e.target.value)}
                        className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 outline-none transition-all focus:border-violet-500/50"
                    >
                        <option value="all">Todos los stacks</option>
                        {uniqueStacks.map((stack) => (
                            <option key={stack} value={stack}>
                                {stack}
                            </option>
                        ))}
                    </select>
                )}
            </motion.section>

            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                    <div className="text-2xl font-bold text-white/90">
                        {stats.total}
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                        Total proyectos
                    </div>
                </div>
                {Object.entries(stats.byStack)
                    .slice(0, 2)
                    .map(([stack, count]) => (
                        <div
                            key={stack}
                            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
                        >
                            <div className="text-2xl font-bold text-white/90">
                                {count}
                            </div>
                            <div className="mt-1 text-xs text-white/40">
                                {stack}
                            </div>
                        </div>
                    ))}
            </motion.section>

            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <ProjectGrid
                    projects={projects}
                    isLoading={isLoading}
                    onOpenInVSCode={openInVSCode}
                    onOpenInTerminal={openInTerminal}
                    onOpenInExplorer={openInExplorer}
                    onRemove={removeProject}
                    onAddProject={() => {}}
                />
            </motion.section>
        </div>
    );
}
