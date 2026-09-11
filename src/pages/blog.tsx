import React from "react";
import { motion } from "framer-motion";
import { IconPencil, IconCalendar, IconArrowRight } from "@tabler/icons-react";

const blogPosts = [
    {
        title: "Construyendo mi primera app con Electron",
        excerpt:
            "Un viaje desde cero hasta crear una aplicación de escritorio funcional con React y Electron.",
        date: "15 Feb 2025",
        tag: "Tutorial",
        color: "from-violet-500 to-fuchsia-500",
    },
    {
        title: "Tailwind CSS v4: Lo que necesitas saber",
        excerpt:
            "Las novedades más importantes de Tailwind v4 y cómo migrar tu proyecto existente.",
        date: "10 Feb 2025",
        tag: "CSS",
        color: "from-cyan-500 to-blue-500",
    },
    {
        title: "Animaciones con Framer Motion",
        excerpt:
            "Cómo crear micro-animaciones fluidas que mejoran la experiencia de usuario en React.",
        date: "05 Feb 2025",
        tag: "React",
        color: "from-orange-500 to-amber-500",
    },
    {
        title: "TypeScript para principiantes",
        excerpt:
            "Guía desde los tipos básicos hasta genéricos avanzados — todo lo que necesitas para empezar.",
        date: "28 Ene 2025",
        tag: "TypeScript",
        color: "from-blue-500 to-indigo-500",
    },
];

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const Blog = () => {
    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <motion.div
                {...fadeUp}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-pink-400">
                        <IconPencil size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white/90">
                            Blog
                        </h1>
                        <p className="text-sm text-white/40">
                            Publicaciones y artículos
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Blog posts grid */}
            <div className="grid gap-4">
                {blogPosts.map((post, i) => (
                    <motion.article
                        key={post.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        className="group p-5 rounded-xl bg-white/3 border border-white/5 
                            hover:bg-white/6 hover:border-white/10 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`rounded-full bg-linear-to-r px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase ${post.color}`}
                                    >
                                        {post.tag}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-white/30">
                                        <IconCalendar size={12} />
                                        {post.date}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </div>
                            <div className="shrink-0 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconArrowRight
                                    size={18}
                                    className="text-white/40"
                                />
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default Blog;
