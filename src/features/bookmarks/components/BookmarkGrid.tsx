import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconBookmarkPlus, IconLoader2 } from "@tabler/icons-react";
import BookmarkCard from "@/features/bookmarks/components/BookmarkCard";

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

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  onOpen: (url: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/5 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/5" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="mt-2 h-3 w-48 rounded bg-white/5" />
        </div>
      </div>
      <div className="mb-3 h-3 w-full rounded bg-white/5" />
      <div className="mb-3 h-3 w-3/4 rounded bg-white/5" />
      <div className="mb-3 flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-white/5" />
        <div className="h-5 w-12 rounded-full bg-white/5" />
      </div>
      <div className="h-3 w-20 rounded bg-white/5" />
    </div>
  );
}

export default function BookmarkGrid({
  bookmarks,
  isLoading,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: BookmarkGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
          <IconBookmarkPlus size={28} className="text-white/30" />
        </div>
        <p className="text-sm font-medium text-white/50">
          No hay bookmarks guardados
        </p>
        <p className="mt-1 text-xs text-white/30">
          Agrega tu primer enlace para comenzar
        </p>
        <button
          onClick={onAdd}
          className="mt-6 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
        >
          Agregar Bookmark
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
