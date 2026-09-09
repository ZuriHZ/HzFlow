import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconNews, IconRefresh, IconExternalLink, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const NEWS_SITES = [
    { name: "YouTube", url: "https://www.youtube.com/" },
    { name: "BBC News", url: "https://www.bbc.com/news" },
    { name: "CNN", url: "https://edition.cnn.com/" },
    { name: "El País", url: "https://elpais.com/" },
    { name: "Reuters", url: "https://www.reuters.com/" },
    { name: "AlertaMundialX", url: "https://x.com/AlertaMundoNews" },
];

const Noticias = () => {
    const [site, setSite] = useState(NEWS_SITES[0].url);
    const webviewRef = useRef<any>(null);
    const [webviewError, setWebviewError] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSite = NEWS_SITES.find((s) => s.url === site) ?? NEWS_SITES[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReload = () => {
        if (webviewRef.current) {
            webviewRef.current.reload();
        }
        setWebviewError(false);
    };

    const isElectron =
        typeof window !== "undefined" && (window as any).isElectron;

    return (
        <div className="max-w-6xl mx-auto w-full space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-400">
                        <IconNews size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Noticias
                        </h1>
                        <p className="text-sm text-white/40">
                            Navegador integrado
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Site selector */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70",
                                "outline-none transition-all hover:bg-white/[0.08] hover:text-white/90 hover:border-white/15",
                                "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                                showDropdown && "bg-white/[0.08] text-white/90 border-white/15"
                            )}
                        >
                            {currentSite.name}
                            <IconChevronDown
                                size={14}
                                className={cn("transition-transform duration-200", showDropdown && "rotate-180")}
                            />
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-zinc-800/95 shadow-xl shadow-black/40 backdrop-blur-sm"
                                >
                                    {NEWS_SITES.map((s) => (
                                        <button
                                            key={s.url}
                                            onClick={() => {
                                                setSite(s.url);
                                                setShowDropdown(false);
                                                setWebviewError(false);
                                            }}
                                            className={cn(
                                                "flex w-full items-center px-3.5 py-2 text-sm transition-colors",
                                                site === s.url
                                                    ? "bg-violet-500/20 text-violet-300"
                                                    : "text-white/60 hover:bg-white/[0.08] hover:text-white/80"
                                            )}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Reload button */}
                    <button
                        onClick={handleReload}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white 
                            border border-white/5 transition-all"
                        title="Recargar"
                    >
                        <IconRefresh size={18} />
                    </button>

                    {/* External link */}
                    <a
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white 
                            border border-white/5 transition-all"
                        title="Abrir en navegador externo"
                    >
                        <IconExternalLink size={18} />
                    </a>
                </div>
            </motion.div>

            {/* Webview container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]"
                style={{ height: "calc(100vh - 12rem)" }}
            >
                {isElectron ? (
                    webviewError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <IconNews size={28} className="text-red-400" />
                            </div>
                            <p className="text-lg font-semibold text-white/60 mb-2">
                                No se pudo cargar el sitio
                            </p>
                            <p className="text-sm text-white/30 max-w-sm">
                                Es posible que el sitio no permita ser mostrado
                                dentro de la app. Prueba con otro sitio o ábrelo
                                en el navegador externo.
                            </p>
                        </div>
                    ) : (
                        <webview
                            ref={webviewRef}
                            src={site}
                            className="w-full h-full border-none"
                            allowpopups={true as any}
                            onError={() => setWebviewError(true)}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                            <IconNews size={28} className="text-violet-400" />
                        </div>
                        <p className="text-lg font-semibold text-white/60 mb-2">
                            Navegador de escritorio
                        </p>
                        <p className="text-sm text-white/30 max-w-sm">
                            El navegador integrado solo está disponible en la
                            app de escritorio (Electron).
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Noticias;
