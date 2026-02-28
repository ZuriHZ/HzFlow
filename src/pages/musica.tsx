import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconVolume,
} from "@tabler/icons-react";

const songs = [
    {
        title: "Set Fire To The Rain",
        artist: "Adele",
        src: "assets/Adele.mp3",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=256&q=80",
    },
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80",
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80",
    },
];

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const Musica = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentSong = songs[currentSongIndex];

    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [currentSongIndex]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handlePrev = () => {
        if (currentSongIndex > 0) {
            setCurrentSongIndex(currentSongIndex - 1);
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (currentSongIndex < songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
            setIsPlaying(true);
        }
    };

    const handleEnded = () => {
        if (currentSongIndex < songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
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
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
                        <IconVolume size={20} className="text-white" />
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
            </motion.div>

            {/* Now playing */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden p-8"
                style={{
                    background:
                        "linear-gradient(135deg, #1a1035 0%, #2d1b69 50%, #1a0a2e 100%)",
                }}
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
                        className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-violet-500/20"
                    >
                        <img
                            src={currentSong.cover}
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Song info */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white/90">
                            {currentSong.title}
                        </h2>
                        <p className="text-sm text-white/40">
                            {currentSong.artist}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-md flex items-center gap-3">
                        <span className="text-xs text-white/30 font-mono w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div className="relative flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
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
                            onClick={handlePrev}
                            disabled={currentSongIndex === 0}
                            className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <IconPlayerTrackPrev size={22} />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            className="p-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white 
                                hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200"
                        >
                            {isPlaying ? (
                                <IconPlayerPause size={28} />
                            ) : (
                                <IconPlayerPlay size={28} />
                            )}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentSongIndex === songs.length - 1}
                            className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 
                                transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <IconPlayerTrackNext size={22} />
                        </button>
                    </div>
                </div>

                {/* Ambient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />

                <audio
                    ref={audioRef}
                    src={currentSong.src}
                    onTimeUpdate={() =>
                        audioRef.current &&
                        setCurrentTime(audioRef.current.currentTime)
                    }
                    onLoadedMetadata={() =>
                        audioRef.current &&
                        setDuration(audioRef.current.duration)
                    }
                    onEnded={handleEnded}
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
                <div className="flex flex-col gap-1">
                    {songs.map((song, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setCurrentSongIndex(i);
                                setIsPlaying(true);
                            }}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                                ${
                                    i === currentSongIndex
                                        ? "bg-violet-500/15 text-white"
                                        : "text-white/50 hover:bg-white/5 hover:text-white/70"
                                }`}
                        >
                            <img
                                src={song.cover}
                                alt={song.title}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="text-left flex-1">
                                <div className="text-sm font-medium">
                                    {song.title}
                                </div>
                                <div className="text-xs text-white/30">
                                    {song.artist}
                                </div>
                            </div>
                            {i === currentSongIndex && isPlaying && (
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
        </div>
    );
};

export default Musica;
