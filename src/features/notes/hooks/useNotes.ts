import { useEffect, useMemo } from "react";
import { useNotesStore } from "@/features/notes/store/useNotesStore";

const CATEGORIES = ["all", "snippets", "ideas", "debug", "til", "todo"] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
    all: "Todas",
    snippets: "Snippets",
    ideas: "Ideas",
    debug: "Debug",
    til: "TIL",
    todo: "Por hacer",
};

export function useNotes() {
    const {
        notes,
        isLoading,
        searchQuery,
        selectedCategory,
        selectedNoteId,
        loadNotes,
        createNote,
        updateNote,
        deleteNote,
        togglePin,
        searchNotes,
        setCategory,
        setSelectedNote,
    } = useNotesStore();

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const filteredNotes = useMemo(() => {
        const byCategory =
            selectedCategory === "all"
                ? notes
                : notes.filter((n) => n.category === selectedCategory);

        return byCategory.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [notes, selectedCategory]);

    const categories = useMemo(
        () =>
            CATEGORIES.map((c) => ({
                value: c,
                label: CATEGORY_LABELS[c],
            })),
        [],
    );

    const selectedNote = useMemo(
        () => notes.find((n) => n.id === selectedNoteId) ?? null,
        [notes, selectedNoteId],
    );

    return {
        notes: filteredNotes,
        allNotes: notes,
        isLoading,
        searchQuery,
        selectedCategory,
        selectedNoteId,
        selectedNote,
        categories,
        createNote,
        updateNote,
        deleteNote,
        togglePin,
        searchNotes,
        setCategory,
        setSelectedNote,
    };
}
