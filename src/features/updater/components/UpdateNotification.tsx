import React from "react";
import { motion } from "framer-motion";
import { IconCheck, IconDownload, IconRefresh } from "@tabler/icons-react";

interface UpdateNotificationProps {
    state: string;
    updateInfo: { version: string; releaseNotes?: string } | null;
    onCheck: () => void;
    onDownload: () => void;
}

// ──────────────────────────────────────────────
// UpdateNotification
// ──────────────────────────────────────────────
//
// Maneja todos los estados del updater con
// mensajes claros para cada uno.
//
// Estados:
//   idle           → "Mantén tu app actualizada" + botón Buscar
//   checking       → Spinner "Buscando actualizaciones..."
//   available      → Badge violeta "Nueva versión vX.Y.Z" + botón Descargar
//   not-available  → Badge verde "Ya estás en la última versión" + botón Buscar
//   downloading    → Se oculta (lo maneja UpdateProgress)
//   downloaded     → Se oculta (lo maneja UpdateReady)
//   error          → Mensaje de error + botón Reintentar

export function UpdateNotification({
    state,
    updateInfo,
    onCheck,
    onDownload,
}: UpdateNotificationProps) {
    // ── Hay actualización disponible ──
    if (state === "available" && updateInfo) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 px-4 py-3"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                    <IconDownload size={16} className="text-violet-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">
                        Actualización disponible
                    </p>
                    <p className="text-xs text-white/50">
                        Versión {updateInfo.version}
                    </p>
                </div>
                <button
                    onClick={onDownload}
                    className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white 
                        hover:bg-violet-400 transition-colors"
                >
                    Descargar
                </button>
            </motion.div>
        );
    }

    // ── Ya está actualizado ──
    if (state === "not-available") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <IconCheck size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-300/90">
                        Ya estás en la última versión
                    </p>
                    <p className="text-xs text-white/40">
                        No hay actualizaciones disponibles
                    </p>
                </div>
                <button
                    onClick={onCheck}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 
                        hover:bg-white/10 hover:text-white transition-colors"
                >
                    <IconRefresh size={14} />
                    Buscar
                </button>
            </motion.div>
        );
    }

    // ── Buscando actualizaciones ──
    if (state === "checking") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <IconRefresh size={16} className="text-violet-400" />
                    </motion.div>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/80">
                        Buscando actualizaciones...
                    </p>
                    <p className="text-xs text-white/40">
                        Conectando con el servidor
                    </p>
                </div>
            </motion.div>
        );
    }

    // ── Error ──
    if (state === "error") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                    <IconRefresh size={16} className="text-red-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-300/90">
                        Error al buscar actualizaciones
                    </p>
                    <p className="text-xs text-white/40">
                        Verifica tu conexión e intenta de nuevo
                    </p>
                </div>
                <button
                    onClick={onCheck}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 
                        hover:bg-white/10 hover:text-white transition-colors"
                >
                    <IconRefresh size={14} />
                    Reintentar
                </button>
            </motion.div>
        );
    }

    // ── Descargando / listo para instalar (se ocultan, los manejan otros componentes) ──
    if (state === "downloading" || state === "downloaded") {
        return null;
    }

    // ── Estado idle (por defecto) ──
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3"
        >
            <div className="flex-1">
                <p className="text-sm font-medium text-white/80">
                    Actualizaciones
                </p>
                <p className="text-xs text-white/40">
                    Mantén tu app actualizada
                </p>
            </div>
            <button
                onClick={onCheck}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 
                    hover:bg-white/10 hover:text-white transition-colors"
            >
                <IconRefresh size={14} />
                Buscar
            </button>
        </motion.div>
    );
}
