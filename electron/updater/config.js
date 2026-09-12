const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// ──────────────────────────────────────────────
// Configuración del auto-updater
// ──────────────────────────────────────────────

// Descarga automática en background — silencioso como VS Code/Telegram
autoUpdater.autoDownload = true;

// Instalar automáticamente cuando la app se cierre (fallback si NSIS no relanza)
autoUpdater.autoInstallOnAppQuit = true;

// Forzar check en dev mode (por default electron-updater lo salta)
// En dev: lee de dev-app-update.yml en la raíz del proyecto
// En prod: lee de la config "publish" en package.json
autoUpdater.forceDevUpdateConfig = true;

// Configurar logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

module.exports = { autoUpdater };
