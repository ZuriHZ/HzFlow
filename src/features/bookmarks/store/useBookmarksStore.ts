import { create } from "zustand";

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

interface BookmarksStore {
  bookmarks: Bookmark[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  loadBookmarks: () => Promise<void>;
  createBookmark: (
    bookmark: Omit<Bookmark, "id" | "createdAt">,
  ) => Promise<void>;
  updateBookmark: (
    id: string,
    data: Partial<Omit<Bookmark, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  importBookmarks: (data: Omit<Bookmark, "id">[]) => Promise<void>;
  exportBookmarks: () => Promise<void>;
  setCategory: (category: string) => void;
  setSearchQuery: (q: string) => void;
}

export const useBookmarksStore = create<BookmarksStore>()((set) => ({
  bookmarks: [],
  isLoading: false,
  searchQuery: "",
  selectedCategory: "all",

  loadBookmarks: async () => {
    set({ isLoading: true });
    try {
      const bookmarks = await window.electronAPI.bookmarksGetAll();
      set({ bookmarks });
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createBookmark: async (bookmark) => {
    try {
      await window.electronAPI.bookmarksCreate(bookmark);
      const bookmarks = await window.electronAPI.bookmarksGetAll();
      set({ bookmarks });
    } catch (error) {
      console.error("Error creating bookmark:", error);
    }
  },

  updateBookmark: async (id, data) => {
    try {
      await window.electronAPI.bookmarksUpdate(id, data);
      const bookmarks = await window.electronAPI.bookmarksGetAll();
      set({ bookmarks });
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  },

  deleteBookmark: async (id) => {
    try {
      await window.electronAPI.bookmarksDelete(id);
      const bookmarks = await window.electronAPI.bookmarksGetAll();
      set({ bookmarks });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  },

  importBookmarks: async (data) => {
    try {
      await window.electronAPI.bookmarksImport(data);
      const bookmarks = await window.electronAPI.bookmarksGetAll();
      set({ bookmarks });
    } catch (error) {
      console.error("Error importing bookmarks:", error);
    }
  },

  exportBookmarks: async () => {
    try {
      await window.electronAPI.bookmarksExport();
    } catch (error) {
      console.error("Error exporting bookmarks:", error);
    }
  },

  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
