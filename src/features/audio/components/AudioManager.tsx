import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAudioPlayer } from "@/features/audio/hooks/useAudioPlayer";
import MiniPlayer from "@/features/audio/components/MiniPlayer";
import MiniPlayerToggle from "@/features/audio/components/MiniPlayerToggle";
import { usePlayerStore } from "@/features/audio/store/usePlayerStore";

export default function AudioManager() {
    const location = useLocation();
    const { audioRef, currentTime, duration, progress, handleTimeUpdate, handleLoadedMetadata } = useAudioPlayer();
    const { togglePlay, playlist } = usePlayerStore();

    const isOnMusicPage = location.pathname === "/musica";

    // Estado para visibilidad del widget - se inicializa considerando la ruta actual
    const [isVisible, setIsVisible] = React.useState(() => {
        // Si estamos en /musica, inicia oculto
        if (isOnMusicPage) return false;
        // Si hay canciones, usa localStorage o muestra por defecto
        return localStorage.getItem("miniPlayerVisible") !== "false";
    });

    // Referencia para guardar la visibilidad previa (evita re-renders innecesarios)
    const previousVisibilityRef = useRef(true);

    // Efecto para manejar cambios de ruta
    useEffect(() => {
        if (isOnMusicPage) {
            // Estamos en /musica: guardar estado actual y ocultar widget
            previousVisibilityRef.current = isVisible;
            setIsVisible(false);
        } else {
            // No estamos en /musica: restaurar visibilidad previa solo si hay canciones
            if (playlist.length > 0) {
                setIsVisible(previousVisibilityRef.current);
            }
        }
    }, [isOnMusicPage, playlist.length]);

    // Efecto para persistir visibilidad en localStorage (solo fuera de /musica)
    useEffect(() => {
        if (!isOnMusicPage) {
            localStorage.setItem("miniPlayerVisible", String(isVisible));
        }
    }, [isVisible, isOnMusicPage]);

    const handleClose = () => {
        setIsVisible(false);
        previousVisibilityRef.current = false;
    };
    const handleToggle = () => {
        const newValue = !isVisible;
        setIsVisible(newValue);
        previousVisibilityRef.current = newValue;
    };

    // No renderizar nada si no hay canciones
    if (playlist.length === 0) return null;

    return (
        <>
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => usePlayerStore.getState().playNext()}
                onPlay={() => usePlayerStore.getState().setIsPlaying(true)}
                onPause={() => usePlayerStore.getState().setIsPlaying(false)}
            />
            <MiniPlayerToggle isVisible={isVisible} onToggle={handleToggle} />
            <MiniPlayer
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                onTogglePlay={togglePlay}
                isVisible={isVisible}
                onClose={handleClose}
            />
        </>
    );
}
