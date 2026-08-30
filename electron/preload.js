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
});
