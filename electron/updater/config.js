const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// ──────────────────────────────────────────────
// Configuración del auto-updater
// ──────────────────────────────────────────────

// Desactivar descarga automática — el usuario decide cuándo actualizar
autoUpdater.autoDownload = false;

// No instalar automáticamente al cerrar la app
autoUpdater.autoInstallOnAppQuit = false;

// Configurar logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Configurar el provider S3 (Cloudflare R2)
// Las credenciales se inyectan en el build via publish config en package.json
autoUpdater.setFeedURL({
    provider: "s3",
    bucket: process.env.R2_BUCKET_NAME || "zurihz-updates",
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || undefined,
    // accessKeyId y secretAccessKey se leen de las variables de entorno
    // o de la config de electron-builder en package.json
});

module.exports = { autoUpdater };
