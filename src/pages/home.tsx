import { MorphingText } from '@/components/magicui/morphing-text';
import { useBookmarksStore } from '@/features/bookmarks/store/useBookmarksStore';
import { useNotesStore } from '@/features/notes/store/useNotesStore';
import { usePomodoroStore } from '@/features/pomodoro/store/usePomodoroStore';
import { useProjectsStore } from '@/features/projects/store/useProjectsStore';
import {
    IconBookmark,
    IconBookmarks,
    IconClock,
    IconFolder,
    IconMusic,
    IconNotebook,
    IconPencil,
    IconStack2,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

function formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatFocusTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}:${String(m).padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

const quickActions = [
    {
        label: 'Notas',
        path: '/notes',
        icon: <IconPencil size={20} />,
        color: 'from-violet-500 to-fuchsia-500',
    },
    {
        label: 'Proyectos',
        path: '/projects',
        icon: <IconFolder size={20} />,
        color: 'from-blue-500 to-cyan-400',
    },
    {
        label: 'Bookmarks',
        path: '/bookmarks',
        icon: <IconBookmark size={20} />,
        color: 'from-orange-500 to-amber-400',
    },
    {
        label: 'Música',
        path: '/musica',
        icon: <IconMusic size={20} />,
        color: 'from-green-500 to-emerald-400',
    },
];

const categoryColors: Record<string, string> = {
    personal: 'bg-violet-500/20 text-violet-300',
    trabajo: 'bg-blue-500/20 text-blue-300',
    idea: 'bg-amber-500/20 text-amber-300',
    proyecto: 'bg-emerald-500/20 text-emerald-300',
    código: 'bg-cyan-500/20 text-cyan-300',
    default: 'bg-white/10 text-white/50',
};

const Home = () => {
    const [now, setNow] = useState(new Date());

    const notes = useNotesStore((s) => s.notes);
    const projects = useProjectsStore((s) => s.projects);
    const bookmarks = useBookmarksStore((s) => s.bookmarks);
    const totalFocusTime = usePomodoroStore((s) => s.totalFocusTime);

    const loadNotes = useNotesStore((s) => s.loadNotes);
    const loadProjects = useProjectsStore((s) => s.loadProjects);
    const loadBookmarks = useBookmarksStore((s) => s.loadBookmarks);

    useEffect(() => {
        loadNotes();
        loadProjects();
        loadBookmarks();
    }, [loadNotes, loadProjects, loadBookmarks]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);

    const recentNotes = [...notes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);

    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 3);

    return (
        <div className="flex flex-col gap-8">
            {/* Hero / Welcome */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="rounded-xl border border-white/5 bg-white/2 p-5"
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-white/90 md:text-3xl">
                            Centro de Productividad
                        </h1>
                        <p className="text-sm text-white/40">
                            Gestiona tus notas, proyectos y bookmarks en un solo lugar
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                        <span className="capitalize">{formatDate(now)}</span>
                        <span className="text-white/20">·</span>
                        <span>{formatTime(now)}</span>
                        <div className="flex gap-2">
                            {[
                                { icon: <IconNotebook size={14} />, value: notes.length, label: 'Notas' },
                                { icon: <IconStack2 size={14} />, value: projects.length, label: 'Proyectos' },
                                { icon: <IconBookmarks size={14} />, value: bookmarks.length, label: 'Bookmarks' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-1.5 rounded-md bg-white/4 px-2 py-1 text-xs text-white/50"
                                >
                                    {stat.icon}
                                    <span className="font-medium text-white/70">{stat.value}</span>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Quick Actions */}
            <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="space-y-4">
                <h2 className="text-lg font-semibold text-white/70">Acciones rápidas</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {quickActions.map((item, i) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.08 }}
                        >
                            <Link
                                to={item.path}
                                className="group block rounded-xl border border-white/5 bg-white/3 p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/6"
                            >
                                <div
                                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${item.color} transition-transform group-hover:scale-110`}
                                >
                                    <span className="text-white">{item.icon}</span>
                                </div>
                                <span className="text-sm font-medium text-white/70 transition-colors group-hover:text-white">
                                    {item.label}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Dashboard Widgets */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Notas Recientes */}
                <motion.section
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="rounded-xl border border-white/5 bg-white/2 p-5"
                >
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                        Notas Recientes
                    </h3>
                    {recentNotes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-white/30">No hay notas todavía</p>
                    ) : (
                        <div className="space-y-3">
                            <Link className="space-y-3" to={'/notes'}>
                                {recentNotes.map((note) => {
                                    const catColor =
                                        categoryColors[note.category.toLowerCase()] || categoryColors.default;
                                    return (
                                        <div
                                            key={note.id}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3 transition-colors hover:bg-white/4"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-white/80">
                                                    {note.title}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}
                                                    >
                                                        {note.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs text-white/30">
                                                {timeAgo(note.updatedAt)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </Link>
                        </div>
                    )}
                </motion.section>

                {/* Proyectos Activos */}
                <motion.section
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="rounded-xl border border-white/5 bg-white/2 p-5"
                >
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                        Proyectos Activos
                    </h3>
                    {recentProjects.length === 0 ? (
                        <p className="py-8 text-center text-sm text-white/30">No hay proyectos todavía</p>
                    ) : (
                        <div className="space-y-3">
                            <Link to={'/projects'} className="space-y-3">
                                {recentProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3 transition-colors hover:bg-white/4"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-white/80">{project.name}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                                                    {project.stack}
                                                </span>
                                                {project.gitBranch && (
                                                    <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                                        {project.gitBranch}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-white/30">
                                            {timeAgo(project.lastAccessed)}
                                        </span>
                                    </div>
                                ))}
                            </Link>
                        </div>
                    )}
                </motion.section>
            </div>

            {/* Stats Bar */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
            >
                {[
                    {
                        icon: <IconNotebook size={18} />,
                        value: notes.length,
                        label: 'Total Notas',
                    },
                    {
                        icon: <IconStack2 size={18} />,
                        value: projects.length,
                        label: 'Total Proyectos',
                    },
                    {
                        icon: <IconBookmarks size={18} />,
                        value: bookmarks.length,
                        label: 'Total Bookmarks',
                    },
                    {
                        icon: <IconClock size={18} />,
                        value: formatFocusTime(totalFocusTime),
                        label: 'Tiempo Enfoque',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/5 bg-white/2 p-5">
                        <div className="mb-2 text-white/30">{stat.icon}</div>
                        <div className="text-2xl font-bold text-white/90">{stat.value}</div>
                        <div className="mt-1 text-xs text-white/40">{stat.label}</div>
                    </div>
                ))}
            </motion.section>
        </div>
    );
};

export default Home;
