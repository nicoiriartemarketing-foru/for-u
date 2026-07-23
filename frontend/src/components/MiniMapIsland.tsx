import type { CSSProperties } from 'react';
import { baseBranches, type ForUActiveProject, type ForUBranchKey } from '../stores/useActiveProjectsStore';

type MiniMapIslandProps = {
  project: ForUActiveProject;
  position: { column: number; row: number };
  isActive?: boolean;
  isNew?: boolean;
  onEnter: () => void;
};

export default function MiniMapIsland({ project, position, isActive = false, isNew = false, onEnter }: MiniMapIslandProps) {
  const branchCounts = getBranchCounts(project);
  const freeNodes = project.nodes.filter((node) => node.role === 'free');
  const completedCount = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done').length;
  const pendingCount = Math.max(0, freeNodes.length - completedCount);
  const progress = freeNodes.length ? Math.round((completedCount / freeNodes.length) * 100) : 0;

  return (
    <article
      className={`foru-mini-island ${isActive ? 'is-active' : ''} ${isNew ? 'is-new' : ''}`}
      style={{ '--island-column': position.column, '--island-row': position.row } as CSSProperties}
      aria-label={`Isla de proyecto ${project.name}`}
    >
      <header className="foru-mini-island-header">
        <span className={`foru-mini-island-status is-${project.status}`}>
          {project.status === 'active' ? '🟢 Activo' : '⏸️ Pausado'}
        </span>
        <strong>{project.name}</strong>
      </header>

      <div className="foru-mini-island-map" aria-hidden="true">
        <div className="foru-mini-island-core">
          <span>{project.name.slice(0, 2).toUpperCase()}</span>
        </div>
        {baseBranches.map((branch, branchIndex) => {
          const branchNodes = project.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key);
          const position = branchPositions[branch.key];

          return (
            <div
              key={branch.key}
              className="foru-mini-island-branch"
              style={{
                '--branch-color': branch.color,
                left: `${position.x}%`,
                top: `${position.y}%`,
              } as CSSProperties}
              title={`${branch.title}: ${branchNodes.length}`}
            >
              <span>{branch.icon}</span>
              <small>{branchNodes.length}</small>
              {branchNodes.slice(0, 6).map((node, nodeIndex) => (
                <i
                  key={node.id}
                  className={node.completedAt || node.taskStatus === 'done' ? 'is-done' : ''}
                  style={{
                    transform: `translate(${Math.cos(branchIndex + nodeIndex * 0.9) * (18 + nodeIndex * 1.8)}px, ${Math.sin(branchIndex + nodeIndex * 0.9) * (15 + nodeIndex * 1.4)}px)`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="foru-mini-island-stats">
        <span>{pendingCount} pendientes</span>
        <span>{completedCount} completas</span>
        <span>{progress}% avance</span>
      </div>

      <div className="foru-mini-island-branches">
        {baseBranches.map((branch) => (
          <span key={branch.key} style={{ '--branch-color': branch.color } as CSSProperties}>
            {branch.icon} {branchCounts[branch.key]}
          </span>
        ))}
      </div>

      <button type="button" className="foru-mini-island-enter" onClick={onEnter}>
        Entrar
      </button>
    </article>
  );
}

function getBranchCounts(project: ForUActiveProject) {
  const counts = Object.fromEntries(baseBranches.map((branch) => [branch.key, 0])) as Record<ForUBranchKey, number>;

  project.nodes.forEach((node) => {
    if (node.role === 'free' && node.branchKey) counts[node.branchKey] += 1;
  });

  return counts;
}

const branchPositions: Record<ForUBranchKey, { x: number; y: number }> = {
  ideas: { x: 25, y: 25 },
  actions: { x: 75, y: 25 },
  finances: { x: 84, y: 51 },
  marketing: { x: 72, y: 77 },
  resources: { x: 25, y: 77 },
};
