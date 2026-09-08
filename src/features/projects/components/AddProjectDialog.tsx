import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus, IconX, IconWand } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AddProjectDialogProps {
    onAdd: (path: string) => void;
}

export default function AddProjectDialog({ onAdd }: AddProjectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [path, setPath] = useState("");
    const [isDetecting, setIsDetecting] = useState(false);

    const handleDetectStack = async () => {
        setIsDetecting(true);
        await new Promise((r) => setTimeout(r, 800));
        setIsDetecting(false);
    };

    const handleSubmit = () => {
        if (!path.trim()) return;
        onAdd(path.trim());
        setPath("");
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
                <IconPlus size={18} />
                Agregar Proyecto
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
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
                                        Agregar Proyecto
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
                                    >
                                        <IconX size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/50">
                                            Ruta del proyecto
                                        </label>
                                        <input
                                            type="text"
                                            value={path}
                                            onChange={(e) =>
                                                setPath(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                handleSubmit()
                                            }
                                            placeholder="C:\Users\...\mi-proyecto"
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        onClick={handleDetectStack}
                                        disabled={!path.trim() || isDetecting}
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium transition-all",
                                            path.trim() && !isDetecting
                                                ? "text-white/70 hover:bg-white/5 hover:text-white/90"
                                                : "cursor-not-allowed text-white/20",
                                        )}
                                    >
                                        <IconWand
                                            size={14}
                                            className={cn(
                                                isDetecting && "animate-spin",
                                            )}
                                        />
                                        {isDetecting
                                            ? "Detectando..."
                                            : "Detectar Stack"}
                                    </button>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-xl px-4 py-2 text-sm text-white/50 transition-all hover:bg-white/5 hover:text-white/70"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!path.trim()}
                                        className={cn(
                                            "rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white transition-all",
                                            path.trim()
                                                ? "hover:shadow-lg hover:shadow-violet-500/25"
                                                : "cursor-not-allowed opacity-50",
                                        )}
                                    >
                                        Agregar
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
