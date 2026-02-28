import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconHome,
    IconSettings,
    IconNews,
    IconPencil,
    IconRocket,
    IconStar,
    IconMusic,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: "Inicio", path: "/", icon: <IconHome size={22} /> },
    { label: "Noticias", path: "/noticias", icon: <IconNews size={22} /> },
    { label: "Blog", path: "/blog", icon: <IconPencil size={22} /> },
    { label: "Features", path: "/features", icon: <IconRocket size={22} /> },
    { label: "Música", path: "/musica", icon: <IconMusic size={22} /> },
    { label: "Extras", path: "/extras", icon: <IconStar size={22} /> },
];

const bottomItems: NavItem[] = [
    {
        label: "Configuración",
        path: "/config",
        icon: <IconSettings size={22} />,
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();
    const sidebarWidth = collapsed ? 72 : 240;

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarWidth }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-10 bottom-0 z-50 flex flex-col border-r border-white/5"
            style={{
                background:
                    "linear-gradient(180deg, #0f0a1e 0%, #130d24 50%, #0f0a1e 100%)",
            }}
        >
            {/* Profile section */}
            <div className="flex flex-col items-center pt-6 pb-4 px-3">
                <a
                    href="http://hassamdev.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                >
                    <div
                        className={`rounded-full bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 
                        flex items-center justify-center shadow-lg shadow-violet-500/20
                        group-hover:shadow-violet-500/40 transition-all duration-300
                        ${collapsed ? "w-10 h-10" : "w-16 h-16"}`}
                    >
                        <span
                            className={`font-black text-white group-hover:scale-110 transition-transform
                            ${collapsed ? "text-sm" : "text-2xl"}`}
                        >
                            Z
                        </span>
                    </div>
                </a>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 text-center overflow-hidden"
                        >
                            <p className="text-sm font-semibold text-white/90">
                                ZuriHZ
                            </p>
                            <p className="text-xs text-white/40">
                                Electron App
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="mx-4 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={item.label}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                ${collapsed ? "justify-center" : ""}
                                ${
                                    isActive
                                        ? "bg-violet-500/15 text-violet-300"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                }`}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-linear-to-b from-violet-400 to-fuchsia-400"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <span className="shrink-0">{item.icon}</span>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Separator */}
            <div className="mx-4 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

            {/* Bottom items */}
            <div className="px-3 py-3 flex flex-col gap-1">
                {bottomItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={item.label}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                ${collapsed ? "justify-center" : ""}
                                ${
                                    isActive
                                        ? "bg-violet-500/15 text-violet-300"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-linear-to-b from-violet-400 to-fuchsia-400"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <span className="shrink-0">{item.icon}</span>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}

                {/* Toggle button */}
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center gap-2 mt-2 py-2 rounded-xl 
                        text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
                    title={collapsed ? "Expandir" : "Colapsar"}
                >
                    {collapsed ? (
                        <IconChevronRight size={18} />
                    ) : (
                        <IconChevronLeft size={18} />
                    )}
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs"
                            >
                                Colapsar
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
