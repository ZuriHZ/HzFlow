import { create } from "zustand";

interface NotesStore {
    notes: Note[];
    isLoading: boolean;
    searchQuery: string;
    selectedCategory: string;
    selectedNoteId: string | null;

    loadNotes: () => Promise<void>;
    createNote: (
        note: Omit<Note, "id" | "createdAt" | "updatedAt">,
    ) => Promise<void>;
    updateNote: (
        id: string,
        data: Partial<Omit<Note, "id" | "createdAt">>,
    ) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
    searchNotes: (query: string) => Promise<void>;
    setCategory: (category: string) => void;
    setSelectedNote: (id: string | null) => void;
}

export const useNotesStore = create<NotesStore>()((set) => ({
    notes: [],
    isLoading: false,
    searchQuery: "",
    selectedCategory: "all",
    selectedNoteId: null,

    loadNotes: async () => {
        set({ isLoading: true });
        try {
            const notes = await window.electronAPI.notesGetAll();
            set({ notes });
        } catch (error) {
            console.error("Error cargando notas:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    createNote: async (note) => {
        try {
            await window.electronAPI.notesCreate(note);
            const notes = await window.electronAPI.notesGetAll();
            set({ notes });
        } catch (error) {
            console.error("Error creando nota:", error);
        }
    },

    updateNote: async (id, data) => {
        try {
            await window.electronAPI.notesUpdate(id, data);
            const notes = await window.electronAPI.notesGetAll();
            set({ notes });
        } catch (error) {
            console.error("Error actualizando nota:", error);
        }
    },

    deleteNote: async (id) => {
        try {
            await window.electronAPI.notesDelete(id);
            const notes = await window.electronAPI.notesGetAll();
            set((state) => ({
                notes,
                selectedNoteId:
                    state.selectedNoteId === id ? null : state.selectedNoteId,
            }));
        } catch (error) {
            console.error("Error eliminando nota:", error);
        }
    },

    togglePin: async (id) => {
        const current = useNotesStore.getState().notes.find((n) => n.id === id);
        if (!current) return;
        try {
            await window.electronAPI.notesUpdate(id, { pinned: !current.pinned });
            const notes = await window.electronAPI.notesGetAll();
            set({ notes });
        } catch (error) {
            console.error("Error fijando nota:", error);
        }
    },

    searchNotes: async (query) => {
        set({ searchQuery: query });
        if (!query.trim()) {
            const notes = await window.electronAPI.notesGetAll();
            set({ notes });
            return;
        }
        try {
            const notes = await window.electronAPI.notesSearch(query);
            set({ notes });
        } catch (error) {
            console.error("Error buscando notas:", error);
        }
    },

    setCategory: (category) => set({ selectedCategory: category }),
    setSelectedNote: (id) => set({ selectedNoteId: id }),
}));
