import type { CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForUBranchKey } from '../stores/useActiveProjectsStore';

export type BranchNodeData = {
  title: string;
  icon?: string;
  branchKey?: ForUBranchKey;
  color?: string;
};

export default function BranchNode({ data, selected }: NodeProps<BranchNodeData>) {
  return (
    <article
      className={selected ? 'foru-branch-node is-selected' : 'foru-branch-node'}
      style={{ '--branch-color': data.color ?? '#C39BD3' } as CSSProperties}
    >
      <Handle className="foru-node-handle foru-node-handle-branch" type="target" position={Position.Left} />
      <Handle className="foru-node-handle foru-node-handle-branch" type="target" position={Position.Top} />
      <div className="foru-branch-node-icon">{data.icon}</div>
      <h3>{data.title}</h3>
      <Handle className="foru-node-handle foru-node-handle-branch" type="source" position={Position.Right} />
      <Handle className="foru-node-handle foru-node-handle-branch" type="source" position={Position.Bottom} />
    </article>
  );
}
