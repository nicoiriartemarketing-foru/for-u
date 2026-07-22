import { Handle, Position, type NodeProps } from 'reactflow';

export type CenterNodeData = {
  title: string;
  icon?: string;
};

export default function CenterNode({ data }: NodeProps<CenterNodeData>) {
  return (
    <article className="foru-center-node">
      <Handle className="foru-node-handle foru-node-handle-center" type="source" position={Position.Top} />
      <Handle className="foru-node-handle foru-node-handle-center" type="source" position={Position.Right} />
      <Handle className="foru-node-handle foru-node-handle-center" type="source" position={Position.Bottom} />
      <Handle className="foru-node-handle foru-node-handle-center" type="source" position={Position.Left} />
      <span aria-hidden="true">{data.icon ?? '✨'}</span>
      <h2>{data.title}</h2>
    </article>
  );
}
