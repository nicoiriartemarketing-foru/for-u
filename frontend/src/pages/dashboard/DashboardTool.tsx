import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import Toolkit from '../../toolkit/Toolkit';
import type { ToolId } from '../../toolkit/types';

const tools = new Set<ToolId>(['content', 'teleprompter', 'video', 'images', 'calendar', 'analytics', 'assistant', 'landing', 'bookings', 'automation']);

export default function DashboardTool() {
  const { user } = useAuth();
  const { tool = '' } = useParams();
  const [params] = useSearchParams();
  const hydrate = useActiveProjectsStore(state => state.hydrateFromSupabase);
  const projectId = params.get('project');
  const project = useActiveProjectsStore(state => projectId ? state.projectsById[projectId] : state.projectsById[state.activeProjectId ?? ''] ?? state.getActiveProjects()[0]);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  useEffect(() => { if (user?.id && cloudUserId !== user.id) void hydrate(user.id); }, [cloudUserId, hydrate, user?.id]);
  if (!user || cloudUserId !== user.id) return <main className="dashboard-tool-loader"><p>Cargando tus herramientas…</p></main>;
  if (!project || !tools.has(tool as ToolId)) return <main className="dashboard-tool-loader"><h1>Esta herramienta no está disponible</h1><Link to="/dashboard">Volver al tablero</Link></main>;
  const templates = params.get('page') === 'templates';
  return <Toolkit embedded key={`${project.id}:${tool}:${templates}`} project={project} initialTool={templates ? undefined : tool as ToolId} initialPage={templates ? 'templates' : undefined} onBack={() => window.history.back()} />;
}
