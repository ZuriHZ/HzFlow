import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  favicon?: string;
  createdAt: string;
}

interface AddBookmarkDialogProps {
  onAdd?: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  onUpdate?: (id: string, data: Partial<Omit<Bookmark, "id" | "createdAt">>) => void;
  editBookmark?: Bookmark | null;
  onClose?: () => void;
}

const categories = [
  { value: "docs", label: "Documentación" },
  { value: "tools", label: "Herramientas" },
  { value: "tutorials", label: "Tutoriales" },
  { value: "social", label: "Social" },
  { value: "other", label: "Otros" },
];

export default function AddBookmarkDialog({
  onAdd,
  onUpdate,
  editBookmark,
  onClose,
}: AddBookmarkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (editBookmark) {
      setUrl(editBookmark.url);
      setTitle(editBookmark.title);
      setDescription(editBookmark.description);
      setCategory(editBookmark.category);
      setTagsInput(editBookmark.tags.join(", "));
      setIsOpen(true);
    }
  }, [editBookmark]);

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setDescription("");
    setCategory("other");
    setTagsInput("");
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    onClose?.();
  };

  const handleSubmit = () => {
    if (!url.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const data = {
      url: url.trim(),
      title: title.trim() || url.trim(),
      description: description.trim(),
      category,
      tags,
      favicon: editBookmark?.favicon,
    };

    if (editBookmark && onUpdate) {
      onUpdate(editBookmark.id, data);
    } else {
      onAdd?.(data);
    }

    handleClose();
  };

  const triggerButton = editBookmark ? null : (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
    >
      <IconPlus size={18} />
      Agregar Bookmark
    </button>
  );

  return (
    <>
      {triggerButton}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white/90">
                    {editBookmark ? "Editar Bookmark" : "Agregar Bookmark"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
                  >
                    <IconX size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://ejemplo.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      Titulo
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Se completa desde la URL si se deja vacio"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      Descripcion
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripcion breve del enlace"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      Categoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 outline-none transition-all focus:border-violet-500/50"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      Tags (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="react, javascript, frontend"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="rounded-xl px-4 py-2 text-sm text-white/50 transition-all hover:bg-white/5 hover:text-white/70"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!url.trim()}
                    className={cn(
                      "rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white transition-all",
                      url.trim()
                        ? "hover:shadow-lg hover:shadow-violet-500/25"
                        : "cursor-not-allowed opacity-50",
                    )}
                  >
                    {editBookmark ? "Guardar" : "Agregar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
