import { playUiTone } from '../lib/sound';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type PomodoroState = {
  endsAt: number | null;
  pausedRemaining: number | null;
  completed: boolean;
  totalSeconds?: number;
};

type PomodoroContextValue = {
  remainingSeconds: number;
  running: boolean;
  completed: boolean;
  totalSeconds: number;
  areaColor: string;
  setAreaColor: (color: string) => void;
  start: (seconds?: number) => void;
  pause: () => void;
  reset: () => void;
};

const defaultSeconds = 25 * 60;
const storageKey = 'foru:pomodoro-v1';
const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function readState(): PomodoroState {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || 'null') as PomodoroState | null;
    if (value && (typeof value.endsAt === 'number' || value.endsAt === null)) return value;
  } catch { /* Start a clean session when an older value cannot be read. */ }
  return { endsAt: null, pausedRemaining: null, completed: false };
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PomodoroState>(readState);
  const [now, setNow] = useState(Date.now());
  const [areaColor, setAreaColor] = useState('#2563eb');
  const notifiedEnd = useRef<number | null>(null);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* The timer still works when browser storage is unavailable. */ }
  }, [state]);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (state.endsAt && state.endsAt <= now) {
      if (notifiedEnd.current !== state.endsAt) {
        notifiedEnd.current = state.endsAt;
        try { playUiTone('success'); } catch { /* Audio is optional. */ }
      }
      setState(current => current.endsAt && current.endsAt <= Date.now()
        ? { ...current, endsAt: null, pausedRemaining: 0, completed: true }
        : current);
    }
  }, [now, state.endsAt]);

  const remainingSeconds = state.endsAt
    ? Math.max(0, Math.ceil((state.endsAt - now) / 1000))
    : state.pausedRemaining ?? defaultSeconds;
  const value = useMemo<PomodoroContextValue>(() => ({
    remainingSeconds,
    totalSeconds: state.totalSeconds || defaultSeconds,
    areaColor,
    setAreaColor,
    running: Boolean(state.endsAt),
    completed: state.completed,
    start(seconds = remainingSeconds || defaultSeconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      try { playUiTone('tap'); } catch { /* The browser may disable audio. */ }
      setNow(Date.now());
      setState({ endsAt: Date.now() + seconds * 1000, pausedRemaining: null, completed: false, totalSeconds: state.pausedRemaining !== null && !state.completed ? state.totalSeconds || defaultSeconds : seconds });
    },
    pause() {
      setState(current => current.endsAt
        ? { ...current, endsAt: null, pausedRemaining: Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000)), completed: false }
        : current);
    },
    reset() { setState({ endsAt: null, pausedRemaining: null, completed: false }); },
  }), [remainingSeconds, state.completed, state.endsAt, state.totalSeconds, state.pausedRemaining, areaColor]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const value = useContext(PomodoroContext);
  if (!value) throw new Error('El Pomodoro necesita su proveedor.');
  return value;
}
