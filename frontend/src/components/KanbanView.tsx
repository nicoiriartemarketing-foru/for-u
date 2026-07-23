import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DigitalRoutePath from './DigitalRoutePath';
import { baseBranches, type ForUTaskStatus, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type KanbanViewProps = {
  includeAllProjectsDefault?: boolean;
};

const columns: Array<{ key: ForUTaskStatus; title: string }> = [
  { key: 'todo', title: 'To Do' },
  { key: 'doing', title: 'Doing' },
  { key: 'done', title: 'Done' },
];

export default function KanbanView({ includeAllProjectsDefault = false }: KanbanViewProps) {
  const [includeAllProjects, setIncludeAllProjects] = useState(includeAllProjectsDefault);
  const [isRoutePathOpen, setIsRoutePathOpen] = useState(false);
  const [isStepFocusOpen, setIsStepFocusOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const completeRouteStep = useActiveProjectsStore((state) => state.completeRouteStep);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const focusedStepNodeIds = useMemo(() => {
    if (!isStepFocusOpen || !activeProject?.digitalRoute.length) return null;

    const currentStep = activeProject.digitalRoute[activeProject.currentRouteIndex];
    if (!currentStep) return null;

    return getStepNodeIds(activeProject.nodes, currentStep.linkedNodeId);
  }, [activeProject?.currentRouteIndex, activeProject?.digitalRoute, activeProject?.nodes, isStepFocusOpen]);

  const cards = useMemo(() => {
    const projectIds = includeAllProjects ? activeProjectIds : activeProjectId ? [activeProjectId] : [];

    return projectIds.flatMap((projectId) => {
      const project = projectsById[projectId];
      if (!project) return [];

      return project.nodes
        .filter((node) => node.role === 'free')
        .map((node) => ({ projectId, projectName: project.name, node }));
    });
  }, [activeProjectId, activeProjectIds, includeAllProjects, projectsById]);

  function moveCard(projectId: string, node: ForUProjectNode, status: ForUTaskStatus) {
    updateNode(projectId, node.id, {
      taskStatus: status,
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
    });
  }

  function completeCurrentRouteStep() {
    if (!activeProjectId) return;

    const didAdvance = completeRouteStep(activeProjectId);
    if (didAdvance) {
      toast.success('¡Ruta Avanzada! +50 XP');
    } else {
      toast('La Ruta Digital ya está completa.');
    }
  }

  return (
    <section className="foru-kanban-view" aria-label="Vista Kanban">
      <header className="foru-view-header">
        <div>
          <span>Kanban</span>
          <h1>Qué va, qué está andando, qué ya salió</h1>
        </div>
        <div className="foru-view-header-actions">
          <button type="button" onClick={() => setIsRoutePathOpen((current) => !current)}>
            {isRoutePathOpen ? 'Ver como Kanban' : '🗺️ Ver como Camino'}
          </button>
          <button
            type="button"
            className={isStepFocusOpen ? 'is-active' : ''}
            onClick={() => setIsStepFocusOpen((current) => !current)}
            disabled={!activeProject?.digitalRoute.length}
          >
            {isStepFocusOpen ? 'Salir del Enfoque' : '🔍 Enfocar Paso Actual'}
          </button>
          <button type="button" onClick={() => setIncludeAllProjects((current) => !current)}>
            {includeAllProjects ? 'Solo proyecto actual' : 'Todos los proyectos'}
          </button>
        </div>
      </header>

      {isRoutePathOpen ? (
        <DigitalRoutePath project={activeProject} onCompleteStep={completeCurrentRouteStep} />
      ) : (
        <section className="foru-digital-route" aria-label="Tu Ruta Digital">
          <div className="foru-digital-route-header">
            <div>
              <span>🗺️ Tu Ruta Digital</span>
              <h2>Misión principal</h2>
            </div>
            <button type="button" onClick={completeCurrentRouteStep} disabled={!activeProject?.digitalRoute.length || activeProject.currentRouteIndex >= activeProject.digitalRoute.length}>
              Completar Paso
            </button>
          </div>

          {activeProject?.digitalRoute.length ? (
            <div className="foru-digital-route-steps">
              {activeProject.digitalRoute.map((step, index) => {
                const isDone = Boolean(step.completedAt) || index < activeProject.currentRouteIndex;
                const isCurrent = index === activeProject.currentRouteIndex && !isDone;

                return (
                  <article key={step.id} className={`${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
                    <span>{isDone ? '✓' : index + 1}</span>
                    <strong>{step.title}</strong>
                    <small>{isDone ? 'Completado' : isCurrent ? 'Paso actual' : 'Próximo'}</small>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="foru-digital-route-empty">Procesa ideas desde el Frasco para que la IA trace tu misión principal.</p>
          )}
        </section>
      )}

      <div className="foru-kanban-columns">
        {columns.map((column) => {
          const columnCards = cards.filter(({ node }) => getNodeStatus(node) === column.key);

          return (
            <section
              key={column.key}
              className="foru-kanban-column"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const payload = event.dataTransfer.getData('application/foru-node');
                if (!payload) return;
                const parsed = JSON.parse(payload) as { projectId: string; nodeId: string };
                const project = projectsById[parsed.projectId];
                const node = project?.nodes.find((item) => item.id === parsed.nodeId);
                if (node) moveCard(parsed.projectId, node, column.key);
              }}
            >
              <header>
                <h2>{column.title}</h2>
                <span>{columnCards.length}</span>
              </header>

              <div className="foru-kanban-cards">
                {columnCards.map(({ projectId, projectName, node }) => {
                  const branch = baseBranches.find((item) => item.key === node.branchKey);
                  const belongsToFocusedStep = !focusedStepNodeIds || (projectId === activeProjectId && focusedStepNodeIds.has(node.id));

                  return (
                    <article
                      key={`${projectId}-${node.id}`}
                      className={`foru-kanban-card is-${node.priority ?? 'low'} ${belongsToFocusedStep ? 'is-step-current' : 'is-step-muted'}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/foru-node', JSON.stringify({ projectId, nodeId: node.id }));
                      }}
                      onClick={() => selectNode(node.id)}
                    >
                      <div>
                        <strong>{node.title}</strong>
                        <small>{includeAllProjects ? projectName : branch?.title ?? 'Sin rama'}</small>
                      </div>
                      <span>{priorityLabel[node.priority ?? 'low']}</span>
                      <em>{branch?.icon ?? '•'} {branch?.title ?? 'Sin rama'}</em>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function getNodeStatus(node: ForUProjectNode): ForUTaskStatus {
  if (node.taskStatus) return node.taskStatus;
  if (node.completedAt) return 'done';
  return 'todo';
}

function getStepNodeIds(nodes: ForUProjectNode[], linkedNodeId: string) {
  const ids = new Set<string>([linkedNodeId]);
  nodes
    .filter((node) => node.parentNodeId === linkedNodeId)
    .forEach((node) => ids.add(node.id));

  return ids;
}

const priorityLabel = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};
