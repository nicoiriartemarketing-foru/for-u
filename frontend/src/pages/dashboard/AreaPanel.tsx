import { usePomodoro } from '../../contexts/PomodoroContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ModuleType } from '../../modules/moduleProjects';
import { useAreaDocuments } from './AreaDocuments';
import { areaDefinitions, areaProgress, areaToolPath, mascotMessage, rewardTask, type AreaId } from './areaModel';

export default function AreaPanel({ projectId, type, area, play = false }: { projectId: string; type: ModuleType; area: AreaId; play?: boolean }) {
  const { setAreaColor } = usePomodoro();
  useEffect(() => { setAreaColor(areaDefinitions.find(value => value.id === area)!.color); }, [area, setAreaColor]);
  const { entry, change, save, reload } = useAreaDocuments(projectId, type);
  const [title, setTitle] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [mode, setMode] = useState<'work' | 'play'>(play ? 'play' : 'work');
  const [reaction, setReaction] = useState('');
  const [reactionId, setReactionId] = useState(0);
  const reactTo = (message: string) => { setReaction(message); setReactionId(value => value + 1); };
  const [found, setFound] = useState<number[]>([]);
  const meta = areaDefinitions.find(a => a.id === area)!;
  if (!entry?.loaded) return <section className="area-panel"><p role="status">{entry?.error || 'Preparando tus tareas…'}</p>{entry?.error && <button onClick={() => void reload()}>Reintentar carga</button>}</section>;
  const tasks = entry.tasks.tasks.filter(t => t.area === area);
  const visibleTasks = showAll ? tasks : [...tasks].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 3);
  const state = entry.world.areas[area] ?? { decoration: 0, searchReward: false, taskReward: false };
  const suggestion = mascotMessage(area, type, entry.tasks.tasks);
  const progress = areaProgress(entry.tasks.tasks, area);
  const tools: Record<AreaId, [string, string][]> = { marketing: [['Editor visual', 'creator'], ['Plantillas', 'landing&page=templates'], ['IA para contenido', 'content'], ['Teleprompter', 'teleprompter']], finance: [['Editar oferta', 'editor'], ['Ver resumen', 'summary']], logistics: [['Calendario', 'calendar'], ['Disponibilidad', 'summary']], operations: [['Pedidos y reservas', 'bookings'], ['WhatsApp y respuestas', 'automation']] };
  const updateWorld = (value: Partial<typeof state>) => change({ world: { ...entry.world, areas: { ...entry.world.areas, [area]: { ...state, ...value } } } });
  return <section className="area-panel" style={{ '--area-color': meta.color } as React.CSSProperties}>
    <header><div><small>{meta.pet} te acompaña</small><h2>{meta.title}</h2></div><span>{progress.total ? `${progress.completed}/${progress.total} tareas` : 'Sin tareas'}</span></header>
    <p>{suggestion.message}</p>
    <div className="area-tabs"><button aria-pressed={mode === 'work'} onClick={() => setMode('work')}>Avanzar</button><button aria-pressed={mode === 'play'} onClick={() => setMode('play')}>Descansar</button></div>
    {entry.historical && <small>Las barras ahora se calculan con tus tareas. Tus marcas anteriores se conservan.</small>}
    <fieldset disabled={entry.busy}>
    {mode === 'work' ? <>
      <ul className="area-task-list">{visibleTasks.map(task => <li key={task.id}><input type="checkbox" aria-label={`Completar ${task.title}`} checked={task.done} onChange={() => change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(t => t.id === task.id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } : t) }, world: !task.done ? rewardTask(entry.world, area) : entry.world })} /><input aria-label="Título de tarea" value={task.title} maxLength={200} onChange={event => { const value = event.target.value; change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(t => t.id === task.id ? { ...t, title: value } : t) } }); }} />{task.tool && <Link aria-label={`Abrir herramienta: ${task.title}`} to={areaToolPath(task.tool, type, projectId)}>Abrir</Link>}<button aria-label={`Eliminar ${task.title}`} onClick={() => { if (window.confirm('¿Eliminar esta tarea?')) change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.filter(t => t.id !== task.id) } }); }}>×</button></li>)}</ul>
      <div className="area-tabs">{tasks.length > 3 && <button onClick={() => setShowAll(value => !value)}>{showAll ? 'Ver tres próximos pasos' : `Ver todas las tareas (${tasks.length})`}</button>}</div><form className="area-add" onSubmit={event => { event.preventDefault(); if (!title.trim()) return; change({ tasks: { ...entry.tasks, tasks: [...entry.tasks.tasks, { id: crypto.randomUUID(), area, title: title.trim(), done: false, createdAt: new Date().toISOString() }] } }); setTitle(''); }}><input aria-label="Nueva tarea" placeholder="Un paso pequeño…" value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /><button>Añadir</button></form>
      <div className="area-tools">{tools[area].map(([label, tool]) => <Link key={label} to={tool.includes('&') ? `/dashboard/tools/landing?project=${projectId}&page=templates` : areaToolPath(tool, type, projectId)}>{label} →</Link>)}</div>
    </> : <>
      <div className={`pet-playground decoration-${state.decoration}`}><span className="pet-decoration">{['🌿', '🌸', '⭐'][state.decoration]}</span><div key={reactionId} className={`pet-friend ${reaction ? 'pet-react' : ''}`} aria-label={`Mascota ${meta.pet}`}><span className="pet-ears">● ●</span><span className="pet-face">● ᴗ ●</span><span>{meta.accessory}</span></div><p role="status">{reaction || 'Aquí puedes jugar sin terminar ninguna tarea.'}</p></div>
      <div className="area-tabs"><button onClick={() => reactTo('¡Qué gusto verte! ♡')}>Acariciar</button><button onClick={() => reactTo('¡Ñam! Gracias por compartir un snack conmigo.')}>Dar un snack</button></div>
      <h3>Busca tres tesoros</h3><p>Sin prisa. Encuentra la concha, la flor y la estrella.</p><div className="pet-search" aria-label="Escena de búsqueda"><span aria-hidden="true">🌳 🪨 🌱 🌊</span>{['🐚', '🌼', '⭐'].map((item, index) => <button key={item} className={`treasure treasure-${index}`} disabled={found.includes(index)} aria-label={`Encontrar ${['concha', 'flor', 'estrella'][index]}`} onClick={() => { const next = [...found, index]; setFound(next); if (next.length === 3) { updateWorld({ searchReward: true }); reactTo('¡Encontraste los tres! Ya puedes elegir las flores para decorar.'); } }}>{found.includes(index) ? '✓' : item}</button>)}</div>{found.length === 3 && <button onClick={() => setFound([])}>Volver a jugar</button>}
      <h3>Tu rincón</h3><div className="area-tabs">{['Planta', 'Flores', 'Estrella'].map((label, index) => <button key={label} aria-pressed={state.decoration === index} disabled={index === 1 ? !state.searchReward : index === 2 ? !state.taskReward : false} onClick={() => updateWorld({ decoration: index })}>{label}{index === 1 && !state.searchReward ? ' · encuentra tesoros' : index === 2 && !state.taskReward ? ' · completa una tarea' : ''}</button>)}</div>
    </>}
    </fieldset>
    <footer className="area-save"><button disabled={(!entry.dirty && entry.taskRevision !== null) || entry.busy || entry.tasks.tasks.some(t => !t.title.trim())} onClick={() => void save()}>{entry.busy ? 'Guardando…' : 'Guardar tareas y mundo'}</button><span role="status">{entry.error || (entry.dirty ? 'Tienes cambios sin guardar.' : entry.taskRevision ? 'Guardado en tu cuenta.' : 'Guía inicial. Puedes guardarla o adaptarla a tu negocio.')}</span>{entry.error && <button onClick={() => { if (window.confirm('Recargar descarta cambios locales y recupera lo guardado. ¿Continuar?')) void reload(); }}>Recargar datos</button>}</footer>
  </section>;
}
