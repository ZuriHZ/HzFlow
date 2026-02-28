import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    IconArrowRight,
    IconNews,
    IconRocket,
    IconMusic,
    IconPencil,
} from "@tabler/icons-react";
import { HeroVideoDialogDemo } from "../components/shared/HeroDialog";
import { MorphingText } from "../components/magicui/morphing-text";

const welcomeTexts = [
    "HOLA",
    "Bienvenido",
    "A ZuriHZ",
    "Explora",
    "Crea",
    "Disfruta",
];

const quickLinks = [
    {
        label: "Noticias",
        path: "/noticias",
        icon: <IconNews size={20} />,
        color: "from-blue-500 to-cyan-400",
    },
    {
        label: "Blog",
        path: "/blog",
        icon: <IconPencil size={20} />,
        color: "from-fuchsia-500 to-pink-400",
    },
    {
        label: "Features",
        path: "/features",
        icon: <IconRocket size={20} />,
        color: "from-orange-500 to-amber-400",
    },
    {
        label: "Música",
        path: "/musica",
        icon: <IconMusic size={20} />,
        color: "from-violet-500 to-purple-400",
    },
];

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const Home = () => {
    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            {/* Hero section */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, #1a1035 0%, #2d1b69 50%, #0f0a1e 100%)",
                }}
            >
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="h-16">
                            <MorphingText
                                texts={welcomeTexts}
                                className="text-4xl md:text-5xl font-black text-white"
                            />
                        </div>
                        <p className="text-white/50 text-lg leading-relaxed max-w-md">
                            Tu centro de control personal. Explora noticias, lee
                            el blog, descubre proyectos y disfruta de tu música
                            favorita.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Link
                                to="/features"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                            >
                                Explorar <IconArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-80">
                        <HeroVideoDialogDemo />
                    </div>
                </div>
                {/* Decorative blurs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />
            </motion.section>

            {/* Quick access cards */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
            >
                <h2 className="text-lg font-semibold text-white/70">
                    Acceso rápido
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((item, i) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <Link
                                to={item.path}
                                className="group block p-5 rounded-xl bg-white/[0.03] border border-white/5 
                                    hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                            >
                                <div
                                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} 
                                    flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                                >
                                    <span className="text-white">
                                        {item.icon}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                                    {item.label}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Stats section */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-3 gap-4"
            >
                {[
                    { label: "Páginas", value: "6", sub: "secciones activas" },
                    {
                        label: "Componentes",
                        value: "12+",
                        sub: "componentes UI",
                    },
                    { label: "Versión", value: "1.0", sub: "Electron App" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="text-center p-5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="text-2xl font-bold text-white/90">
                            {stat.value}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </motion.section>
        </div>
    );
};

export default Home;
