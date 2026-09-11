import { useState, useEffect, useCallback } from "react";

// ──────────────────────────────────────────────
// useUpdater Hook
// ──────────────────────────────────────────────
//
// Este hook gestiona el estado de la actualización
// en el renderer (React). Se comunica con el main
// process via el preload bridge.
//
// Estados posibles:
//   idle        → Sin actividad, esperando
//   checking    → Buscando actualizaciones en R2
//   available   → Nueva versión encontrada, lista para descargar
//   not-available → Ya estás en la última versión
//   downloading → Descargando la actualización
//   downloaded  → Descarga completa, lista para instalar
//   error       → Algo salió mal

type UpdaterState =
    | "idle"
    | "checking"
    | "available"
    | "not-available"
    | "downloading"
    | "downloaded"
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

export function useUpdater() {
    const [state, setState] = useState<UpdaterState>("idle");
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [progress, setProgress] = useState<DownloadProgress | null>(null);
    const [error, setError] = useState<UpdaterError | null>(null);

    // ── Acciones ──

    const checkForUpdates = useCallback(async () => {
        setState("checking");
        setError(null);
        setProgress(null);

        try {
            // Delay mínimo de 3s para que el usuario vea el spinner
            const result = await Promise.all([
                window.electronAPI.updater.checkForUpdates(),
                new Promise((resolve) => setTimeout(resolve, 3000)),
            ]).then(([res]) => res);

            if (result.state === "available") {
                setUpdateInfo(result.info);
                setState("available");
            } else if (result.state === "not-available") {
                setState("not-available");
            } else if (result.state === "error") {
                setError(result.error);
                setState("error");
            }
        } catch (err) {
            setError({
                code: "IPC_FAILED",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            setState("error");
        }
    }, []);

    const downloadUpdate = useCallback(async () => {
        setState("downloading");
        setProgress(null);
        setError(null);

        try {
            const result = await window.electronAPI.updater.downloadUpdate();

            if (result.ok) {
                // La descarga se completa, el estado se actualúa
                // por el evento on-downloaded del main process
            } else {
                setError(result.error);
                setState("error");
            }
        } catch (err) {
            setError({
                code: "IPC_FAILED",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            setState("error");
        }
    }, []);

    const quitAndInstall = useCallback(async () => {
        await window.electronAPI.updater.quitAndInstall();
    }, []);

    // ── Suscripción a eventos del main process ──

    useEffect(() => {
        const api = window.electronAPI.updater;
        if (!api) return;

        // Cuando el main empieza a buscar actualizaciones
        const unsubChecking = api.onChecking(() => {
            setState("checking");
        });

        // Cuando hay una versión nueva disponible
        const unsubAvailable = api.onAvailable((info: UpdateInfo) => {
            setUpdateInfo(info);
            setState("available");
        });

        // Cuando no hay actualización disponible
        const unsubNotAvailable = api.onNotAvailable(() => {
            setState("not-available");
        });

        // Progreso de la descarga (se emite repetidamente)
        const unsubProgress = api.onProgress((prog: DownloadProgress) => {
            setProgress(prog);
        });

        // Descarga completada, lista para instalar
        const unsubDownloaded = api.onDownloaded((info: UpdateInfo) => {
            setUpdateInfo(info);
            setState("downloaded");
            setProgress(null);
        });

        // Error en el proceso
        const unsubError = api.onError((err: UpdaterError) => {
            setError(err);
            setState("error");
        });

        // Cleanup: remover listeners cuando el componente se desmonta
        return () => {
            unsubChecking?.();
            unsubAvailable?.();
            unsubNotAvailable?.();
            unsubProgress?.();
            unsubDownloaded?.();
            unsubError?.();
        };
    }, []);

    return {
        state,
        updateInfo,
        progress,
        error,
        // Acciones
        checkForUpdates,
        downloadUpdate,
        quitAndInstall,
    };
}
