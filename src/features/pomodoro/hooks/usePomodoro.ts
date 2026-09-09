import { useMemo } from "react";
import { usePomodoroStore } from "@/features/pomodoro/store/usePomodoroStore";

const MODE_LABELS: Record<string, string> = {
  focus: "Enfoque",
  shortBreak: "Descanso Corto",
  longBreak: "Descanso Largo",
};

export function usePomodoro() {
  const mode = usePomodoroStore((s) => s.mode);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const timeLeft = usePomodoroStore((s) => s.timeLeft);
  const sessionsCompleted = usePomodoroStore((s) => s.sessionsCompleted);
  const focusDuration = usePomodoroStore((s) => s.focusDuration);

  const startTimer = usePomodoroStore((s) => s.startTimer);
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer);
  const resetTimer = usePomodoroStore((s) => s.resetTimer);
  const switchMode = usePomodoroStore((s) => s.switchMode);

  const totalTime = useMemo(() => {
    const store = usePomodoroStore.getState();
    switch (mode) {
      case "focus":
        return store.focusDuration * 60;
      case "shortBreak":
        return store.shortBreakDuration * 60;
      case "longBreak":
        return store.longBreakDuration * 60;
    }
  }, [mode, focusDuration]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  const progress = useMemo(() => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  }, [timeLeft, totalTime]);

  const modeLabel = MODE_LABELS[mode] ?? "Enfoque";

  return {
    mode,
    isRunning,
    timeLeft,
    formattedTime,
    progress,
    modeLabel,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  };
}
