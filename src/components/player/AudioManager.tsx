import React from "react";
import { useLocation } from "react-router-dom";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import MiniPlayer from "@/components/player/MiniPlayer";
import MiniPlayerToggle from "@/components/player/MiniPlayerToggle";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function AudioManager() {
    const location = useLocation();
    const { audioRef, currentTime, duration, progress, handleTimeUpdate, handleLoadedMetadata } = useAudioPlayer();
    const { togglePlay, playlist } = usePlayerStore();

    const isOnMusicPage = location.pathname === "/musica";

    const [isVisible, setIsVisible] = React.useState(() => {
        if (isOnMusicPage) return false;
        return localStorage.getItem("miniPlayerVisible") !== "false";
    });

    const [previousVisibility, setPreviousVisibility] = React.useState(true);

    React.useEffect(() => {
        if (isOnMusicPage) {
            setPreviousVisibility(isVisible);
            setIsVisible(false);
        } else if (playlist.length > 0) {
            setIsVisible(previousVisibility);
        }
    }, [isOnMusicPage]);

    React.useEffect(() => {
        if (!isOnMusicPage) {
            localStorage.setItem("miniPlayerVisible", String(isVisible));
        }
    }, [isVisible, isOnMusicPage]);

    const handleClose = () => setIsVisible(false);
    const handleToggle = () => setIsVisible((v) => !v);

    if (playlist.length === 0) return null;

    return (
        <>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => usePlayerStore.getState().playNext()} onPlay={() => usePlayerStore.getState().setIsPlaying(true)} onPause={() => usePlayerStore.getState().setIsPlaying(false)} />
            <MiniPlayerToggle isVisible={isVisible} onToggle={handleToggle} />
            <MiniPlayer currentTime={currentTime} duration={duration} progress={progress} onTogglePlay={togglePlay} isVisible={isVisible} onClose={handleClose} />
        </>
    );
}
