import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moduleLabels, projectModuleType, type ModuleType } from '../../modules/moduleProjects';
import { loadModuleDocument, loadModuleProjects, persistModuleProject, saveModuleDocument } from '../../services/moduleDocuments';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import './unifiedDashboard.css';

type AreaId = 'marketing' | 'finance' | 'logistics' | 'operations';
type Progress = Partial<Record<AreaId, boolean>>;
const areas: Array<{ id: AreaId; emoji: string; title: string; description: string }> = [
  { id: 'marketing', emoji: '🔵', title: 'Marketing', description: 'Crea, diseña y comparte.' },
  { id: 'finance', emoji: '🟢', title: 'Finanzas', description: 'Ordena tu oferta y sus precios.' },
  { id: 'logistics', emoji: '🟠', title: 'Logística', description: 'Planifica tu semana y tu inventario.' },
  { id: 'operations', emoji: '🟣', title: 'Operaciones', description: 'Responde y recibe pedidos.' },
];
const industries: Record<ModuleType, string> = {
  restaurant: 'gastronomy', ecommerce: 'ecommerce', hospitality: 'hospitality', tourism: 'tourism', courses: 'courses',
};
const productLabels: Record<ModuleType, string> = {
  restaurant: 'Platos', ecommerce: 'Productos', hospitality: 'Habitaciones', tourism: 'Experiencias', courses: 'Cursos',
};

function modulePath(type: ModuleType, projectId: string, editor = false) {
  return `/modules/${type}${editor ? '/editor' : ''}?project=${encodeURIComponent(projectId)}`;
}

