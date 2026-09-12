import { create } from "zustand";

// ──────────────────────────────────────────────
// useUpdaterStore
// ──────────────────────────────────────────────
//
// Store global para el estado del auto-updater.
// Se inicializa una vez y vive durante toda la app.
// Reemplaza el hook local useUpdater en config.tsx.

type UpdaterState =
    | "idle"
    | "checking"
    | "available"
    | "not-available"
    | "downloading"
    | "downloaded"
    | "installing"
    | "error";

interface UpdateInfo {
    version: string;
    releaseDate?: string;
    releaseNotes?: string;
}

interface DownloadProgress {
    percent: number;
    bytesPerSecond: number;
    total: number;
    transferred: number;
}

interface UpdaterError {
    code: string;
    message: string;
}

interface UpdaterStore {
    // State
    state: UpdaterState;
    updateInfo: UpdateInfo | null;
    progress: DownloadProgress | null;
    error: UpdaterError | null;
    listenersInitialized: boolean;

    // Actions
    checkForUpdates: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    quitAndInstall: () => Promise<void>;
    initListeners: () => void;
    reset: () => void;
}

export const useUpdaterStore = create<UpdaterStore>((set, get) => ({
    state: "idle",
    updateInfo: null,
    progress: null,
    error: null,
    listenersInitialized: false,

    checkForUpdates: async () => {
        const api = window.electronAPI?.updater;
        if (!api) return;

        set({ state: "checking", error: null, progress: null });

        try {
            const result = await api.checkForUpdates();

            if (result.state === "available") {
                set({ updateInfo: result.info, state: "available" });
            } else if (result.state === "not-available") {
                set({ updateInfo: null, state: "not-available" });
            } else if (result.state === "error" && result.error) {
                set({ updateInfo: null, error: result.error, state: "error" });
            }
        } catch (err) {
            set({
                error: {
                    code: "IPC_FAILED",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
                state: "error",
            });
        }
    },

    downloadUpdate: async () => {
        const api = window.electronAPI?.updater;
        if (!api || get().state !== "available") return;

        set({ state: "downloading", progress: null, error: null });

        try {
            const result = await api.downloadUpdate();
            if (!result.ok && result.error) {
                set({ error: result.error, state: "error" });
            }
        } catch (err) {
            set({
                error: {
                    code: "IPC_FAILED",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
                state: "error",
            });
        }
    },

    quitAndInstall: async () => {
        const api = window.electronAPI?.updater;
        if (!api) return;

        set({ state: "installing" });
        try {
            await api.quitAndInstall();
        } catch (err) {
            set({
                error: {
                    code: "IPC_FAILED",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
                state: "error",
            });
        }
    },

    initListeners: () => {
        const api = window.electronAPI?.updater;
        if (!api || get().listenersInitialized) return;

        api.onChecking(() => {
            // Solo actualizar si no hay un manual check activo
            const current = get().state;
            if (current === "idle" || current === "not-available" || current === "error") {
                set({ state: "checking" });
            }
        });

        api.onAvailable((info: UpdateInfo) => {
            set({ updateInfo: info, state: "available" });
        });

        api.onNotAvailable(() => {
            const current = get().state;
            // No sobreescribir si estamos en downloading/downloaded/installing
            if (current !== "downloading" && current !== "downloaded" && current !== "installing") {
                set({ updateInfo: null, state: "not-available" });
            }
        });

        api.onProgress((prog: DownloadProgress) => {
            set({ progress: prog });
        });

        api.onDownloaded((info: UpdateInfo) => {
            set({ updateInfo: info, state: "downloaded", progress: null });
        });

        api.onError((err: UpdaterError) => {
            set({ updateInfo: null, error: err, state: "error" });
        });

        set({ listenersInitialized: true });
    },

    reset: () => {
        set({
            state: "idle",
            updateInfo: null,
            progress: null,
            error: null,
        });
    },
}));
