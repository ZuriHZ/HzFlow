const { ipcMain } = require("electron");

function setupWindowHandlers(win, isDev) {
    ipcMain.on("devtools", () => {
        if (isDev) {
            win.webContents.openDevTools();
        } else {
            win.webContents.closeDevTools();
        }
    });

    ipcMain.on("close-window", () => {
        if (win && !win.isDestroyed()) {
            win.close();
        }
    });

    ipcMain.on("minimize-window", () => {
        if (win && !win.isMinimized()) {
            win.minimize();
        }
    });

    ipcMain.on("toggle-maximize-window", () => {
        if (win && !win.isDestroyed()) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    });
}

module.exports = { setupWindowHandlers };
