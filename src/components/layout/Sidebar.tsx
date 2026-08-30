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
import { cn } from "@/lib/utils";

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

function NavLink({
    item,
    collapsed,
    isActive,
}: {
    item: NavItem;
    collapsed: boolean;
    isActive: boolean;
}) {
    return (
        <Link
            to={item.path}
            title={item.label}
            className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                collapsed && "justify-center",
                isActive
                    ? "bg-primary/15 text-violet-300"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80",
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-linear-to-b from-violet-400 to-fuchsia-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
            <span className="shrink-0">{item.icon}</span>
            <AnimatePresence>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden text-sm font-medium whitespace-nowrap"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();
    const sidebarWidth = collapsed ? 72 : 240;

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarWidth }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="bg-sidebar-panel fixed top-10 bottom-0 left-0 z-50 flex flex-col border-r border-sidebar-border"
        >
            <div className="flex flex-col items-center px-3 pt-6 pb-4">
                <a
                    href="http://hassamdev.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                >
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400",
                            "shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:shadow-violet-500/40",
                            collapsed ? "h-10 w-10" : "h-16 w-16",
                        )}
                    >
                        <span
                            className={cn(
                                "font-black text-white transition-transform group-hover:scale-110",
                                collapsed ? "text-sm" : "text-2xl",
                            )}
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
                            className="mt-3 overflow-hidden text-center"
                        >
                            <p className="text-sm font-semibold text-white/90">
                                ZuriHZ
                            </p>
                            <p className="text-xs text-white/40">Electron App</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mx-4 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        item={item}
                        collapsed={collapsed}
                        isActive={location.pathname === item.path}
                    />
                ))}
            </nav>

            <div className="mx-4 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            <div className="flex flex-col gap-1 px-3 py-3">
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.path}
                        item={item}
                        collapsed={collapsed}
                        isActive={location.pathname === item.path}
                    />
                ))}

                <button
                    onClick={onToggle}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl py-2 text-white/30 transition-all duration-200 hover:bg-white/5 hover:text-white/60"
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
