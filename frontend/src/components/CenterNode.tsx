import type { CSSProperties } from 'react';
import type { NodeProps } from 'reactflow';

export type CenterNodeData = {
  title: string;
  icon?: string;
  progress: number;
  nextMilestone: string;
  reward: string;
};

export default function CenterNode({ data }: NodeProps<CenterNodeData>) {
  return (
    <article className="foru-center-node">
      <div className="foru-center-progress" style={{ '--progress': `${data.progress * 3.6}deg` } as CSSProperties}>
        <span>{data.progress}%</span>
      </div>
      <div>
        <span aria-hidden="true">{data.icon ?? '🎯'}</span>
        <h2>{data.title}</h2>
        <p>{data.nextMilestone}</p>
        <strong>{data.reward}</strong>
      </div>
    </article>
  );
}
