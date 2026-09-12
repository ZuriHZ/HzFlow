import React from "react";
import { motion } from "framer-motion";
import {
    IconKeyboard,
    IconFolder,
    IconNotebook,
    IconMusic,
    IconSettings,
    IconSearch,
    IconRocket,
} from "@tabler/icons-react";

const shortcutGroups = [
    {
        icon: <IconFolder size={20} />,
        title: "Navegación",
        color: "from-blue-500 to-cyan-400",
        shortcuts: [
            { keys: ["Ctrl", "1"], description: "Ir a Inicio" },
            { keys: ["Ctrl", "2"], description: "Ir a Proyectos" },
            { keys: ["Ctrl", "3"], description: "Ir a Notes" },
            { keys: ["Ctrl", "4"], description: "Ir a Noticias" },
            { keys: ["Ctrl", "5"], description: "Ir a Blog" },
        ],
    },
    {
        icon: <IconSearch size={20} />,
        title: "Búsqueda",
        color: "from-violet-500 to-purple-400",
        shortcuts: [
            { keys: ["Ctrl", "K"], description: "Búsqueda global" },
            { keys: ["Ctrl", "F"], description: "Buscar en página" },
            { keys: ["Ctrl", "Shift", "F"], description: "Buscar en archivos" },
        ],
    },
    {
        icon: <IconNotebook size={20} />,
        title: "Notes",
        color: "from-emerald-500 to-teal-400",
        shortcuts: [
            { keys: ["Ctrl", "N"], description: "Nueva nota" },
            { keys: ["Ctrl", "S"], description: "Guardar nota" },
            { keys: ["Ctrl", "Shift", "D"], description: "Eliminar nota" },
        ],
    },
    {
        icon: <IconMusic size={20} />,
        title: "Música",
        color: "from-fuchsia-500 to-pink-400",
        shortcuts: [
            { keys: ["Space"], description: "Play / Pause" },
            { keys: ["→"], description: "Siguiente canción" },
            { keys: ["←"], description: "Canción anterior" },
            { keys: ["↑", "↓"], description: "Volumen" },
        ],
    },
    {
        icon: <IconSettings size={20} />,
        title: "General",
        color: "from-orange-500 to-amber-400",
        shortcuts: [
            { keys: ["Ctrl", ","], description: "Configuración" },
            { keys: ["Ctrl", "R"], description: "Recargar app" },
            { keys: ["F11"], description: "Pantalla completa" },
            { keys: ["Ctrl", "Shift", "I"], description: "DevTools" },
        ],
    },
    {
        icon: <IconRocket size={20} />,
        title: "App",
        color: "from-red-500 to-rose-400",
        shortcuts: [
            { keys: ["Ctrl", "Q"], description: "Cerrar app" },
            { keys: ["Alt", "←"], description: "Retroceder" },
            { keys: ["Alt", "→"], description: "Adelantar" },
        ],
    },
];

const Shortcuts = () => {
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400">
                        <IconKeyboard size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Atajos de Teclado de HzFlow
                        </h1>
                        <p className="text-sm text-white/40">
                            Navega más rápido con atajos
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Shortcuts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcutGroups.map((group, i) => (
                    <motion.div
                        key={group.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="p-5 rounded-xl bg-white/[0.03] border border-white/5 
                            hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br ${group.color}`}
                            >
                                <span className="text-white">{group.icon}</span>
                            </div>
                            <h3 className="text-base font-semibold text-white/80">
                                {group.title}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {group.shortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.description}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm text-white/50">
                                        {shortcut.description}
                                    </span>
                                    <div className="flex gap-1">
                                        {shortcut.keys.map((key) => (
                                            <kbd
                                                key={key}
                                                className="px-2 py-0.5 text-xs font-mono bg-white/10 text-white/70 rounded border border-white/10"
                                            >
                                                {key}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
            >
                <p className="text-sm text-violet-300/80">
                    <strong>Tip:</strong> Los atajos funcionan en cualquier parte de la app. Presiona{" "}
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded border border-white/10">
                        Ctrl
                    </kbd>{" "}
                    +{" "}
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded border border-white/10">
                        /
                    </kbd>{" "}
                    para ver esta lista rápidamente.
                </p>
            </motion.div>
        </div>
    );
};

export default Shortcuts;
