import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForUNodeKind, ForUNodePriority } from '../stores/useActiveProjectsStore';

export type IdeaNodeData = {
  title: string;
  kind: ForUNodeKind;
  icon?: string;
  priority?: ForUNodePriority;
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

  return (
    <article className={`${selected ? 'foru-idea-node is-selected' : 'foru-idea-node'}${priorityClass}`}>
      <Handle className="foru-node-handle" type="target" position={Position.Left} />
      <div className="foru-idea-node-meta">
        <span className="foru-idea-node-kicker">{nodeLabels[data.kind] ?? 'Nodo'}</span>
        {data.priority ? <span className="foru-priority-badge">{priorityIcon[data.priority]}</span> : null}
      </div>
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
