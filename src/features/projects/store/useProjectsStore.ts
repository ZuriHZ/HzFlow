import { create } from "zustand";

interface ProjectsStore {
    projects: Project[];
    isLoading: boolean;
    searchQuery: string;
    selectedStack: string;

    loadProjects: () => Promise<void>;
    addProject: (path: string) => Promise<void>;
    removeProject: (id: string) => Promise<void>;
    openInVSCode: (path: string) => Promise<void>;
    openInTerminal: (path: string) => Promise<void>;
    openInExplorer: (path: string) => Promise<void>;
    refreshGitInfo: (path: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setSelectedStack: (stack: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()((set, get) => ({
    projects: [],
    isLoading: false,
    searchQuery: "",
    selectedStack: "all",

    loadProjects: async () => {
        set({ isLoading: true });
        try {
            const projects = await window.electronAPI.projectsGetAll();
            set({ projects });
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addProject: async (path: string) => {
        try {
            const newProject = await window.electronAPI.projectsAdd(path);
            set((state) => ({ projects: [...state.projects, newProject] }));
        } catch (error) {
            console.error("Error adding project:", error);
        }
    },

    removeProject: async (id: string) => {
        try {
            await window.electronAPI.projectsRemove(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
            }));
        } catch (error) {
            console.error("Error removing project:", error);
        }
    },

    openInVSCode: async (path: string) => {
        try {
            await window.electronAPI.projectsOpenInVSCode(path);
        } catch (error) {
            console.error("Error opening in VS Code:", error);
        }
    },

    openInTerminal: async (path: string) => {
        try {
            await window.electronAPI.projectsOpenInTerminal(path);
        } catch (error) {
            console.error("Error opening terminal:", error);
        }
    },

    openInExplorer: async (path: string) => {
        try {
            await window.electronAPI.projectsOpenInExplorer(path);
        } catch (error) {
            console.error("Error opening explorer:", error);
        }
    },

    refreshGitInfo: async (path: string) => {
        try {
            const gitInfo = await window.electronAPI.projectsGetGitInfo(path);
            set((state) => ({
                projects: state.projects.map((p) =>
                    p.path === path
                        ? {
                              ...p,
                              gitBranch: gitInfo.gitBranch ?? undefined,
                              gitAhead: gitInfo.gitAhead,
                              gitBehind: gitInfo.gitBehind,
                          }
                        : p,
                ),
            }));
        } catch (error) {
            console.error("Error getting git info:", error);
        }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSelectedStack: (stack: string) => set({ selectedStack: stack }),
}));
