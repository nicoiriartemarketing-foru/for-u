import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { moduleLabels, projectModuleType, type ModuleType } from '../../modules/moduleProjects';
import { loadModuleProjects, persistModuleProject } from '../../services/moduleDocuments';
import type { ForUIndustryKey } from '../../templates/industryTemplates';
import './moduleProjects.css';
const World3D = lazy(() => import('../World3D'));
const industryForModule: Record<ModuleType, ForUIndustryKey> = { restaurant: 'gastronomy', ecommerce: 'handmade', hospitality: 'services', tourism: 'tourism', courses: 'education' };
const descriptions: Record<ModuleType, string> = { restaurant: 'Menú, recetas e inventario', ecommerce: 'Catálogo, carrito y ventas', hospitality: 'Habitaciones, reservas y huéspedes', tourism: 'Tours, itinerarios y reservas', courses: 'Lecciones, alumnos y contenido' };

export default function ModuleProjects() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const projectsById = useActiveProjectsStore(state => state.projectsById);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  const coins = useActiveProjectsStore(state => state.coins);
  const streak = useActiveProjectsStore(state => state.dailyStreak);
  const hydrate = useActiveProjectsStore(state => state.hydrateFromSupabase);
  const [attempt, setAttempt] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const loadKey = `${userId ?? ''}:${attempt}`;
  const loaded = loadedFor === loadKey;
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [world, setWorld] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ModuleType>('restaurant');
  const [unsynced, setUnsynced] = useState<string | null>(null);
  const submitting = useRef(false);
  const projects = cloudUserId === userId ? Object.values(projectsById) : [];
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try { await hydrate(userId); await loadModuleProjects(userId); if (active) { setLoadedFor(loadKey); setMessage(''); } }
      catch (error) { if (active) setMessage((error as Error).message); }
    })();
    return () => { active = false; };
  }, [userId, hydrate, loadKey]);
  function open(id: string) {
    const project = projectsById[id]; if (!project) return;
    useActiveProjectsStore.getState().switchProject(id);
    const module = projectModuleType(project);
    navigate(module ? `/modules/${module}?project=${encodeURIComponent(id)}` : '/workspace');
  }
  async function sync(id: string) {
    if (!userId || submitting.current) return;
    submitting.current = true; setCreating(true);
    try {
      const project = useActiveProjectsStore.getState().getProjectById(id);
      if (!project) throw new Error('Proyecto no encontrado.');
      await persistModuleProject(userId, project);
      if (useActiveProjectsStore.getState().cloudUserId !== userId) return;
      setUnsynced(null); setName(''); setFormOpen(false); setMessage('Proyecto guardado en tu cuenta.');
    } catch (error) { setUnsynced(id); setMessage((error as Error).message); }
    finally { submitting.current = false; setCreating(false); }
  }
  async function create(event: FormEvent) {
    event.preventDefault(); if (!name.trim() || submitting.current || unsynced || !loaded || cloudUserId !== userId) return;
    const store = useActiveProjectsStore.getState();
    const before = new Set(Object.keys(store.projectsById));
    const id = store.openProject({ name: name.trim(), industryKey: industryForModule[type], strategyProfile: { moduleType: type } });
    if (!id || before.has(id)) { setMessage(useActiveProjectsStore.getState().planLimitNotice?.message ?? 'No se pudo crear el proyecto.'); return; }
    await sync(id);
  }
  return <main className="module-projects">
    <header><div><span>FOR U</span><h1>Mis proyectos</h1><p>Elige el negocio con el que quieres avanzar hoy.</p></div><details><summary>Mi espacio</summary><nav><Link to="/workspace">Mi ruta y herramientas</Link><Link to="/dashboard?view=studio">Estudio de contenido anterior</Link><button onClick={() => setWorld(value => !value)}>{world ? 'Ver proyectos' : 'Ver mis islas'}</button><span>{coins} monedas · {streak} días de racha</span></nav></details></header>
    <p role="status">{message || (!loaded ? 'Cargando tus proyectos…' : '')}</p>
    {!loaded && message && <button onClick={() => setAttempt(value => value + 1)}>Reintentar carga</button>}
    {unsynced && <button disabled={creating} onClick={() => sync(unsynced)}>Reintentar sincronización del proyecto</button>}
    {loaded && <>
      {projects.some(project => projectModuleType(project)) && <Link className="module-create-content" to="/content-creator">Crear Contenido</Link>}
      {world ? <Suspense fallback={<p>Cargando tus islas…</p>}><World3D onBackToMap={() => setWorld(false)} onOpenProject={open} /></Suspense> : <div className="module-project-grid">{projects.map(project => {
        const module = projectModuleType(project);
        return <article key={project.id} className={`module-project-card module-project-${module ?? 'general'}`}><span>{module ? moduleLabels[module] : 'Proyecto'}</span><h2>{project.name}</h2><p>{module ? descriptions[module] : 'Tu Ruta Digital'}</p><button disabled={creating || project.id === unsynced} onClick={() => open(project.id)}>Abrir {project.name}</button></article>;
      })}</div>}
      {!formOpen && <button className="module-create-project" disabled={!!unsynced} onClick={() => setFormOpen(true)}>Crear nuevo proyecto</button>}
      {formOpen && <form onSubmit={create}><h2>Un nuevo proyecto</h2><label>Nombre del proyecto<input required maxLength={120} value={name} onChange={event => setName(event.target.value)} /></label><label>Rubro<select value={type} onChange={event => setType(event.target.value as ModuleType)}>{Object.entries(moduleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="module-project-actions"><button type="submit" disabled={creating || !!unsynced}>{creating ? 'Guardando proyecto…' : 'Crear proyecto'}</button><button type="button" disabled={creating} onClick={() => setFormOpen(false)}>Cancelar</button></div></form>}
    </>}
  </main>;
}
