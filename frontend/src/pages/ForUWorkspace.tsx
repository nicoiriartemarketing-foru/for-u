import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ArchipelagoView from '../components/ArchipelagoView';
import DailyRewardsModal from '../components/DailyRewardsModal';
import GanttView from '../components/GanttView';
import IdeaJarFab from '../components/IdeaJarFab';
import KanbanView from '../components/KanbanView';
import Logo from '../components/Logo';
import NodeDetailPanel from '../components/NodeDetailPanel';
import ProjectCanvas from '../components/ProjectCanvas';
import ProjectDashboard from '../components/ProjectDashboard';
import ProjectNavigator from '../components/ProjectNavigator';
import { type ForUActiveProject, type ForUProjectGuideState, type ForUWorkspaceView, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const World3D = lazy(() => import('../components/World3D'));
type ForUMainView = 'objectives' | 'world';

export default function ForUWorkspace() {
  const [mainView, setMainView] = useState<ForUMainView>('objectives');
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const currentView = useActiveProjectsStore((state) => state.currentView);
  const setView = useActiveProjectsStore((state) => state.setView);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const panToIsland = useActiveProjectsStore((state) => state.panToIsland);
  const coins = useActiveProjectsStore((state) => state.coins);
  const dailyStreak = useActiveProjectsStore((state) => state.dailyStreak);
  const checkDailyReward = useActiveProjectsStore((state) => state.checkDailyReward);
  const getProjectState = useActiveProjectsStore((state) => state.getProjectState);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);
  const [firstUseTip, setFirstUseTip] = useState<string | null>(null);
  const [dismissedGuideKey, setDismissedGuideKey] = useState('');

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const projectGuideState = activeProjectId ? getProjectState(activeProjectId) : 'empty';
  const guideStep = guideStepsByState[projectGuideState];
  const shouldShowGuidedCapture = mainView === 'objectives' && (projectGuideState === 'empty' || projectGuideState === 'raw');
  const contextualGuideKey = `${activeProjectId ?? 'none'}-${projectGuideState}`;
  const shouldShowContextualGuide = mainView === 'objectives'
    && ['empty', 'raw', 'organized', 'planned'].includes(projectGuideState)
    && dismissedGuideKey !== contextualGuideKey;

  useEffect(() => {
    if (checkDailyReward().shouldShow) {
      setIsDailyRewardOpen(true);
    }
  }, [checkDailyReward]);

  useEffect(() => {
    if (mainView !== 'objectives') {
      setFirstUseTip(null);
      return;
    }

    const tip = firstUseTips[currentView];
    if (!tip) {
      setFirstUseTip(null);
      return;
    }

    const storageKey = `foru-first-use-tip-${currentView}`;
    if (window.localStorage.getItem(storageKey)) {
      setFirstUseTip(null);
      return;
    }

    setFirstUseTip(tip);
    window.localStorage.setItem(storageKey, 'true');
    const timeoutId = window.setTimeout(() => setFirstUseTip(null), 6500);

    return () => window.clearTimeout(timeoutId);
  }, [currentView, mainView]);

  function openProjectIsland(projectId: string) {
    switchProject(projectId);
    panToIsland(projectId);
    deselectNode();
    clearFocus();
    setView('map');
    setMainView('objectives');
  }

  function openDashboard() {
    deselectNode();
    clearFocus();
    setView('dashboard');
    setMainView('objectives');
  }

  function changeView(view: ForUWorkspaceView) {
    deselectNode();
    clearFocus();
    setMainView('objectives');
    setView(view);
  }

  function changeMainView(view: ForUMainView) {
    deselectNode();
    clearFocus();
    setMainView(view);
    if (view === 'objectives' && currentView === 'dashboard') {
      setView('archipelago');
    }
  }

  function runNextAction() {
    if (projectGuideState === 'empty' || projectGuideState === 'raw') {
      openIdeaJar();
      return;
    }

    if (projectGuideState === 'organized') {
      setMainView('objectives');
      setView('map');
      return;
    }

    if (projectGuideState === 'planned' || projectGuideState === 'active') {
      setMainView('objectives');
      setView('kanban');
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
        <button type="button" className="foru-daily-streak-badge" onClick={() => setIsDailyRewardOpen(true)}>
          🔥 Racha: {dailyStreak} días
        </button>
        <button type="button" className="foru-coins-badge" onClick={() => setIsDailyRewardOpen(true)}>
          🪙 {coins}
        </button>
      </header>

      <section className="foru-shell-main">
        <div className="foru-canvas-stage">
          <div className="foru-canvas-toolbar">
            <span className="foru-step-kicker">
              {mainView === 'world'
                ? 'Mi Mundo · Exploración 3D'
                : currentView === 'dashboard'
                ? 'Dashboard · Archipiélago de Proyectos'
                : currentView === 'archipelago'
                ? 'Archipiélago · Todos los mapas mentales'
                : currentView === 'map'
                ? 'Mapa Mental · Isla enfocada'
                : currentView === 'kanban'
                ? 'Kanban · Ejecución por estado'
                : currentView === 'gantt'
                ? 'Gantt · Línea de tiempo'
                : 'Archipiélago · Zoom continuo'}
            </span>
            {mainView === 'objectives' ? (
              <div className="foru-subview-switcher" aria-label="Vistas de objetivos">
                {workspaceViews.map((view) => (
                  <button
                    key={view.key}
                    type="button"
                    className={currentView === view.key ? 'is-active' : ''}
                    onClick={() => changeView(view.key)}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="foru-world-subnav" aria-label="Vistas de Mi Mundo">
                <span>🌌 Archipiélago 3D</span>
                {activeProject ? <span>Isla actual: {activeProject.name}</span> : null}
              </div>
            )}
            <div className="foru-shell-metrics">
              <span>{mainView === 'world' ? 'Explora tus islas en 3D' : 'Elige una vista y avanza sin ruido'}</span>
            </div>
          </div>
          {firstUseTip ? (
            <div className="foru-first-use-tip" role="status">
              <strong>Tip rápido</strong>
              <span>{firstUseTip}</span>
              <button type="button" onClick={() => setFirstUseTip(null)}>Entendido</button>
            </div>
          ) : null}
          {mainView === 'objectives' && activeProject ? (
            <ProjectFlowBar
              state={projectGuideState}
              step={guideStep}
              onNextAction={runNextAction}
            />
          ) : null}
          {mainView === 'objectives' ? <RouteProgressBar project={activeProject} /> : null}
          {mainView === 'world' ? (
            <Suspense fallback={<World3DSkeleton />}>
              <World3D onBackToMap={() => setMainView('objectives')} onOpenProject={openProjectIsland} />
            </Suspense>
          ) : shouldShowGuidedCapture ? (
            <IdeaJarFab
              centered
              title={projectGuideState === 'raw' ? '¡Tienes ideas esperando!' : '¡Empecemos por capturar!'}
              description={projectGuideState === 'raw'
                ? 'Tu siguiente paso es organizar esas notas con IA para convertirlas en tareas claras.'
                : 'Antes de ver mapas y tableros, suelta ideas crudas en el frasco. No tienen que estar perfectas.'}
            />
          ) : currentView === 'dashboard' ? (
            <ProjectDashboard onEnterProject={openProjectIsland} />
          ) : currentView === 'archipelago' ? (
            <ArchipelagoView onEnterProject={openProjectIsland} />
          ) : currentView === 'map' ? (
            <>
              <ProjectCanvas />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : currentView === 'kanban' ? (
            <>
              <KanbanView />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : currentView === 'gantt' ? (
            <GanttView />
          ) : (
            <ArchipelagoView onEnterProject={openProjectIsland} />
          )}
        </div>
      </section>

      {mainView === 'objectives' && currentView === 'archipelago' && !shouldShowGuidedCapture ? <IdeaJarFab /> : null}
      {shouldShowContextualGuide ? (
        <FirstStepsModal
          state={projectGuideState}
          step={guideStep}
          onClose={() => setDismissedGuideKey(contextualGuideKey)}
          onAction={() => {
            setDismissedGuideKey(contextualGuideKey);
            runNextAction();
          }}
        />
      ) : null}
      <DailyRewardsModal isOpen={isDailyRewardOpen} onClose={() => setIsDailyRewardOpen(false)} />
    </main>
  );
}

function ProjectFlowBar({
  state,
  step,
  onNextAction,
}: {
  state: ForUProjectGuideState;
  step: GuideStep;
  onNextAction: () => void;
}) {
  return (
    <section className="foru-project-flow" aria-label="Progreso guiado del proyecto">
      <div className="foru-project-flow-steps">
        {flowSteps.map((item) => (
          <article key={item.index} className={`${item.index < step.index ? 'is-done' : ''} ${item.index === step.index ? 'is-current' : ''}`}>
            <span>{item.index < step.index ? '✓' : item.index}</span>
            <strong>{item.shortLabel}</strong>
          </article>
        ))}
      </div>
      <div className="foru-project-flow-now">
        <small>Paso {step.index}/5</small>
        <strong>{step.label}</strong>
      </div>
      <button type="button" onClick={onNextAction}>
        {nextActionByState[state]}
      </button>
    </section>
  );
}

function FirstStepsModal({
  state,
  step,
  onClose,
  onAction,
}: {
  state: ForUProjectGuideState;
  step: GuideStep;
  onClose: () => void;
  onAction: () => void;
}) {
  const content = modalContentByState[state] ?? modalContentByState.empty;

  return (
    <div className="foru-first-steps-backdrop" role="dialog" aria-modal="true">
      <section className="foru-first-steps-modal">
        <span>{content.icon}</span>
        <small>Paso {step.index}/5 · {step.label}</small>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <div>
          <button type="button" onClick={onAction}>{content.action}</button>
          <button type="button" onClick={onClose}>Ahora no</button>
        </div>
      </section>
    </div>
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

const workspaceViews: Array<{ key: ForUWorkspaceView; label: string }> = [
  { key: 'archipelago', label: '🗺️ Archipiélago' },
  { key: 'map', label: '🧠 Mapa' },
  { key: 'kanban', label: '📋 Kanban' },
  { key: 'gantt', label: '📊 Gantt' },
  { key: 'dashboard', label: '📊 Dashboard' },
];

type GuideStep = {
  index: number;
  label: string;
  shortLabel: string;
};

const flowSteps: GuideStep[] = [
  { index: 1, label: '📥 Captura tus ideas', shortLabel: 'Capturar' },
  { index: 2, label: '🤖 Organiza con IA', shortLabel: 'Organizar' },
  { index: 3, label: '🗺️ Crea tu Ruta', shortLabel: 'Planificar' },
  { index: 4, label: '✅ Ejecuta el plan', shortLabel: 'Ejecutar' },
  { index: 5, label: '🎉 ¡Progreso!', shortLabel: 'Celebrar' },
];

const guideStepsByState: Record<ForUProjectGuideState, GuideStep> = {
  empty: flowSteps[0],
  raw: flowSteps[1],
  organized: flowSteps[2],
  planned: flowSteps[3],
  active: flowSteps[3],
  completed: flowSteps[4],
};

const nextActionByState: Record<ForUProjectGuideState, string> = {
  empty: '📥 Capturar',
  raw: '✨ Organizar',
  organized: '🗺️ Ver Ruta',
  planned: '▶️ Empezar',
  active: '✅ Seguir ejecutando',
  completed: '🎉 Celebrar',
};

const modalContentByState: Record<Exclude<ForUProjectGuideState, 'active' | 'completed'>, {
  icon: string;
  title: string;
  description: string;
  action: string;
}> = {
  empty: {
    icon: '🚀',
    title: '¡Empecemos!',
    description: 'Este proyecto todavía no tiene ideas. Primero vamos a capturar sin ordenar ni juzgar.',
    action: 'Echar ideas al frasco',
  },
  raw: {
    icon: '✨',
    title: '¡Tienes ideas!',
    description: 'Ya hay material en el frasco. El siguiente paso es pedirle a la IA que lo convierta en tareas claras.',
    action: 'Organizar mi cerebro con IA',
  },
  organized: {
    icon: '🧠',
    title: '¡Estructura lista!',
    description: 'Tus ideas ya tienen forma. Ahora revisa el mapa y la Ruta Digital para elegir el camino.',
    action: 'Ver mi Ruta Digital',
  },
  planned: {
    icon: '🎯',
    title: '¡Plan listo!',
    description: 'Ya tienes una ruta. Ahora toca ejecutar paso a paso sin mirar todo a la vez.',
    action: 'Empezar a ejecutar',
  },
};

const firstUseTips: Partial<Record<ForUWorkspaceView, string>> = {
  archipelago: 'Haz doble clic en una isla para entrar a su mapa. Activa Mover Mapa solo cuando quieras navegar.',
  map: 'Haz clic en una rama o en un nodo para ver detalles. Usa Mover Mapa solo cuando quieras reorganizar la vista.',
  kanban: 'Arrastra tareas entre columnas. Cuando una tarea llega a Done, ganas monedas.',
  gantt: 'Aquí ves la línea de tiempo de tu proyecto para entender qué viene primero.',
  dashboard: 'Compara tus proyectos sin entrar en cada isla.',
};

function RouteProgressBar({ project }: { project: ForUActiveProject | null }) {
  if (!project?.digitalRoute.length) return null;

  const totalSteps = project.digitalRoute.length;
  const safeIndex = Math.min(project.currentRouteIndex, totalSteps - 1);
  const currentStep = project.digitalRoute[safeIndex];
  const completedSteps = project.digitalRoute.filter((step, index) => step.completedAt || index < project.currentRouteIndex).length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <section className="foru-route-progress-bar" aria-label="Progreso de la Ruta Digital">
      <div>
        <span>Ruta Digital</span>
        <strong>
          Paso {Math.min(safeIndex + 1, totalSteps)} de {totalSteps}: {currentStep?.title ?? 'Ruta completa'}
        </strong>
      </div>
      <div className="foru-route-progress-track" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>
      <small>{progress}% completado</small>
    </section>
  );
}
