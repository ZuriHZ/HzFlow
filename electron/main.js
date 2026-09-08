const { app, BrowserWindow } = require("electron");
const { setupWindowManager } = require("./core/windowManager");
const { setupAudioHandlers } = require("./ipc/audioHandlers");
const { setupWindowHandlers } = require("./ipc/windowHandlers");
const { setupNotesHandlers } = require("./ipc/notesHandlers");
const { setupProjectsHandlers } = require("./ipc/projectsHandlers");
const { setupBookmarksHandlers } = require("./ipc/bookmarksHandlers");
const { setupNotificationsHandlers } = require("./ipc/notificationsHandlers");

const isDev = !app.isPackaged;
let mainWindow;

app.whenReady().then(() => {
    // 1. Crear ventana
    mainWindow = setupWindowManager();

    // 2. Configurar manejadores IPC de audio
    setupAudioHandlers();

    // 3. Configurar manejadores IPC de ventana
    setupWindowHandlers(mainWindow, isDev);

    // 4. Configurar manejadores IPC de features
    setupNotesHandlers();
    setupProjectsHandlers();
    setupBookmarksHandlers();
    setupNotificationsHandlers();
});

// Manejo correcto del cierre de la aplicación
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = setupWindowManager();
        setupWindowHandlers(mainWindow, isDev);
    }
});
