import { useState, useEffect, useCallback, useRef } from "react";

// ──────────────────────────────────────────────
// useUpdater Hook
// ──────────────────────────────────────────────
//
// Gestiona el estado de la actualización en el renderer.
//
// Dos fuentes de verdad:
//   1. Auto-check (main process, cada 3s) → eventos on*
//   2. Manual check (usuario hace click) → resultado IPC
//
// Regla: cuando el usuario hace click en "Buscar",
// se ignora el auto-check hasta que el IPC responda.
// Esto evita race conditions y flicker de estado.

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

export function useUpdater() {
    const [state, setState] = useState<UpdaterState>("idle");
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [progress, setProgress] = useState<DownloadProgress | null>(null);
    const [error, setError] = useState<UpdaterError | null>(null);

    // Ref para evitar que auto-check events sobreescriban
    // el resultado de un manual check en progreso
    const manualCheckActive = useRef(false);

    // ── Acciones ──

    const checkForUpdates = useCallback(async () => {
        manualCheckActive.current = true;
        setState("checking");
        setError(null);
        setProgress(null);

        try {
            const result = await window.electronAPI.updater.checkForUpdates();

            if (result.state === "available") {
                setUpdateInfo(result.info);
                setState("available");
            } else if (result.state === "not-available") {
                setUpdateInfo(null);
                setState("not-available");
            } else if (result.state === "error" && result.error) {
                setUpdateInfo(null);
                setError(result.error);
                setState("error");
            }
        } catch (err) {
            setError({
                code: "IPC_FAILED",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            setState("error");
        } finally {
            manualCheckActive.current = false;
        }
    }, []);

    const downloadUpdate = useCallback(async () => {
        if (state !== "available") return;

        setState("downloading");
        setProgress(null);
        setError(null);

        try {
            const result = await window.electronAPI.updater.downloadUpdate();

            if (!result.ok && result.error) {
                setError(result.error);
                setState("error");
            }
            // Si ok, el estado se actualiza por el evento on-downloaded
        } catch (err) {
            setError({
                code: "IPC_FAILED",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            setState("error");
        }
    }, [state]);

    const quitAndInstall = useCallback(async () => {
        setState("installing");
        try {
            await window.electronAPI.updater.quitAndInstall();
        } catch (err) {
            setError({
                code: "IPC_FAILED",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            setState("error");
        }
    }, []);

    // ── Suscripción a eventos del main process (auto-check) ──

    useEffect(() => {
        const api = window.electronAPI?.updater;
        if (!api) return;

        const unsubs: (() => void)[] = [];

        unsubs.push(
            api.onChecking(() => {
                if (manualCheckActive.current) return;
                setState("checking");
            }) ?? (() => {})
        );

        unsubs.push(
            api.onAvailable((info: UpdateInfo) => {
                if (manualCheckActive.current) return;
                setUpdateInfo(info);
                setState("available");
            }) ?? (() => {})
        );

        unsubs.push(
            api.onNotAvailable(() => {
                if (manualCheckActive.current) return;
                setUpdateInfo(null);
                setState("not-available");
            }) ?? (() => {})
        );

        unsubs.push(
            api.onProgress((prog: DownloadProgress) => {
                setProgress(prog);
            }) ?? (() => {})
        );

        unsubs.push(
            api.onDownloaded((info: UpdateInfo) => {
                setUpdateInfo(info);
                setState("downloaded");
                setProgress(null);
            }) ?? (() => {})
        );

        unsubs.push(
            api.onError((err: UpdaterError) => {
                setUpdateInfo(null);
                setError(err);
                setState("error");
            }) ?? (() => {})
        );

        return () => {
            unsubs.forEach((fn) => fn());
        };
    }, []);

    return {
        state,
        updateInfo,
        progress,
        error,
        checkForUpdates,
        downloadUpdate,
        quitAndInstall,
    };
}
