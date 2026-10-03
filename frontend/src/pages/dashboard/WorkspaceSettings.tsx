import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { ToolkitProvider } from '../../toolkit/ToolkitContext';
import { businessFromProject } from '../../toolkit/types';
import ConnectionStatus from '../../toolkit/ConnectionStatus';
import '../../toolkit/toolkit.css';
export default function WorkspaceSettings() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  const project = store.projectsById[params.get('project') ?? store.activeProjectId ?? ''];
  if (!user || !project || store.cloudUserId !== user.id) return <p>Elige un proyecto desde el tablero.</p>;
  return <section className="workspace-settings"><h1>Configuración</h1><p>Gestiona los datos de tu negocio y sus conexiones.</p><Link to={`/modules/${projectModuleType(project)}/editor?project=${project.id}`}>Editar datos del negocio →</Link><ToolkitProvider key={`${user.id}:${project.id}`} userId={user.id} projectId={project.id} business={businessFromProject(project)}><ConnectionStatus /></ToolkitProvider></section>;
}
