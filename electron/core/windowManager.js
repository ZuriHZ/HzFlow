const { BrowserWindow, Menu, app } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function setupWindowManager() {
    let win = new BrowserWindow({
        width: 1340,
        height: 1000,
        backgroundColor: "#262335",
        frame: false,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload.js"), // Fixed path: one level up
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true,
            sandbox: true,
        },
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, "../../dist/index.html")); // Fixed path
    }

    win.once("ready-to-show", () => {
        win.show();
    });

    const template = [
        {
            label: "Archivo",
            submenu: [
                {
                    label: "Nuevo",
                    click: () => { /* lógica para nuevo */ },
                },
                {
                    label: "Abrir",
                    click: () => { /* lógica para abrir */ },
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
                const focused = BrowserWindow.getFocusedWindow();
                if (focused) focused.reload();
            },
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return win;
}

module.exports = { setupWindowManager };
