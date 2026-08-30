import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconVolume,
    IconFolderPlus,
    IconMusic,
} from "@tabler/icons-react";
import { usePlayerStore } from "../store/usePlayerStore";

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const Musica = () => {
    const {
        playlist,
        currentIndex,
        isPlaying,
        volume,
        setPlaylist,
        playSong,
        playNext,
        playPrev,
        togglePlay,
        setIsPlaying,
        setVolume,
    } = usePlayerStore();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentSong = playlist[currentIndex];

    // Sincronizar el audio element con el estado global
    useEffect(() => {
        if (audioRef.current && currentSong) {
            audioRef.current.volume = volume;
            
            // Si cambió la canción (el src del audio), tenemos que recargarla
            if (audioRef.current.src !== currentSong.src) {
                audioRef.current.src = currentSong.src;
                audioRef.current.load();
                setCurrentTime(0);
                if (isPlaying) {
                    audioRef.current.play().catch(console.error);
                }
            } else {
                // Si es la misma canción pero cambió el isPlaying global
                if (isPlaying && audioRef.current.paused) {
                    audioRef.current.play().catch(console.error);
                } else if (!isPlaying && !audioRef.current.paused) {
                    audioRef.current.pause();
                }
            }
        }
    }, [currentIndex, isPlaying, currentSong]);

    // Sincronizar volumen en tiempo real
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleSelectFiles = async () => {
        try {
            const files = await (window as any).electronAPI.selectMusicFiles();
            if (files && files.length > 0) {
                // Si querés agregar a la cola sin borrar lo anterior, podrías hacer setPlaylist([...playlist, ...files])
                // Por ahora reemplazamos la lista.
                setPlaylist(files);
            }
        } catch (error) {
            console.error("Error al seleccionar archivos:", error);
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-400">
                        <IconMusic size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Música
                        </h1>
                        <p className="text-sm text-white/40">
                            Tu reproductor personal
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSelectFiles}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                    <IconFolderPlus size={18} />
                    <span className="text-sm font-medium">Abrir música</span>
                </button>
            </motion.div>

            {playlist.length === 0 ? (
                <div className="bg-hero-surface flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5">
                    <IconMusic size={48} className="text-white/20 mb-4" />
                    <p className="text-white/50 text-lg">No hay canciones en la lista</p>
                    <p className="text-white/30 text-sm mt-1">Hacé clic en "Abrir música" para empezar</p>
                </div>
            ) : (
                <>
                    {/* Now playing */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-hero-surface relative overflow-hidden rounded-2xl p-8"
                    >
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            {/* Album art */}
                            <motion.div
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-violet-500/20 bg-violet-900/50 flex items-center justify-center"
                            >
                                {currentSong?.cover ? (
                                    <img
                                        src={currentSong.cover}
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <IconMusic size={64} className="text-white/20" />
                                )}
                            </motion.div>

                            {/* Song info */}
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white/90 truncate max-w-sm">
                                    {currentSong?.title}
                                </h2>
                                <p className="text-sm text-white/40">
                                    Desconocido
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full max-w-md flex items-center gap-3">
                                <span className="text-xs text-white/30 font-mono w-10 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="relative flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-xs text-white/30 font-mono w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={playPrev}
                                    disabled={currentIndex === 0}
                                    className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                        transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <IconPlayerTrackPrev size={22} />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 p-4 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 cursor-pointer"
                                >
                                    {isPlaying ? (
                                        <IconPlayerPause size={28} />
                                    ) : (
                                        <IconPlayerPlay size={28} />
                                    )}
                                </button>
                                <button
                                    onClick={playNext}
                                    disabled={currentIndex === playlist.length - 1}
                                    className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                        transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <IconPlayerTrackNext size={22} />
                                </button>
                            </div>
                            
                            {/* Volume Control */}
                            <div className="absolute bottom-8 right-8 flex items-center gap-2 group">
                                <IconVolume size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-white/70 rounded-full pointer-events-none"
                                        style={{ width: `${volume * 100}%` }}
                                    />
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.01" 
                                        value={volume}
                                        onChange={(e) => setVolume(Number(e.target.value))}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ambient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />

                        <audio
                            ref={audioRef}
                            onTimeUpdate={() =>
                                audioRef.current &&
                                setCurrentTime(audioRef.current.currentTime)
                            }
                            onLoadedMetadata={() =>
                                audioRef.current &&
                                setDuration(audioRef.current.duration)
                            }
                            onEnded={playNext}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    </motion.div>

                    {/* Playlist */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <h3 className="text-sm font-semibold text-white/50 px-1">
                            Lista de reproducción
                        </h3>
                        <div className="flex flex-col gap-1 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                            {playlist.map((song, i) => (
                                <button
                                    key={i}
                                    onClick={() => playSong(i)}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
                                        ${
                                            i === currentIndex
                                                ? "bg-violet-500/15 text-white"
                                                : "text-white/50 hover:bg-white/5 hover:text-white/70"
                                        }`}
                                >
                                    {song.cover ? (
                                        <img
                                            src={song.cover}
                                            alt={song.title}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <IconMusic size={16} className="text-white/30" />
                                        </div>
                                    )}
                                    <div className="text-left flex-1 truncate">
                                        <div className="text-sm font-medium truncate">
                                            {song.title}
                                        </div>
                                        <div className="text-xs text-white/30">
                                            Desconocido
                                        </div>
                                    </div>
                                    {i === currentIndex && isPlaying && (
                                        <div className="flex gap-0.5 items-end h-4">
                                            {[1, 2, 3].map((bar) => (
                                                <motion.div
                                                    key={bar}
                                                    animate={{
                                                        height: ["40%", "100%", "40%"],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        delay: bar * 0.15,
                                                    }}
                                                    className="w-0.5 bg-violet-400 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Musica;
