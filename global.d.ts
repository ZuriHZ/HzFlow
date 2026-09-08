declare interface Window {
    electronAPI: ElectronAPI;
    isElectron: boolean;
}

// ── Existing Audio Types ──

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

// ── Notes Types ──

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    pinned: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── Projects Types ──

interface Project {
    id: string;
    name: string;
    path: string;
    stack: string;
    lastAccessed: string;
    gitBranch?: string;
    gitAhead?: number;
    gitBehind?: number;
}

// ── Bookmarks Types ──

interface Bookmark {
    id: string;
    url: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    favicon?: string;
    createdAt: string;
}

// ── Notification Types ──

interface NotificationSendResult {
    sent: boolean;
    reason?: string;
}

// ── ElectronAPI ──

interface ElectronAPI {
    // Existing: Window & Theme
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleDevTools: () => void;
    onUpdateTheme: (callback: () => void) => void;
    onUpdateThemeAsync: () => Promise<string>;
    onWindowDragEnter: (callback: () => void) => void;
    onWindowDragLeave: (callback: () => void) => void;
    onWindowDroppedFiles: (callback: (paths: string[]) => void) => void;

    // Existing: Audio
    selectMusicFiles: () => Promise<{ src: string; filePath: string; title: string }[]>;
    processDroppedFiles: (filePaths: string[]) => Promise<{ src: string; filePath: string; title: string }[]>;
    getAudioData: (filePath: string) => Promise<AudioDataResult | null>;

    // Notes
    notesGetAll: () => Promise<Note[]>;
    notesGetById: (id: string) => Promise<Note | null>;
    notesCreate: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<Note>;
    notesUpdate: (id: string, data: Partial<Omit<Note, "id" | "createdAt">>) => Promise<Note | null>;
    notesDelete: (id: string) => Promise<boolean>;
    notesSearch: (query: string) => Promise<Note[]>;

    // Projects
    projectsGetAll: () => Promise<Project[]>;
    projectsAdd: (projectPath: string) => Promise<Project>;
    projectsRemove: (id: string) => Promise<boolean>;
    projectsOpenInVSCode: (projectPath: string) => Promise<void>;
    projectsOpenInTerminal: (projectPath: string) => Promise<void>;
    projectsOpenInExplorer: (projectPath: string) => Promise<void>;
    projectsGetGitInfo: (projectPath: string) => Promise<{ gitBranch: string | null; gitAhead: number; gitBehind: number }>;

    // Bookmarks
    bookmarksGetAll: () => Promise<Bookmark[]>;
    bookmarksCreate: (bookmark: Omit<Bookmark, "id" | "createdAt">) => Promise<Bookmark>;
    bookmarksUpdate: (id: string, data: Partial<Omit<Bookmark, "id" | "createdAt">>) => Promise<Bookmark | null>;
    bookmarksDelete: (id: string) => Promise<boolean>;
    bookmarksImport: (data: Omit<Bookmark, "id">[]) => Promise<Bookmark[]>;
    bookmarksExport: () => Promise<Bookmark[]>;

    // Notifications
    notificationsSend: (title: string, body: string) => Promise<NotificationSendResult>;
    notificationsRequestPermission: () => Promise<string>;
}
