import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type PomodoroTimerProps = {
  taskTitle?: string;
  durationSeconds?: number;
  onComplete: () => void;
};

export default function PomodoroTimer({
  taskTitle,
  durationSeconds = 25 * 60,
  onComplete,
}: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    setHasCompleted(false);
  }, [durationSeconds, taskTitle]);

  useEffect(() => {
    if (!isRunning || hasCompleted) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          setHasCompleted(true);
          onComplete();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasCompleted, isRunning, onComplete]);

  const progress = useMemo(() => {
    return Math.max(0, Math.min(1, 1 - remainingSeconds / durationSeconds));
  }, [durationSeconds, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  const circumference = 2 * Math.PI * 54;

  return (
    <section className={`foru-pomodoro ${isRunning ? 'is-running' : ''}`} aria-label="Pomodoro de enfoque">
      <div className="foru-pomodoro-ring">
        <svg viewBox="0 0 128 128" role="img" aria-label={`${minutes}:${seconds}`}>
          <circle cx="64" cy="64" r="54" className="foru-pomodoro-track" />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            className="foru-pomodoro-progress"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </svg>
        <div>
          <strong>{hasCompleted ? 'BINGO' : `${minutes}:${seconds}`}</strong>
          <span>{hasCompleted ? '+10 monedas' : '25 min'}</span>
        </div>
      </div>

      <div className="foru-pomodoro-copy">
        <span>{taskTitle ? 'Tarea activa' : 'Elige una tarea'}</span>
        <p>{taskTitle ?? 'Selecciona una tarea pendiente para empezar con calma.'}</p>
      </div>

      <div className="foru-pomodoro-actions">
        <button
          type="button"
          onClick={() => setIsRunning(true)}
          disabled={!taskTitle || isRunning || hasCompleted}
        >
          Empezar Pomodoro
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRunning(false);
            setRemainingSeconds(durationSeconds);
            setHasCompleted(false);
          }}
          disabled={!taskTitle || (!isRunning && remainingSeconds === durationSeconds && !hasCompleted)}
        >
          Reiniciar
        </button>
      </div>

      {isRunning ? <div className="foru-pomodoro-dim" aria-hidden="true" /> : null}
    </section>
  );
}
