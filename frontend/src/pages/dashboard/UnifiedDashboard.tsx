import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moduleLabels, projectModuleType, type ModuleType } from '../../modules/moduleProjects';
import { persistModuleProject } from '../../services/moduleDocuments';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { areaDefinitions, areaProgress, isSavedProject, type AreaId } from './areaModel';
import { useAreaDocuments } from './AreaDocuments';
import AreaPanel from './AreaPanel';
import './unifiedDashboard.css';
import { useDialogFocus } from '../../toolkit/useDialogFocus';
export default function UnifiedDashboard() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<ModuleType>('restaurant');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const retryId = useRef<string | null>(null);
  const lock = useRef(false);
  const dialogRef = useRef<HTMLFormElement>(null);
  useDialogFocus(dialogRef, params.get('create') === '1', () => { if (!lock.current) setParams({}); });
  const owned = store.cloudUserId === user?.id ? Object.values(store.projectsById) : [];
  const projects = owned.filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p));
  const legacy = owned.filter(p => !isSavedProject(p.id) || p.cloudPending);
  const project = projects.find(p => p.id === params.get('project')) ?? projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  useEffect(() => { if (user) void store.hydrateFromSupabase(user.id); }, [user?.id]);
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!user || !name.trim() || lock.current) return;
    lock.current = true; setCreating(true); setNotice('');
    try {
      const id = retryId.current ?? store.openProject({ name: name.trim(), industryKey: (type === 'restaurant' ? 'gastronomy' : type) as never, strategyProfile: { moduleType: type } });
      const next = useActiveProjectsStore.getState().getProjectById(id);
      if (!next) throw new Error('No se pudo preparar el proyecto.');
      retryId.current = id;
      await persistModuleProject(user.id, next);
      store.switchProject(id); retryId.current = null; setName('');
      navigate(`/modules/${type}/editor?project=${encodeURIComponent(id)}`);
    } catch (error) { setNotice((error as Error).message); }
    finally { lock.current = false; setCreating(false); }
  }
  return <section className="dashboard-home"><header className="world-intro"><span>Tu espacio de trabajo</span><h1>Hola, {user?.user_metadata?.display_name || 'emprendedora'}</h1><p>Elige un área. Un paso pequeño también cuenta.</p></header>
    {legacy.length > 0 && <details className="recovery-notice"><summary>{legacy.length} borrador(es) pendiente(s) de recuperación</summary><p>Estos borradores aún no están confirmados en la nube. Se conservan en este dispositivo; algunos usan IDs antiguos.</p><ul>{legacy.map(p => <li key={p.id}>{p.name} <button onClick={() => { const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `borrador-${p.id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Descargar respaldo</button></li>)}</ul></details>}
    {project ? <ProjectAreas key={project.id} projectId={project.id} type={projectModuleType(project)!} /> : <section className="dashboard-empty"><h2>Tu primer proyecto empieza aquí</h2><p>Elige un rubro y dale un nombre a tu negocio.</p><Link to="/dashboard?create=1">Crear proyecto</Link></section>}
    {params.get('create') === '1' && <div className="project-modal-backdrop"><form ref={dialogRef} className="project-modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onSubmit={create}><button type="button" className="project-modal-close" aria-label="Cerrar" onClick={() => { setParams(project ? { project: project.id } : {}); }}>×</button><h2 id="new-project-title">¿Qué negocio quieres explorar?</h2><label>Nombre de tu negocio<input autoFocus required maxLength={120} value={name} disabled={Boolean(retryId.current)} onChange={e => setName(e.target.value)} placeholder="Ej. Alfajores del Valle" /></label><fieldset disabled={Boolean(retryId.current) || creating}><legend>Rubro</legend><div className="project-type-grid">{(Object.keys(moduleLabels) as ModuleType[]).map(value => <label key={value} className={type === value ? 'is-selected' : ''}><input type="radio" name="business-type" checked={value === type} onChange={() => setType(value)} />{moduleLabels[value]}</label>)}</div></fieldset>{notice && <p role="alert">{notice}</p>}<button className="project-modal-submit" disabled={creating || !name.trim()}>{creating ? 'Guardando…' : retryId.current ? 'Reintentar guardado' : `Crear ${moduleLabels[type]}`}</button></form></div>}
  </section>;
}
function ProjectAreas({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry, reload } = useAreaDocuments(projectId, type);
  const [area, setArea] = useState<AreaId | null>(null);
  const completed = areaDefinitions.filter(a => areaProgress(entry?.tasks?.tasks ?? [], a.id).complete).length;
  return <>{entry?.error && <div role="alert" className="recovery-notice">{entry.error} <button onClick={() => void reload()}>Reintentar carga</button></div>}<div className="dashboard-areas">{areaDefinitions.map(a => { const progress = areaProgress(entry?.tasks?.tasks ?? [], a.id); return <button key={a.id} className={`dashboard-area dashboard-area-${a.id} area-open`} onClick={() => setArea(a.id)}><span className="area-icon">{a.accessory}</span><h2>{a.title}</h2><p>{a.pet} te ayuda a elegir el siguiente paso</p><progress max={100} value={progress.percent} aria-label={`Progreso de ${a.title}`} /><span>{entry?.loaded ? progress.total ? `${progress.completed} de ${progress.total} tareas` : 'Sin tareas' : 'Cargando tareas…'}</span><strong>Abrir espacio →</strong></button>; })}</div>{area && <AreaPanel key={area} projectId={projectId} type={type} area={area} />}<section className="dashboard-pro"><span>🚀</span><div><strong>{completed === 4 ? 'Tus cuatro áreas están al día' : 'Tu negocio, paso a paso'}</strong><p>{completed}/4 áreas completas. Las estadísticas básicas siempre están disponibles.</p><Link to={`/dashboard/tools/analytics?project=${projectId}`}>Ver estadísticas</Link></div></section><Link className="world-invitation" to={`/dashboard/world?project=${projectId}`}>🏝️ Visita tu isla y juega con tus mascotas →</Link></>;
}
