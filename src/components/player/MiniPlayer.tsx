import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlayerPlay, IconPlayerPause, IconPlayerTrackNext, IconPlayerTrackPrev, IconMusic, IconX, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
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
    isVisible: boolean;
    onClose: () => void;
}

export default function MiniPlayer({ currentTime, duration, progress, onTogglePlay, isVisible, onClose }: MiniPlayerProps) {
    const navigate = useNavigate();
    const { playlist, currentIndex, isPlaying, playPrev, playNext } = usePlayerStore();
    const [expanded, setExpanded] = React.useState(false);
    const currentSong = playlist[currentIndex];
    const didDrag = React.useRef(false);

    if (playlist.length === 0) return null;

    const handleClick = (fn: () => void) => () => {
        if (!didDrag.current) fn();
        didDrag.current = false;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragStart={() => { didDrag.current = false; }}
                    onDragEnd={(_, info) => {
                        const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
                        if (dist > 10) didDrag.current = true;
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-20 right-4 z-50 w-[280px] rounded-2xl bg-[#130d24]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                >
                    {/* Progress bar */}
                    <div className="h-0.5 bg-white/5">
                        <div className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Main row */}
                    <div className="flex items-center gap-2.5 px-3 h-14">
                        {/* Cover */}
                        <button onClick={handleClick(() => navigate("/musica"))} className="flex-shrink-0 cursor-pointer">
                            {currentSong?.cover ? (
                                <img src={currentSong.cover} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                                    <IconMusic size={16} className="text-white/30" />
                                </div>
                            )}
                        </button>

                        {/* Info */}
                        <button onClick={handleClick(() => navigate("/musica"))} className="flex-1 min-w-0 text-left cursor-pointer">
                            <div className="text-xs font-medium text-white/90 truncate">{currentSong?.title || "Sin título"}</div>
                            <div className="text-[10px] text-white/40 truncate">{currentSong?.artist || "Desconocido"}</div>
                        </button>

                        {/* Controls */}
                        <div className="flex items-center gap-0.5">
                            <button onClick={handleClick(playPrev)} className="p-1.5 text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                                <IconPlayerTrackPrev size={14} />
                            </button>
                            <button onClick={handleClick(onTogglePlay)} className="p-1.5 bg-violet-500/20 rounded-full text-violet-400 hover:bg-violet-500/30 transition-colors cursor-pointer">
                                {isPlaying ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                            </button>
                            <button onClick={handleClick(playNext)} className="p-1.5 text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                                <IconPlayerTrackNext size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded — song list */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-white/5">
                                <div className="max-h-40 overflow-y-auto px-3 py-1.5 custom-scrollbar">
                                    {playlist.map((song, i) => (
                                        <button key={i} onClick={handleClick(() => usePlayerStore.getState().playSong(i))} className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${i === currentIndex ? "bg-violet-500/15 text-white" : "text-white/50 hover:bg-white/5"}`}>
                                            <span className="text-[10px] font-mono w-4 text-right text-white/20">{i + 1}</span>
                                            <div className="flex-1 truncate text-xs">{song.title}</div>
                                            {song.duration && <span className="text-[10px] text-white/20 font-mono">{formatTime(song.duration)}</span>}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom row: time + expand + close */}
                    <div className="flex items-center justify-between px-3 py-1 border-t border-white/5">
                        <span className="text-[10px] text-white/30 font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <div className="flex items-center gap-0.5">
                            <button onClick={handleClick(() => setExpanded(!expanded))} className="p-1 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                                {expanded ? <IconChevronDown size={12} /> : <IconChevronUp size={12} />}
                            </button>
                            <button onClick={handleClick(onClose)} className="p-1 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                                <IconX size={12} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
