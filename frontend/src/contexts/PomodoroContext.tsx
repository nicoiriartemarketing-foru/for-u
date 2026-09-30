import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type PomodoroState = {
  endsAt: number | null;
  pausedRemaining: number | null;
  completed: boolean;
};

type PomodoroContextValue = {
  remainingSeconds: number;
  running: boolean;
  completed: boolean;
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

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (state.endsAt && state.endsAt <= now) {
      setState(current => current.endsAt && current.endsAt <= Date.now()
        ? { endsAt: null, pausedRemaining: 0, completed: true }
        : current);
    }
  }, [now, state.endsAt]);

  const remainingSeconds = state.endsAt
    ? Math.max(0, Math.ceil((state.endsAt - now) / 1000))
    : state.pausedRemaining ?? defaultSeconds;
  const value = useMemo<PomodoroContextValue>(() => ({
    remainingSeconds,
    running: Boolean(state.endsAt),
    completed: state.completed,
    start(seconds = remainingSeconds || defaultSeconds) {
      setState({ endsAt: Date.now() + seconds * 1000, pausedRemaining: null, completed: false });
    },
    pause() {
      setState(current => current.endsAt
        ? { endsAt: null, pausedRemaining: Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000)), completed: false }
        : current);
    },
    reset() { setState({ endsAt: null, pausedRemaining: null, completed: false }); },
  }), [remainingSeconds, state.completed, state.endsAt]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const value = useContext(PomodoroContext);
  if (!value) throw new Error('El Pomodoro necesita su proveedor.');
  return value;
}
