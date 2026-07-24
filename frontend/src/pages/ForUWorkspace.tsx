import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DailyRewardsModal from '../components/DailyRewardsModal';
import IdeaJarFab from '../components/IdeaJarFab';
import KanbanView from '../components/KanbanView';
import Logo from '../components/Logo';
import NodeDetailPanel from '../components/NodeDetailPanel';
import ProjectCanvas from '../components/ProjectCanvas';
import ProjectNavigator from '../components/ProjectNavigator';
import { type ForUProjectGuideState, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const World3D = lazy(() => import('../components/World3D'));
type ForUMainView = 'objectives' | 'world';

export default function ForUWorkspace() {
  const [mainView, setMainView] = useState<ForUMainView>('objectives');
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [revealedStep, setRevealedStep] = useState<ForUProjectGuideState | null>(null);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const setView = useActiveProjectsStore((state) => state.setView);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const panToIsland = useActiveProjectsStore((state) => state.panToIsland);
  const coins = useActiveProjectsStore((state) => state.coins);
  const dailyStreak = useActiveProjectsStore((state) => state.dailyStreak);
  const checkDailyReward = useActiveProjectsStore((state) => state.checkDailyReward);
  const getProjectState = useActiveProjectsStore((state) => state.getProjectState);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);

  const projectGuideState = activeProjectId ? getProjectState(activeProjectId) : 'empty';
  const guideStep = guideStepsByState[projectGuideState];
  const focusContent = focusContentByState[projectGuideState];
  const shouldRevealWorkView = revealedStep === projectGuideState && ['organized', 'planned', 'active'].includes(projectGuideState);

  useEffect(() => {
    if (projectGuideState === 'completed' && checkDailyReward().shouldShow) setIsDailyRewardOpen(true);
  }, [checkDailyReward, projectGuideState]);

  useEffect(() => {
    setRevealedStep(null);
  }, [activeProjectId, projectGuideState]);

  function openProjectIsland(projectId: string) {
    switchProject(projectId);
    panToIsland(projectId);
    deselectNode();
    clearFocus();
    setView('map');
    setMainView('objectives');
    setRevealedStep('organized');
  }

  function openDashboard() {
    deselectNode();
    clearFocus();
    setMainView('objectives');
    setRevealedStep(null);
  }

  function changeMainView(view: ForUMainView) {
    deselectNode();
    clearFocus();
    setMainView(view);
  }

  function runCurrentStepAction() {
    if (projectGuideState === 'empty' || projectGuideState === 'raw') {
      openIdeaJar();
      return;
    }

    if (projectGuideState === 'organized') {
      setView('map');
      setRevealedStep('organized');
      return;
    }

    if (projectGuideState === 'planned' || projectGuideState === 'active') {
      setView('kanban');
      setRevealedStep(projectGuideState);
      return;
    }

    setIsDailyRewardOpen(true);
  }

  return (
    <main className="foru-shell">
      <Toaster position="bottom-center" toastOptions={{ className: 'foru-hot-toast' }} />
      <header className="foru-shell-header">
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <ProjectNavigator onOpenProject={openProjectIsland} onOpenDashboard={openDashboard} />
        <div className="foru-main-mode-switcher" aria-label="Modo principal">
          <button
            type="button"
            className={mainView === 'objectives' ? 'is-active' : ''}
            onClick={() => changeMainView('objectives')}
          >
            <span>🎯</span>
            <strong>Objetivos</strong>
          </button>
          <button
            type="button"
            className={mainView === 'world' ? 'is-active' : ''}
            onClick={() => changeMainView('world')}
          >
            <span>🌍</span>
            <strong>Mi Mundo</strong>
          </button>
        </div>
        {mainView === 'objectives' ? <span className="foru-header-step-pill">🎯 Paso {guideStep.index}/5: {guideStep.label}</span> : null}
        <button
          type="button"
          className="foru-daily-streak-badge"
          data-tooltip="Inicia sesión cada día para mantener tu racha"
          onClick={() => setIsDailyRewardOpen(true)}
        >
          📅 Racha: {dailyStreak} {dailyStreak === 1 ? 'día' : 'días'}
        </button>
        <button
          type="button"
          className="foru-coins-badge"
          data-tooltip="Gana monedas completando tareas"
          onClick={() => setIsDailyRewardOpen(true)}
        >
          🪙 {coins} monedas
        </button>
      </header>

      <section className="foru-shell-main">
        <div className="foru-canvas-stage">
          {mainView === 'world' ? (
            <>
              <div className="foru-canvas-toolbar">
                <span className="foru-context-message">🌍 Explora tu mundo en 3D</span>
              </div>
              <Suspense fallback={<World3DSkeleton />}>
                <World3D onBackToMap={() => setMainView('objectives')} onOpenProject={openProjectIsland} />
              </Suspense>
            </>
          ) : shouldRevealWorkView && projectGuideState === 'organized' ? (
            <>
              <ProjectCanvas />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : shouldRevealWorkView && (projectGuideState === 'planned' || projectGuideState === 'active') ? (
            <>
              <KanbanView />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : (
            <FocusOnlyStep
              content={focusContent}
              step={guideStep}
              onAction={runCurrentStepAction}
            />
          )}
        </div>
      </section>

      <DailyRewardsModal isOpen={isDailyRewardOpen} onClose={() => setIsDailyRewardOpen(false)} />
    </main>
  );
}

function FocusOnlyStep({
  content,
  step,
  onAction,
}: {
  content: FocusStepContent;
  step: GuideStep;
  onAction: () => void;
}) {
  return (
    <section className="foru-focus-only-step" aria-label={step.label}>
      <span className="foru-focus-only-step-index">Paso {step.index}/5</span>
      <div className="foru-focus-only-orb">{content.icon}</div>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <button type="button" onClick={onAction}>{content.action}</button>
      {step.index <= 2 ? <IdeaJarFab hiddenLauncher /> : null}
    </section>
  );
}

function World3DSkeleton() {
  return (
    <section className="foru-world3d-skeleton" aria-label="Cargando Mundito 3D">
      <div className="foru-world3d-skeleton-island">
        <i />
        <i />
        <i />
      </div>
      <div>
        <span>Cargando Mundito 3D</span>
        <strong>Preparando islas, luces y perlitas...</strong>
      </div>
    </section>
  );
}

type GuideStep = {
  index: number;
  label: string;
};

type FocusStepContent = {
  icon: string;
  title: string;
  description: string;
  action: string;
};

const guideStepsByState: Record<ForUProjectGuideState, GuideStep> = {
  empty: { index: 1, label: 'Capturar' },
  raw: { index: 2, label: 'Organizar' },
  organized: { index: 3, label: 'Planificar' },
  planned: { index: 4, label: 'Ejecutar' },
  active: { index: 4, label: 'Ejecutar' },
  completed: { index: 5, label: 'Celebrar' },
};

const focusContentByState: Record<ForUProjectGuideState, FocusStepContent> = {
  empty: {
    icon: '📥',
    title: '¡Empecemos!',
    description: 'Captura tus ideas sin juzgar. Una frase basta.',
    action: 'Echar ideas al frasco',
  },
  raw: {
    icon: '🤖',
    title: 'Ideas listas',
    description: 'Ahora deja que la IA ordene tu cabeza.',
    action: 'Organizar con IA',
  },
  organized: {
    icon: '🗺️',
    title: 'Ruta lista',
    description: 'Mira tu ruta solo cuando estés lista para planificar.',
    action: 'Ver Ruta Digital',
  },
  planned: {
    icon: '🎯',
    title: 'Plan listo',
    description: 'Empieza por una tarea. Solo una.',
    action: 'Empezar',
  },
  active: {
    icon: '✅',
    title: 'Sigue el plan',
    description: 'Continúa con la siguiente tarea.',
    action: 'Seguir ejecutando',
  },
  completed: {
    icon: '🎉',
    title: '¡A celebrar!',
    description: 'Ya hiciste progreso real.',
    action: 'Ver recompensa',
  },
};
