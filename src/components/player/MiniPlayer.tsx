import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlayerPlay, IconPlayerPause, IconPlayerTrackNext, IconPlayerTrackPrev, IconMusic, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { usePlayerStore } from "@/store/usePlayerStore";

const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60),
        s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};

interface MiniPlayerProps {
    currentTime: number;
    duration: number;
    progress: number;
    onTogglePlay: () => void;
}

export default function MiniPlayer({ currentTime, duration, progress, onTogglePlay }: MiniPlayerProps) {
    const navigate = useNavigate();
    const { playlist, currentIndex, isPlaying, togglePlay, playPrev, playNext } = usePlayerStore();
    const [expanded, setExpanded] = React.useState(() => localStorage.getItem("miniPlayerExpanded") !== "false");
    const currentSong = playlist[currentIndex];

    if (playlist.length === 0) return null;

    const handleToggle = () => {
        const next = !expanded;
        setExpanded(next);
        localStorage.setItem("miniPlayerExpanded", String(next));
    };

    return (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-50 bg-[#130d24]/95 backdrop-blur-xl border-t border-white/5">
            {/* Progress bar */}
            <div className="h-1 bg-white/5">
                <div className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Collapsed bar */}
            <div className="flex items-center gap-3 px-4 h-14">
                {/* Cover */}
                <button onClick={() => navigate("/musica")} className="flex-shrink-0 cursor-pointer">
                    {currentSong?.cover ? (
                        <img src={currentSong.cover} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <IconMusic size={18} className="text-white/30" />
                        </div>
                    )}
                </button>

                {/* Info */}
                <button onClick={() => navigate("/musica")} className="flex-1 min-w-0 text-left cursor-pointer">
                    <div className="text-sm font-medium text-white/90 truncate">{currentSong?.title || "Sin título"}</div>
                    <div className="text-xs text-white/40 truncate">{currentSong?.artist || "Desconocido"}</div>
                </button>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <button onClick={playPrev} className="p-2 text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                        <IconPlayerTrackPrev size={18} />
                    </button>
                    <button onClick={onTogglePlay} className="p-2 bg-violet-500/20 rounded-full text-violet-400 hover:bg-violet-500/30 transition-colors cursor-pointer">
                        {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
                    </button>
                    <button onClick={playNext} className="p-2 text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                        <IconPlayerTrackNext size={18} />
                    </button>
                </div>

                {/* Time */}
                <span className="text-xs text-white/30 font-mono w-20 text-right hidden sm:block">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Expand */}
                <button onClick={handleToggle} className="p-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                    {expanded ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                </button>
            </div>

            {/* Expanded — song list */}
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                        <div className="max-h-48 overflow-y-auto px-4 py-2 custom-scrollbar">
                            {playlist.map((song, i) => (
                                <button key={i} onClick={() => usePlayerStore.getState().playSong(i)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer ${i === currentIndex ? "bg-violet-500/15 text-white" : "text-white/50 hover:bg-white/5"}`}>
                                    <span className="text-xs font-mono w-5 text-right text-white/20">{i + 1}</span>
                                    <div className="flex-1 truncate text-sm">{song.title}</div>
                                    {song.duration && <span className="text-xs text-white/20 font-mono">{formatTime(song.duration)}</span>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
