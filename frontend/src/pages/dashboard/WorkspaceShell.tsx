import { confirmWorkspaceNavigation } from '../../lib/useUnsavedNavigation';
import { useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { isSavedProject } from './areaModel';
import './workspace.css';
export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
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
  return <div className="workspace-shell"><aside className="workspace-sidebar"><Link className="workspace-brand" to="/dashboard">for u<span>Un paso a tu ritmo</span></Link><Link className="workspace-new" to="/dashboard?create=1">＋ Crear nuevo proyecto</Link><nav aria-label="Navegación de tu negocio">{links.map(([icon, title, path]) => <Link key={title} aria-current={location.pathname === path.split('?')[0] ? 'page' : undefined} to={project ? path : '/dashboard?create=1'}><span>{icon}</span>{title}</Link>)}</nav><p>Tu espacio para avanzar.<br />Y también para respirar.</p><button onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Salir</button></aside><div className="workspace-main"><header className="workspace-top"><nav aria-label="Vistas del proyecto"><Link aria-current={location.pathname === '/dashboard' ? 'page' : undefined} to={`/dashboard${query}`}>Tablero</Link><Link aria-current={location.pathname === '/dashboard/world' ? 'page' : undefined} to={`/dashboard/world${query}`}>Mi mundo</Link></nav><label>Proyecto activo<select value={project?.id ?? ''} onChange={event => { if (!confirmWorkspaceNavigation()) return; store.switchProject(event.target.value); const next = projects.find(p => p.id === event.target.value); const path = location.pathname.startsWith('/modules/') && next ? `/modules/${projectModuleType(next)}${location.pathname.endsWith('/editor') ? '/editor' : ''}` : location.pathname; navigate(`${path}?project=${encodeURIComponent(event.target.value)}`); }}><option value="" disabled>Elige un proyecto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label></header><div className="workspace-body">{children}</div></div></div>;
}
