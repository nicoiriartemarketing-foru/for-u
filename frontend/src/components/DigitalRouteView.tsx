import { useMemo } from 'react';
import toast from 'react-hot-toast';
import type { ForUActiveProject } from '../stores/useActiveProjectsStore';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { getDigitalRouteTemplate } from '../templates/digitalRouteTemplates';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';

type DigitalRouteViewProps = {
  project: ForUActiveProject | null;
  onOpenLanding: () => void;
  onOpenTasks: () => void;
  onStartAction: () => void;
};

export default function DigitalRouteView({
  project,
  onOpenLanding,
  onOpenTasks,
  onStartAction,
}: DigitalRouteViewProps) {
  const getDigitalRouteSteps = useActiveProjectsStore((state) => state.getDigitalRouteSteps);
  const getCurrentDigitalRouteStep = useActiveProjectsStore((state) => state.getCurrentDigitalRouteStep);
  const createTasksForDigitalRouteStep = useActiveProjectsStore((state) => state.createTasksForDigitalRouteStep);
  const completeDigitalRouteStep = useActiveProjectsStore((state) => state.completeDigitalRouteStep);

  const routeTemplate = useMemo(() => getDigitalRouteTemplate(project?.industryKey), [project?.industryKey]);
  const steps = project ? getDigitalRouteSteps(project.id) : [];
  const currentStep = project ? getCurrentDigitalRouteStep(project.id) : null;
  const readySteps = steps.filter((step) => step.status === 'ready').length;
  const progress = steps.length ? Math.round((readySteps / steps.length) * 100) : 0;

  if (!project) {
    return (
      <section className="foru-digital-route-view">
        <MagicCard className="foru-digital-route-empty">
          <MagicBadge>Ruta Digital</MagicBadge>
          <h1>Elige un proyecto para ver su ruta.</h1>
        </MagicCard>
      </section>
    );
  }

  function handlePrimaryAction(stepId: string) {
    if (!project) return;
    const step = steps.find((item) => item.id === stepId);
    if (!step) return;

    if (step.id === 'landing') {
      createTasksForDigitalRouteStep(project.id, step.id);
      onOpenLanding();
      return;
    }

    const createdIds = createTasksForDigitalRouteStep(project.id, step.id);
    if (createdIds.length > 0) {
      toast.success(`Creé ${createdIds.length} acciones para ${step.shortTitle}.`);
    } else {
      toast('Esta estación ya tiene sus acciones creadas.');
    }
    onStartAction();
  }

  function handleCompleteStep(stepId: string) {
    if (!project) return;
    const completed = completeDigitalRouteStep(project.id, stepId);
    if (completed) toast.success('Estación lista. Avanzamos la ruta ✨');
  }

  return (
    <section className="foru-digital-route-view" aria-label="Ruta Digital del proyecto">
      <header className="foru-digital-route-hero">
        <div>
          <MagicBadge>{routeTemplate.title}</MagicBadge>
          <h1>{project.name}</h1>
          <p>{routeTemplate.description}</p>
        </div>
        <div className="foru-digital-route-progress-card">
          <span>{progress}%</span>
          <strong>{readySteps}/{steps.length} estaciones listas</strong>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>
      </header>

      {currentStep ? (
        <MagicCard className="foru-digital-route-current" as="section">
          <div>
            <MagicBadge>Ahora</MagicBadge>
            <h2>{currentStep.title}</h2>
            <p>{currentStep.outcome}</p>
            <small>{currentStep.why}</small>
          </div>
          <div className="foru-digital-route-current-actions">
            <MagicButton type="button" onClick={() => handlePrimaryAction(currentStep.id)}>
              {currentStep.primaryAction}
            </MagicButton>
            <MagicButton type="button" variant="soft" onClick={() => handleCompleteStep(currentStep.id)}>
              Marcar estación lista
            </MagicButton>
          </div>
        </MagicCard>
      ) : null}

      <div className="foru-digital-route-path">
        {steps.map((step, index) => (
          <MagicCard
            key={step.id}
            as="article"
            className={`foru-digital-route-step is-${step.status} ${currentStep?.id === step.id ? 'is-current' : ''}`}
          >
            <div className="foru-digital-route-step-marker">
              <span>{step.status === 'ready' ? '✓' : index + 1}</span>
              {index < steps.length - 1 ? <i /> : null}
            </div>

            <div className="foru-digital-route-step-body">
              <div className="foru-digital-route-step-top">
                <MagicBadge>{step.badge}</MagicBadge>
                <span>{getStatusLabel(step.status)}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.outcome}</p>
              <div className="foru-digital-route-output">
                <strong>Resultado:</strong> {step.artifactLabel}
              </div>
              <div className="foru-digital-route-mini-progress">
                <span>{step.completedTasks}/{step.totalTasks} acciones completas</span>
                <i><b style={{ width: `${step.totalTasks ? Math.round((step.completedTasks / step.totalTasks) * 100) : 0}%` }} /></i>
              </div>
              <div className="foru-digital-route-step-actions">
                <button type="button" onClick={() => handlePrimaryAction(step.id)}>
                  {step.id === 'landing' ? 'Abrir landing' : step.createdTasks > 0 ? 'Continuar' : 'Crear acciones'}
                </button>
                {step.createdTasks > 0 ? (
                  <button type="button" onClick={onOpenTasks}>Ver tareas</button>
                ) : null}
              </div>
            </div>
          </MagicCard>
        ))}
      </div>
    </section>
  );
}

function getStatusLabel(status: string) {
  if (status === 'ready') return 'Listo';
  if (status === 'in_progress') return 'En progreso';
  return 'Pendiente';
}
