import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { baseBranches, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function GanttView() {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  const rows = useMemo(() => {
    const nodes = activeProject?.nodes.filter((node) => node.role === 'free') ?? [];

    return baseBranches.flatMap((branch) => {
      const branchNodes = nodes.filter((node) => node.branchKey === branch.key);
      return branchNodes.map((node, index) => ({
        branch,
        node,
        offset: getOffsetDays(node, index),
        duration: getDurationDays(node),
      }));
    });
  }, [activeProject?.nodes]);

  return (
    <section className="foru-gantt-view" aria-label="Vista Gantt">
      <header className="foru-view-header">
        <div>
          <span>Gantt</span>
          <h1>Línea de tiempo simple</h1>
          <p>{activeProject?.name ?? 'Sin proyecto'} · duración estimada por defecto: 1 día</p>
        </div>
      </header>

      <div className="foru-gantt-grid">
        <div className="foru-gantt-axis">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index}>Día {index + 1}</span>
          ))}
        </div>

        {rows.length ? rows.map(({ branch, node, offset, duration }) => (
          <div key={node.id} className="foru-gantt-row">
            <div className="foru-gantt-label">
              <span>{branch.icon}</span>
              <strong>{node.title}</strong>
              <small>{branch.title}</small>
            </div>
            <div className="foru-gantt-track">
              <div
                className={`foru-gantt-bar is-${node.priority ?? 'low'}`}
                style={{
                  '--branch-color': branch.color,
                  left: `${Math.min(offset, 6) * 14}%`,
                  width: `${Math.max(12, duration * 14)}%`,
                } as CSSProperties}
              >
                {duration}d
              </div>
            </div>
          </div>
        )) : (
          <div className="foru-gantt-empty">
            <strong>No hay tareas para mostrar</strong>
            <p>Agrega nodos al mapa o procesa ideas del Frasco.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function getOffsetDays(node: ForUProjectNode, index: number) {
  const created = new Date(node.createdAt).getTime();
  if (Number.isFinite(created)) {
    return Math.abs(Math.floor((created / (1000 * 60 * 60 * 24)) % 7));
  }

  return index % 7;
}

function getDurationDays(node: ForUProjectNode) {
  if (node.subtasks?.length) return Math.min(4, Math.max(1, node.subtasks.length));
  if (node.priority === 'high') return 2;
  return 1;
}
