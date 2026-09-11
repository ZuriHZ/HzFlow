#!/usr/bin/env node

// ──────────────────────────────────────────────
// Script: upload-to-r2.ts
// ──────────────────────────────────────────────
//
// Sube los archivos de release (instalador + latest.yml)
// al bucket de Cloudflare R2.
//
// Uso:
//   pnpm upload
//   pnpm upload -- --version 1.0.1
//   pnpm upload -- --dry-run
//
// Opciones:
//   --version, -v   Forzar versión específica (default: lee de latest.yml)
//   --dry-run, -d   Solo mostrar qué se subiría, sin subir
//   --clean, -c     Eliminar versiones anteriores antes de subir
//
// Requiere variables de entorno:
//   R2_ACCOUNT_ID       → ID de tu cuenta Cloudflare
//   R2_ACCESS_KEY_ID    → Access Key ID del API Token
//   R2_SECRET_ACCESS_KEY → Secret Access Key del API Token
//   R2_BUCKET_NAME      → Nombre del bucket (zurihz-updates)

import * as fs from "node:fs";
import * as path from "node:path";
import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    type PutObjectCommandInput,
    type ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint: string;
}

interface UploadOptions {
    version?: string;
    dryRun: boolean;
    clean: boolean;
}

interface UploadResult {
    file: string;
    key: string;
    success: boolean;
    error?: string;
    size: number;
}

interface VersionInfo {
    version: string;
    releaseDate: string;
    files: VersionFile[];
}

interface VersionFile {
    url: string;
    sha512: string;
    size: number;
}

// ──────────────────────────────────────────────
// Environment & Config
// ──────────────────────────────────────────────

function loadEnvFile(): void {
    const envPath = path.join(__dirname, "..", ".env");
    if (!fs.existsSync(envPath)) return;

    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            const value = valueParts.join("=").trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}

