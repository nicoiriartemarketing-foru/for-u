import type { ForUProjectNode, ForURouteStep } from '../stores/useActiveProjectsStore';
import MiniMindMap from './MiniMindMap';

type RouteStepStationProps = {
  step: ForURouteStep;
  stepNumber: number;
  nodes: ForUProjectNode[];
  isDone: boolean;
  isCurrent: boolean;
};

export default function RouteStepStation({ step, stepNumber, nodes, isDone, isCurrent }: RouteStepStationProps) {
  return (
    <article className={`foru-route-station ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
      <div className="foru-route-station-marker">
        <span>{isDone ? '✓' : stepNumber}</span>
      </div>
      <div className="foru-route-station-card">
        <header>
          <small>{isDone ? 'Completado' : isCurrent ? 'Paso actual' : 'Próximo'}</small>
          <h3>{step.title}</h3>
        </header>
        <MiniMindMap centerLabel={step.title} nodes={nodes} />
      </div>
    </article>
  );
}
