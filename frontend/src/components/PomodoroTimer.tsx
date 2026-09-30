import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePomodoro } from '../contexts/PomodoroContext';

type PomodoroTimerProps = {
  taskTitle?: string;
  durationSeconds?: number;
  onComplete: () => void;
};

export default function PomodoroTimer({
  taskTitle = 'Una cosa a la vez',
  durationSeconds = 25 * 60,
  onComplete,
}: PomodoroTimerProps) {
  const { remainingSeconds, running: isRunning, completed: hasCompleted, start, pause, reset } = usePomodoro();
  const completionReported = useRef(false);
  useEffect(() => {
    if (hasCompleted && !completionReported.current) {
      completionReported.current = true;
      onComplete();
    }
    if (!hasCompleted) completionReported.current = false;
  }, [hasCompleted, onComplete]);

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
          onClick={() => start(remainingSeconds || durationSeconds)}
          disabled={isRunning}
        >
          {isRunning ? 'En foco' : hasCompleted ? 'Empezar otro Pomodoro' : 'Empezar Pomodoro'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isRunning) pause(); else reset();
          }}
          disabled={!isRunning && remainingSeconds === durationSeconds && !hasCompleted}
        >
          {isRunning ? 'Pausar' : 'Reiniciar'}
        </button>
      </div>

      {isRunning ? <div className="foru-pomodoro-dim" aria-hidden="true" /> : null}
    </section>
  );
}
