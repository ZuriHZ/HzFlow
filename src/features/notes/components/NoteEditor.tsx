import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    IconDeviceFloppy,
    IconTrash,
    IconPinFilled,
    IconPin,
    IconNotebook,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { value: "snippets", label: "Snippet" },
    { value: "ideas", label: "Idea" },
    { value: "debug", label: "Debug" },
    { value: "til", label: "TIL" },
    { value: "todo", label: "Por hacer" },
];

interface NoteEditorProps {
    note: Note | null;
    onSave: (id: string, data: Partial<Omit<Note, "id" | "createdAt">>) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
}

export default function NoteEditor({
    note,
    onSave,
    onDelete,
    onTogglePin,
}: NoteEditorProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("snippets");
    const [tagsInput, setTagsInput] = useState("");

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setCategory(note.category);
            setTagsInput(note.tags.join(", "));
        }
    }, [note?.id]);

    if (!note) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <IconNotebook size={48} className="text-white/10" />
                <div className="text-center">
                    <p className="text-sm text-white/30">
                        Selecciona una nota para editar
                    </p>
                    <p className="mt-1 text-xs text-white/20">
                        O crea una nueva con el boton de arriba
                    </p>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        onSave(note.id, { title, content, category, tags });
    };

    const formattedCreated = new Date(note.createdAt).toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    const formattedUpdated = new Date(note.updatedAt).toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titulo de la nota..."
                    className="flex-1 bg-transparent text-base font-semibold text-white/90 placeholder-white/25 outline-none"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/60 outline-none transition-all focus:border-violet-500/50"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => onTogglePin(note.id)}
                    className="rounded-lg p-1.5 text-white/40 transition-all hover:bg-white/5 hover:text-violet-400"
                    title={note.pinned ? "Desfijar" : "Fijar"}
                >
                    {note.pinned ? (
                        <IconPinFilled size={16} />
                    ) : (
                        <IconPin size={16} />
                    )}
                </button>

                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/25"
                >
                    <IconDeviceFloppy size={14} />
                    Guardar
                </button>

                <button
                    onClick={() => onDelete(note.id)}
                    className="rounded-lg p-1.5 text-white/30 transition-all hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                >
                    <IconTrash size={16} />
                </button>
            </div>

            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-2">
                <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Tags (separados por coma)..."
                    className="flex-1 bg-transparent text-xs text-white/50 placeholder-white/25 outline-none"
                />
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu nota aqui..."
                className="flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-white/80 placeholder-white/20 outline-none"
            />

            <div className="flex items-center justify-between border-t border-white/5 px-5 py-2 text-[10px] text-white/25">
                <span>Creado: {formattedCreated}</span>
                <span>Actualizado: {formattedUpdated}</span>
            </div>
        </div>
    );
}
