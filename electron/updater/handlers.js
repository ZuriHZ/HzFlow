const { autoUpdater } = require("./config");
const { BrowserWindow, app } = require("electron");
const path = require("path");

// ──────────────────────────────────────────────
// Eventos de autoUpdater → IPC al renderer
// ──────────────────────────────────────────────
//
// electron-updater emite eventos que necesitamos
// reenviar al renderer process para que la UI
// pueda mostrar el estado de la actualización.
//
// Flujo de eventos:
//   checking-for-update → searching for updates in R2
//   update-available    → new version found, ready to download
//   update-not-available → already on latest version
//   download-progress   → downloading (emitted repeatedly)
//   update-downloaded   → download complete, ready to install
//   error               → something went wrong

function sendToRenderer(channel, data) {
    // Envía el evento a TODAS las ventanas abiertas
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((win) => {
        if (!win.isDestroyed()) {
            win.webContents.send(channel, data);
        }
    });
}

function setupUpdaterHandlers() {
    // ── checking-for-update ──
    // Se emite cuando autoUpdater.start() o checkForUpdates() se llama
    autoUpdater.on("checking-for-update", () => {
        console.log("[Updater] Checking for updates...");
        sendToRenderer("updater:on-checking");
    });

    // ── update-available ──
    // Se emite cuando hay una versión nueva en R2
    autoUpdater.on("update-available", (info) => {
        console.log("[Updater] Update available:", info.version);
        // Enviamos solo la info segura (sin paths internos)
        sendToRenderer("updater:on-available", {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes,
        });
    });

    // ── update-not-available ──
    // Se emite cuando la versión local es igual o mayor a la de R2
    autoUpdater.on("update-not-available", (info) => {
        console.log("[Updater] No update available. Current version:", info.version);
        sendToRenderer("updater:on-not-available");
    });

    // ── download-progress ──
    // Se emite repetidamente durante la descarga
    autoUpdater.on("download-progress", (progress) => {
        sendToRenderer("updater:on-progress", {
            percent: Math.round(progress.percent),
            bytesPerSecond: progress.bytesPerSecond,
            total: progress.total,
            transferred: progress.transferred,
        });
    });

    // ── update-downloaded ──
    // Se emite cuando la descarga terminó y el instalador está listo
    autoUpdater.on("update-downloaded", (info) => {
        console.log("[Updater] Update downloaded:", info.version);
        sendToRenderer("updater:on-downloaded", {
            version: info.version,
            releaseDate: info.releaseDate,
        });
    });

    // ── error ──
    // Se emite si hay cualquier error (red, R2, hash, etc.)
    autoUpdater.on("error", (error) => {
        console.error("[Updater] Error:", error.message);
        sendToRenderer("updater:on-error", {
            code: error.code || "UNKNOWN",
            message: error.message,
        });
    });

    console.log("[Updater] Handlers registered");
}

module.exports = { setupUpdaterHandlers };
