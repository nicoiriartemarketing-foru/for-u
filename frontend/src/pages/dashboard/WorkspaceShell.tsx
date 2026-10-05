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
  const pageAccess = {
    restaurant: { icon: '📖', title: 'Mi menú', path: `/modules/restaurant/editor${query}`, help: 'Abre tu menú para editar platos, precios, fotos y publicación.' },
    ecommerce: { icon: '🛍️', title: 'Mi tienda', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu tienda.' },
    hospitality: { icon: '🏡', title: 'Mi hospedaje', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu hospedaje.' },
    tourism: { icon: '🗺️', title: 'Mis experiencias', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tus experiencias turísticas.' },
    courses: { icon: '🎓', title: 'Mis cursos', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página donde presentas tus cursos.' },
  }[type];
  const links = [
    { icon: '📤', title: 'Uploads', path: `/dashboard/tools/images${query}`, help: 'Sube y organiza las fotos de tu negocio.' },
    { icon: '📅', title: 'Calendario', path: `/dashboard/tools/calendar${query}`, help: 'Planifica tus actividades y publicaciones.' },
    pageAccess,
    { icon: '🎨', title: 'Creator Studio', path: `/content-creator${query}`, help: 'Diseña piezas para redes sociales con plantillas, imágenes y texto.' },
    { icon: '📊', title: 'Estadísticas', path: `/dashboard/tools/analytics${query}`, help: 'Consulta las visitas y clics registrados. Los clics no equivalen a ventas.' },
    { icon: '⚙️', title: 'Configuración', path: `/dashboard/settings${query}`, help: 'Gestiona tu cuenta y las conexiones disponibles.' },
  ];
  return <div className="workspace-shell"><aside className={`workspace-sidebar ${menuOpen ? 'menu-open' : ''}`}><Link className="workspace-brand" to="/dashboard">for u<span>Un paso a tu ritmo</span></Link><Tooltip text="Crea otro proyecto y conserva los que ya tienes en tu cuenta."><Link className="workspace-new" to="/dashboard?create=1">＋ Crear nuevo proyecto</Link></Tooltip><DSButtonSecondary ref={menuButton} className="workspace-menu-toggle" aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>☰</DSButtonSecondary><nav id="workspace-navigation" aria-label="Navegación de tu negocio" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>{links.map(({icon, title, path, help}) => <Tooltip key={title} text={help}><Link aria-current={location.pathname === path.split('?')[0] ? 'page' : undefined} to={project ? path : '/dashboard?create=1'}><span>{icon}</span>{title}</Link></Tooltip>)}</nav>{project && <PendingTasks projectId={project.id} type={type} />}<p>Tu espacio para avanzar.<br />Y también para respirar.</p><DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Salir</DSButtonSecondary></aside><div className="workspace-main"><header className="workspace-top"><nav aria-label="Vistas del proyecto"><Link aria-current={location.pathname === '/dashboard' ? 'page' : undefined} to={`/dashboard${query}`}>Tablero</Link><Link aria-current={location.pathname === '/dashboard/world' ? 'page' : undefined} to={`/dashboard/world${query}`}>Mi mundo</Link></nav><label>Proyecto activo<select value={project?.id ?? ''} onChange={event => { if (!confirmWorkspaceNavigation()) return; store.switchProject(event.target.value); const next = projects.find(p => p.id === event.target.value); const path = location.pathname.startsWith('/modules/') && next ? `/modules/${projectModuleType(next)}${location.pathname.endsWith('/editor') ? '/editor' : ''}` : location.pathname; navigate(`${path}?project=${encodeURIComponent(event.target.value)}`); }}><option value="" disabled>Elige un proyecto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label></header><div className="workspace-body">{children}</div></div>{project && params.get('welcome') === '1' && <EmotionalCompass key={project.id} projectId={project.id} onDone={() => { const next = new URLSearchParams(params); next.delete('welcome'); setParams(next, { replace: true }); }} />}</div>;
}

function PendingTasks({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry } = useAreaDocuments(projectId, type);
  const count = entry?.loaded ? entry.tasks.tasks.filter(task => !task.done).length : null;
  return <Link className="workspace-pending" to={`/dashboard?project=${projectId}`}>Mis próximos pasos{count !== null && count > 0 && <span aria-label={`${count} tareas pendientes`}>{count}</span>}</Link>;
}
