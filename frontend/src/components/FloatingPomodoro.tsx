import { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';
import { usePomodoro } from '../contexts/PomodoroContext';
import './floatingPomodoro.css';

export default function FloatingPomodoro() {
  const [open, setOpen] = useState(false);
  const { remainingSeconds, running, completed } = usePomodoro();
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  return <aside className={`floating-pomodoro ${open ? 'is-open' : ''}`} aria-label="Pomodoro de enfoque">
    {open && <div className="floating-pomodoro-panel"><PomodoroTimer onComplete={() => undefined} /></div>}
    <button type="button" className="floating-pomodoro-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>
      <span aria-hidden="true">🍅</span>
      <span>{completed ? '¡Listo!' : `${minutes}:${seconds}`}</span>
      <small>{running ? 'En foco' : 'Pomodoro'}</small>
    </button>
  </aside>;
}
