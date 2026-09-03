const { ipcMain, dialog } = require("electron");

function formatSongPath(filePath) {
    return {
        src: filePath,
        filePath: filePath,
        title: filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, ""),
    };
}

function setupAudioHandlers() {
    ipcMain.handle("select-music-files", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
            filters: [{ name: "Audio", extensions: ["mp3", "wav", "ogg", "m4a"] }],
        });

        if (result.canceled) return [];
        return result.filePaths.map(formatSongPath);
    });

    ipcMain.handle("process-dropped-files", async (event, filePaths) => {
        const validExtensions = [".mp3", ".wav", ".ogg", ".m4a"];
        const validPaths = filePaths.filter((filePath) => validExtensions.some((ext) => filePath.toLowerCase().endsWith(ext)));
        return validPaths.map(formatSongPath);
    });

    ipcMain.handle("get-audio-data", async (event, filePath) => {
        const fs = require("fs").promises;
        try {
            const buffer = await fs.readFile(filePath);
            let metadata = { title: filePath.split(/[\\/]/).pop().replace(/\.[^/.]+$/, ""), artist: undefined, album: undefined, cover: undefined, duration: undefined };
            try {
                const mm = await import("music-metadata");
                const parsed = await mm.parseBuffer(new Uint8Array(buffer), { duration: true });
                if (parsed.common.title) metadata.title = parsed.common.title;
                if (parsed.common.artist) metadata.artist = parsed.common.artist;
                if (parsed.common.album) metadata.album = parsed.common.album;
                if (parsed.format.duration) metadata.duration = parsed.format.duration;
                if (parsed.common.picture && parsed.common.picture.length > 0) {
                    const pic = parsed.common.picture[0];
                    const base64 = Buffer.from(pic.data).toString("base64");
                    metadata.cover = `data:${pic.format};base64,${base64}`;
                }
            } catch (metaErr) {
                console.warn("No se pudo extraer metadata:", metaErr.message);
            }
            return { buffer: Array.from(new Uint8Array(buffer)), metadata };
        } catch (error) {
            console.error("Error leyendo archivo:", filePath, error);
            return null;
        }
    });
}

module.exports = { setupAudioHandlers };
