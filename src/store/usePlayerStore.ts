import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Song {
    src: string;
    title: string;
    cover?: string; // Opcional por ahora, después podemos poner un cover por defecto
}

interface PlayerStore {
    // Estado
    playlist: Song[];
    currentIndex: number;
    isPlaying: boolean;
    volume: number;

    // Acciones
    setPlaylist: (songs: Song[]) => void;
    playSong: (index: number) => void;
    playNext: () => void;
    playPrev: () => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
    setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set) => ({
            playlist: [],
            currentIndex: 0,
            isPlaying: false,
            volume: 1, // Volumen va de 0.0 a 1.0

            // Reemplaza la cola entera y empieza a reproducir la primera
            setPlaylist: (songs) => set({ playlist: songs, currentIndex: 0, isPlaying: true }),

            // Salta a una canción específica de la lista
            playSong: (index) => set({ currentIndex: index, isPlaying: true }),

            // Siguiente canción (frena en la última si no hay más)
            playNext: () =>
                set((state) => {
                    if (state.currentIndex < state.playlist.length - 1) {
                        return { currentIndex: state.currentIndex + 1, isPlaying: true };
                    }
                    return state; // Ya está en la última
                }),

            // Canción anterior
            playPrev: () =>
                set((state) => ({
                    currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
                    isPlaying: true,
                })),

            // Play/Pause manual
            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

            // Sincronizar el estado de play cuando el audio termina/pausa por su cuenta
            setIsPlaying: (playing) => set({ isPlaying: playing }),

            // Control de volumen
            setVolume: (volume) => set({ volume }),
        }),
        {
            name: "mi-reproductor-storage", // Este es el nombre con el que se guarda en localStorage
            // partialize elige qué cosas SÍ se guardan en el disco duro.
            // ¡No ponemos isPlaying, así siempre arranca en false al abrir la app!
            partialize: (state) => ({
                playlist: state.playlist,
                currentIndex: state.currentIndex,
                volume: state.volume,
            }),
        },
    ),
);
