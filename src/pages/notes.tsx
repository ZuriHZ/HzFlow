import React from "react";
import { motion } from "framer-motion";
import { IconNotebook } from "@tabler/icons-react";
import { useNotes } from "@/features/notes/hooks/useNotes";
import NotesList from "@/features/notes/components/NotesList";
import NoteEditor from "@/features/notes/components/NoteEditor";

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export default function Notes() {
    const {
        notes,
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
    } = useNotes();

    const handleNewNote = () => {
        createNote({
            title: "Nueva nota",
            content: "",
            category: "snippets",
            tags: [],
            pinned: false,
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-white/2 p-6 md:p-8"
            >
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                        <IconNotebook size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Dev Notes
                        </h1>
                        <p className="text-sm text-white/40">
                            Tus notas de desarrollo
                        </p>
                    </div>
                </div>
                <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
            </motion.section>

            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-white/5 bg-white/2"
            >
                <NotesList
                    notes={notes}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    selectedNoteId={selectedNoteId}
                    categories={categories}
                    isLoading={isLoading}
                    onSearch={searchNotes}
                    onCategoryChange={setCategory}
                    onNoteSelect={setSelectedNote}
                    onNewNote={handleNewNote}
                />
                <NoteEditor
                    note={selectedNote}
                    onSave={updateNote}
                    onDelete={deleteNote}
                    onTogglePin={togglePin}
                />
            </motion.section>
        </div>
    );
}
