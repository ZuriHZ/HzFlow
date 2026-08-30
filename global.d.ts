declare interface Window {
    electronAPI: ElectronAPI;
    isElectron: boolean;
}

interface ElectronAPI {
    selectMusicFiles: () => Promise<{ src: string; title: string }[]>;
    // ... tus métodos existentes
}
