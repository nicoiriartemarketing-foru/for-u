import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForUNodeKind } from '../stores/useActiveProjectsStore';

export type IdeaNodeData = {
  title: string;
  kind: ForUNodeKind;
  icon?: string;
};

const nodeLabels: Record<ForUNodeKind, string> = {
  idea: 'Idea',
  task: 'Accion',
  resource: 'Recurso',
  blocker: 'Bloqueo',
  inspiration: 'Inspiracion',
};

export default function IdeaNode({ data, selected }: NodeProps<IdeaNodeData>) {
  return (
    <article className={selected ? 'foru-idea-node is-selected' : 'foru-idea-node'}>
      <Handle className="foru-node-handle" type="target" position={Position.Left} />
      <div className="foru-idea-node-kicker">{nodeLabels[data.kind]}</div>
      <h3>
        {data.icon && <span aria-hidden="true">{data.icon}</span>}
        {data.title}
      </h3>
      <Handle className="foru-node-handle" type="source" position={Position.Right} />
    </article>
  );
}
