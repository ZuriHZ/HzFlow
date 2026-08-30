const { app, BrowserWindow, Menu, ipcMain, dialog, protocol, net } = require("electron");
const { pathToFileURL } = require("url");
const path = require("path");

// Función para no repetir el formateo de las canciones
function formatSongPath(filePath) {
    return {
        src: pathToFileURL(filePath).href.replace("file://", "local-audio://"),
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

// Registramos el protocolo con privilegios ANTES de que la app esté lista
protocol.registerSchemesAsPrivileged([
    {
        scheme: "local-audio",
        privileges: {
            secure: true,
            supportFetchAPI: true,
            bypassCSP: true,
            stream: true, // ¡Este es el que hace que la etiqueta <audio> funcione!
        },
    },
]);

app.whenReady().then(() => {
    protocol.handle("local-audio", (request) => {
        // La URL viene perfecta, solo le devolvemos su prefijo 'file://' original
        const fileUrl = request.url.replace("local-audio://", "file://");
        return net.fetch(fileUrl);
    });

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

// Leer archivo de audio como buffer para crear Blob URL (soporta seek)
ipcMain.handle("get-audio-data", async (event, filePath) => {
    const fs = require("fs");
    try {
        const buffer = fs.readFileSync(filePath);
        return buffer;
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
