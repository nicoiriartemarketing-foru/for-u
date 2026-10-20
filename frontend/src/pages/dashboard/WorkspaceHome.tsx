import '../../toolkit/professionalEditor.css';
import { Link } from 'react-router-dom';
import { ButtonSecondary as Button } from '../../components/ui/DesignSystem';
import type { ForUActiveProject } from '../../stores/useActiveProjectsStore';
import { moduleLabels, projectModuleType } from '../../modules/moduleProjects';
import { areaDefinitions } from './areaModel';
import { useAreaDocuments } from './AreaDocuments';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { projectDestination, taskDestination, resumePath, sameTask, type TaskReference } from './workspaceFocusModel';

export function FocusStatus() {
  const { state, save, reload } = useWorkspaceFocus();
  if ((!state.loaded && !state.error)||(!state.dirty&&!state.busy&&!state.error)) return null;
  return <div className="focus-status" role={state.error ? 'alert' : 'status'}>
    <span>{state.error || (state.busy ? 'Guardando enfoque…' : state.dirty ? 'Tu enfoque tiene cambios sin guardar.' : state.revision ? 'Enfoque guardado en tu cuenta.' : 'Elige hasta tres pasos para Hoy.')}</span>
    {state.loaded && state.dirty && <Button disabled={state.busy} onClick={() => void save()}>Guardar enfoque</Button>}
    {state.error && <Button disabled={state.busy} onClick={() => { if (!state.dirty || window.confirm('Recargar recuperará el enfoque guardado y descartará estos cambios de enfoque. ¿Continuar?')) void reload(); }}>Recargar enfoque</Button>}
  </div>;
}

export default function WorkspaceHome({ projects }: { projects: ForUActiveProject[] }) {
  const { state } = useWorkspaceFocus();
  return <>
    <section className="workspace-today magic-card" aria-labelledby="today-heading">
      <header><div><small>UN PASO A TU RITMO</small><h2 id="today-heading">Hoy</h2></div><span>{state.data.today.length}/3 pasos</span></header>
      <p>No necesitas hacerlo todo. Elige tus prioridades entre tus proyectos.</p>
      {!state.loaded ? <p role="status">{state.error ? 'Tu enfoque no está disponible. Puedes continuar con tus proyectos.' : 'Cargando tu enfoque…'}</p> : <>
        {!state.data.today.length && <p className="focus-empty">Aún no elegiste pasos. Puedes seleccionarlos aquí o desde un área.</p>}
        <ul className="focus-list">{state.data.today.map(ref => {
          const project = projects.find(p => p.id === ref.projectId);
          return project ? <TodayTask key={`${ref.projectId}:${ref.taskId}`} reference={ref} project={project} /> : <UnavailableTask key={`${ref.projectId}:${ref.taskId}`} reference={ref} />;
        })}</ul>
        <details className="focus-picker"><summary>Elegir mis pasos de Hoy</summary>{projects.map(project => <ProjectTaskPicker key={project.id} project={project} />)}</details>
      </>}
    </section>
    <section className="workspace-projects" aria-labelledby="projects-heading"><header><h2 id="projects-heading">Mis proyectos</h2><Link className="pe-action-link pe-action-primary" to="/dashboard?create=1">＋ Crear proyecto</Link></header><div className="workspace-project-grid">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
  </>;
}
function ProjectCard({ project }: { project: ForUActiveProject }) {
  const type = projectModuleType(project)!;
  const { entry } = useAreaDocuments(project.id, type);
  const { state, remember } = useWorkspaceFocus();
  const last = projectDestination(state.data, project.id);
  const saved = entry?.loaded && entry.taskRevision !== null;
  return <article className="workspace-project-card magic-card"><small>{moduleLabels[type]}</small><h3>{project.name}</h3><p>{entry?.error ? 'No se pudo consultar el progreso.' : saved ? `${entry.tasks.tasks.filter(t => t.done).length} de ${entry.tasks.tasks.length} pasos completados${entry.dirty ? ' · cambios pendientes' : ''}` : entry?.loaded ? 'Tu guía inicial está lista para adaptar.' : 'Cargando progreso…'}</p><nav aria-label={`Acciones de ${project.name}`}><Link className="pe-action-link pe-action-primary" to={resumePath(last, type)} onClick={() => remember(last)}>Continuar →</Link><Link className="pe-action-link" to={`/creator-studio?project=${project.id}`} onClick={() => remember({ projectId: project.id, tool: 'studio' })}>Creator Studio</Link></nav></article>;
}
function UnavailableTask({ reference, title = 'Este paso ya no está disponible o pertenece a un proyecto que no se pudo cargar.' }: { reference: TaskReference; title?: string }) {
  const { state, toggle } = useWorkspaceFocus();
  return <li><span>{title}</span><Button disabled={state.busy} onClick={() => toggle(reference)}>Quitar de Hoy</Button></li>;
}
function TodayTask({ reference, project }: { reference: TaskReference; project: ForUActiveProject }) {
  const type = projectModuleType(project)!;
  const { entry, reload } = useAreaDocuments(project.id, type);
  const { state, toggle, remember } = useWorkspaceFocus();
  if (!entry?.loaded || entry.error) return <li><span>{project.name} · {entry?.error ? 'No se pudo cargar este paso.' : 'Cargando paso…'}</span>{entry?.error && <Button onClick={() => { if (!entry.dirty || window.confirm('Recargar descartará los cambios de tareas sin guardar. ¿Continuar?')) void reload(); }}>Reintentar</Button>}</li>;
  const task = entry.tasks.tasks.find(t => t.id === reference.taskId);
  if (!task) return <UnavailableTask reference={reference} title={`${project.name} · Este paso ya no está en la lista.`} />;
  const work = taskDestination(project.id, task);
  return <li><div><small>{project.name} · {areaDefinitions.find(a => a.id === task.area)?.title}</small><Link to={resumePath(work, type)} onClick={() => remember(work)}>{task.title}</Link><span>{task.done ? '✓ Completado' : 'Pendiente'}{entry.dirty ? ' · cambios sin guardar' : ''}</span></div><Button disabled={state.busy} onClick={() => toggle(reference)}>Quitar</Button></li>;
}
function ProjectTaskPicker({ project }: { project: ForUActiveProject }) {
  const { entry } = useAreaDocuments(project.id, projectModuleType(project)!);
  const { state, toggle } = useWorkspaceFocus();
  const canSelect = entry?.loaded && entry.taskRevision !== null && !entry.dirty && !entry.busy && !entry.error;
  return <details><summary>{project.name}</summary>{!canSelect ? <p>Guarda o recupera las tareas en <Link to={`/dashboard?project=${project.id}`}>las áreas de este proyecto</Link> antes de elegirlas.</p> : <ul>{entry.tasks.tasks.filter(task => !task.done || state.data.today.some(ref => sameTask(ref, { projectId: project.id, taskId: task.id }))).map(task => {
    const ref = { projectId: project.id, taskId: task.id };
    const selected = state.data.today.some(other => sameTask(ref, other));
    return <li key={task.id}><label><input type="checkbox" checked={selected} disabled={state.busy || (!selected && state.data.today.length >= 3)} onChange={() => toggle(ref)} />{task.title}</label></li>;
  })}</ul>}</details>;
}
