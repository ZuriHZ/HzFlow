import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Layout
import TitleBar from "./components/layout/TitleBar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/home";
import Config from "./pages/config";
import Noticias from "./pages/noticias";
import Blog from "./pages/blog";
import Features from "./pages/features";
import Musica from "./pages/musica";
import Extras from "./pages/extras";

// Shared
import LoadingScreen from "./components/shared/LoadingScreen";

function App() {
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    if (loading) {
        return <LoadingScreen onComplete={() => setLoading(false)} />;
    }

    const sidebarWidth = sidebarCollapsed ? 72 : 240;

    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-app-bg">
                {/* Title bar (Electron window controls) */}
                <TitleBar />

                <div className="flex flex-1 pt-10 w-full">
                    {/* Sidebar navigation */}
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed((p) => !p)}
                    />

                    {/* Main content area */}
                    <main
                        className="flex-1 flex flex-col min-h-[calc(100vh-2.5rem)] transition-all duration-300"
                        style={{ marginLeft: sidebarWidth }}
                    >
                        <div className="flex-1 p-6 pt-8 overflow-y-auto w-full">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/config" element={<Config />} />
                                <Route
                                    path="/noticias"
                                    element={<Noticias />}
                                />
                                <Route path="/blog" element={<Blog />} />
                                <Route
                                    path="/features"
                                    element={<Features />}
                                />
                                <Route path="/musica" element={<Musica />} />
                                <Route path="/extras" element={<Extras />} />
                            </Routes>
                        </div>
                        <Footer />
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
