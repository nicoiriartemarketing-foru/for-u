import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProjectSelector from '../components/shared/ProjectSelector';
import { loadModuleDocument, loadModuleProjects, saveModuleDocument } from '../services/moduleDocuments';
import { moduleLabels, type ModuleProject, type ModuleType } from './moduleProjects';
import type { ComponentType } from 'react';
import './moduleWorkspace.css';
import { ModuleDraftContext } from './useModuleDraft';
import { MediaScope } from '../components/shared/mediaScope';
export type ModuleConfiguration<T> = {
  type: ModuleType;
  create: (name: string) => T;
  parse: (value: unknown) => T;
  Dashboard: ComponentType<{ data: T; onChange: (data: T) => void; project?: ModuleProject; userId?: string }>;
  Editor: ComponentType<{ data: T; onChange: (data: T) => void; project?: ModuleProject; userId?: string }>;
  dashboardLabel: string;
  editorLabel: string;
  Publication?: ComponentType<{ data: T; userId: string; project: ModuleProject; disabled: boolean }>;
};

export default function ModuleWorkspace<T>({ config }: { config: ModuleConfiguration<T> }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [params] = useSearchParams();
  const projectId = params.get('project');
  const [projects, setProjects] = useState<ModuleProject[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const loadKey = `${userId ?? ''}:${config.type}:${attempt}`;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadModuleProjects(userId).then(value => { if (active) { setProjects(value.filter(project => project.type === config.type)); setError(''); setLoadedFor(loadKey); } })
      .catch(reason => { if (active) { setError(reason.message); setLoadedFor(loadKey); } });
    return () => { active = false; };
  }, [userId, loadKey, config.type]);
  if (loadedFor !== loadKey || !user) return <main className={`${config.type}-module module-workspace`}><p role="status">Cargando tus proyectos…</p></main>;
  if (error) return <main className={`${config.type}-module module-workspace`}><p role="alert">{error}</p><button onClick={() => setAttempt(value => value + 1)}>Reintentar</button><Link to="/workspace">Volver a mis proyectos</Link></main>;
  const current = projectId ? projects.find(project => project.id === projectId) : projects[0];
  if (!current) return <main className={`${config.type}-module module-workspace`}><h1>{projectId ? 'Proyecto no disponible' : 'Tu proyecto empieza aquí'}</h1><p>{projectId ? 'Elige un proyecto de este rubro para continuar.' : 'Crea un proyecto de este rubro desde tu tablero.'}</p><Link to="/workspace">Ir a mis proyectos</Link></main>;
  return <ModuleSession config={config} key={`${user.id}:${current.id}`} userId={user.id} project={current} projects={projects} />;
}

function ModuleSession<T>({ userId, project, projects, config }: { userId: string; project: ModuleProject; projects: ModuleProject[]; config: ModuleConfiguration<T> }) {
  const { Dashboard, Editor, Publication } = config;
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.pathname.endsWith('/editor');
  const [data, setData] = useState<T | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    loadModuleDocument(userId, project.id, config.type).then(document => {
      if (!active) return;
      const payload = document ? config.parse(document.payload) : config.create(project.name);
      setData(payload); setRevision(document?.revision ?? null); setDirty(false); setStatus('');
    }).catch(reason => { if (active) setStatus(reason.message); });
    return () => { active = false; };
  }, [userId, project.id, project.name, attempt, config]);
  useEffect(() => {
    if (!dirty && !pendingDraft) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty, pendingDraft]);
  function update(value: T) { setData(value); setDirty(true); setStatus('Tienes cambios sin guardar.'); }
  async function save() {
    if (!data || busy.current || pendingDraft) return;
    busy.current = true; setSaving(true);
    try {
      const nextRevision = await saveModuleDocument(userId, project.id, config.type, data, revision);
      setRevision(nextRevision); setDirty(false); setStatus('Guardado en tu cuenta.');
    } catch (reason) { setStatus((reason as Error).message); }
    finally { busy.current = false; setSaving(false); }
  }
  function leave(path: string) {
    if ((dirty || pendingDraft) && !window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?')) return;
    navigate(path);
  }
  function changeView(path: string) {
    if (saving) return;
    if (pendingDraft && !window.confirm('Hay un formulario sin aplicar. ¿Quieres descartarlo y cambiar de vista?')) return;
    navigate(path);
  }
  if (!data) return <main className={`${config.type}-module module-workspace`}><p role="status">{status || 'Cargando el proyecto…'}</p>{status && <button onClick={() => setAttempt(value => value + 1)}>Reintentar carga</button>}</main>;
  return <main className={`${config.type}-module module-workspace`}>
    <header className="module-header"><div><span>For U · {moduleLabels[config.type]}</span><h1>{project.name}</h1></div><button disabled={!dirty || saving || pendingDraft} onClick={save}>{saving ? 'Guardando…' : 'Guardar cambios'}</button></header>
    <p role="status">{status}</p>
    <button disabled={saving} onClick={() => { if ((!dirty && !pendingDraft) || window.confirm('Actualizar recupera los datos guardados y descarta los cambios pendientes. ¿Continuar?')) { setData(null); setAttempt(value => value + 1); } }}>Actualizar datos</button>
    {pendingDraft && <p role="status">Termina y aplica el formulario abierto, o cancélalo, antes de guardar el proyecto.</p>}
    <button disabled={saving} onClick={() => leave(`/content-creator?project=${encodeURIComponent(project.id)}`)}>Crear Contenido</button>
    <ProjectSelector projects={projects} value={project.id} disabled={saving} onChange={id => leave(`/modules/${config.type}${editing ? '/editor' : ''}?project=${encodeURIComponent(id)}`)} />
    <nav className="module-navigation" aria-label={moduleLabels[config.type]}><button disabled={saving} onClick={() => leave('/dashboard?view=projects')}>Mis proyectos</button><button disabled={saving} aria-current={editing ? undefined : 'page'} onClick={() => changeView(`/modules/${config.type}?project=${encodeURIComponent(project.id)}`)}>{config.dashboardLabel}</button><button disabled={saving} aria-current={editing ? 'page' : undefined} onClick={() => changeView(`/modules/${config.type}/editor?project=${encodeURIComponent(project.id)}`)}>{config.editorLabel}</button></nav>
    <fieldset className="module-editing-area" disabled={saving}>
      <ModuleDraftContext.Provider value={setPendingDraft}>
      <MediaScope.Provider value={{ userId, projectId: project.id }}>
      {editing ? <Editor data={data} onChange={update} project={project} userId={userId} /> : <Dashboard data={data} onChange={update} project={project} userId={userId} />}
      </MediaScope.Provider>
      </ModuleDraftContext.Provider>
    </fieldset>
    {Publication && <Publication data={data} userId={userId} project={project} disabled={dirty || pendingDraft || saving} />}
  </main>;
}
