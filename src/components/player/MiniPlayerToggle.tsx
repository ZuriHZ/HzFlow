import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMusic } from "@tabler/icons-react";
import { usePlayerStore } from "@/store/usePlayerStore";

interface MiniPlayerToggleProps {
    isVisible: boolean;
    onToggle: () => void;
}

export default function MiniPlayerToggle({ isVisible, onToggle }: MiniPlayerToggleProps) {
    const { playlist } = usePlayerStore();

    if (playlist.length === 0) return null;

    return (
        <AnimatePresence>
            {!isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={onToggle}
                    className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-violet-500/80 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-colors cursor-pointer"
                >
                    <IconMusic size={20} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