export default function UnifiedDashboard() {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const hydrate = useActiveProjectsStore(state => state.hydrateFromSupabase);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  const projectsById = useActiveProjectsStore(state => state.projectsById);
  const activeProjectId = useActiveProjectsStore(state => state.activeProjectId);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(params.get('create') === '1');
  const [name, setName] = useState('');
  const [type, setType] = useState<ModuleType>('restaurant');
  const [creating, setCreating] = useState(false);
  const [unsyncedProject, setUnsyncedProject] = useState<{ id: string; type: ModuleType } | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [progressRevision, setProgressRevision] = useState<string | null>(null);
  const creatingRef = useRef(false);
  const projects = useMemo(() => cloudUserId === userId ? Object.values(projectsById).filter(project => projectModuleType(project)) : [], [cloudUserId, projectsById, userId]);
  const requested = params.get('project');
  const project = projects.find(item => item.id === requested) ?? projects.find(item => item.id === activeProjectId) ?? projects[0];
  const projectType = project ? projectModuleType(project) : null;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try { await hydrate(userId); await loadModuleProjects(userId); if (active) setNotice(''); }
      catch (error) { if (active) setNotice((error as Error).message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [hydrate, userId]);
  useEffect(() => {
    if (!project || !userId) { setProgress({}); setProgressRevision(null); return; }
    let active = true;
    loadModuleDocument(userId, project.id, 'dashboard-progress').then(document => {
      const payload = document?.payload as Progress | undefined;
      if (active) { setProgress(payload ?? {}); setProgressRevision(document?.revision ?? null); }
    }).catch(error => { if (active) setNotice((error as Error).message); });
    return () => { active = false; };
  }, [project?.id, userId]);

  function selectProject(id: string) {
    useActiveProjectsStore.getState().switchProject(id);
    setParams(current => { current.set('project', id); current.delete('create'); return current; });
  }
  function openCreator() {
    if (project) navigate(`/content-creator?project=${encodeURIComponent(project.id)}`);
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!userId || !name.trim() || creatingRef.current) return;
    creatingRef.current = true; setCreating(true); setNotice('');
    const existing = unsyncedProject;
    const id = existing?.id ?? useActiveProjectsStore.getState().openProject({ name: name.trim(), industryKey: industries[type] as never, strategyProfile: { moduleType: type } });
    const newProject = useActiveProjectsStore.getState().getProjectById(id);
    const createdType = existing?.type ?? type;
    try {
      if (!id || !newProject) throw new Error('No se pudo preparar el proyecto.');
      await persistModuleProject(userId, newProject);
      useActiveProjectsStore.getState().switchProject(id);
      setCreateOpen(false); setName(''); setUnsyncedProject(null);
      navigate(modulePath(createdType, id, true));
    } catch (error) {
      if (id) setUnsyncedProject({ id, type: createdType });
      setNotice((error as Error).message || 'Tu proyecto está listo en este dispositivo. Reintenta el guardado antes de abrirlo.');
    } finally { creatingRef.current = false; setCreating(false); }
  }
  async function toggleProgress(area: AreaId) {
    if (!userId || !project) return;
    const next = { ...progress, [area]: !progress[area] };
    setProgress(next);
    try { setProgressRevision(await saveModuleDocument(userId, project.id, 'dashboard-progress', next, progressRevision)); }
    catch (error) { setProgress(progress); setNotice((error as Error).message); }
  }
  const completed = areas.filter(area => progress[area.id]).length;
  const toolLink = (tool: string) => project ? `/dashboard/tools/${tool}?project=${encodeURIComponent(project.id)}` : '/dashboard';

  if (loading) return <main className="unified-dashboard-loading">Cargando tu tablero…</main>;
  return <main className="unified-dashboard">
    <aside className="dashboard-sidebar" aria-label="Navegación principal">
      <Link className="dashboard-logo" to="/dashboard">FOR U</Link>
      <button className="dashboard-create" type="button" onClick={() => setCreateOpen(true)}>＋ Crear nuevo proyecto</button>
      <nav>
        <Link to={toolLink('images')}>📤 Uploads</Link>
        <Link to={toolLink('calendar')}>📅 Calendario</Link>
        <Link to={project && projectType ? modulePath(projectType, project.id, true) : '/dashboard'}>🍽️ {projectType ? productLabels[projectType] : 'Platos'}</Link>
        <Link to={toolLink('analytics')}>📊 Estadísticas</Link>
        <Link to={project && projectType ? modulePath(projectType, project.id) : '/dashboard'}>⚙️ Configuración</Link>
      </nav>
      <button className="dashboard-signout" type="button" onClick={() => { void signOut(); navigate('/login'); }}>Salir</button>
    </aside>
    <section className="dashboard-content">
      <header className="dashboard-topbar">
        <div><span>Tu espacio de trabajo</span><h1>Hola, {user?.user_metadata?.display_name || 'emprendedora'}</h1></div>
        <label>Proyecto activo<select value={project?.id ?? ''} onChange={event => selectProject(event.target.value)}><option value="">Elige un proyecto</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name} · {moduleLabels[projectModuleType(item) as ModuleType]}</option>)}</select></label>
      </header>
      {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      {!project ? <section className="dashboard-empty"><h2>Empieza con un proyecto</h2><p>Elige un rubro y tendrás un espacio básico para explorarlo.</p><button type="button" onClick={() => setCreateOpen(true)}>Crear mi primer proyecto</button></section> : <>
        <p className="dashboard-project-intro">{project.name} · {moduleLabels[projectType as ModuleType]}. Elige solo un bloque para avanzar ahora.</p>
        <div className="dashboard-areas">
          {areas.map(area => <AreaCard key={area.id} area={area} complete={Boolean(progress[area.id])} onComplete={() => void toggleProgress(area.id)} project={project} projectType={projectType as ModuleType} onCreator={openCreator} toolLink={toolLink} />)}
        </div>
        <section className="dashboard-pro"><span>🚀</span><div><strong>Modo Pro</strong><p>Completa las 4 áreas para desbloquear estadísticas avanzadas.</p></div><b>{completed}/4</b></section>
      </>}
    </section>
    {createOpen && <div className="project-modal-backdrop" role="presentation"><form className="project-modal" onSubmit={create} role="dialog" aria-modal="true" aria-labelledby="project-modal-title"><button className="project-modal-close" type="button" onClick={() => setCreateOpen(false)} aria-label="Cerrar">×</button><span>Nuevo proyecto</span><h2 id="project-modal-title">¿Qué negocio quieres explorar?</h2><label>Nombre de tu negocio<input autoFocus required maxLength={120} value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Alfajores del Valle" disabled={Boolean(unsyncedProject)} /></label><fieldset disabled={Boolean(unsyncedProject)}><legend>Rubro</legend><div className="project-type-grid">{(Object.keys(moduleLabels) as ModuleType[]).map(item => <label key={item} className={type === item ? 'is-selected' : ''}><input type="radio" name="type" value={item} checked={type === item} onChange={() => setType(item)} /><span>{moduleLabels[item]}</span></label>)}</div></fieldset>{unsyncedProject && <p role="status">Tu proyecto ya fue creado. Reintentaremos guardarlo sin duplicarlo.</p>}<button className="project-modal-submit" disabled={creating || (!unsyncedProject && !name.trim())}>{creating ? 'Guardando…' : unsyncedProject ? 'Reintentar guardado' : `Crear ${moduleLabels[type]}`}</button></form></div>}
  </main>;
}

function AreaCard({ area, complete, onComplete, project, projectType, onCreator, toolLink }: { area: typeof areas[number]; complete: boolean; onComplete: () => void; project: { id: string }; projectType: ModuleType; onCreator: () => void; toolLink: (tool: string) => string }) {
  const editor = modulePath(projectType, project.id, true);
  const dashboard = modulePath(projectType, project.id);
  const links: Record<AreaId, Array<{ label: string; to?: string; action?: () => void }>> = {
    marketing: [{ label: 'Editor visual', action: onCreator }, { label: 'Plantillas', to: `/content-creator?project=${encodeURIComponent(project.id)}` }, { label: 'IA para contenido', to: toolLink('content') }, { label: 'Teleprompter', to: toolLink('teleprompter') }],
    finance: [{ label: 'Editar oferta', to: editor }, { label: 'Ver resumen', to: dashboard }],
    logistics: [{ label: 'Calendario', to: toolLink('calendar') }, { label: 'Inventario y agenda', to: dashboard }],
    operations: [{ label: 'Pedidos y reservas', to: toolLink('bookings') }, { label: 'WhatsApp y respuestas', to: toolLink('automation') }],
  };
  return <article className={`dashboard-area dashboard-area-${area.id}`}><div className="dashboard-area-heading"><span>{area.emoji}</span><div><h2>{area.title}</h2><p>{area.description}</p></div></div><div className="dashboard-progress"><i style={{ width: complete ? '100%' : '0%' }} /><span>{complete ? 'Listo' : 'Por empezar'}</span></div><div className="dashboard-area-links">{links[area.id].map(link => link.to ? <Link key={link.label} to={link.to}>{link.label} →</Link> : <button key={link.label} type="button" onClick={link.action}>{link.label} →</button>)}</div><button className="dashboard-complete" type="button" onClick={onComplete}>{complete ? 'Marcar pendiente' : 'Marcar área lista'}</button></article>;
}
