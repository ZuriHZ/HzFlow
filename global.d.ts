declare interface Window {
    electronAPI: ElectronAPI;
    isElectron: boolean;
}

interface AudioMetadata {
    title: string;
    artist?: string;
    album?: string;
    cover?: string;
    duration?: number;
}

interface AudioDataResult {
    buffer: number[];
    metadata: AudioMetadata;
}

interface ElectronAPI {
    selectMusicFiles: () => Promise<{ src: string; filePath: string; title: string }[]>;
    processDroppedFiles: (filePaths: string[]) => Promise<{ src: string; filePath: string; title: string }[]>;
    getAudioData: (filePath: string) => Promise<AudioDataResult | null>;
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleDevTools: () => void;
}
