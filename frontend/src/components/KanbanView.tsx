import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import toast from 'react-hot-toast';
import DigitalRoutePath from './DigitalRoutePath';
import FloatingReward, { type FloatingRewardBurst } from './FloatingReward';
import { baseBranches, type ForUTaskStatus, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type KanbanViewProps = {
  includeAllProjectsDefault?: boolean;
};

const columns: Array<{ key: ForUTaskStatus; title: string }> = [
  { key: 'todo', title: 'To Do' },
  { key: 'doing', title: 'Doing' },
  { key: 'done', title: 'Done' },
];

const DUST_THRESHOLD_MS = 48 * 60 * 60 * 1000;

function isDustyNode(node: ForUProjectNode) {
  if (node.locked || node.completedAt || node.taskStatus === 'done') return false;
  const lastActiveTime = new Date(node.lastActiveDate).getTime();
  return Number.isFinite(lastActiveTime) && lastActiveTime < Date.now() - DUST_THRESHOLD_MS;
}

export default function KanbanView({ includeAllProjectsDefault = false }: KanbanViewProps) {
  const [includeAllProjects, setIncludeAllProjects] = useState(includeAllProjectsDefault);
  const [isRoutePathOpen, setIsRoutePathOpen] = useState(false);
  const [isStepFocusOpen, setIsStepFocusOpen] = useState(false);
  const [rewardBurst, setRewardBurst] = useState<FloatingRewardBurst | null>(null);
  const [completingCardKey, setCompletingCardKey] = useState<string | null>(null);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const completeRouteStep = useActiveProjectsStore((state) => state.completeRouteStep);
  const addCoins = useActiveProjectsStore((state) => state.addCoins);
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

  function showRewardBurst(x: number, y: number, coins = 20, xp = 0) {
    setRewardBurst({ id: `${Date.now()}-${Math.random()}`, x, y, coins, xp });
    window.setTimeout(() => setRewardBurst(null), 1600);
  }

  function moveCard(projectId: string, node: ForUProjectNode, status: ForUTaskStatus, point?: { x: number; y: number }) {
    const wasCompleted = Boolean(node.completedAt || node.taskStatus === 'done');
    const wasDusty = isDustyNode(node);
    const coinReward = status === 'done' && !wasCompleted ? (wasDusty ? 60 : 20) : 0;
    updateNode(projectId, node.id, {
      taskStatus: status,
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
      rewardCoins: coinReward ? (node.rewardCoins ?? 0) + coinReward : node.rewardCoins,
    });

    if (status === 'done' && !wasCompleted && point) {
      addCoins(coinReward);
      setCompletingCardKey(`${projectId}-${node.id}`);
      showRewardBurst(point.x, point.y, coinReward, 0);
      if (wasDusty) toast.success('¡Limpieza Profunda! +40 monedas extra');
      window.setTimeout(() => setCompletingCardKey(null), 900);
    }
  }

  function completeCurrentRouteStep(event?: MouseEvent<HTMLButtonElement>) {
    if (!activeProjectId) return;

    const didAdvance = completeRouteStep(activeProjectId);
    if (didAdvance) {
      toast.success('¡Ruta Avanzada! +50 XP');
      showRewardBurst(event?.clientX ?? window.innerWidth / 2, event?.clientY ?? 180, 20, 50);
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
                if (node) moveCard(parsed.projectId, node, column.key, { x: event.clientX, y: event.clientY });
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
                  const isDusty = isDustyNode(node);

                  return (
                    <article
                      key={`${projectId}-${node.id}`}
                      className={`foru-kanban-card is-${node.priority ?? 'low'} ${belongsToFocusedStep ? 'is-step-current' : 'is-step-muted'} ${isDusty ? 'is-dusty-card' : ''} ${completingCardKey === `${projectId}-${node.id}` ? 'is-disintegrating' : ''}`}
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
                      {isDusty ? <span className="foru-dusty-card-badge">Polvo</span> : null}
                      <em>{branch?.icon ?? '•'} {branch?.title ?? 'Sin rama'}</em>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <FloatingReward burst={rewardBurst} />
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
