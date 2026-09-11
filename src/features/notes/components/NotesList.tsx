import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconSearch, IconPlus, IconNotebook } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import NoteCard from '@/features/notes/components/NoteCard';

interface NotesListProps {
    notes: Note[];
    searchQuery: string;
    selectedCategory: string;
    selectedNoteId: string | null;
    categories: { value: string; label: string }[];
    isLoading: boolean;
    onSearch: (query: string) => void;
    onCategoryChange: (category: string) => void;
    onNoteSelect: (id: string) => void;
    onNewNote: () => void;
}

export default function NotesList({
    notes,
    searchQuery,
    selectedCategory,
    selectedNoteId,
    categories,
    isLoading,
    onSearch,
    onCategoryChange,
    onNoteSelect,
    onNewNote,
}: NotesListProps) {
    return (
        <div className="flex h-full w-80 shrink-0 flex-col border-r border-white/5">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <button
                    onClick={onNewNote}
                    className="flex items-center gap-2 rounded-xl bg-violet-500/15 px-3 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/25"
                >
                    <IconPlus size={16} />
                    Nueva Nota
                </button>
            </div>

            <div className="relative px-4 pb-2">
                <IconSearch size={14} className="absolute top-2 left-7 text-white/30" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Buscar notas..."
                    className="w-full rounded-xl border border-white/10 bg-white/3 py-2 pr-3 pl-8 text-xs text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
            </div>

            <div className="flex min-w-0 gap-1.5 overflow-x-auto px-4 pb-3">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => onCategoryChange(cat.value)}
                        className={cn(
                            'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all',
                            selectedCategory === cat.value
                                ? 'bg-violet-500/20 text-violet-300'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60',
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-xs text-white/30">Cargando...</div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <IconNotebook size={32} className="text-white/15" />
                        <p className="text-xs text-white/30">
                            {searchQuery ? 'No se encontraron notas' : 'Sin notas todavia'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <AnimatePresence mode="popLayout">
                            {notes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    isSelected={note.id === selectedNoteId}
                                    onClick={() => onNoteSelect(note.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
