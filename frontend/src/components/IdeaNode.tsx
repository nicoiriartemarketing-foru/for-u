import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForUNodeKind, ForUNodePriority } from '../stores/useActiveProjectsStore';

export type IdeaNodeData = {
  title: string;
  kind: ForUNodeKind;
  icon?: string;
  priority?: ForUNodePriority;
  isNextAction?: boolean;
  routeStepNumber?: number;
  isDusty?: boolean;
};

const nodeLabels: Partial<Record<ForUNodeKind, string>> = {
  idea: 'Idea',
  task: 'Accion',
  resource: 'Recurso',
  blocker: 'Bloqueo',
  inspiration: 'Inspiracion',
};

export default function IdeaNode({ data, selected }: NodeProps<IdeaNodeData>) {
  const priorityClass = data.priority ? ` has-priority-${data.priority}` : '';
  const routeClass = data.routeStepNumber ? ' is-route-node' : '';
  const dustyClass = data.isDusty ? ' is-dusty-node' : '';

  return (
    <article className={`${selected ? 'foru-idea-node is-selected' : 'foru-idea-node'}${priorityClass}${routeClass}${dustyClass}`}>
      <Handle className="foru-node-handle" type="target" position={Position.Left} />
      <div className="foru-idea-node-meta">
        <span className="foru-idea-node-kicker">{nodeLabels[data.kind] ?? 'Nodo'}</span>
        {data.priority ? <span className="foru-priority-badge">{priorityIcon[data.priority]}</span> : null}
      </div>
      {data.routeStepNumber ? <span className="foru-route-node-badge">🧭 {data.routeStepNumber}</span> : null}
      {data.isDusty ? <span className="foru-dusty-badge">Polvo</span> : null}
      {data.isNextAction ? <span className="foru-next-action-badge">🔥 Siguiente</span> : null}
      <h3>
        {data.icon && <span aria-hidden="true">{data.icon}</span>}
        {data.title}
      </h3>
      <Handle className="foru-node-handle" type="source" position={Position.Right} />
    </article>
  );
}

const priorityIcon: Record<ForUNodePriority, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟢',
};
