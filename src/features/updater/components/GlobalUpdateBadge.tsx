import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconDownload, IconCheck, IconRefresh } from "@tabler/icons-react";
import { useUpdaterStore } from "../store/useUpdaterStore";

// ──────────────────────────────────────────────
// GlobalUpdateBadge
// ──────────────────────────────────────────────
//
// Badge compacto para la titlebar.
// Aparece solo cuando hay un update listo o descargando.
// Click → abre UpdateDetailPanel (controlado por el padre).

interface GlobalUpdateBadgeProps {
    onClick: () => void;
}

export function GlobalUpdateBadge({ onClick }: GlobalUpdateBadgeProps) {
    const state = useUpdaterStore((s) => s.state);
    const updateInfo = useUpdaterStore((s) => s.updateInfo);
    const progress = useUpdaterStore((s) => s.progress);

    // No mostrar en idle, checking, not-available, error
    const isVisible = state === "available" || state === "downloading" || state === "downloaded" || state === "installing";

    if (!isVisible) return null;

    const getVersionLabel = () => {
        if (!updateInfo?.version) return "";
        const parts = updateInfo.version.split(".");
        return `v${parts[0]}.${parts[1]}`;
    };

    const getIcon = () => {
        if (state === "downloading") {
            return (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <IconDownload size={12} className="text-white" />
                </motion.div>
            );
        }
        if (state === "downloaded" || state === "installing") {
            return <IconCheck size={12} className="text-white" />;
        }
        return <IconDownload size={12} className="text-white" />;
    };

    const getBgColor = () => {
        if (state === "downloaded") return "bg-emerald-500";
        if (state === "installing") return "bg-amber-500";
        if (state === "downloading") return "bg-violet-500";
        return "bg-violet-500";
    };

    const getTooltip = () => {
        if (state === "downloading") {
            return `Descargando... ${Math.round(progress?.percent || 0)}%`;
        }
        if (state === "downloaded") {
            return `${getVersionLabel()} listo para instalar`;
        }
        if (state === "installing") {
            return "Instalando...";
        }
        return `${getVersionLabel()} disponible`;
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                title={getTooltip()}
                className={`no-drag flex h-6 items-center gap-1.5 rounded-full px-2 text-[10px] font-bold text-white transition-colors ${getBgColor()} hover:opacity-90`}
            >
                {getIcon()}
                <span>{getVersionLabel()}</span>
                {state === "downloading" && (
                    <span className="ml-0.5 opacity-75">
                        {Math.round(progress?.percent || 0)}%
                    </span>
                )}
            </motion.button>
        </AnimatePresence>
    );
}
