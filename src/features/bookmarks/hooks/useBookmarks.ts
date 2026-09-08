import { useEffect, useMemo } from "react";
import { useBookmarksStore } from "@/features/bookmarks/store/useBookmarksStore";

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "docs", label: "Documentación" },
  { value: "tools", label: "Herramientas" },
  { value: "tutorials", label: "Tutoriales" },
  { value: "social", label: "Social" },
  { value: "other", label: "Otros" },
];

export function useBookmarks() {
  const {
    bookmarks,
    isLoading,
    searchQuery,
    selectedCategory,
    loadBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    exportBookmarks,
    setCategory,
    setSearchQuery,
  } = useBookmarksStore();

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((b) => {
        const matchesSearch =
          !searchQuery ||
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        const matchesCategory =
          selectedCategory === "all" || b.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [bookmarks, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    bookmarks.forEach((b) => {
      byCategory[b.category] = (byCategory[b.category] || 0) + 1;
    });
    return { total: bookmarks.length, byCategory };
  }, [bookmarks]);

  const openUrl = (url: string) => {
    window.open(url, "_blank");
  };

  return {
    bookmarks: filteredBookmarks,
    isLoading,
    searchQuery,
    selectedCategory,
    categories: CATEGORIES,
    stats,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    exportBookmarks,
    setCategory,
    setSearchQuery,
    openUrl,
  };
}
