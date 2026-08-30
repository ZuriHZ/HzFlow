import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (progress >= 100) {
            setTimeout(() => setExiting(true), 400);
            setTimeout(() => onComplete(), 1000);
            return;
        }
        const timer = setInterval(() => {
            setProgress((prev) => Math.min(prev + 2, 100));
        }, 20);
        return () => clearInterval(timer);
    }, [progress, onComplete]);

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="bg-loading-radial fixed inset-0 z-200 flex flex-col items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-2xl shadow-violet-500/30">
                            <span className="text-5xl font-black text-white">
                                Z
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-2 text-2xl font-bold tracking-wide text-white/90"
                    >
                        ZuriHZ
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mb-8 text-sm text-white/30"
                    >
                        Preparando tu experiencia...
                    </motion.p>

                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="h-1.5 overflow-hidden rounded-full bg-white/5"
                    >
                        <motion.div
                            className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
                            style={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </motion.div>

                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 font-mono text-xs text-white/20"
                    >
                        {progress}%
                    </motion.span>

                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
                        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-fuchsia-600/5 blur-[80px]" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
