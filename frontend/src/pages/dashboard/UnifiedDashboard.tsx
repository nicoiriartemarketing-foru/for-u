import ProjectJourney, {ProjectWizard} from '../../experience/ProjectJourney';
import ProjectViews from '../../experience/ProjectViews';
import {savedAreaAchievement} from './areaPersistence';
import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { CompassBadge } from './EmotionalCompass';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectModuleType, type ModuleType } from '../../modules/moduleProjects';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { areaDefinitions, areaProgress, isSavedProject, type AreaId } from './areaModel';
import { useAreaDocuments } from './AreaDocuments';
import AreaPanel from './AreaPanel';
import './unifiedDashboard.css';
import { useDialogFocus } from '../../toolkit/useDialogFocus';
import WorkspaceHome from './WorkspaceHome';
import { useWorkspaceFocus } from './WorkspaceFocus';
import PizarraAgent from '../../components/PizarraAgent';
export default function UnifiedDashboard() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const owned = store.cloudUserId === user?.id ? Object.values(store.projectsById) : [];
  const projects = owned.filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p));
  const legacy = owned.filter(p => !isSavedProject(p.id) || p.cloudPending);
  const requested = params.get('project');
  const project = requested ? projects.find(p => p.id === requested) : undefined;
  useEffect(() => { if (user && store.cloudUserId !== user.id) void store.hydrateFromSupabase(user.id); }, [user?.id, store.cloudUserId]);
  useEffect(() => { if (project && store.activeProjectId !== project.id) store.switchProject(project.id); }, [project?.id, store.activeProjectId]);
  return <section className="dashboard-home"><header className="world-intro"><span>Tu espacio de trabajo</span><h1>{project?project.name:`Hola, ${user?.user_metadata?.display_name || 'emprendedora'}`}</h1><p>{project?'¿En qué quieres avanzar hoy?':'Tus proyectos, tus prioridades. Un paso pequeño también cuenta.'}</p></header>
    {legacy.length > 0 && !project && <details className="recovery-notice"><summary>{legacy.length} borrador(es) pendiente(s) de recuperación</summary><p>Estos borradores aún no están confirmados en la nube. Se conservan en este dispositivo; algunos usan IDs antiguos.</p><ul>{legacy.map(p => <li key={p.id}>{p.name} <DSButtonSecondary onClick={() => { const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `borrador-${p.id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Descargar respaldo</DSButtonSecondary></li>)}</ul></details>}
    {store.isCloudSyncing && <p role="status">Cargando tus proyectos…</p>}
    {store.projectLoadError && <div className="recovery-notice" role="alert">{store.projectLoadError} <DSButtonSecondary onClick={() => { if (user) void store.hydrateFromSupabase(user.id); }}>Reintentar proyectos</DSButtonSecondary></div>}
    {!requested && <WorkspaceHome projects={projects} />}
    {requested && !project && !store.isCloudSyncing && <p role="alert">No encontramos este proyecto en tu cuenta. <Link to="/dashboard">Volver a mis proyectos</Link></p>}
    {project ? <><Link className="workspace-back" to="/dashboard">← Mis proyectos y Hoy</Link><div className="project-area-intro"><h2 className="sr-only">Accesos del proyecto</h2><nav><Link className="pe-action-link" to={`/dashboard/tools/proposal?project=${project.id}`}>Mi propuesta →</Link> · <Link className="pe-action-link" to={`/creator-studio?project=${project.id}`}>Abrir Creator Studio →</Link></nav></div><ProjectJourney key={`journey:${project.id}`} projectId={project.id} />{params.get('setup')!=='1'&&<ProjectAreas key={project.id} projectId={project.id} type={projectModuleType(project)!} />}</> : !requested && params.get('create')!=='1' && !projects.length && !store.isCloudSyncing && !store.projectLoadError && <Navigate to="/onboarding" replace />}
    {params.get('create') === '1' && <ProjectWizard onClose={() => setParams(project ? {project:project.id} : {})} />}
  </section>;
}

function ProjectAreas({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry, reload } = useAreaDocuments(projectId, type);
  const [params, setParams] = useSearchParams();
  const { remember } = useWorkspaceFocus();
  const { user } = useAuth();
  const task = entry?.tasks?.tasks.find(t => t.id === params.get('task'));
  const requestedArea = areaDefinitions.find(a => a.id === params.get('area'))?.id;
  const closeArea = () => { setArea(null); const next = new URLSearchParams(params); next.delete('area'); next.delete('task'); setParams(next, { replace: true }); };
  const openArea = (id: AreaId) => { const next = new URLSearchParams(params); next.set('area', id); next.delete('task'); setParams(next, { replace: true }); setArea(id); remember({ projectId, area: id }); };
  const [area, setArea] = useState<AreaId | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<'marketing' | 'finanzas' | 'logistica' | 'operaciones'>('marketing');
  const areaDialog = useRef<HTMLDivElement>(null);
  useDialogFocus(areaDialog, area !== null, closeArea);
  useEffect(() => { setArea(requestedArea ?? task?.area ?? null); }, [requestedArea, task?.area]);
  useEffect(() => {
    if (!area) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [area]);
  const unlocked = savedAreaAchievement(entry);
  const completed = areaDefinitions.filter(a => areaProgress(entry?.tasks?.tasks ?? [], a.id).complete).length;

  const mapAreaIdToChatArea = (id: string): 'marketing' | 'finanzas' | 'logistica' | 'operaciones' => {
    switch (id) {
      case 'marketing': return 'marketing';
      case 'finance': return 'finanzas';
      case 'logistics': return 'logistica';
      case 'operations': return 'operaciones';
      default: return 'marketing';
    }
  };

  return <><CompassBadge projectId={projectId} />{entry?.error && <div role="alert" className="recovery-notice">{entry.error} <DSButtonSecondary onClick={() => void reload()}>Reintentar carga</DSButtonSecondary></div>}<ProjectViews projectId={projectId} type={type} onArea={openArea} />{area && <div className="area-modal-backdrop"><div ref={areaDialog} className="area-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="area-modal-title"><header className="area-modal-heading"><h2 id="area-modal-title">Tu espacio de {areaDefinitions.find(item => item.id === area)?.title}</h2><DSButtonSecondary type="button" aria-label="Cerrar área" onClick={closeArea}>Cerrar ×</DSButtonSecondary></header><AreaPanel key={area} projectId={projectId} type={type} area={area} initialTaskId={task?.id} /><DSButtonSecondary onClick={() => { setActiveArea(mapAreaIdToChatArea(area)); closeArea(); setChatOpen(true); }}>Pedir ayuda al asistente</DSButtonSecondary></div></div>}<section className={`dashboard-pro ${unlocked ? 'is-unlocked' : ''}`}><span>🚀</span><div><strong>{unlocked ? 'Modo Pro · logro del proyecto' : 'Tu negocio, paso a paso'}</strong><p>{completed}/4 áreas completas. {entry?.taskDirty ? "Progreso provisional: guarda tus tareas. " : ""}Las estadísticas básicas siempre están disponibles. Este logro no cambia tu suscripción ni concede almacenamiento.</p><Link className={unlocked ? 'pro-unlocked-button' : ''} to={`/dashboard/tools/analytics?project=${projectId}${unlocked ? '&celebrate=1' : ''}`}>{unlocked ? '✨ Ver mis logros y estadísticas' : 'Ver estadísticas básicas'}</Link></div></section><Link className="world-invitation" to={`/dashboard/world?project=${projectId}`}>🏝️ Visita tu isla y juega con tus mascotas →</Link>
    {chatOpen && (
      <PizarraAgent
        area={activeArea}
        userName={user?.user_metadata?.display_name || 'emprendedora'}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    )}
  </>;
}
