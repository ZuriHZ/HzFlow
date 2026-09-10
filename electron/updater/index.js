const { autoUpdater } = require("./config");
const { setupUpdaterHandlers } = require("./handlers");

// ──────────────────────────────────────────────
// initAutoUpdater()
// ──────────────────────────────────────────────
//
// Esta función se llama una vez cuando la app está lista.
// Configura los event handlers y dispara el primer
// chequeo de actualizaciones con un delay de 3 segundos
// para no bloquear el inicio de la app.

function initAutoUpdater() {
    console.log("[Updater] Initializing...");

    // 1. Registrar los event handlers
    setupUpdaterHandlers();

    // 2. Chequear actualizaciones después de 3 segundos
    //    (delay para que la app cargue primero)
    setTimeout(() => {
        console.log("[Updater] Auto-checking for updates...");
        autoUpdater.checkForUpdates().catch((err) => {
            console.error("[Updater] Auto-check failed:", err.message);
        });
    }, 3000);
}

module.exports = { initAutoUpdater };
