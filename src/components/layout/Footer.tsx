import React from "react";
import { FaGithub, FaHeart } from "react-icons/fa";
import PomodoroWidget from "@/features/pomodoro/components/PomodoroWidget";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border px-6 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>© {year} ZuriHZ — Desktop App</span>

                <PomodoroWidget />

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        Hecho con{" "}
                        <FaHeart className="text-[10px] text-fuchsia-400/70" />
                    </span>
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-foreground"
                    >
                        <FaGithub size={14} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
