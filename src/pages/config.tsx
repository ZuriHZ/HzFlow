import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSettings, IconCheck, IconX } from "@tabler/icons-react";
import { useUpdater } from "@/features/updater/hooks/useUpdater";
import {
    UpdateNotification,
    UpdateProgress,
    UpdateReady,
} from "@/features/updater/components";

const defaultConfig = {
    darkMode: false,
    notifications: true,
};

const Config = () => {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem("config");
        return saved ? JSON.parse(saved) : defaultConfig;
    });
    const [originalConfig, setOriginalConfig] = useState(config);
    const [feedback, setFeedback] = useState<"saved" | "cancelled" | null>(
        null,
    );

    // ── Updater ──
    const updater = useUpdater();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", config.darkMode);
    }, [config.darkMode]);

    const handleChange = (name: string, value: boolean) => {
        setConfig((prev: any) => ({ ...prev, [name]: value }));
        setFeedback(null);
    };

    const handleSave = () => {
        localStorage.setItem("config", JSON.stringify(config));
        setOriginalConfig(config);
        setFeedback("saved");
        setTimeout(() => setFeedback(null), 2500);
    };

    const handleCancel = () => {
        setConfig(originalConfig);
        setFeedback("cancelled");
        setTimeout(() => setFeedback(null), 2500);
    };

    const hasChanges =
        JSON.stringify(config) !== JSON.stringify(originalConfig);

    return (
        <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400">
                        <IconSettings size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Configuración
                        </h1>
                        <p className="text-sm text-white/40">
                            Personaliza tu experiencia
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Settings sections */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {/* General preferences */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
                    <div className="px-5 py-3">
                        <h2 className="text-sm font-semibold text-white/60">
                            Preferencias generales
                        </h2>
                    </div>

                    {/* Dark mode toggle */}
                    <div className="flex items-center justify-between px-5 py-4">
                        <div>
                            <p className="text-sm font-medium text-white/80">
                                Modo oscuro
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                                Cambia el tema de la interfaz
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                handleChange("darkMode", !config.darkMode)
                            }
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 
                                ${config.darkMode ? "bg-violet-500" : "bg-white/10"}`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
                                    ${config.darkMode ? "left-[22px]" : "left-0.5"}`}
                            />
                        </button>
                    </div>

                    {/* Notifications toggle */}
                    <div className="flex items-center justify-between px-5 py-4">
                        <div>
                            <p className="text-sm font-medium text-white/80">
                                Notificaciones
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                                Recibe alertas y actualizaciones
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                handleChange(
                                    "notifications",
                                    !config.notifications,
                                )
                            }
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 
                                ${config.notifications ? "bg-violet-500" : "bg-white/10"}`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
                                    ${config.notifications ? "left-[22px]" : "left-0.5"}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Updater section */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
                    <div className="px-5 py-3">
                        <h2 className="text-sm font-semibold text-white/60">
                            Actualizaciones
                        </h2>
                    </div>

                    <div className="p-5 space-y-3">
                        {/* Notification: shows check button or available update */}
                        <UpdateNotification
                            state={updater.state}
                            updateInfo={updater.updateInfo}
                            onCheck={updater.checkForUpdates}
                            onDownload={updater.downloadUpdate}
                        />

                        {/* Progress bar: shows during download */}
                        {updater.state === "downloading" && updater.progress && (
                            <UpdateProgress
                                percent={updater.progress.percent}
                                bytesPerSecond={updater.progress.bytesPerSecond}
                                transferred={updater.progress.transferred}
                                total={updater.progress.total}
                            />
                        )}

                        {/* Ready: shows after download completes */}
                        {updater.state === "downloaded" && (
                            <UpdateReady
                                updateInfo={updater.updateInfo}
                                onRestart={updater.quitAndInstall}
                            />
                        )}

                        {/* Error state */}
                        {updater.state === "error" && updater.error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                                <p className="text-xs text-red-400">
                                    Error: {updater.error.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <AnimatePresence>
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
                        >
                            <span className="text-sm text-white/60">
                                Tienes cambios sin guardar
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-white/60 
                                        hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="rounded-lg bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                                >
                                    Guardar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Feedback toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-lg
                            ${
                                feedback === "saved"
                                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                                    : "bg-red-500/20 border border-red-500/30 text-red-300"
                            }`}
                    >
                        {feedback === "saved" ? (
                            <IconCheck size={16} />
                        ) : (
                            <IconX size={16} />
                        )}
                        <span className="text-sm font-medium">
                            {feedback === "saved"
                                ? "¡Configuración guardada!"
                                : "Cambios cancelados"}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Config;
