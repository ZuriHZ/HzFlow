import React from 'react';
import { motion } from 'framer-motion';
import { IconPinFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
    snippets: 'bg-blue-500/15 text-blue-400',
    ideas: 'bg-amber-500/15 text-amber-400',
    debug: 'bg-red-500/15 text-red-400',
    til: 'bg-emerald-500/15 text-emerald-400',
    todo: 'bg-violet-500/15 text-violet-400',
};

const CATEGORY_LABELS: Record<string, string> = {
    snippets: 'Snippet',
    ideas: 'Idea',
    debug: 'Debug',
    til: 'TIL',
    todo: 'Por hacer',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}sem`;
}

interface NoteCardProps {
    note: Note;
    isSelected: boolean;
    onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
    const preview = note.content.length > 80 ? note.content.slice(0, 80) + '...' : note.content;

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={cn(
                'w-full rounded-xl border p-3 text-left transition-all duration-200 mt-2',
                isSelected
                    ? 'border-violet-500/30 bg-violet-500/10'
                    : 'border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-medium text-white/90">{note.title}</h3>
                {note.pinned && <IconPinFilled size={14} className="shrink-0 text-violet-400" />}
            </div>

            <p className="mt-1 line-clamp-2 text-xs text-white/40">{preview}</p>

            <div className="mt-1 flex items-center gap-2">
                {note.category && (
                    <span
                        className={cn(
                            'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                            CATEGORY_COLORS[note.category] ?? 'bg-white/10 text-white/50',
                        )}
                    >
                        {CATEGORY_LABELS[note.category] ?? note.category}
                    </span>
                )}
                <span className="ml-auto text-[10px] text-white/30">{timeAgo(note.updatedAt)}</span>
            </div>
        </motion.button>
    );
}
