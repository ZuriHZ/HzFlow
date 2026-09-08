import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroStore {
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsCompleted: number;
  totalFocusTime: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  tick: () => void;
  completeSession: () => void;
  setFocusDuration: (min: number) => void;
  setShortBreakDuration: (min: number) => void;
  setLongBreakDuration: (min: number) => void;
}

let tickInterval: ReturnType<typeof setInterval> | null = null;

function getDurationForMode(mode: TimerMode, state: PomodoroStore): number {
  switch (mode) {
    case "focus":
      return state.focusDuration * 60;
    case "shortBreak":
      return state.shortBreakDuration * 60;
    case "longBreak":
      return state.longBreakDuration * 60;
  }
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      mode: "focus",
      isRunning: false,
      timeLeft: 25 * 60,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsCompleted: 0,
      totalFocusTime: 0,

      startTimer: () => {
        if (tickInterval) clearInterval(tickInterval);
        set({ isRunning: true });
        tickInterval = setInterval(() => {
          const state = get();
          if (state.isRunning) {
            state.tick();
          }
        }, 1000);
      },

      pauseTimer: () => {
        if (tickInterval) {
          clearInterval(tickInterval);
          tickInterval = null;
        }
        set({ isRunning: false });
      },

      resetTimer: () => {
        if (tickInterval) {
          clearInterval(tickInterval);
          tickInterval = null;
        }
        const state = get();
        set({
          isRunning: false,
          timeLeft: getDurationForMode(state.mode, state),
        });
      },

      switchMode: (mode) => {
        if (tickInterval) {
          clearInterval(tickInterval);
          tickInterval = null;
        }
        const state = get();
        set({
          mode,
          isRunning: false,
          timeLeft: getDurationForMode(mode, state),
        });
      },

      tick: () => {
        const state = get();
        if (state.timeLeft <= 1) {
          state.completeSession();
        } else {
          set({ timeLeft: state.timeLeft - 1 });
        }
      },

      completeSession: () => {
        const state = get();
        if (tickInterval) {
          clearInterval(tickInterval);
          tickInterval = null;
        }

        if (state.mode === "focus") {
          const newSessions = state.sessionsCompleted + 1;
          const newTotalFocus = state.totalFocusTime + state.focusDuration * 60;
          const nextMode: TimerMode =
            newSessions % 4 === 0 ? "longBreak" : "shortBreak";

          set({
            sessionsCompleted: newSessions,
            totalFocusTime: newTotalFocus,
            mode: nextMode,
            isRunning: false,
            timeLeft: getDurationForMode(nextMode, state),
          });
        } else {
          set({
            mode: "focus",
            isRunning: false,
            timeLeft: getDurationForMode("focus", state),
          });
        }
      },

      setFocusDuration: (min) => {
        const state = get();
        set({
          focusDuration: min,
          timeLeft: state.mode === "focus" ? min * 60 : state.timeLeft,
        });
      },

      setShortBreakDuration: (min) => {
        const state = get();
        set({
          shortBreakDuration: min,
          timeLeft: state.mode === "shortBreak" ? min * 60 : state.timeLeft,
        });
      },

      setLongBreakDuration: (min) => {
        const state = get();
        set({
          longBreakDuration: min,
          timeLeft: state.mode === "longBreak" ? min * 60 : state.timeLeft,
        });
      },
    }),
    {
      name: "pomodoro-storage",
      partialize: (state) => ({
        mode: state.mode,
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsCompleted: state.sessionsCompleted,
        totalFocusTime: state.totalFocusTime,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<PomodoroStore>;
        const merged = { ...current, ...persistedState };
        merged.timeLeft = getDurationForMode(merged.mode, merged);
        return merged;
      },
    }
  )
);
