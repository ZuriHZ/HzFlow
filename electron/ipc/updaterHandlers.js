const { ipcMain } = require("electron");
const { autoUpdater } = require("../updater/config");

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
//   → Cierra la app y ejecuta el instalador

function setupUpdaterIpc() {
    // ── check-for-update ──
    ipcMain.handle("updater:check-for-update", async () => {
        try {
            const result = await autoUpdater.checkForUpdates();
            if (result && result.updateInfo) {
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
        } catch (error) {
            // Si no hay update disponible, checkForUpdates lanza un error
            // con el mensaje "No update available"
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
    ipcMain.handle("updater:quit-and-install", async () => {
        // quitAndInstall cierra la app y ejecuta el instalador
        // No retorna nada porque la app se cierra
        autoUpdater.quitAndInstall(true, false);
    });

    console.log("[Updater] IPC handlers registered");
}

module.exports = { setupUpdaterIpc };
