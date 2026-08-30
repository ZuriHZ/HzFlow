import React from "react";
import { motion } from "framer-motion";
import {
    IconStar,
    IconExternalLink,
    IconBrandGithub,
    IconBrandWhatsapp,
    IconBrandFacebook,
} from "@tabler/icons-react";

const socialLinks = [
    {
        label: "GitHub",
        url: "https://github.com/",
        icon: <IconBrandGithub size={24} />,
        color: "from-gray-600 to-gray-400",
        description: "Mis repositorios y proyectos open source",
    },
    {
        label: "WhatsApp",
        url: "https://wa.me/",
        icon: <IconBrandWhatsapp size={24} />,
        color: "from-green-500 to-emerald-400",
        description: "Contacto directo por WhatsApp",
    },
    {
        label: "Facebook",
        url: "https://www.facebook.com/",
        icon: <IconBrandFacebook size={24} />,
        color: "from-blue-600 to-blue-400",
        description: "Perfil y publicaciones en Facebook",
    },
    {
        label: "Portafolio",
        url: "http://hassamzuriel.vercel.app/",
        icon: <IconExternalLink size={24} />,
        color: "from-violet-500 to-fuchsia-400",
        description: "Mi portafolio personal en la web",
    },
];

const shortcuts = [
    { key: "F5", action: "Refrescar ventana" },
    { key: "Ctrl+R", action: "Recargar app" },
    { key: "F11", action: "Pantalla completa" },
    { key: "Ctrl+Q", action: "Cerrar aplicación" },
];

const Extras = () => {
    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-400">
                        <IconStar size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Extras
                        </h1>
                        <p className="text-sm text-white/40">
                            Enlaces, atajos y más
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Social links */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold text-white/50">
                    Mis enlaces
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {socialLinks.map((link, i) => (
                        <motion.a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 
                                hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br transition-transform group-hover:scale-110 ${link.color}`}
                            >
                                <span className="text-white">{link.icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                                    {link.label}
                                </div>
                                <div className="text-xs text-white/30">
                                    {link.description}
                                </div>
                            </div>
                            <IconExternalLink
                                size={14}
                                className="text-white/20 group-hover:text-white/50 transition-colors"
                            />
                        </motion.a>
                    ))}
                </div>
            </motion.section>

            {/* Keyboard shortcuts */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
            >
                <h2 className="text-sm font-semibold text-white/50">
                    Atajos de teclado
                </h2>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
                    {shortcuts.map((s) => (
                        <div
                            key={s.key}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <span className="text-sm text-white/60">
                                {s.action}
                            </span>
                            <kbd className="px-2.5 py-1 text-xs font-mono bg-white/5 text-white/50 rounded-lg border border-white/10">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* About section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center"
            >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
                    <span className="text-lg font-black text-white">Z</span>
                </div>
                <p className="text-sm text-white/50">
                    ZuriHZ v1.0.0 — Una aplicación de escritorio construida con
                    Electron + React como práctica de desarrollo.
                </p>
            </motion.section>
        </div>
    );
};

export default Extras;
