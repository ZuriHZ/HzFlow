declare interface Window {
    electronAPI: ElectronAPI;
    isElectron: boolean;
}

interface ElectronAPI {
    selectMusicFiles: () => Promise<{ filePath: string; title: string }[]>;
    processDroppedFiles: (filePaths: string[]) => Promise<{ filePath: string; title: string }[]>;
    getAudioData: (filePath: string) => Promise<number[] | null>;
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleDevTools: () => void;
}
