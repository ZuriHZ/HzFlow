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
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, #1a1035 0%, #0a0612 70%, #000 100%)",
                    }}
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                            <span className="text-5xl font-black text-white">
                                Z
                            </span>
                        </div>
                    </motion.div>

                    {/* App name */}
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-2xl font-bold text-white/90 mb-2 tracking-wide"
                    >
                        ZuriHZ
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-sm text-white/30 mb-8"
                    >
                        Preparando tu experiencia...
                    </motion.p>

                    {/* Progress bar */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="h-1.5 bg-white/5 rounded-full overflow-hidden"
                    >
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
                            style={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </motion.div>

                    {/* Percentage */}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 text-xs text-white/20 font-mono"
                    >
                        {progress}%
                    </motion.span>

                    {/* Ambient glow effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
                        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-[80px]" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
