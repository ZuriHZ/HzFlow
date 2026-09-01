import React from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import MiniPlayer from "@/components/player/MiniPlayer";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function AudioManager() {
    const { audioRef, currentTime, duration, progress, handleTimeUpdate, handleLoadedMetadata } = useAudioPlayer();
    const { togglePlay, playlist } = usePlayerStore();

    if (playlist.length === 0) return null;

    return (
        <>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => usePlayerStore.getState().playNext()} onPlay={() => usePlayerStore.getState().setIsPlaying(true)} onPause={() => usePlayerStore.getState().setIsPlaying(false)} />
            <MiniPlayer currentTime={currentTime} duration={duration} progress={progress} onTogglePlay={togglePlay} />
        </>
    );
}
