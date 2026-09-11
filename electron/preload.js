const { contextBridge, ipcRenderer } = require("electron");

// Expone una variable global para detectar Electron en el renderer
contextBridge.exposeInMainWorld("isElectron", true);

contextBridge.exposeInMainWorld("electronAPI", {
    onUpdateTheme: (callback) => ipcRenderer.on("update-theme", callback),
    onUpdateThemeAsync: async () => ipcRenderer.invoke("update-theme"),
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("toggle-maximize-window"),
    close: () => ipcRenderer.send("close-window"),
    selectMusicFiles: () => ipcRenderer.invoke("select-music-files"),
    toggleDevTools: () => ipcRenderer.send("devtools"),
    processDroppedFiles: (paths) => ipcRenderer.invoke("process-dropped-files", paths),
    getAudioData: (filePath) => ipcRenderer.invoke("get-audio-data", filePath),
    onWindowDragEnter: (callback) => ipcRenderer.on("window-drag-enter", callback),
    onWindowDragLeave: (callback) => ipcRenderer.on("window-drag-leave", callback),
    onWindowDroppedFiles: (callback) => ipcRenderer.on("window-dropped-files", (_event, paths) => callback(paths)),

    // Notes
    notesGetAll: () => ipcRenderer.invoke("notes:get-all"),
    notesGetById: (id) => ipcRenderer.invoke("notes:get-by-id", id),
    notesCreate: (note) => ipcRenderer.invoke("notes:create", note),
    notesUpdate: (id, data) => ipcRenderer.invoke("notes:update", id, data),
    notesDelete: (id) => ipcRenderer.invoke("notes:delete", id),
    notesSearch: (query) => ipcRenderer.invoke("notes:search", query),

    // Projects
    projectsGetAll: () => ipcRenderer.invoke("projects:get-all"),
    projectsAdd: (projectPath) => ipcRenderer.invoke("projects:add", projectPath),
    projectsRemove: (id) => ipcRenderer.invoke("projects:remove", id),
    projectsOpenInVSCode: (projectPath) => ipcRenderer.invoke("projects:open-in-vscode", projectPath),
    projectsOpenInTerminal: (projectPath) => ipcRenderer.invoke("projects:open-in-terminal", projectPath),
    projectsOpenInExplorer: (projectPath) => ipcRenderer.invoke("projects:open-in-explorer", projectPath),
    projectsGetGitInfo: (projectPath) => ipcRenderer.invoke("projects:get-git-info", projectPath),

    // Bookmarks
    bookmarksGetAll: () => ipcRenderer.invoke("bookmarks:get-all"),
    bookmarksCreate: (bookmark) => ipcRenderer.invoke("bookmarks:create", bookmark),
    bookmarksUpdate: (id, data) => ipcRenderer.invoke("bookmarks:update", id, data),
    bookmarksDelete: (id) => ipcRenderer.invoke("bookmarks:delete", id),
    bookmarksImport: (data) => ipcRenderer.invoke("bookmarks:import", data),
    bookmarksExport: () => ipcRenderer.invoke("bookmarks:export"),

    // Notifications
    notificationsSend: (title, body) => ipcRenderer.invoke("notifications:send", title, body),
    notificationsRequestPermission: () => ipcRenderer.invoke("notifications:request-permission"),

    // GitHub
    github: {
        getStatus: () => ipcRenderer.invoke("github:get-status"),
        loginPat: (token) => ipcRenderer.invoke("github:login-pat", { token }),
        saveToken: (token) => ipcRenderer.invoke("github:save-token", { token }),
        logout: () => ipcRenderer.invoke("github:logout"),
        prsList: (filter) => ipcRenderer.invoke("github:prs:list", filter),
        prsGet: (owner, repo, number) => ipcRenderer.invoke("github:prs:get", { owner, repo, number }),
        openExternal: (url) => ipcRenderer.invoke("github:open-external", { url }),
    },

    // ── Updater ──
    // Permite al renderer controlar las actualizaciones.
    // Solo expone acciones y eventos, nunca credenciales.
    updater: {
        // Disparar un chequeo de actualizaciones manualmente
        checkForUpdates: () => ipcRenderer.invoke("updater:check-for-update"),
        // Iniciar la descarga de la actualización
        downloadUpdate: () => ipcRenderer.invoke("updater:download-update"),
        // Cerrar la app e instalar la actualización
        quitAndInstall: () => ipcRenderer.invoke("updater:quit-and-install"),

        // ── Event listeners ──
        // Estos métodos registran callbacks que se llaman
        // cuando el main process envía eventos del updater.
        // Cada uno recibe un channel específico del updater.

        onChecking: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("updater:on-checking", handler);
            return () => ipcRenderer.removeListener("updater:on-checking", handler);
        },
        onAvailable: (callback) => {
            const handler = (_event, info) => callback(info);
            ipcRenderer.on("updater:on-available", handler);
            return () => ipcRenderer.removeListener("updater:on-available", handler);
        },
        onNotAvailable: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("updater:on-not-available", handler);
            return () => ipcRenderer.removeListener("updater:on-not-available", handler);
        },
        onProgress: (callback) => {
            const handler = (_event, progress) => callback(progress);
            ipcRenderer.on("updater:on-progress", handler);
            return () => ipcRenderer.removeListener("updater:on-progress", handler);
        },
        onDownloaded: (callback) => {
            const handler = (_event, info) => callback(info);
            ipcRenderer.on("updater:on-downloaded", handler);
            return () => ipcRenderer.removeListener("updater:on-downloaded", handler);
        },
        onError: (callback) => {
            const handler = (_event, error) => callback(error);
            ipcRenderer.on("updater:on-error", handler);
            return () => ipcRenderer.removeListener("updater:on-error", handler);
        },
    },
});
