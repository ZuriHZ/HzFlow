import { useRef, useState, useEffect, useCallback } from "react";
import { usePlayerStore } from "@/features/audio/store/usePlayerStore";

export function useAudioPlayer() {
    const { playlist, currentIndex, isPlaying, volume, playNext, setIsPlaying, setVolume } = usePlayerStore();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDraggingTime, setIsDraggingTime] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const seekTimeRef = useRef(0);
    const lastIndexRef = useRef<number | null>(null);
    const pendingSeekRef = useRef<number | null>(null);
    const blobUrlsRef = useRef<Map<string, string>>(new Map());
    const loadIdRef = useRef(0);
    const isPlayRequestedRef = useRef(false);

    const currentSong = playlist[currentIndex];

    // Crear Blob URL
    const createBlobUrl = async (filePath: string) => {
        if (blobUrlsRef.current.has(filePath)) {
            return { blobUrl: blobUrlsRef.current.get(filePath)!, metadata: { title: playlist.find((s) => s.filePath === filePath)?.title || "" } };
        }
        try {
            const result = await window.electronAPI.getAudioData(filePath);
            if (!result || !result.buffer) return null;
            const uint8 = new Uint8Array(result.buffer);
            const ext = filePath.split(".").pop()?.toLowerCase() || "mp3";
            const mime = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" }[ext] || "audio/mpeg";
            const blob = new Blob([uint8], { type: mime });
            const url = URL.createObjectURL(blob);
            blobUrlsRef.current.set(filePath, url);
            return { blobUrl: url, metadata: result.metadata };
        } catch {
            return null;
        }
    };

    const cleanupBlobUrl = useCallback((filePath: string) => {
        const url = blobUrlsRef.current.get(filePath);
        if (url) {
            URL.revokeObjectURL(url);
            blobUrlsRef.current.delete(filePath);
        }
    }, []);

    // Sync audio element
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
            isPlayRequestedRef.current = isPlaying;
            const currentLoadId = ++loadIdRef.current;
            createBlobUrl(currentSong.filePath).then((result) => {
                if (currentLoadId !== loadIdRef.current) return;
                if (result && audioRef.current) {
                    audioRef.current.src = result.blobUrl;
                    audioRef.current.load();
                    if (result.metadata) usePlayerStore.getState().updateSongMetadata(currentIndex, result.metadata);
                }
            });
        } else {
            if (isPlaying && audioRef.current.paused) {
                isPlayRequestedRef.current = true;
                audioRef.current.play().catch(() => {});
            } else if (!isPlaying && !audioRef.current.paused) {
                audioRef.current.pause();
            }
        }
    }, [currentIndex, isPlaying, currentSong]);

    // Volume
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    // Drag release
    useEffect(() => {
        const up = () => {
            if (isDraggingTime) {
                setIsDraggingTime(false);
                if (audioRef.current) {
                    if (audioRef.current.readyState >= 3) audioRef.current.currentTime = seekTimeRef.current;
                    else pendingSeekRef.current = seekTimeRef.current;
                }
            }
        };
        window.addEventListener("mouseup", up);
        window.addEventListener("touchend", up);
        return () => {
            window.removeEventListener("mouseup", up);
            window.removeEventListener("touchend", up);
        };
    }, [isDraggingTime]);

    // Cleanup
    useEffect(
        () => () => {
            blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
            blobUrlsRef.current.clear();
        },
        [],
    );

    // MediaSession
    useEffect(() => {
        if (!("mediaSession" in navigator) || !currentSong) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist || "Desconocido",
            album: currentSong.album || "",
            artwork: currentSong.cover ? [{ src: currentSong.cover, sizes: "512x512", type: "image/jpeg" }] : [],
        });
        navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler("previoustrack", () => usePlayerStore.getState().playPrev());
        navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
        navigator.mediaSession.setActionHandler("seekbackward", (d) => {
            if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - (d.seekOffset || 10));
        });
        navigator.mediaSession.setActionHandler("seekforward", (d) => {
            if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + (d.seekOffset || 10));
        });
        navigator.mediaSession.setActionHandler("seekto", (d) => {
            if (d.seekTime != null && audioRef.current) audioRef.current.currentTime = d.seekTime;
        });
        if (isPlaying && audioRef.current) {
            const id = setInterval(() => {
                if (audioRef.current) navigator.mediaSession.setPositionState({ duration: duration || 0, playbackRate: audioRef.current.playbackRate, position: audioRef.current.currentTime || 0 });
            }, 1000);
            return () => clearInterval(id);
        }
    }, [currentIndex, isPlaying, duration, currentSong]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    usePlayerStore.getState().togglePlay();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(Math.min(1, usePlayerStore.getState().volume + 0.05));
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(Math.max(0, usePlayerStore.getState().volume - 0.05));
                    break;
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [duration]);

    const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

    const handleTimeInput = useCallback((val: number) => {
        setCurrentTime(val);
        seekTimeRef.current = val;
    }, []);

    const handleSeekCommit = useCallback(() => {
        if (audioRef.current) {
            if (audioRef.current.readyState >= 3) audioRef.current.currentTime = seekTimeRef.current;
            else pendingSeekRef.current = seekTimeRef.current;
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current && !isDraggingTime) {
            const t = audioRef.current.currentTime;
            if (isFinite(t) && !isNaN(t)) setCurrentTime(t);
        }
    }, [isDraggingTime]);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            const d = audioRef.current.duration;
            setDuration(isFinite(d) && !isNaN(d) ? d : 0);
            if (pendingSeekRef.current !== null) {
                audioRef.current.currentTime = pendingSeekRef.current;
                pendingSeekRef.current = null;
            }
            if (isPlayRequestedRef.current || usePlayerStore.getState().isPlaying) {
                audioRef.current.play().catch(() => {});
                isPlayRequestedRef.current = false;
            }
        }
    }, []);

    return {
        audioRef,
        currentTime,
        duration,
        progress,
        isDraggingTime,
        setIsDraggingTime,
        currentSong,
        handleTimeInput,
        handleSeekCommit,
        handleTimeUpdate,
        handleLoadedMetadata,
        cleanupBlobUrl,
    };
}
