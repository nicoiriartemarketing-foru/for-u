import {locationDestination,projectViewPath,workspaceSpaces,projectViews} from '../../workspace/navigation';
import {projectDestination,resumePath} from './workspaceFocusModel';
import Logo from '../../components/Logo';
import WorkspaceTools from './WorkspaceTools';
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
import { FocusStatus } from './WorkspaceHome';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { knownTaskTool } from './workspaceFocusModel';
import './unifiedDashboard.css';
import './workspace.css';
import './workspaceIdentity.css';
import './worldExperience.css';

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { remember, state: focusState } = useWorkspaceFocus();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => projectModuleType(p) && isSavedProject(p.id) && !p.cloudPending) : [];
  const requested = params.get('project');
  const project = requested ? projects.find(p => p.id === requested) : projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  const previousLocation = useRef(`${user?.id}:${location.pathname}${location.search}`);
  useEffect(() => {
    const current = `${user?.id}:${location.pathname}${location.search}`;
    const changed = previousLocation.current !== current;
    previousLocation.current = current;
    // Reading/restoring a document never migrates it. Only a navigation records
    // a destination; a late account response cannot write the previous project.
    if (!changed || !project || !focusState.loaded) return;
    const destination = locationDestination(location.pathname, location.search, project.id);
    if (destination && JSON.stringify(projectDestination(focusState.data,project.id).destination)!==JSON.stringify(destination)) remember({projectId:project.id,destination});
  }, [user?.id,location.pathname,location.search,project?.id,focusState.loaded]);
  const query = project ? `?project=${encodeURIComponent(project.id)}` : '';
  const type = project ? projectModuleType(project)! : 'restaurant';
  const pageAccess = {
    restaurant: { icon: '📖', title: 'Mi menú', path: `/modules/restaurant/editor${query}`, help: 'Abre tu menú para editar platos, precios, fotos y publicación.' },
    ecommerce: { icon: '🛍️', title: 'Mi tienda', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu tienda.' },
    hospitality: { icon: '🏡', title: 'Mi hospedaje', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu hospedaje.' },
    tourism: { icon: '🗺️', title: 'Mis experiencias', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tus experiencias turísticas.' },
    courses: { icon: '🎓', title: 'Mis cursos', path: `/modules/courses/editor${query}`, help: 'Abre el editor de la página donde presentas tus cursos.' },
  }[type];
  const links = [
    { icon: '📱', title: 'Mi perfil', path: `/dashboard/tools/profile${query}`, help: 'Organiza bio, destacados y publicaciones. No modifica Instagram.' },
    { icon: '✨', title: 'Mi propuesta', path: `/dashboard/tools/proposal${query}`, help: 'Define tus ofertas y prepara tu página sin cambiar de rubro.' },
    { icon: '📤', title: 'Uploads', path: `/dashboard/tools/images${query}`, help: 'Sube y organiza las fotos de tu negocio.' },
    { icon: '📅', title: 'Calendario', path: `/dashboard/tools/calendar${query}`, help: 'Planifica tus actividades y publicaciones.' },
    pageAccess,
    ...(type === 'restaurant' ? [{ icon: '🛒', title: 'Pedidos internos', path: `/modules/restaurant/orders${query}`, help: 'Gestiona pedidos, mesas, zonas y tarifas de delivery.' }] : []),
    { icon: '🧾', title: 'Compras y cotizaciones', path: `/dashboard/tools/orders${query}`, help: 'Gestiona compras y propuestas aceptadas de tus ofertas publicadas.' },
    { icon: '🎨', title: 'Creator Studio', path: `/creator-studio${query}`, help: 'Continúa la ruta creativa de este proyecto.' },
    { icon: '📊', title: 'Estadísticas', path: `/dashboard/tools/analytics${query}`, help: 'Consulta las visitas y clics registrados. Los clics no equivalen a ventas.' },
    { icon: '⚙️', title: 'Configuración', path: `/dashboard/settings${query}`, help: 'Gestiona tu cuenta y las conexiones disponibles.' },
  ];
  const rememberNavigation = (path: string) => {
    if (!project) return;
    const [pathname,search='']=path.split('?');const destination=locationDestination(pathname,'?'+search,project.id);
    if(destination)remember({projectId:project.id,destination});
  };
  const toolTitles: Record<string, string> = { 'content-creator':'Creador visual', landing: 'Editor de página', bookings: 'Reservas y pedidos', content: 'Propuestas con IA', teleprompter: 'Teleprompter', video: 'Video', assistant: 'Asistente', automation: 'Respuestas automáticas' };
  const currentTitle = location.pathname === '/dashboard' ? (requested ? 'Mi tablero' : 'Mi espacio') : location.pathname === '/dashboard/world' ? 'Mi mundo'
    : params.get('view') === 'management' ? 'Gestión'
    : links.find(link => link.path.split('?')[0] === location.pathname)?.title
      ?? toolTitles[location.pathname.split('/').at(-1) ?? '']
      ?? (location.pathname.includes('/modules/') ? pageAccess.title : location.pathname.includes('/landing') ? 'Editor de página' : 'Creator Studio');
  const isLinkUnlocked = (_title: string) => Boolean(project);
  const renderLink = ({icon,title,path,help}:typeof links[number]) => {
          const unlocked = isLinkUnlocked(title);
          return <Tooltip key={title} text={unlocked ? help : 'Elige un proyecto guardado para abrir esta herramienta.'}>
            <Link className={unlocked ? '' : 'workspace-nav-locked'} aria-current={location.pathname === path.split('?')[0] ? 'page' : undefined} to={unlocked && project ? path : '/dashboard?create=1'} onClick={() => { if (unlocked) rememberNavigation(path); }} tabIndex={unlocked ? 0 : -1}>
              <span className="workspace-nav-icon" aria-hidden="true">{icon}</span>{title}
            </Link>
          </Tooltip>;
  };
  return <div className="workspace-shell workspace-shell-immersive">
    <aside className={`workspace-sidebar ${menuOpen ? 'menu-open' : ''}`}>
      <Link className="workspace-brand" to="/dashboard" aria-label="FOR U · Mis proyectos"><Logo /></Link>

      {project && <TaskProgress projectId={project.id} type={type} />}
      <Tooltip text="Crea otro proyecto y conserva los que ya tienes en tu cuenta."><Link className="workspace-new magic-button-primary" to="/dashboard?create=1">＋ Crear nuevo proyecto</Link></Tooltip>
      <DSButtonSecondary ref={menuButton} className="workspace-menu-toggle" aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>☰</DSButtonSecondary>
      <Link className="workspace-home-link" to="/dashboard">Mis proyectos y Hoy</Link>
      <details className="workspace-account-menu"><summary aria-label="Opciones de cuenta">•••</summary><Link to="/dashboard">Mis proyectos y Hoy</Link><DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Cerrar sesión</DSButtonSecondary></details><Link className="immersive-new-project" to="/dashboard?create=1">＋ Proyecto</Link><nav id="workspace-navigation" aria-label="Navegación de tu negocio" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>
        {links.filter(link=>['Mi propuesta','Creator Studio','Calendario',pageAccess.title].includes(link.title)).map(renderLink)}
        <WorkspaceTools links={links} projectId={project?.id} type={type} onNavigate={rememberNavigation}/>
      </nav>
      {project && <PendingTasks projectId={project.id} type={type} />}
      <p>Tu espacio para avanzar.<br />Y también para respirar.</p>
      <DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Salir</DSButtonSecondary>
    </aside>

    <div className="workspace-main">
      <header className="workspace-top"><div className="workspace-mobile-tools"><WorkspaceTools links={links} projectId={project?.id} type={type} onNavigate={rememberNavigation}/></div>
        <nav className="workspace-breadcrumbs" aria-label="Ubicación"><Link to="/dashboard">Mi espacio</Link><span aria-hidden="true">/</span><span aria-current="page">{currentTitle}</span></nav>
        <nav className="workspace-view-switch" aria-label="Vistas del proyecto">{project ? projectViews.map(view=><Link key={view} aria-current={(view==='world'?location.pathname==='/dashboard/world':location.pathname==='/dashboard'&&(params.get('view')==='management'?'map':params.get('view')||'map')===view)?'page':undefined} to={projectViewPath(project.id,view)}>{({map:'Mapa',kanban:'Kanban',calendar:'Calendario',world:'Mi mundo'})[view]}</Link>) : <span>Elige un proyecto para continuar</span>}
        </nav>
        <label>Proyecto activo<select value={project?.id ?? ''} onChange={event => { if (!confirmWorkspaceNavigation()) return; store.switchProject(event.target.value); const next = projects.find(p => p.id === event.target.value); if(next) navigate(resumePath(projectDestination(focusState.data,next.id),projectModuleType(next)!)); }}><option value="" disabled>Elige un proyecto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      </header>
      {project&&<nav className="workspace-spaces" aria-label="Espacios del proyecto">{workspaceSpaces(project.id,type).map(space=><Link key={space.id} to={space.path} aria-current={location.pathname===space.path.split('?')[0]?'page':undefined}>{space.title}</Link>)}</nav>}
      <div className="workspace-body">
        {project&&location.pathname!=='/dashboard'&&<Link className="workspace-map-return" to={projectViewPath(project.id,'map')}>← Volver a mi mapa</Link>}
        <FocusStatus />
        {requested && !project ? <section className="magic-card" role={store.isCloudSyncing ? 'status' : 'alert'}><h1>{store.isCloudSyncing || store.cloudUserId !== user?.id ? 'Cargando proyecto…' : 'Este proyecto no está disponible'}</h1><p>{store.projectLoadError || 'No se abrirá otro proyecto en su lugar.'}</p>{store.projectLoadError && <DSButtonSecondary onClick={() => { if (user) void store.hydrateFromSupabase(user.id); }}>Reintentar</DSButtonSecondary>}<Link to="/dashboard">Volver a mis proyectos</Link></section> : children}
      </div>
    </div>

    {project && params.get('welcome') === '1' && <EmotionalCompass key={project.id} projectId={project.id} onDone={() => { const next = new URLSearchParams(params); next.delete('welcome'); setParams(next, { replace: true }); }} />}
  </div>;
}

function PendingTasks({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry } = useAreaDocuments(projectId, type);
  const count = entry?.loaded ? entry.tasks.tasks.filter(task => !task.done).length : null;
  return <Link className="workspace-pending" to={`/dashboard?project=${projectId}&view=management`}>Mis próximos pasos{count !== null && count > 0 && <span aria-label={`${count} tareas pendientes`}>{count}</span>}</Link>;
}

function TaskProgress({projectId,type}:{projectId:string;type:ModuleType}) { const {entry}=useAreaDocuments(projectId,type); if(!entry?.loaded)return null; const done=entry.tasks.tasks.filter(t=>t.done).length,total=entry.tasks.tasks.length; return <div className="foru-route-progress-bar"><small>{done}/{total} pasos · {entry.taskDirty ? "pendientes de guardar" : entry.taskRevision ? "guardados" : "guía inicial"}</small><progress aria-label="Progreso de tareas del proyecto" max={total||1} value={done}/></div>; }
