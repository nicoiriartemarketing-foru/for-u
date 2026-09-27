import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProjectSelector from '../../components/shared/ProjectSelector';
import { loadModuleDocument, loadModuleProjects, saveModuleDocument } from '../../services/moduleDocuments';
import type { ModuleProject } from '../moduleProjects';
import RestaurantEditor from './RestaurantEditor';
import RestaurantDashboard from './RestaurantDashboard';
import { emptyRestaurant, type RestaurantData } from './model';

export default function RestaurantWorkspace() {
  const { user } = useAuth();
  const userId = user?.id;
  const [params] = useSearchParams();
  const projectId = params.get('project');
  const [projects, setProjects] = useState<ModuleProject[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadModuleProjects(userId).then(value => { if (active) { setProjects(value.filter(project => project.type === 'restaurant')); setError(''); setLoaded(true); } })
      .catch(reason => { if (active) { setError(reason.message); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, attempt]);
  if (error) return <main className="restaurant-module module-workspace"><p role="alert">{error}</p><button onClick={() => setAttempt(value => value + 1)}>Reintentar</button><Link to="/workspace">Volver a mis proyectos</Link></main>;
  if (!loaded || !user) return <main className="restaurant-module module-workspace"><p role="status">Cargando tus restaurantes…</p></main>;
  const current = projectId ? projects.find(project => project.id === projectId) : projects[0];
  if (!current) return <main className="restaurant-module module-workspace"><h1>{projectId ? 'Proyecto no disponible' : 'Tu restaurante empieza aquí'}</h1><p>{projectId ? 'Elige un restaurante de tu cuenta para continuar.' : 'Crea un proyecto de gastronomía para abrir tu menú y recetas.'}</p><Link to="/workspace">Ir a mis proyectos</Link></main>;
  return <RestaurantSession key={`${user.id}:${current.id}`} userId={user.id} project={current} projects={projects} />;
}

function RestaurantSession({ userId, project, projects }: { userId: string; project: ModuleProject; projects: ModuleProject[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.pathname.endsWith('/editor');
  const [data, setData] = useState<RestaurantData | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    loadModuleDocument(userId, project.id, 'restaurant').then(document => {
      if (!active) return;
      const payload = document?.payload as RestaurantData | undefined;
      if (payload && (payload.version !== 1 || !Array.isArray(payload.dishes) || !Array.isArray(payload.inventory) || !Array.isArray(payload.recipes) || !Array.isArray(payload.sections) || !Array.isArray(payload.preparations) || !payload.settings || !Array.isArray(payload.settings.faq))) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
      setData(payload ?? emptyRestaurant(project.name)); setRevision(document?.revision ?? null); setStatus('');
    }).catch(reason => { if (active) setStatus(reason.message); });
    return () => { active = false; };
  }, [userId, project.id, project.name, attempt]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  function update(value: RestaurantData) { setData(value); setDirty(true); setStatus('Tienes cambios sin guardar.'); }
  async function save() {
    if (!data || busy.current) return;
    busy.current = true; setSaving(true);
    try {
      const nextRevision = await saveModuleDocument(userId, project.id, 'restaurant', data, revision);
      setRevision(nextRevision); setDirty(false); setStatus('Guardado en tu cuenta.');
    } catch (reason) { setStatus((reason as Error).message); }
    finally { busy.current = false; setSaving(false); }
  }
  function leave(path: string) {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?')) return;
    navigate(path);
  }
  if (!data) return <main className="restaurant-module module-workspace"><p role="status">{status || 'Cargando menú y recetas…'}</p>{status && <button onClick={() => setAttempt(value => value + 1)}>Reintentar carga</button>}</main>;
  return <main className="restaurant-module module-workspace">
    <header className="module-header"><div><span>For U · Restaurante</span><h1>{project.name}</h1></div><button disabled={!dirty || saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar cambios'}</button></header>
    <p role="status">{status}</p>
    <ProjectSelector projects={projects} value={project.id} disabled={saving} onChange={id => leave(`/modules/restaurant${editing ? '/editor' : ''}?project=${encodeURIComponent(id)}`)} />
    <nav className="restaurant-actions" aria-label="Restaurante"><button disabled={saving} onClick={() => leave('/workspace')}>Mis proyectos</button><Link aria-current={editing ? undefined : 'page'} to={`/modules/restaurant?project=${encodeURIComponent(project.id)}`}>Logística y recetas</Link><Link aria-current={editing ? 'page' : undefined} to={`/modules/restaurant/editor?project=${encodeURIComponent(project.id)}`}>Menú y secciones</Link></nav>
    <fieldset className="module-editing-area" disabled={saving}>
      {editing ? <RestaurantEditor data={data} onChange={update} /> : <RestaurantDashboard data={data} onChange={update} />}
    </fieldset>
  </main>;
}
