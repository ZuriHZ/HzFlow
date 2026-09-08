import React from "react";
import { useState } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";

import Sidebar from "@/components/layout/Sidebar";
import TitleBar from "@/components/layout/TitleBar";
import Footer from "@/components/layout/Footer";
import LoadingScreen from "@/components/shared/LoadingScreen";
import AudioManager from "@/features/audio/components/AudioManager";

import Blog from "@/pages/blog";
import Config from "@/pages/config";
import Extras from "@/pages/extras";
import Features from "@/pages/features";
import Home from "@/pages/home";
import Musica from "@/pages/musica";
import Noticias from "@/pages/noticias";
const Projects = React.lazy(() => import("@/pages/projects"));
const Bookmarks = React.lazy(() => import("@/pages/bookmarks"));
const Notes = React.lazy(() => import("@/pages/notes"));

export function MyRoutes() {
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    if (loading) {
        return <LoadingScreen onComplete={() => setLoading(false)} />;
    }

    const sidebarWidth = sidebarCollapsed ? 72 : 240;
    return (
        <Router>
            <div className="min-h-full bg-background text-foreground">
                <TitleBar />

                <div className="flex min-h-full w-full pt-10">
                    <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />

                    <main className="flex min-h-[calc(100vh-2.5rem)] flex-1 flex-col transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
                        <div className="flex-1 p-6">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/config" element={<Config />} />
                                <Route path="/noticias" element={<Noticias />} />
                                <Route path="/blog" element={<Blog />} />
                                <Route path="/features" element={<Features />} />
                                <Route path="/musica" element={<Musica />} />
                                <Route path="/extras" element={<Extras />} />
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/bookmarks" element={<Bookmarks />} />
                                <Route path="/notes" element={<Notes />} />
                            </Routes>
                        </div>
                        <Footer />
                    </main>
                </div>
                <AudioManager />
            </div>
        </Router>
    );
}
