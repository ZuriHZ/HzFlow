import React from "react";
import { FaGithub, FaHeart } from "react-icons/fa";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full py-4 px-6 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-white/30">
                <span>© {year} ZuriHZ — Electron App</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        Hecho con{" "}
                        <FaHeart className="text-fuchsia-400/70 text-[10px]" />
                    </span>
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/60 transition-colors"
                    >
                        <FaGithub size={14} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
