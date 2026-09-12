import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconX,
    IconDownload,
    IconCheck,
    IconRefresh,
    IconLoader2,
    IconRocket,
} from "@tabler/icons-react";
import { useUpdaterStore } from "../store/useUpdaterStore";

// ──────────────────────────────────────────────
// UpdateDetailPanel
// ──────────────────────────────────────────────
//
// Panel overlay que se muestra al hacer click en
// el GlobalUpdateBadge o desde Config.
//
// Muestra: versión, release notes, progreso, install.

interface UpdateDetailPanelProps {
    onClose: () => void;
}

export function UpdateDetailPanel({ onClose }: UpdateDetailPanelProps) {
    const state = useUpdaterStore((s) => s.state);
    const updateInfo = useUpdaterStore((s) => s.updateInfo);
    const progress = useUpdaterStore((s) => s.progress);
    const error = useUpdaterStore((s) => s.error);
    const downloadUpdate = useUpdaterStore((s) => s.downloadUpdate);
    const quitAndInstall = useUpdaterStore((s) => s.quitAndInstall);
    const checkForUpdates = useUpdaterStore((s) => s.checkForUpdates);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-200 flex items-start justify-center pt-14"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* Panel */}
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-[380px] rounded-2xl border border-white/10 bg-[#1a1a2e]/95 shadow-2xl backdrop-blur-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                <IconRocket size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white/90">
                                    Actualización disponible
                                </h3>
                                <p className="text-xs text-white/40">
                                    {updateInfo?.version
                                        ? `Versión ${updateInfo.version}`
                                        : "Buscando información..."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <IconX size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-4">
                        {/* Idle / Checking */}
                        {state === "idle" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <IconRefresh size={24} className="mb-3 text-white/20" />
                                <p className="text-sm text-white/50">
                                    No hay actualizaciones disponibles
                                </p>
                                <button
                                    onClick={checkForUpdates}
                                    className="mt-3 rounded-lg bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    Buscar ahora
                                </button>
                            </div>
                        )}

                        {/* Checking */}
                        {state === "checking" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="mb-3"
                                >
                                    <IconRefresh size={24} className="text-violet-400" />
                                </motion.div>
                                <p className="text-sm text-white/70">
                                    Buscando actualizaciones...
                                </p>
                            </div>
                        )}

                        {/* Available — auto-download starts automatically */}
                        {state === "available" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20"
                                >
                                    <IconDownload size={20} className="text-violet-400" />
                                </motion.div>
                                <p className="text-sm font-medium text-white/90">
                                    Nueva versión {updateInfo?.version}
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                    Descargando automáticamente...
                                </p>
                            </div>
                        )}

                        {/* Downloading */}
                        {state === "downloading" && progress && (
                            <div className="py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm text-white/70">Descargando...</p>
                                    <span className="text-xs font-semibold text-violet-400">
                                        {Math.round(progress.percent)}%
                                    </span>
                                </div>
                                <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.percent}%` }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-white/30">
                                    <span>
                                        {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
                                    </span>
                                    <span>
                                        {progress.bytesPerSecond > 0
                                            ? `${formatBytes(progress.bytesPerSecond)}/s`
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Downloaded — ready to install */}
                        {state === "downloaded" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20"
                                >
                                    <IconCheck size={20} className="text-emerald-400" />
                                </motion.div>
                                <p className="text-sm font-medium text-white/90">
                                    {updateInfo?.version} listo para instalar
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                    Se cerrará la app y se ejecutará el instalador
                                </p>
                                <button
                                    onClick={quitAndInstall}
                                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
                                >
                                    <IconRefresh size={14} />
                                    Reiniciar ahora
                                </button>
                            </div>
                        )}

                        {/* Installing */}
                        {state === "installing" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="mb-3"
                                >
                                    <IconLoader2 size={24} className="text-amber-400" />
                                </motion.div>
                                <p className="text-sm font-medium text-white/90">
                                    Instalando actualización...
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                    La app se cerrará en unos segundos
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {state === "error" && error && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                    <IconX size={20} className="text-red-400" />
                                </div>
                                <p className="text-sm font-medium text-red-300/90">
                                    Error al buscar actualizaciones
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                    {error.message}
                                </p>
                                <button
                                    onClick={checkForUpdates}
                                    className="mt-3 rounded-lg bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Not available */}
                        {state === "not-available" && (
                            <div className="flex flex-col items-center py-6 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                                    <IconCheck size={20} className="text-emerald-400" />
                                </div>
                                <p className="text-sm font-medium text-emerald-300/90">
                                    Ya estás en la última versión
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                    No hay actualizaciones disponibles
                                </p>
                                <button
                                    onClick={checkForUpdates}
                                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <IconRefresh size={12} />
                                    Buscar de nuevo
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
