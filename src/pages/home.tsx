import { MorphingText } from "@/components/magicui/morphing-text";
import { HeroVideoDialogDemo } from "@/components/shared/HeroDialog";
import {
    IconArrowRight,
    IconMusic,
    IconNews,
    IconPencil,
    IconRocket,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";



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
        <div className="flex flex-col gap-8">
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="bg-hero-surface relative overflow-hidden rounded-2xl p-6 md:p-8"
            >
                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-4">
                        <p className="max-w-md text-lg leading-relaxed text-white/50">
                            Tu centro de control personal. Explora noticias, lee
                            el blog, descubre proyectos y disfruta de tu música
                            favorita.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Link
                                to="/features"
                                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25"
                            >
                                Explorar <IconArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    <div className="w-full shrink-0 md:w-80">
                        <HeroVideoDialogDemo />
                    </div>
                </div>
                <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-fuchsia-600/10 blur-[80px]" />
            </motion.section>

            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
            >
                <h2 className="text-lg font-semibold text-white/70">
                    Acceso rápido
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {quickLinks.map((item, i) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <Link
                                to={item.path}
                                className="group block rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
                            >
                                <div
                                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${item.color} transition-transform group-hover:scale-110`}
                                >
                                    <span className="text-white">
                                        {item.icon}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-white/70 transition-colors group-hover:text-white">
                                    {item.label}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

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
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center"
                    >
                        <div className="text-2xl font-bold text-white/90">
                            {stat.value}
                        </div>
                        <div className="mt-1 text-xs text-white/40">
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </motion.section>
        </div>
    );
};

export default Home;
