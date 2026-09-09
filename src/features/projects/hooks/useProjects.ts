import { useEffect, useMemo } from "react";
import { useProjectsStore } from "@/features/projects/store/useProjectsStore";

export function useProjects() {
    const {
        projects,
        isLoading,
        searchQuery,
        selectedStack,
        loadProjects,
        addProject,
        removeProject,
        openInVSCode,
        openInTerminal,
        openInExplorer,
        refreshGitInfo,
        setSearchQuery,
        setSelectedStack,
    } = useProjectsStore();

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    useEffect(() => {
        if (projects.length === 0) return;

        const interval = setInterval(() => {
            projects.forEach((project) => {
                refreshGitInfo(project.path);
            });
        }, 30000);

        return () => clearInterval(interval);
    }, [projects, refreshGitInfo]);

    const uniqueStacks = useMemo(() => {
        const stacks = new Set(projects.map((p) => p.stack).filter(Boolean));
        return Array.from(stacks).sort();
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch =
                !searchQuery ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.path.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStack =
                selectedStack === "all" || project.stack === selectedStack;

            return matchesSearch && matchesStack;
        });
    }, [projects, searchQuery, selectedStack]);

    const stats = useMemo(() => {
        const byStack: Record<string, number> = {};
        projects.forEach((p) => {
            const stack = p.stack || "Sin stack";
            byStack[stack] = (byStack[stack] || 0) + 1;
        });
        return { total: projects.length, byStack };
    }, [projects]);

    return {
        projects: filteredProjects,
        allProjects: projects,
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
    };
}
