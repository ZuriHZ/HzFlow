const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");

function formatSongPath(filePath) {
    return {
        filePath: filePath,
        title: filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, ""),
    };
}

const isDev = !app.isPackaged;
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1340,
        height: 1000,
        backgroundColor: "#262335",
        frame: false,
        show: false,
        autoHideMenuBar: true,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true,
            sandbox: true,
        },
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools(); // <-- ESTO ABRE LAS DEVTOOLS AUTOMÁTICAMENTE
    } else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
    win.once("ready-to-show", () => {
        win.show();
    });
    // La carga solo ocurre aquí, no se repite después.

    // Menú personalizado
    const template = [
        {
            label: "Archivo",
            submenu: [
                {
                    label: "Nuevo",
                    click: () => {
                        /* lógica para nuevo */
                    },
                },
                {
                    label: "Abrir",
                    click: () => {
                        /* lógica para abrir */
                    },
                },
                { type: "separator" },
                { label: "Salir", role: "quit" },
            ],
        },
        {
            label: "Editar",
            submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }],
        },
        {
            label: "Ver",
            submenu: [{ role: "reload" }, { type: "separator" }, { role: "resetzoom" }, { role: "zoomin" }, { role: "zoomout" }, { type: "separator" }, { role: "togglefullscreen" }, { type: "separator" }, { role: "toggleDevTools" }],
        },
        {
            label: "Refrescar ventana",
            accelerator: "F5",
            click: () => {
                const { BrowserWindow } = require("electron");
                const focused = BrowserWindow.getFocusedWindow();
                if (focused) focused.reload();
            },
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Menú personalizado y resto de la función
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on("devtools", () => {
    if (isDev) {
        win.webContents.openDevTools(); // <-- ESTO ABRE LAS DEVTOOLS AUTOMÁTICAMENTE
    } else {
        win.webContents.closeDevTools(); // <-- ESTO CIERRA LAS DEVTOOLS AUTOMÁTICAMENTE
    }
});

ipcMain.handle("select-music-files", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Audio", extensions: ["mp3", "wav", "ogg", "m4a"] }],
    });

    if (result.canceled) return [];
    return result.filePaths.map(formatSongPath);
});

// NUEVO: Handler para procesar archivos soltados en la ventana
ipcMain.handle("process-dropped-files", async (event, filePaths) => {
    const validExtensions = [".mp3", ".wav", ".ogg", ".m4a"];

    // Filtramos para que solo pasen archivos de audio
    const validPaths = filePaths.filter((filePath) => validExtensions.some((ext) => filePath.toLowerCase().endsWith(ext)));

    return validPaths.map(formatSongPath);
});

// Leer archivo de audio como buffer + metadata ID3
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

ipcMain.on("close-window", () => {
    win.close();
});

ipcMain.on("minimize-window", () => {
    if (win && !win.isMinimized()) win.minimize();
});

ipcMain.on("toggle-maximize-window", () => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

// Manejo correcto del cierre de la aplicación
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
