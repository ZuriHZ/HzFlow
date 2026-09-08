import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePomodoroStore } from "@/features/pomodoro/store/usePomodoroStore";

interface Props {
  onClose: () => void;
}

export default function PomodoroSettings({ onClose }: Props) {
  const focusDuration = usePomodoroStore((s) => s.focusDuration);
  const shortBreakDuration = usePomodoroStore((s) => s.shortBreakDuration);
  const longBreakDuration = usePomodoroStore((s) => s.longBreakDuration);
  const setFocusDuration = usePomodoroStore((s) => s.setFocusDuration);
  const setShortBreakDuration = usePomodoroStore((s) => s.setShortBreakDuration);
  const setLongBreakDuration = usePomodoroStore((s) => s.setLongBreakDuration);

  const [localFocus, setLocalFocus] = useState(focusDuration);
  const [localShort, setLocalShort] = useState(shortBreakDuration);
  const [localLong, setLocalLong] = useState(longBreakDuration);

  const handleApply = () => {
    setFocusDuration(localFocus);
    setShortBreakDuration(localShort);
    setLongBreakDuration(localLong);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-white/10 bg-[#1a1a2e]/95 p-4 shadow-xl backdrop-blur-md"
    >
      <h4 className="mb-3 text-xs font-semibold text-white/80">
        Configuración Pomodoro
      </h4>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-white/50">Enfoque</label>
            <span className="text-[11px] font-medium text-violet-400">
              {localFocus} min
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={60}
            value={localFocus}
            onChange={(e) => setLocalFocus(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-white/50">Descanso Corto</label>
            <span className="text-[11px] font-medium text-violet-400">
              {localShort} min
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={localShort}
            onChange={(e) => setLocalShort(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-white/50">Descanso Largo</label>
            <span className="text-[11px] font-medium text-violet-400">
              {localLong} min
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={30}
            value={localLong}
            onChange={(e) => setLocalLong(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-[11px] text-white/50 transition-colors hover:text-white/70"
        >
          Cancelar
        </button>
        <button
          onClick={handleApply}
          className="rounded-lg bg-violet-500 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-600"
        >
          Aplicar
        </button>
      </div>
    </motion.div>
  );
}
