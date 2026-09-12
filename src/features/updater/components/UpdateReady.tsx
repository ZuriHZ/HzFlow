import React from "react";
import { motion } from "framer-motion";
import { IconCheck, IconRefresh, IconLoader2 } from "@tabler/icons-react";

interface UpdateReadyProps {
    updateInfo: { version: string } | null;
    onRestart: () => void;
    isInstalling?: boolean;
}

// ──────────────────────────────────────────────
// UpdateReady
// ──────────────────────────────────────────────
//
// Muestra un panel/setqMessage de que la
// actualización está lista para instalar.
//
// Se muestra cuando el estado es "downloaded" o "installing".

export function UpdateReady({ updateInfo, onRestart, isInstalling }: UpdateReadyProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-5 py-4"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    {isInstalling ? (
                        <IconLoader2 size={20} className="text-emerald-400 animate-spin" />
                    ) : (
                        <IconCheck size={20} className="text-emerald-400" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">
                        {isInstalling ? "Instalando actualización..." : "Actualización lista para instalar"}
                    </p>
                    <p className="text-xs text-white/50">
                        {isInstalling
                            ? "La app se cerrará en unos segundos para instalar. NSIS relanzará la app automáticamente."
                            : `La versión ${updateInfo?.version || "nueva"} ha sido descargada correctamente`
                        }
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <p className="text-xs text-white/40 flex-1">
                    {isInstalling
                        ? "Si no se cierra automáticamente, cerrá la app manualmente"
                        : "Se cerrará la app y se ejecutará el instalador"
                    }
                </p>
                <button
                    onClick={onRestart}
                    disabled={isInstalling}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white 
                        hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isInstalling ? (
                        <>
                            <IconLoader2 size={14} className="animate-spin" />
                            Instalando...
                        </>
                    ) : (
                        <>
                            <IconRefresh size={14} />
                            Reiniciar ahora
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
