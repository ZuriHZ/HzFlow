#!/usr/bin/env node

// ──────────────────────────────────────────────
// Script: upload-to-r2.js
// ──────────────────────────────────────────────
//
// Sube los archivos de release (instalador + latest.yml)
// al bucket de Cloudflare R2.
//
// Uso:
//   node scripts/upload-to-r2.js
//
// Requiere variables de entorno:
//   R2_ACCOUNT_ID       → ID de tu cuenta Cloudflare
//   R2_ACCESS_KEY_ID    → Access Key ID del API Token
//   R2_SECRET_ACCESS_KEY → Secret Access Key del API Token
//   R2_BUCKET_NAME      → Nombre del bucket (zurihz-updates)
//
// También puedes crear un archivo .env con estas variables
// y el script las leerá automáticamente.

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Cargar .env si existe
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            const value = valueParts.join("=").trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

// Configuración
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "zurihz-updates";
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Validar variables
const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error("❌ Faltan variables de entorno:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCrea un archivo .env en la raíz del proyecto:");
    console.error("   R2_ACCOUNT_ID=tu_account_id");
    console.error("   R2_ACCESS_KEY_ID=tu_access_key");
    console.error("   R2_SECRET_ACCESS_KEY=tu_secret_key");
    console.error("   R2_BUCKET_NAME=zurihz-updates");
    process.exit(1);
}

// Crear cliente S3 compatible con R2
const s3 = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

// Directorio de release
const releaseDir = path.join(__dirname, "..", "release");

async function main() {
    console.log("📦 Subiendo archivos a R2...");
    console.log(`   Bucket: ${BUCKET_NAME}`);
    console.log(`   Directorio: ${releaseDir}\n`);

    // Verificar que existe el directorio de release
    if (!fs.existsSync(releaseDir)) {
        console.error("❌ No se encontró el directorio 'release/'");
        console.error("   Ejecuta primero: pnpm dist");
        process.exit(1);
    }

    // Buscar archivos a subir
    const files = findFiles(releaseDir);

    if (files.length === 0) {
        console.error("❌ No se encontraron archivos en release/");
        process.exit(1);
    }

    console.log(`   Encontrados ${files.length} archivos:\n`);

    // Subir cada archivo
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
        const relativePath = path.relative(releaseDir, file);
        const key = `releases/${relativePath.replace(/\\/g, "/")}`;

        try {
            const content = fs.readFileSync(file);
            const contentType = getContentType(file);

            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: content,
                    ContentType: contentType,
                }),
            );

            console.log(`   ✅ ${relativePath}`);
            uploaded++;
        } catch (error) {
            console.error(`   ❌ ${relativePath}: ${error.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Resultado: ${uploaded} subidos, ${failed} fallidos`);

    if (failed > 0) {
        process.exit(1);
    }

    // Verificar que latest.yml existe y mostrar info
    const latestYml = files.find((f) => path.basename(f) === "latest.yml");
    if (latestYml) {
        const content = fs.readFileSync(latestYml, "utf-8");
        const versionMatch = content.match(/version:\s*(.+)/);
        if (versionMatch) {
            console.log(`\n🎯 Versión publicada: ${versionMatch[1].trim()}`);
        }
    }

    console.log("\n✅ ¡Listo! Los usuarios recibirán la actualización automáticamente.");
}

// Buscar archivos recursivamente
function findFiles(dir) {
    const results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...findFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }

    return results;
}

// Obtener Content-Type según extensión
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        ".yml": "text/yaml",
        ".yaml": "text/yaml",
        ".exe": "application/octet-stream",
        ".msi": "application/octet-stream",
        ".dmg": "application/octet-stream",
        ".appimage": "application/octet-stream",
        ".zip": "application/zip",
        ".json": "application/json",
    };
    return types[ext] || "application/octet-stream";
}

main().catch((error) => {
    console.error("\n❌ Error inesperado:", error.message);
    process.exit(1);
});
