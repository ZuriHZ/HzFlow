import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlayerPlay, IconPlayerPause, IconPlayerTrackNext, IconPlayerTrackPrev, IconVolume, IconFolderPlus, IconMusic,     IconArrowsShuffle, IconRepeat, IconTrash, IconX } from "@tabler/icons-react";
import { usePlayerStore } from "../store/usePlayerStore";

const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const Musica = () => {
    const { playlist, currentIndex, isPlaying, volume, isShuffle, isRepeat, addSongs, playSong, playNext, playPrev, togglePlay, setIsPlaying, toggleShuffle, toggleRepeat, setVolume, removeSong, clearPlaylist } = usePlayerStore();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDraggingTime, setIsDraggingTime] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const seekTimeRef = useRef(0);
    const lastIndexRef = useRef<number | null>(null);
    const pendingSeekRef = useRef<number | null>(null);
    const blobUrlsRef = useRef<Map<string, string>>(new Map());

    // Crear Blob URL a partir del archivo local (soporta seek)
    const createBlobUrl = async (filePath: string): Promise<string | null> => {
        if (blobUrlsRef.current.has(filePath)) {
            return blobUrlsRef.current.get(filePath)!;
        }
        try {
            const buffer = await (window as any).electronAPI.getAudioData(filePath);
            if (!buffer) return null;
            const uint8 = new Uint8Array(buffer);
            const ext = filePath.split(".").pop()?.toLowerCase() || "mp3";
            const mime = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" }[ext] || "audio/mpeg";
            const blob = new Blob([uint8], { type: mime });
            const url = URL.createObjectURL(blob);
            blobUrlsRef.current.set(filePath, url);
            return url;
        } catch (error) {
            return null;
        }
    };

    // Limpiar Blob URLs cuando seelimina una canción
    const cleanupBlobUrl = (filePath: string) => {
        const url = blobUrlsRef.current.get(filePath);
        if (url) {
            URL.revokeObjectURL(url);
            blobUrlsRef.current.delete(filePath);
        }
    };

    // Escuchar mouseup/touchend en window para soltar el seek aunque el mouse salga del input
    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDraggingTime) {
                setIsDraggingTime(false);
                if (audioRef.current) {
                    const ready = audioRef.current.readyState;
                    const canSeek = ready >= 3;
                    if (canSeek) {
                        audioRef.current.currentTime = seekTimeRef.current;
                    } else {
                        pendingSeekRef.current = seekTimeRef.current;
                    }
                }
            }
        };
        window.addEventListener("mouseup", handleGlobalUp);
        window.addEventListener("touchend", handleGlobalUp);
        return () => {
            window.removeEventListener("mouseup", handleGlobalUp);
            window.removeEventListener("touchend", handleGlobalUp);
        };
    }, [isDraggingTime]);

    // Limpiar todas las Blob URLs al desmontar
    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            blobUrlsRef.current.clear();
        };
    }, []);

    const currentSong = playlist[currentIndex];

    // Sincronizar el audio element con el estado global (usando Blob URLs)
    useEffect(() => {
        if (!audioRef.current || !currentSong) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                setCurrentTime(0);
                setDuration(0);
            }
            lastIndexRef.current = null;
            return;
        }

        audioRef.current.volume = volume;

        const songChanged = lastIndexRef.current !== currentIndex;

        if (songChanged) {
            lastIndexRef.current = currentIndex;
            setCurrentTime(0);
            createBlobUrl(currentSong.filePath).then((blobUrl) => {
                if (blobUrl && audioRef.current) {
                    audioRef.current.src = blobUrl;
                    audioRef.current.load();
                }
            });
        } else {
            if (isPlaying && audioRef.current.paused) {
                audioRef.current.play().catch(console.error);
            } else if (!isPlaying && !audioRef.current.paused) {
                audioRef.current.pause();
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
                addSongs(files);
            }
        } catch (error) {
            console.error("Error al seleccionar archivos:", error);
        }
    };

    // NUEVO: Manejar cuando soltamos archivos en la ventana
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        // Electron inyecta una propiedad 'path' en los File objects
        const files = Array.from(e.dataTransfer.files);
        const paths = files.map((f: any) => f.path).filter(Boolean);
        if (paths.length > 0) {
            try {
                const newSongs = await (window as any).electronAPI.processDroppedFiles(paths);
                if (newSongs && newSongs.length > 0) {
                    addSongs(newSongs);
                }
            } catch (error) {
                console.error("Error al procesar archivos soltados:", error);
            }
        }
    };

    const handleRemoveSong = (index: number) => {
        const song = playlist[index];
        if (song) cleanupBlobUrl(song.filePath);
        removeSong(index);
    };

    const handleClearPlaylist = () => {
        playlist.forEach((song) => cleanupBlobUrl(song.filePath));
        clearPlaylist();
    };

    const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            className={`max-w-4xl mx-auto w-full space-y-6 transition-colors duration-300 rounded-2xl p-4
                ${isDraggingOver ? "bg-violet-500/10 border-2 border-dashed border-violet-500" : "border-2 border-transparent"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
        >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-400">
                        <IconMusic size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">Música</h1>
                        <p className="text-sm text-white/40">Tu reproductor personal</p>
                    </div>
                </div>

                <button onClick={handleSelectFiles} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    <IconFolderPlus size={18} />
                    <span className="text-sm font-medium">Abrir música</span>
                </button>
                {playlist.length > 0 && (
                    <button onClick={handleClearPlaylist} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                        <IconTrash size={18} />
                        <span className="text-sm font-medium">Limpiar</span>
                    </button>
                )}
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-hero-surface relative overflow-hidden rounded-2xl p-8">
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
                                {currentSong?.cover ? <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" /> : <IconMusic size={64} className="text-white/20" />}
                            </motion.div>

                            {/* Song info */}
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white/90 truncate max-w-sm">{currentSong?.title}</h2>
                                <p className="text-sm text-white/40">Desconocido</p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full max-w-md flex items-center gap-3">
                                <span className="text-xs text-white/30 font-mono w-10 text-right">{formatTime(currentTime)}</span>
                                <div className="relative flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onInput={(e) => {
                                            const val = Number((e.target as HTMLInputElement).value);
                                            setCurrentTime(val);
                                            seekTimeRef.current = val;
                                        }}
                                        onMouseDown={() => setIsDraggingTime(true)}
                                        onTouchStart={() => setIsDraggingTime(true)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-xs text-white/30 font-mono w-10">{formatTime(duration)}</span>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={toggleShuffle}
                                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                                        isShuffle ? "text-violet-400 bg-violet-400/10" : "text-white/30 hover:text-white/60"
                                    }`}
                                >
                                    <IconArrowsShuffle size={20} />
                                </button>
                                <button
                                    onClick={playPrev}
                                    disabled={currentIndex === 0}
                                    className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                        transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <IconPlayerTrackPrev size={22} />
                                </button>
                                <button onClick={togglePlay} className="rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 p-4 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 cursor-pointer">
                                    {isPlaying ? <IconPlayerPause size={28} /> : <IconPlayerPlay size={28} />}
                                </button>
                                <button
                                    onClick={playNext}
                                    disabled={currentIndex === playlist.length - 1}
                                    className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                        transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <IconPlayerTrackNext size={22} />
                                </button>
                                <button
                                    onClick={toggleRepeat}
                                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                                        isRepeat ? "text-violet-400 bg-violet-400/10" : "text-white/30 hover:text-white/60"
                                    }`}
                                >
                                    <IconRepeat size={20} />
                                </button>
                            </div>

                            {/* Volume Control */}
                            <div className="absolute bottom-8 right-8 flex items-center gap-2 group">
                                <IconVolume size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute inset-y-0 left-0 bg-white/70 rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
                                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        {/* Ambient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />

                        <audio
                            ref={audioRef}
                            onTimeUpdate={() => {
                                if (audioRef.current && !isDraggingTime) {
                                    const t = audioRef.current.currentTime;
                                    if (isFinite(t) && !isNaN(t)) {
                                        setCurrentTime(t);
                                    }
                                }
                            }}
                            onLoadedMetadata={() => {
                                if (audioRef.current) {
                                    const d = audioRef.current.duration;
                                    setDuration(isFinite(d) && !isNaN(d) ? d : 0);
                                    if (pendingSeekRef.current !== null) {
                                        audioRef.current.currentTime = pendingSeekRef.current;
                                        pendingSeekRef.current = null;
                                    }
                                    if (isPlaying) {
                                        audioRef.current.play().catch(console.error);
                                    }
                                }
                            }}
                            onEnded={playNext}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    </motion.div>

                    {/* Playlist */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                        <h3 className="text-sm font-semibold text-white/50 px-1">Lista de reproducción</h3>
                        <div className="flex flex-col gap-1 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                            {playlist.map((song, i) => (
                                <button
                                    key={i}
                                    onClick={() => playSong(i)}
                                    className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
                                        ${i === currentIndex ? "bg-violet-500/15 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"}`}
                                >
                                    {song.cover ? (
                                        <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <IconMusic size={16} className="text-white/30" />
                                        </div>
                                    )}
                                    <div className="text-left flex-1 truncate">
                                        <div className="text-sm font-medium truncate">{song.title}</div>
                                        <div className="text-xs text-white/30">Desconocido</div>
                                    </div>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => { e.stopPropagation(); handleRemoveSong(i); }}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); handleRemoveSong(i); } }}
                                        className="p-1 rounded-full text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                    >
                                        <IconX size={14} />
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
