import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react";
import { usePomodoro } from "@/features/pomodoro/hooks/usePomodoro";
import PomodoroSettings from "@/features/pomodoro/components/PomodoroSettings";

const MODES = [
  { key: "focus" as const, label: "Enfoque" },
  { key: "shortBreak" as const, label: "Descanso" },
  { key: "longBreak" as const, label: "Largo" },
];

export default function PomodoroWidget() {
  const {
    mode,
    isRunning,
    formattedTime,
    progress,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => switchMode(m.key)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              mode === m.key
                ? "bg-violet-500/20 text-violet-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={48} height={48} className="-rotate-90">
          <circle
            cx={24}
            cy={24}
            r={20}
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={3}
          />
          <motion.circle
            cx={24}
            cy={24}
            r={20}
            fill="transparent"
            stroke="#8b5cf6"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute text-xs font-semibold text-white/90">
          {formattedTime}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-white transition-colors hover:bg-violet-600"
        >
          {isRunning ? (
            <IconPlayerPause size={14} />
          ) : (
            <IconPlayerPlay size={14} className="ml-0.5" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/15 hover:text-white/80"
        >
          <IconRefresh size={14} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/15 hover:text-white/80"
        >
          <IconSettings size={14} />
        </button>
      </div>

      <span className="ml-1 whitespace-nowrap text-[10px] text-white/40">
        {sessionsCompleted}/8
      </span>

      <AnimatePresence>
        {showSettings && (
          <PomodoroSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