function getConfig(): R2Config {
    const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"] as const;
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Faltan variables de entorno:");
        for (const key of missing) {
            console.error(`   - ${key}`);
        }
        console.error("\nCrea un archivo .env en la raíz del proyecto:");
        console.error("   R2_ACCOUNT_ID=tu_account_id");
        console.error("   R2_ACCESS_KEY_ID=tu_access_key");
        console.error("   R2_SECRET_ACCESS_KEY=tu_secret_key");
        console.error("   R2_BUCKET_NAME=zurihz-updates");
        process.exit(1);
    }

    return {
        accountId: process.env.R2_ACCOUNT_ID!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        bucketName: process.env.R2_BUCKET_NAME || "zurihz-updates",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestage.com`,
    };
}

// ──────────────────────────────────────────────
// CLI Arguments
// ──────────────────────────────────────────────

function parseArgs(): UploadOptions {
    const args = process.argv.slice(2);
    const options: UploadOptions = { dryRun: false, clean: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "--version":
            case "-v":
                options.version = args[++i];
                break;
            case "--dry-run":
            case "-d":
                options.dryRun = true;
                break;
            case "--clean":
            case "-c":
                options.clean = true;
                break;
            case "--help":
            case "-h":
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp(): void {
    console.log(`
📦 ZuriHZ R2 Upload Script

Uso:
  pnpm upload [opciones]

Opciones:
  --version, -v <version>   Forzar versión específica (default: lee de latest.yml)
  --dry-run, -d             Solo mostrar qué se subiría, sin subir
  --clean, -c               Eliminar versiones anteriores antes de subir
  --help, -h                Mostrar esta ayuda

Ejemplos:
  pnpm upload                          # Subir versión actual
  pnpm upload -- --version 1.0.1       # Subir con versión específica
  pnpm upload -- --dry-run             # Ver qué se subiría
  pnpm upload -- --clean               # Limpiar versiones viejas primero
`);
}

// ──────────────────────────────────────────────
// S3 Client
// ──────────────────────────────────────────────

function createS3Client(config: R2Config): S3Client {
    return new S3Client({
        region: "auto",
        endpoint: config.endpoint,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });
}

// ──────────────────────────────────────────────
// File Operations
// ──────────────────────────────────────────────

// Archivos que electron-updater necesita en R2
const REQUIRED_FILES = [
    "latest.yml",           // Metadata de versión
    ".exe",                 // Instalador Windows
    ".exe.blockmap",        // Mapa de bloques para updates incrementales
    ".zip",                 // Archivo portable (si existe)
];

function findReleaseFiles(dir: string): string[] {
    const results: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Ignorar win-unpacked y otras carpetas
            if (item === "win-unpacked" || item === "mac" || item === "linux-unpacked") {
                continue;
            }
            results.push(...findReleaseFiles(fullPath));
        } else if (isReleaseFile(item)) {
            results.push(fullPath);
        }
    }

    return results;
}

function isReleaseFile(filename: string): boolean {
    const lower = filename.toLowerCase();
    return REQUIRED_FILES.some((ext) => lower.endsWith(ext.toLowerCase()));
}

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
        ".yml": "text/yaml",
        ".yaml": "text/yaml",
        ".exe": "application/octet-stream",
        ".msi": "application/octet-stream",
        ".dmg": "application/octet-stream",
        ".appimage": "application/octet-stream",
        ".zip": "application/zip",
        ".json": "application/json",
        ".blockmap": "application/octet-stream",
    };
    return types[ext] || "application/octet-stream";
}

function parseLatestYml(filePath: string): VersionInfo | null {
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, "utf-8");
    const versionMatch = content.match(/version:\s*(.+)/);
    const dateMatch = content.match(/releaseDate:\s*(.+)/);

    if (!versionMatch) return null;

    const version = versionMatch[1].trim();
    const releaseDate = dateMatch?.[1]?.trim() || new Date().toISOString();

    // Parse files section
    const files: VersionFile[] = [];
    const fileRegex = /- url:\s*(.+)\n\s+sha512:\s*(.+)\n\s+size:\s*(\d+)/g;
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
        files.push({
            url: match[1],
            sha512: match[2],
            size: parseInt(match[3], 10),
        });
    }

    return { version, releaseDate, files };
}

// ──────────────────────────────────────────────
// R2 Operations
// ──────────────────────────────────────────────

async function listR2Objects(
    s3: S3Client,
    config: R2Config,
    prefix: string
): Promise<string[]> {
    const command: ListObjectsV2CommandInput = {
        Bucket: config.bucketName,
        Prefix: prefix,
    };

    const response = await s3.send(new ListObjectsV2Command(command));
    return response.Contents?.map((obj) => obj.Key || "") || [];
}

async function deleteR2Object(
    s3: S3Client,
    config: R2Config,
    key: string
): Promise<void> {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: key,
        })
    );
}

async function uploadFile(
    s3: S3Client,
    config: R2Config,
    filePath: string,
    releaseDir: string
): Promise<UploadResult> {
    const relativePath = path.relative(releaseDir, filePath);
    const key = `releases/${relativePath.replace(/\\/g, "/")}`;
    const content = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);
    const size = content.length;

    const command: PutObjectCommandInput = {
        Bucket: config.bucketName,
        Key: key,
        Body: content,
        ContentType: contentType,
    };

    try {
        await s3.send(new PutObjectCommand(command));
        return { file: relativePath, key, success: true, size };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { file: relativePath, key, success: false, error: message, size };
    }
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main(): Promise<void> {
    console.log("📦 ZuriHZ R2 Upload Script\n");

    // Load env and parse args
    loadEnvFile();
    const config = getConfig();
    const options = parseArgs();
    const s3 = createS3Client(config);

    // Find release directory
    const releaseDir = path.join(__dirname, "..", "release");
    if (!fs.existsSync(releaseDir)) {
        console.error("❌ No se encontró el directorio 'release/'");
        console.error("   Ejecuta primero: pnpm dist");
        process.exit(1);
    }

    // Find files
    const files = findReleaseFiles(releaseDir);
    if (files.length === 0) {
        console.error("❌ No se encontraron archivos en release/");
        process.exit(1);
    }

    // Parse latest.yml for version info
    const latestYmlPath = path.join(releaseDir, "latest.yml");
    const versionInfo = parseLatestYml(latestYmlPath);
    const version = options.version || versionInfo?.version;

    if (!version) {
        console.error("❌ No se pudo determinar la versión");
        console.error("   Usa --version <ver> o asegúrate de que latest.yml existe");
        process.exit(1);
    }

    // Display info
    console.log("📋 Configuración:");
    console.log(`   Bucket:    ${config.bucketName}`);
    console.log(`   Versión:   ${version}`);
    console.log(`   Archivos:  ${files.length}`);
    console.log(`   Dry Run:   ${options.dryRun ? "Sí" : "No"}`);
    console.log(`   Clean:     ${options.clean ? "Sí" : "No"}\n`);

    // Clean old versions if requested
    if (options.clean && !options.dryRun) {
        console.log("🧹 Limpiando versiones anteriores...");
        const existingKeys = await listR2Objects(s3, config, "releases/");
        for (const key of existingKeys) {
            if (key.includes(version)) continue; // Skip current version
            await deleteR2Object(s3, config, key);
            console.log(`   🗑️  ${key}`);
        }
        console.log("");
    }

    // Upload files
    console.log("📤 Subiendo archivos...\n");

    const results: UploadResult[] = [];
    let totalSize = 0;

    for (const file of files) {
        const relativePath = path.relative(releaseDir, file);
        const size = fs.statSync(file).size;
        totalSize += size;

        if (options.dryRun) {
            console.log(`   📄 ${relativePath} (${formatSize(size)})`);
            results.push({ file: relativePath, key: "", success: true, size });
            continue;
        }

        const result = await uploadFile(s3, config, file, releaseDir);
        results.push(result);

        if (result.success) {
            console.log(`   ✅ ${result.file} (${formatSize(result.size)})`);
        } else {
            console.log(`   ❌ ${result.file}: ${result.error}`);
        }
    }

    // Summary
    console.log("\n" + "─".repeat(50));
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Exitosos: ${successful.length}`);
    console.log(`   ❌ Fallidos: ${failed.length}`);
    console.log(`   📦 Tamaño total: ${formatSize(totalSize)}`);

    if (options.dryRun) {
        console.log("\n⚠️  Dry run completado. No se subió ningún archivo.");
        return;
    }

    if (failed.length > 0) {
        console.log("\n❌ Algunos archivos fallaron. Revisa los errores arriba.");
        process.exit(1);
    }

    // Show published version
    if (versionInfo) {
        console.log(`\n🎯 Versión publicada: ${version}`);
        console.log(`   Fecha: ${versionInfo.releaseDate}`);
        if (versionInfo.files.length > 0) {
            console.log(`   Archivos: ${versionInfo.files.length}`);
        }
    }

    console.log("\n✅ ¡Listo! Los usuarios recibirán la actualización automáticamente.");
    console.log(`\n🔗 URL de descarga:`);
    console.log(`   ${config.endpoint}/${config.bucketName}/releases/latest.yml`);
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ──────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────

main().catch((error) => {
    console.error("\n❌ Error inesperado:", error.message);
    process.exit(1);
});
