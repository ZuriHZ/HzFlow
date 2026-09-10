import React from "react";
import { motion } from "framer-motion";
import { IconDownload } from "@tabler/icons-react";

interface UpdateProgressProps {
    percent: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
}

// ──────────────────────────────────────────────
// UpdateProgress
// ──────────────────────────────────────────────
//
// Muestra una barra de progreso durante la
// descarga de la actualización.
//
// Se muestra cuando el estado es "downloading".

export function UpdateProgress({
    percent,
    bytesPerSecond,
    transferred,
    total,
}: UpdateProgressProps) {
    // Formatear bytes a formato legible
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Formatear velocidad
    const formatSpeed = (bytesPerSec: number): string => {
        if (bytesPerSec === 0) return "";
        return formatBytes(bytesPerSec) + "/s";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.03] border border-white/5 px-5 py-4"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                    <IconDownload size={16} className="text-violet-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">
                        Descargando actualización
                    </p>
                    <p className="text-xs text-white/50">
                        {bytesPerSecond && bytesPerSecond > 0
                            ? `${formatSpeed(bytesPerSecond)}`
                            : "Preparando descarga..."}
                    </p>
                </div>
                <span className="text-sm font-semibold text-violet-400">
                    {Math.round(percent)}%
                </span>
            </div>

            {/* Barra de progreso */}
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>

            {/* Info de transferencia */}
            {transferred !== undefined && total !== undefined && (
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-white/30">
                        {formatBytes(transferred)} de {formatBytes(total)}
                    </span>
                </div>
            )}
        </motion.div>
    );
}
