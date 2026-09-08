import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconExternalLink,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  docs: "bg-blue-500/20 text-blue-300",
  tools: "bg-violet-500/20 text-violet-300",
  tutorials: "bg-green-500/20 text-green-300",
  social: "bg-pink-500/20 text-pink-300",
  other: "bg-white/10 text-white/50",
};

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

interface BookmarkCardProps {
  bookmark: Bookmark;
  onOpen: (url: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkCard({
  bookmark,
  onOpen,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const getFaviconUrl = () => {
    if (bookmark.favicon) return bookmark.favicon;
    try {
      const url = new URL(bookmark.url);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const getInitial = () => {
    return bookmark.title.charAt(0).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const faviconUrl = getFaviconUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className="group relative flex flex-col rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="h-5 w-5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <span
            className={cn(
              "text-sm font-bold text-violet-400",
              faviconUrl ? "hidden" : "",
            )}
          >
            {getInitial()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-base font-semibold text-white/90">
            {bookmark.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-white/40">
            {bookmark.url}
          </p>
        </div>
      </div>

      {bookmark.description && (
        <p className="mb-3 line-clamp-2 text-sm text-white/50">
          {bookmark.description}
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            categoryColors[bookmark.category] || categoryColors.other,
          )}
        >
          {bookmark.category}
        </span>
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/40"
          >
            {tag}
          </span>
        ))}
        {bookmark.tags.length > 3 && (
          <span className="text-[10px] text-white/30">
            +{bookmark.tags.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto text-[11px] text-white/30">
        {formatDate(bookmark.createdAt)}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          onClick={() => onOpen(bookmark.url)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
          title="Abrir en navegador"
        >
          <IconExternalLink size={16} />
        </button>
        <button
          onClick={() => onEdit(bookmark)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white/80"
          title="Editar"
        >
          <IconPencil size={16} />
        </button>

        <div className="flex-1" />

        {showConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete(bookmark.id);
                setShowConfirm(false);
              }}
              className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-medium text-red-400 transition-all hover:bg-red-500/30"
            >
              Eliminar
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-lg px-2.5 py-1 text-[11px] text-white/40 transition-all hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"
            title="Eliminar"
          >
            <IconTrash size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
