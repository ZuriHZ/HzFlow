const { ipcMain, app, BrowserWindow } = require("electron");
const { autoUpdater } = require("../updater/config");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Comparación semver: retorna true si a > b
function semverGreaterThan(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) > (pb[i] || 0)) return true;
        if ((pa[i] || 0) < (pb[i] || 0)) return false;
    }
    return false;
}

// ──────────────────────────────────────────────
// IPC Handlers para el updater
// ──────────────────────────────────────────────
//
// Estos handlers permiten que el renderer (React)
// controle el proceso de actualización sin acceder
// directamente a electron-updater (que es del main).
//
// Canal: updater:check-for-update
//   → Inicia un chequeo de actualizaciones
//   → Retorna { state, info? }
//
// Canal: updater:download-update
//   → Inicia la descarga de la actualización
//   → El progreso se envía via eventos on*
//
// Canal: updater:quit-and-install
//   → Spawn NSIS manualmente con --force-run
//   → Cierra la app para que NSIS pueda reemplazar archivos
//   → NSIS relanza la app automáticamente después de instalar

function setupUpdaterIpc() {
    // ── app:get-version ──
    ipcMain.handle("app:get-version", () => app.getVersion());

    // ── check-for-update ──
    //
    // electron-updater.checkForUpdates() SIEMPRE retorna updateInfo
    // poblado cuando puede leer latest.yml, sin importar si la versión
    // es igual. La comparación la hacemos aquí para retornar el estado
    // correcto al renderer.
    ipcMain.handle("updater:check-for-update", async () => {
        try {
            const result = await autoUpdater.checkForUpdates();
            if (result && result.updateInfo) {
                const currentVersion = app.getVersion();
                const remoteVersion = result.updateInfo.version;

                // Solo hay update si la versión remota es MAYOR
                const isNewer = semverGreaterThan(remoteVersion, currentVersion);

                if (isNewer) {
                    return {
                        state: "available",
                        info: {
                            version: result.updateInfo.version,
                            releaseDate: result.updateInfo.releaseDate,
                            releaseNotes: result.updateInfo.releaseNotes,
                        },
                    };
                }
                return { state: "not-available" };
            }
            return { state: "not-available" };
        } catch (error) {
            // "No update available" es un error normal de electron-updater
            if (error.message && error.message.includes("No update available")) {
                return { state: "not-available" };
            }
            return {
                state: "error",
                error: {
                    code: error.code || "UNKNOWN",
                    message: error.message,
                },
            };
        }
    });

    // ── download-update ──
    ipcMain.handle("updater:download-update", async () => {
        try {
            await autoUpdater.downloadUpdate();
            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: error.code || "DOWNLOAD_FAILED",
                    message: error.message,
                },
            };
        }
    });

    // ── quit-and-install ──
    //
    // Usa el método nativo de electron-updater para cerrar la app,
    // instalar la actualización silenciosamente y relanzarla.
    ipcMain.handle("updater:quit-and-install", async () => {
        console.log("[Updater] quit-and-install called");

        try {
            // isSilent = true, isForceRunAfter = true
            autoUpdater.quitAndInstall(true, true);
            return { ok: true };
        } catch (error) {
            console.error("[Updater] Failed to quit and install:", error);
            return { ok: false, error: error.message || "Failed to quit and install" };
        }
    });

    console.log("[Updater] IPC handlers registered");
}

module.exports = { setupUpdaterIpc };
