import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { useAuth } from '../../contexts/AuthContext';
import { useAreaDocuments } from './AreaDocuments';
import type { ModuleType } from '../../modules/moduleProjects';
import { projectModuleType } from '../../modules/moduleProjects';
import { areaDefinitions, areaProgress, isSavedProject, type AreaId } from './areaModel';
import AreaPanel from './AreaPanel';
const WorldScene = lazy(() => import('./WorldScene'));
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function WorldPage() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const [area, setArea] = useState<AreaId | null>(null);
  const [lite, setLite] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const sceneFailed = useCallback(() => { setSceneError(true); setLite(true); }, []);
  const [zoom, setZoom] = useState(34);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(!document.hidden);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p)) : [];
  const project = projects.find(p => p.id === params.get('project')) ?? projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  useEffect(() => { const change = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change); }, []);
  if (!project) return <section className="world-intro"><h1>Tu mundo empieza con una isla</h1><p>Cada proyecto guardado tendrá su propio lugar.</p><Link to="/dashboard?create=1">Crear mi primera isla</Link></section>;
  const select = (id: string) => { store.switchProject(id); setParams({ project: id }); setArea(null); };
  const fallback = <div className="world-lite"><span aria-hidden="true">⛵</span><h2>{project.name}</h2><p>{sceneError ? 'La escena 3D no respondió. Puedes usar todos los espacios y juegos en esta vista ligera.' : 'Vista ligera. Todos los espacios y juegos siguen disponibles.'}</p></div>;
  return <section className="world-page"><header className="world-intro"><span>Un lugar para tus ideas</span><h1>Mi pequeño mundo</h1><p>Navega a tu isla. Avanza un poco o juega con tus compañeros.</p><div className="world-options"><label><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} /> Vista ligera</label><label><input type="checkbox" checked={reduced} onChange={e => setReduced(e.target.checked)} /> Reducir movimiento</label></div></header><nav className="world-island-picker" aria-label="Viajar entre islas">{projects.map(p => <button key={p.id} aria-pressed={p.id === project.id} onClick={() => select(p.id)}>🏝️ {p.name}</button>)}</nav>
    {!lite && <div className="area-tabs"><button aria-label="Alejar la isla" disabled={zoom <= 24} onClick={() => setZoom(v => v - 5)}>− Alejar</button><button aria-label="Acercar la isla" disabled={zoom >= 49} onClick={() => setZoom(v => v + 5)}>＋ Acercar</button></div>}
    {lite ? fallback : <SceneBoundary fallback={fallback}><Suspense fallback={<div className="world-lite">Preparando el mar…</div>}><WorldScene projects={projects} activeId={project.id} onSelect={select} onArea={setArea} reduced={reduced} visible={visible} onFailure={sceneFailed} zoom={zoom} /></Suspense></SceneBoundary>}
    <WorldAreas projectId={project.id} type={projectModuleType(project)!} area={area} onArea={setArea} />
    {area && <div className="world-panel" key={`${project.id}:${area}`}><button onClick={() => setArea(null)}>Cerrar espacio</button><AreaPanel projectId={project.id} type={projectModuleType(project)!} area={area} /></div>}
  </section>;
}

function WorldAreas({ projectId, type, area, onArea }: { projectId: string; type: ModuleType; area: AreaId | null; onArea: (area: AreaId) => void }) {
  const { entry } = useAreaDocuments(projectId, type);
  return <nav className="world-area-picker" aria-label="Espacios de la isla">{areaDefinitions.map(a => {
    const progress = areaProgress(entry?.tasks?.tasks ?? [], a.id);
    return <button key={a.id} aria-pressed={area === a.id} style={{ borderColor: a.color }} onClick={() => onArea(a.id)}><span>{a.accessory}</span><strong>{a.title}</strong><small>{a.pet} te espera</small><small>{entry?.loaded ? progress.total ? `${progress.completed}/${progress.total} tareas` : 'Sin tareas' : entry?.error ? 'Reintenta al abrir' : 'Cargando tareas…'}</small></button>;
  })}</nav>;
}
