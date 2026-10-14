import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Tooltip } from '../../components/ui/DesignSystem';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ModuleType } from '../../modules/moduleProjects';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { taskTools, knownTaskTool, sameTask } from './workspaceFocusModel';
import { useAreaDocuments } from './AreaDocuments';
import { areaDefinitions, areaProgress, areaToolPath, mascotMessage, rewardTask, type AreaId } from './areaModel';

export default function AreaPanel({ projectId, type, area, play = false, initialTaskId }: { projectId: string; type: ModuleType; area: AreaId; play?: boolean; initialTaskId?: string }) {
  const { setAreaColor } = usePomodoro();
  useEffect(() => { setAreaColor(areaDefinitions.find(value => value.id === area)!.color); }, [area, setAreaColor]);
  const { entry, change, save, reload } = useAreaDocuments(projectId, type);
  const { state: focus, toggle, remember, save: saveFocus } = useWorkspaceFocus();
  const [title, setTitle] = useState('');
  const [tool, setTool] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId ?? null);
  useEffect(() => { if (initialTaskId) setSelectedTaskId(initialTaskId); }, [initialTaskId]);
  const [mode, setMode] = useState<'work' | 'play'>(play ? 'play' : 'work');
  const [reaction, setReaction] = useState('');
  const [reactionId, setReactionId] = useState(0);
  const reactTo = (message: string) => { setReaction(message); setReactionId(value => value + 1); };
  const [found, setFound] = useState<number[]>([]);
  const meta = areaDefinitions.find(a => a.id === area)!;
  if (!entry?.loaded) return <section className="area-panel"><p role="status">{entry?.error || 'Preparando tus tareas…'}</p>{entry?.error && <DSButtonSecondary onClick={() => void reload()}>Reintentar carga</DSButtonSecondary>}</section>;
  const tasks = entry.tasks.tasks.filter(t => t.area === area);
  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const visibleTasks = showAll ? tasks : [...tasks].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 3);
  const state = entry.world.areas[area] ?? { decoration: 0, searchReward: false, taskReward: false };
  const suggestion = mascotMessage(area, type, entry.tasks.tasks);
  const progress = areaProgress(entry.tasks.tasks, area);
  const tools: Record<AreaId, [string, string][]> = { marketing: [['Mi perfil y publicaciones', 'profile'], ['Mi propuesta', 'proposal'], ['Diseñar para redes', 'creator'], ['Plantillas', 'landing&page=templates'], ['IA para contenido', 'content'], ['Teleprompter', 'teleprompter']], finance: [['Editar oferta', 'editor'], ['Ver resumen', 'summary']], logistics: [['Calendario', 'calendar'], ['Disponibilidad', 'summary']], operations: [...(type === 'restaurant' ? [['Pedidos internos', 'orders'] as [string,string]] : []), ['Reservas', 'bookings'], ['WhatsApp y respuestas', 'automation']] };
  const toolHelp: Record<string, string> = {
    profile: 'Organiza bio, destacados y piezas sin modificar Instagram.',
    creator: 'Crea piezas gráficas para redes sociales y expórtalas como imagen.',
    'landing&page=templates': 'Explora estilos para la página de tu negocio.',
    content: 'Prepara propuestas de contenido con IA y revísalas antes de usarlas.',
    teleprompter: 'Lee tu guion mientras preparas o grabas un video.',
    editor: 'Edita la oferta de este proyecto: productos, habitaciones, experiencias o cursos.',
    summary: 'Consulta el resumen y las herramientas operativas de este proyecto.',
    calendar: 'Planifica actividades y consulta tu agenda sin necesitar una conexión externa.',
    bookings: 'Revisa los pedidos o reservas registrados para este proyecto.',
    automation: 'Configura los mensajes y las opciones de contacto disponibles para tu negocio.',
  };
  const rememberTool = (task: { id: string; tool?: string }) => { if (knownTaskTool(task.tool)) remember({ projectId, area, taskId: task.id, tool: task.tool }); };
  const updateWorld = (value: Partial<typeof state>) => change({ world: { ...entry.world, areas: { ...entry.world.areas, [area]: { ...state, ...value } } } });
  return <section className="area-panel" style={{ '--area-color': meta.color } as React.CSSProperties}>
    <header><div><small>{meta.pet} te acompaña</small><h2>{meta.title}</h2></div><span>{progress.total ? `${progress.completed}/${progress.total} tareas` : 'Sin tareas'}</span></header>
    <p>{suggestion.message}</p>
    <div className="area-tabs"><DSButtonSecondary aria-pressed={mode === 'work'} onClick={() => setMode('work')}>Avanzar</DSButtonSecondary><DSButtonSecondary aria-pressed={mode === 'play'} onClick={() => setMode('play')}>Descansar</DSButtonSecondary></div>
    {entry.historical && <small>Las barras ahora se calculan con tus tareas. Tus marcas anteriores se conservan.</small>}
    <fieldset disabled={entry.busy}>
    {mode === 'work' ? <>
      <div className="area-task-summary" aria-label="Resumen de pasos"><strong>{progress.percent}% completado</strong><span>{progress.completed} completados · {progress.total - progress.completed} pendientes</span><progress max={progress.total || 1} value={progress.completed} aria-label={`Pasos completados de ${meta.title}`} /></div>
      {selectedTask && <section className="area-task-detail" aria-label="Proceso de la tarea"><header><h3>{selectedTask.title}</h3><DSButtonSecondary type="button" onClick={() => setSelectedTaskId(null)} aria-label="Cerrar detalle de tarea">×</DSButtonSecondary></header><p>{selectedTask.done ? 'Este paso está completado. Puedes revisar su herramienta o desmarcarlo para retomarlo.' : 'Este paso está pendiente. Avanza en su herramienta y marca la tarea cuando hayas terminado.'}</p><DSInput label="Nombre del paso" info="Ajusta este paso a tu negocio. Guarda las tareas para conservar el cambio." value={selectedTask.title} maxLength={200} onChange={event => change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(task => task.id === selectedTask.id ? { ...task, title: event.target.value } : task) } })} />{knownTaskTool(selectedTask.tool) ? <Link onClick={() => rememberTool(selectedTask)} to={areaToolPath(selectedTask.tool, type, projectId)}>Abrir herramienta de este paso →</Link> : <p>Este es un paso personalizado. Puedes realizarlo fuera de la app y marcarlo como completado en la lista.</p>}<label className="task-tool-select">Herramienta del paso<select value={knownTaskTool(selectedTask.tool) ? selectedTask.tool : ''} onChange={event => change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(task => task.id === selectedTask.id ? { ...task, tool: event.target.value || undefined } : task) } })}><option value="">Paso fuera de la app</option>{taskTools.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><DSButtonSecondary disabled={!focus.loaded || focus.busy || entry.dirty || entry.taskRevision === null || (!focus.data.today.some(ref => sameTask(ref, { projectId, taskId: selectedTask.id })) && focus.data.today.length >= 3)} onClick={() => toggle({ projectId, taskId: selectedTask.id })}>{focus.data.today.some(ref => sameTask(ref, { projectId, taskId: selectedTask.id })) ? 'Quitar de Hoy' : 'Elegir para Hoy'}</DSButtonSecondary>{(entry.dirty || entry.taskRevision === null) && <small>Guarda las tareas antes de elegir este paso para Hoy.</small>}{focus.dirty && <DSButtonSecondary disabled={focus.busy} onClick={() => void saveFocus()}>Guardar enfoque</DSButtonSecondary>}</section>}
      <ul className="area-task-list">{visibleTasks.map(task => <li key={task.id}><DSInput type="checkbox" aria-label={`Completar ${task.title}`} checked={task.done} onChange={() => change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(t => t.id === task.id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } : t) }, world: !task.done ? rewardTask(entry.world, area) : entry.world })} /><DSButtonSecondary type="button" className="area-task-open" aria-expanded={selectedTaskId === task.id} tooltip="Consulta el estado de este paso y abre su herramienta." onClick={() => setSelectedTaskId(task.id)}>{task.title}<small>{task.done ? '✓ Completada' : 'Pendiente'}</small></DSButtonSecondary>{knownTaskTool(task.tool) && <Link onClick={() => rememberTool(task)} aria-label={`Abrir herramienta: ${task.title}`} to={areaToolPath(task.tool, type, projectId)}>Abrir</Link>}<DSButtonSecondary aria-label={`Eliminar ${task.title}`} onClick={() => { if (window.confirm('¿Eliminar esta tarea?')) change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.filter(t => t.id !== task.id) } }); }}>×</DSButtonSecondary></li>)}</ul>
      <div className="area-tabs">{tasks.length > 3 && <DSButtonSecondary onClick={() => setShowAll(value => !value)}>{showAll ? 'Ver tres próximos pasos' : `Ver todas las tareas (${tasks.length})`}</DSButtonSecondary>}</div><form className="area-add" onSubmit={event => { event.preventDefault(); if (!title.trim()) return; change({ tasks: { ...entry.tasks, tasks: [...entry.tasks.tasks, { id: crypto.randomUUID(), area, title: title.trim(), tool: tool || undefined, done: false, createdAt: new Date().toISOString() }] } }); setTitle(''); setTool(''); }}><DSInput aria-label="Nueva tarea" placeholder="Un paso pequeño…" value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /><label className="task-tool-select">Herramienta (opcional)<select value={tool} onChange={event => setTool(event.target.value)}><option value="">Paso fuera de la app</option>{taskTools.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><DSButtonSecondary>Añadir</DSButtonSecondary></form>
      <div className="area-tools">{area === 'marketing' && <>
        <Tooltip text="Crea o revisa tu página con una guía de cinco pasos."><Link to={`/dashboard/tools/landing?project=${projectId}&wizard=1`}>✨ Crear landing paso a paso →</Link></Tooltip>
        <Tooltip text="Abre tu borrador para editar textos, agregar bloques de tu rubro y arrastrar secciones."><Link to={`/dashboard/tools/landing?project=${projectId}`}>Editar mi página →</Link></Tooltip>
      </>}{tools[area].map(([label, tool]) => <Tooltip key={label} text={toolHelp[tool]}><Link to={tool.includes('&') ? `/dashboard/tools/landing?project=${projectId}&page=templates` : areaToolPath(tool, type, projectId)}>{label} →</Link></Tooltip>)}</div>
    </> : <>
      <div className={`pet-playground decoration-${state.decoration}`}><span className="pet-decoration">{['🌿', '🌸', '⭐'][state.decoration]}</span><div key={reactionId} className={`pet-friend ${reaction ? 'pet-react' : ''}`} aria-label={`Mascota ${meta.pet}`}><span className="pet-ears">● ●</span><span className="pet-face">● ᴗ ●</span><span>{meta.accessory}</span></div><p role="status">{reaction || 'Aquí puedes jugar sin terminar ninguna tarea.'}</p></div>
      <div className="area-tabs"><DSButtonSecondary onClick={() => reactTo('¡Qué gusto verte! ♡')}>Acariciar</DSButtonSecondary><DSButtonSecondary onClick={() => reactTo('¡Ñam! Gracias por compartir un snack conmigo.')}>Dar un snack</DSButtonSecondary></div>
      <h3>Busca tres tesoros</h3><p>Sin prisa. Encuentra la concha, la flor y la estrella.</p><div className="pet-search" aria-label="Escena de búsqueda"><span aria-hidden="true">🌳 🪨 🌱 🌊</span>{['🐚', '🌼', '⭐'].map((item, index) => <DSButtonSecondary key={item} className={`treasure treasure-${index}`} disabled={found.includes(index)} aria-label={`Encontrar ${['concha', 'flor', 'estrella'][index]}`} onClick={() => { const next = [...found, index]; setFound(next); if (next.length === 3) { updateWorld({ searchReward: true }); reactTo('¡Encontraste los tres! Ya puedes elegir las flores para decorar.'); } }}>{found.includes(index) ? '✓' : item}</DSButtonSecondary>)}</div>{found.length === 3 && <DSButtonSecondary onClick={() => setFound([])}>Volver a jugar</DSButtonSecondary>}
      <h3>Tu rincón</h3><div className="area-tabs">{['Planta', 'Flores', 'Estrella'].map((label, index) => <DSButtonSecondary key={label} aria-pressed={state.decoration === index} disabled={index === 1 ? !state.searchReward : index === 2 ? !state.taskReward : false} onClick={() => updateWorld({ decoration: index })}>{label}{index === 1 && !state.searchReward ? ' · encuentra tesoros' : index === 2 && !state.taskReward ? ' · completa una tarea' : ''}</DSButtonSecondary>)}</div>
    </>}
    </fieldset>
    <footer className="area-save"><DSButtonSecondary disabled={(!entry.dirty && entry.taskRevision !== null) || entry.busy || entry.tasks.tasks.some(t => !t.title.trim())} onClick={() => void save()}>{entry.busy ? 'Guardando…' : 'Guardar tareas y mundo'}</DSButtonSecondary><span role="status">{entry.error || (entry.dirty ? 'Tienes cambios sin guardar.' : entry.taskRevision ? 'Guardado en tu cuenta.' : 'Guía inicial. Puedes guardarla o adaptarla a tu negocio.')}</span>{entry.error && <DSButtonSecondary onClick={() => { if (window.confirm('Recargar descarta cambios locales y recupera lo guardado. ¿Continuar?')) void reload(); }}>Recargar datos</DSButtonSecondary>}</footer>
  </section>;
}
