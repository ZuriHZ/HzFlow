import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Song {
    src: string;
    filePath: string;
    title: string;
    artist?: string;
    album?: string;
    cover?: string;
    duration?: number;
}

interface PlayerStore {
    playlist: Song[];
    currentIndex: number;
    isPlaying: boolean;
    volume: number;
    isShuffle: boolean;
    isRepeat: boolean;

    addSongs: (songs: Song[]) => void;
    removeSong: (index: number) => void;
    clearPlaylist: () => void;
    playSong: (index: number) => void;
    playNext: () => void;
    playPrev: () => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
    setVolume: (volume: number) => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    updateSongMetadata: (index: number, metadata: { title?: string; artist?: string; album?: string; cover?: string; duration?: number }) => void;
}

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set) => ({
            playlist: [],
            currentIndex: 0,
            isPlaying: false,
            volume: 1,
            isShuffle: false,
            isRepeat: false,

            // Agrega canciones al final de la cola
            addSongs: (newSongs) =>
                set((state) => {
                    const updatedPlaylist = [...state.playlist, ...newSongs];
                    if (state.playlist.length === 0 && newSongs.length > 0) {
                        return { playlist: updatedPlaylist, currentIndex: 0, isPlaying: true };
                    }
                    return { playlist: updatedPlaylist };
                }),

            removeSong: (index) =>
                set((state) => {
                    const newPlaylist = state.playlist.filter((_, i) => i !== index);
                    let newIndex = state.currentIndex;
                    if (newPlaylist.length === 0) {
                        return { playlist: [], currentIndex: 0, isPlaying: false };
                    }
                    if (index < state.currentIndex) {
                        newIndex = state.currentIndex - 1;
                    } else if (index === state.currentIndex && state.currentIndex >= newPlaylist.length) {
                        newIndex = newPlaylist.length - 1;
                    }
                    return { playlist: newPlaylist, currentIndex: newIndex };
                }),

            clearPlaylist: () => set({ playlist: [], currentIndex: 0, isPlaying: false }),

            playSong: (index) => set({ currentIndex: index, isPlaying: true }),

            // Lógica actualizada para Siguiente canción
            playNext: () =>
                set((state) => {
                    if (state.playlist.length === 0) return state;

                    if (state.isShuffle) {
                        // Elegir una al azar que no sea la actual (si hay más de 1)
                        if (state.playlist.length === 1) return { currentIndex: 0, isPlaying: true };
                        let nextIndex;
                        do {
                            nextIndex = Math.floor(Math.random() * state.playlist.length);
                        } while (nextIndex === state.currentIndex);
                        return { currentIndex: nextIndex, isPlaying: true };
                    }

                    if (state.currentIndex < state.playlist.length - 1) {
                        return { currentIndex: state.currentIndex + 1, isPlaying: true };
                    } else if (state.isRepeat) {
                        // Si llegamos al final y repeat está activo, volvemos a la 0
                        return { currentIndex: 0, isPlaying: true };
                    }

                    return state;
                }),

            playPrev: () =>
                set((state) => ({
                    currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
                    isPlaying: true,
                })),

            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
            setIsPlaying: (playing) => set({ isPlaying: playing }),
            setVolume: (volume) => set({ volume }),
            toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
            toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

            updateSongMetadata: (index, metadata) =>
                set((state) => {
                    const newPlaylist = [...state.playlist];
                    if (newPlaylist[index]) {
                        newPlaylist[index] = { ...newPlaylist[index], ...metadata };
                    }
                    return { playlist: newPlaylist };
                }),
        }),
        {
            name: "mi-reproductor-storage",
            partialize: (state) => ({
                playlist: state.playlist,
                currentIndex: state.currentIndex,
                volume: state.volume,
                isShuffle: state.isShuffle, // Guardamos la preferencia
                isRepeat: state.isRepeat, // Guardamos la preferencia
            }),
        },
    ),
);
