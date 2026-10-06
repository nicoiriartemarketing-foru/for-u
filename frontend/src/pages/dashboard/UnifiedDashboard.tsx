import { Card, InfoIcon } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, ButtonPrimary as DSButtonPrimary } from '../../components/ui/DesignSystem';
import { CompassBadge } from './EmotionalCompass';
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
import AgentChat from '../../components/AgentChat';
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
      navigate(`/modules/${type}/editor?project=${encodeURIComponent(id)}${projects.length === 0 ? '&welcome=1' : ''}`);
    } catch (error) { setNotice((error as Error).message); }
    finally { lock.current = false; setCreating(false); }
  }
  return <section className="dashboard-home"><header className="world-intro"><span>Tu espacio de trabajo</span><h1>Hola, {user?.user_metadata?.display_name || 'emprendedora'}</h1><p>Elige un área. Un paso pequeño también cuenta.</p></header>
    {legacy.length > 0 && <details className="recovery-notice"><summary>{legacy.length} borrador(es) pendiente(s) de recuperación</summary><p>Estos borradores aún no están confirmados en la nube. Se conservan en este dispositivo; algunos usan IDs antiguos.</p><ul>{legacy.map(p => <li key={p.id}>{p.name} <DSButtonSecondary onClick={() => { const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `borrador-${p.id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Descargar respaldo</DSButtonSecondary></li>)}</ul></details>}
    {project ? <ProjectAreas key={project.id} projectId={project.id} type={projectModuleType(project)!} /> : <section className="dashboard-empty"><h2>Tu primer proyecto empieza aquí</h2><p>Elige un rubro y dale un nombre a tu negocio.</p><Link to="/dashboard?create=1">Crear proyecto</Link></section>}
    {params.get('create') === '1' && <div className="project-modal-backdrop"><form ref={dialogRef} className="project-modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onSubmit={create}><DSButtonSecondary type="button" className="project-modal-close" aria-label="Cerrar" onClick={() => { setParams(project ? { project: project.id } : {}); }}>×</DSButtonSecondary><h2 id="new-project-title">¿Qué negocio quieres explorar?</h2><label>Nombre de tu negocio<DSInput autoFocus required maxLength={120} value={name} disabled={Boolean(retryId.current)} onChange={e => setName(e.target.value)} placeholder="Ej. Alfajores del Valle" /></label><fieldset disabled={Boolean(retryId.current) || creating}><legend>Rubro</legend><div className="project-type-grid">{(Object.keys(moduleLabels) as ModuleType[]).map(value => <label key={value} className={type === value ? 'is-selected' : ''}><DSInput type="radio" name="business-type" checked={value === type} onChange={() => setType(value)} />{moduleLabels[value]}</label>)}</div></fieldset>{notice && <p role="alert">{notice}</p>}<DSButtonPrimary className="project-modal-submit" disabled={creating || !name.trim()}>{creating ? 'Guardando…' : retryId.current ? 'Reintentar guardado' : `Crear ${moduleLabels[type]}`}</DSButtonPrimary></form></div>}
  </section>;
}
const areaHelp = { marketing: 'Crea contenido, prepara tu página y encuentra herramientas para comunicar tu negocio.', finance: 'Organiza tu oferta, precios y costos.', logistics: 'Planifica actividades y revisa la disponibilidad de tu negocio.', operations: 'Configura el contacto y la recepción de pedidos o reservas.' };
function ProjectAreas({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry, reload } = useAreaDocuments(projectId, type);
  const [area, setArea] = useState<AreaId | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<'marketing' | 'finanzas' | 'logistica' | 'operaciones'>('marketing');
  const areaDialog = useRef<HTMLDivElement>(null);
  useDialogFocus(areaDialog, area !== null, () => setArea(null));
  useEffect(() => {
    if (!area) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [area]);
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

  return <><CompassBadge projectId={projectId} />{entry?.error && <div role="alert" className="recovery-notice">{entry.error} <DSButtonSecondary onClick={() => void reload()}>Reintentar carga</DSButtonSecondary></div>}<div className="dashboard-areas">{areaDefinitions.map(a => { const progress = areaProgress(entry?.tasks?.tasks ?? [], a.id); return <Card as="article" key={a.id} onClick={event => { if (!(event.target as HTMLElement).closest('button,a,input')) { setActiveArea(mapAreaIdToChatArea(a.id)); setChatOpen(true); } }} className={`dashboard-area dashboard-area-${a.id} area-open bg-gradient-to-br ${a.gradient} rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`} ><InfoIcon text={areaHelp[a.id]} label={`Ayuda de ${a.title}`} /><span className="area-icon">{a.accessory}</span><h2>{a.title}</h2><p>{a.pet} te ayuda a elegir el siguiente paso</p>{entry?.loaded ? <><div className="area-progress-track" role="progressbar" aria-label={`Progreso de ${a.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}><span style={{ width: `${progress.percent}%` }} /></div><span key={progress.percent} className="area-progress-number">{progress.percent}% completado</span><span>{progress.total ? `${progress.completed} de ${progress.total} pasos` : 'Sin tareas'}</span>{progress.complete && <span className="area-gold-check" aria-label={`${a.title} completada`}>✓</span>}</> : <div className="area-progress-skeleton" role="status" aria-label="Cargando progreso"><span /><span /></div>}<DSButtonSecondary type="button" aria-label={`Abrir ${a.title}`} tooltip={`Abrir tareas y herramientas de ${a.title}`} onClick={() => { setActiveArea(mapAreaIdToChatArea(a.id)); setChatOpen(true); }}>Abrir espacio →</DSButtonSecondary></Card>; })}</div>{area && <div className="area-modal-backdrop"><div ref={areaDialog} className="area-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="area-modal-title"><header className="area-modal-heading"><h2 id="area-modal-title">Tu espacio de {areaDefinitions.find(item => item.id === area)?.title}</h2><DSButtonSecondary type="button" aria-label="Cerrar área" onClick={() => setArea(null)}>Cerrar ×</DSButtonSecondary></header><AreaPanel key={area} projectId={projectId} type={type} area={area} /></div></div>}<section className={`dashboard-pro ${completed === 4 ? 'is-unlocked' : ''}`}><span>🚀</span><div><strong>{completed === 4 ? 'Modo Pro desbloqueado' : 'Modo Pro · Tu negocio, paso a paso'}</strong><p>{completed}/4 áreas completas. Las estadísticas básicas siempre están disponibles.</p><Link className={completed === 4 ? 'pro-unlocked-button' : ''} to={`/dashboard/tools/analytics?project=${projectId}${completed === 4 ? '&celebrate=1' : ''}`}>{completed === 4 ? '✨ Ver mis logros y estadísticas' : 'Ver estadísticas básicas'}</Link></div></section><Link className="world-invitation" to={`/dashboard/world?project=${projectId}`}>🏝️ Visita tu isla y juega con tus mascotas →</Link>
    {chatOpen && (
      <AgentChat 
        area={activeArea} 
        userName="Nicole" 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />
    )}
  </>;
}
