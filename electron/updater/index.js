const { autoUpdater } = require("./config");
const { setupUpdaterHandlers } = require("./handlers");

// ──────────────────────────────────────────────
// initAutoUpdater()
// ──────────────────────────────────────────────
//
// Configura el auto-updater silencioso:
// 1. Check al iniciar (3s delay)
// 2. Check periódico cada 4 horas
// 3. autoDownload: true → descarga en background

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 horas
let periodicCheckTimer = null;

function initAutoUpdater() {
    console.log("[Updater] Initializing (silent mode)...");

    // 1. Registrar los event handlers
    setupUpdaterHandlers();

    // 2. Primer check después de 3 segundos
    setTimeout(() => {
        console.log("[Updater] Initial auto-check...");
        autoUpdater.checkForUpdates().catch((err) => {
            console.error("[Updater] Initial check failed:", err.message);
        });
    }, 3000);

    // 3. Check periódico cada 4 horas
    periodicCheckTimer = setInterval(() => {
        console.log("[Updater] Periodic auto-check...");
        autoUpdater.checkForUpdates().catch((err) => {
            console.error("[Updater] Periodic check failed:", err.message);
        });
    }, CHECK_INTERVAL_MS);

    console.log("[Updater] Periodic check scheduled every 4h");
}

function stopAutoUpdater() {
    if (periodicCheckTimer) {
        clearInterval(periodicCheckTimer);
        periodicCheckTimer = null;
        console.log("[Updater] Periodic check stopped");
    }
}

module.exports = { initAutoUpdater, stopAutoUpdater };
