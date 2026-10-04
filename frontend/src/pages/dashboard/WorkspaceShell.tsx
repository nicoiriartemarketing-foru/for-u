import { Tooltip } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { useAreaDocuments } from './AreaDocuments';
import type { ModuleType } from '../../modules/moduleProjects';
import EmotionalCompass from './EmotionalCompass';
import { confirmWorkspaceNavigation } from '../../lib/useUnsavedNavigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { isSavedProject } from './areaModel';
import './workspace.css';
export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  useEffect(() => { if (user && store.cloudUserId !== user.id) void store.hydrateFromSupabase(user.id); }, [user?.id, store.cloudUserId]);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => projectModuleType(p) && isSavedProject(p.id) && !p.cloudPending) : [];
  const project = projects.find(p => p.id === params.get('project')) ?? projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  const query = project ? `?project=${encodeURIComponent(project.id)}` : '';
  const type = project ? projectModuleType(project)! : 'restaurant';
  const links = [
    ['📤', 'Uploads', `/dashboard/tools/images${query}`],
    ['📅', 'Calendario', `/dashboard/tools/calendar${query}`],
    ['🍽️', { restaurant: 'Platos', ecommerce: 'Productos', hospitality: 'Habitaciones', tourism: 'Experiencias', courses: 'Cursos' }[type], `/modules/${type}/editor${query}`],
    ['📊', 'Estadísticas', `/dashboard/tools/analytics${query}`],
    ['⚙️', 'Configuración', `/dashboard/settings${query}`],
  ];
  return <div className="workspace-shell"><aside className={`workspace-sidebar ${menuOpen ? 'menu-open' : ''}`}><Link className="workspace-brand" to="/dashboard">for u<span>Un paso a tu ritmo</span></Link><Tooltip text="Crea otro proyecto y conserva los que ya tienes en tu cuenta."><Link className="workspace-new" to="/dashboard?create=1">＋ Crear nuevo proyecto</Link></Tooltip><DSButtonSecondary ref={menuButton} className="workspace-menu-toggle" aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>☰</DSButtonSecondary><nav id="workspace-navigation" aria-label="Navegación de tu negocio" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>{links.map(([icon, title, path], index) => <Tooltip key={title} text={['Sube y organiza las fotos de tu negocio.', 'Planifica tus actividades y publicaciones.', 'Edita la oferta de este proyecto: nombres, precios y fotos.', 'Consulta las visitas y clics registrados. Los clics no equivalen a ventas.', 'Gestiona tu cuenta y las conexiones disponibles.'][index]}><Link aria-current={location.pathname === path.split('?')[0] ? 'page' : undefined} to={project ? path : '/dashboard?create=1'}><span>{icon}</span>{title}</Link></Tooltip>)}</nav>{project && <PendingTasks projectId={project.id} type={type} />}<p>Tu espacio para avanzar.<br />Y también para respirar.</p><DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Salir</DSButtonSecondary></aside><div className="workspace-main"><header className="workspace-top"><nav aria-label="Vistas del proyecto"><Link aria-current={location.pathname === '/dashboard' ? 'page' : undefined} to={`/dashboard${query}`}>Tablero</Link><Link aria-current={location.pathname === '/dashboard/world' ? 'page' : undefined} to={`/dashboard/world${query}`}>Mi mundo</Link></nav><label>Proyecto activo<select value={project?.id ?? ''} onChange={event => { if (!confirmWorkspaceNavigation()) return; store.switchProject(event.target.value); const next = projects.find(p => p.id === event.target.value); const path = location.pathname.startsWith('/modules/') && next ? `/modules/${projectModuleType(next)}${location.pathname.endsWith('/editor') ? '/editor' : ''}` : location.pathname; navigate(`${path}?project=${encodeURIComponent(event.target.value)}`); }}><option value="" disabled>Elige un proyecto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label></header><div className="workspace-body">{children}</div></div>{project && params.get('welcome') === '1' && <EmotionalCompass key={project.id} projectId={project.id} onDone={() => { const next = new URLSearchParams(params); next.delete('welcome'); setParams(next, { replace: true }); }} />}</div>;
}

function PendingTasks({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry } = useAreaDocuments(projectId, type);
  const count = entry?.loaded ? entry.tasks.tasks.filter(task => !task.done).length : null;
  return <Link className="workspace-pending" to={`/dashboard?project=${projectId}`}>Mis próximos pasos{count !== null && count > 0 && <span aria-label={`${count} tareas pendientes`}>{count}</span>}</Link>;
}
