import React from "react";
import { motion } from "framer-motion";
import {
    IconRocket,
    IconBrowser,
    IconCode,
    IconPalette,
    IconMusic,
    IconDeviceGamepad2,
} from "@tabler/icons-react";

const features = [
    {
        icon: <IconBrowser size={24} />,
        title: "Navegador integrado",
        description:
            "Navega sitios web directamente en la app con webview (YouTube, noticias, etc.).",
        color: "from-blue-500 to-cyan-400",
    },
    {
        icon: <IconMusic size={24} />,
        title: "Reproductor de música",
        description:
            "Escucha tu música favorita con un reproductor elegante e integrado.",
        color: "from-violet-500 to-purple-400",
    },
    {
        icon: <IconPalette size={24} />,
        title: "Interfaz moderna",
        description:
            "Diseño oscuro premium con animaciones fluidas y componentes profesionales.",
        color: "from-fuchsia-500 to-pink-400",
    },
    {
        icon: <IconCode size={24} />,
        title: "React + Electron",
        description:
            "Construida con React, Vite, Tailwind CSS y Electron para máximo rendimiento.",
        color: "from-emerald-500 to-teal-400",
    },
    {
        icon: <IconDeviceGamepad2 size={24} />,
        title: "Extensible",
        description:
            "Arquitectura modular para añadir funcionalidades fácilmente.",
        color: "from-orange-500 to-amber-400",
    },
    {
        icon: <IconRocket size={24} />,
        title: "Multiplataforma",
        description: "Funciona en Windows, macOS y Linux con Electron Builder.",
        color: "from-red-500 to-rose-400",
    },
];

const Features = () => {
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-amber-400">
                        <IconRocket size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Features
                        </h1>
                        <p className="text-sm text-white/40">
                            Características de la aplicación
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feat, i) => (
                    <motion.div
                        key={feat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="group p-5 rounded-xl bg-white/[0.03] border border-white/5 
                            hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                    >
                        <div
                            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg transition-transform duration-300 group-hover:scale-110 ${feat.color}`}
                        >
                            <span className="text-white">{feat.icon}</span>
                        </div>
                        <h3 className="text-base font-semibold text-white/80 mb-1 group-hover:text-white transition-colors">
                            {feat.title}
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                            {feat.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Tech stack */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
            >
                <h3 className="text-sm font-semibold text-white/60 mb-3">
                    Stack tecnológico
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        "React 19",
                        "Electron",
                        "Vite",
                        "TypeScript",
                        "Tailwind CSS v4",
                        "Framer Motion",
                        "shadcn/ui",
                    ].map((tech) => (
                        <span
                            key={tech}
                            className="px-3 py-1.5 text-xs font-medium bg-white/5 text-white/50 rounded-lg border border-white/5"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Features;
