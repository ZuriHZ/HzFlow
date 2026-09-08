import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconBookmark,
  IconSearch,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import BookmarkGrid from "@/features/bookmarks/components/BookmarkGrid";
import AddBookmarkDialog from "@/features/bookmarks/components/AddBookmarkDialog";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  docs: "bg-blue-500/20 text-blue-300",
  tools: "bg-violet-500/20 text-violet-300",
  tutorials: "bg-green-500/20 text-green-300",
  social: "bg-pink-500/20 text-pink-300",
  other: "bg-white/10 text-white/50",
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Bookmarks() {
  const {
    bookmarks,
    isLoading,
    searchQuery,
    selectedCategory,
    categories,
    stats,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    exportBookmarks,
    setCategory,
    setSearchQuery,
    openUrl,
  } = useBookmarks();

  const [editingBookmark, setEditingBookmark] = useState<{
    id: string;
    url: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    favicon?: string;
    createdAt: string;
  } | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
      >
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
              <IconBookmark size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/90">Bookmarks</h1>
              <p className="text-sm text-white/40">
                Tus enlaces de desarrollo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => importBookmarks([])}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white/80"
            >
              <IconUpload size={16} />
              Importar
            </button>
            <button
              onClick={exportBookmarks}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white/80"
            >
              <IconDownload size={16} />
              Exportar
            </button>
            <AddBookmarkDialog onAdd={createBookmark} />
          </div>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <IconSearch
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar bookmarks..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-10 text-sm text-white/90 placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setCategory(e.target.value)}
          className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 outline-none transition-all focus:border-violet-500/50"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-white/90">{stats.total}</div>
          <div className="mt-1 text-xs text-white/40">Total bookmarks</div>
        </div>
        {Object.entries(stats.byCategory)
          .slice(0, 2)
          .map(([cat, count]) => (
            <div
              key={cat}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
            >
              <div className="text-2xl font-bold text-white/90">{count}</div>
              <div className="mt-1 text-xs text-white/40">{cat}</div>
            </div>
          ))}
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <BookmarkGrid
          bookmarks={bookmarks}
          isLoading={isLoading}
          onOpen={openUrl}
          onEdit={setEditingBookmark}
          onDelete={deleteBookmark}
          onAdd={() => {}}
        />
      </motion.section>

      {editingBookmark && (
        <AddBookmarkDialog
          editBookmark={editingBookmark}
          onUpdate={updateBookmark}
          onClose={() => setEditingBookmark(null)}
        />
      )}
    </div>
  );
}
