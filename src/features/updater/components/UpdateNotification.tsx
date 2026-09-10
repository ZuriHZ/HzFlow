import React from "react";
import { motion } from "framer-motion";
import { IconDownload, IconRefresh } from "@tabler/icons-react";

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
// Muestra un badge/botón en la interfaz cuando
// hay una actualización disponible.
//
// Estados que maneja:
//   idle / not-available → Solo muestra "Buscar actualizaciones"
//   checking             → Muestra spinner "Buscando..."
//   available            → Muestra badge "Nueva versión v1.2.3" + botón descargar
//   error                → Muestra error + botón reintentar

export function UpdateNotification({
    state,
    updateInfo,
    onCheck,
    onDownload,
}: UpdateNotificationProps) {
    // Si hay una actualización disponible, mostrar badge prominente
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

    // Si está descargando o ya se descargó, no mostrar este componente
    if (state === "downloading" || state === "downloaded") {
        return null;
    }

    // Estado por defecto: botón para buscar actualizaciones
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
                    {state === "checking"
                        ? "Buscando actualizaciones..."
                        : state === "error"
                          ? "Error al buscar actualizaciones"
                          : "Mantén tu app actualizada"}
                </p>
            </div>
            <button
                onClick={onCheck}
                disabled={state === "checking"}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 
                    hover:bg-white/10 hover:text-white transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {state === "checking" ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <IconRefresh size={14} />
                    </motion.div>
                ) : (
                    <IconRefresh size={14} />
                )}
                {state === "checking" ? "Buscando..." : "Buscar"}
            </button>
        </motion.div>
    );
}
