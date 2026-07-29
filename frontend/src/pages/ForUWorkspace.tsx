import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import EmotionalOnboardingModal from '../components/EmotionalOnboardingModal';
import FloatingReward, { type FloatingRewardBurst } from '../components/FloatingReward';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { planConfigs, type ForUNextAction, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const World3D = lazy(() => import('../components/World3D'));
const ActionView = lazy(() => import('../components/ActionView'));
const GanttView = lazy(() => import('../components/GanttView'));
const KanbanView = lazy(() => import('../components/KanbanView'));
const ProjectCanvas = lazy(() => import('../components/ProjectCanvas'));
const ForUChat = lazy(() => import('../components/ForUChat'));
const PersonalDashboard = lazy(() => import('../components/PersonalDashboard'));
const NodeDetailPanel = lazy(() => import('../components/NodeDetailPanel'));

type WorkspaceScreen = 'dashboard' | 'action' | 'project' | 'world';
type ProjectSubview = 'kanban' | 'map' | 'gantt';

export default function ForUWorkspace() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [screen, setScreen] = useState<WorkspaceScreen>('dashboard');
  const [projectSubview, setProjectSubview] = useState<ProjectSubview>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [completedAction, setCompletedAction] = useState<ForUNextAction | null>(null);
  const [rewardBurst, setRewardBurst] = useState<FloatingRewardBurst | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const coins = useActiveProjectsStore((state) => state.coins);
  const dailyStreak = useActiveProjectsStore((state) => state.dailyStreak);
  const userPlan = useActiveProjectsStore((state) => state.userPlan);
  const features = useActiveProjectsStore((state) => state.features);
  const planLimitNotice = useActiveProjectsStore((state) => state.planLimitNotice);
  const clearPlanLimitNotice = useActiveProjectsStore((state) => state.clearPlanLimitNotice);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const setView = useActiveProjectsStore((state) => state.setView);
  const getProjectById = useActiveProjectsStore((state) => state.getProjectById);
  const getNextAction = useActiveProjectsStore((state) => state.getNextAction);
  const getPersonalDashboardProjects = useActiveProjectsStore((state) => state.getPersonalDashboardProjects);
  const generateNextAction = useActiveProjectsStore((state) => state.generateNextAction);
  const completeNextAction = useActiveProjectsStore((state) => state.completeNextAction);
  const hydrateFromSupabase = useActiveProjectsStore((state) => state.hydrateFromSupabase);
  const clearCloudUser = useActiveProjectsStore((state) => state.clearCloudUser);

  useEffect(() => {
    if (!user?.id) return;
    void hydrateFromSupabase(user.id);
  }, [hydrateFromSupabase, user?.id]);

  const dashboardProjects = useMemo(
    () => getPersonalDashboardProjects(),
    [activeProjectIds, projectsById, getPersonalDashboardProjects],
  );
  const currentProjectId = selectedProjectId ?? activeProjectId ?? dashboardProjects[0]?.project.id ?? null;
  const currentProject = currentProjectId ? getProjectById(currentProjectId) : null;
  const currentAction = currentProjectId ? getNextAction(currentProjectId) : null;
  const planLabel = planConfigs[userPlan ?? 'free'].label;

  function showUpgrade(title: string, message: string) {
    useActiveProjectsStore.setState({
      planLimitNotice: {
        title,
        message,
        feature: 'kanban',
      },
    });
  }

  function openDashboard(projectId?: string) {
    if (projectId) {
      switchProject(projectId);
      setSelectedProjectId(projectId);
    }

    deselectNode();
    clearFocus();
    setCompletedAction(null);
    setScreen('dashboard');
  }

  function selectProject(projectId: string) {
    switchProject(projectId);
    setSelectedProjectId(projectId);
    setCompletedAction(null);
    deselectNode();
    clearFocus();
  }

  function startProject(projectId: string) {
    selectProject(projectId);
    generateNextAction(projectId);
    setScreen('action');
  }

  function viewProject(projectId: string) {
    if (!features.kanban) {
      showUpgrade('Upgrade a Pro para ver el proyecto completo', 'El plan Gratis mantiene el tablero personal y la acción del momento. Pro desbloquea Kanban, mapa mental y flujo completo.');
      return;
    }

    selectProject(projectId);
    setView('kanban');
    setProjectSubview('kanban');
    setScreen('project');
  }

  function openWorld() {
    if (!features.world3D) {
      showUpgrade('Desbloquea el Mundo 3D con Pro', 'Mi Mundo es parte de Pro: islas, progreso visual y exploración 3D cuando quieras inspirarte.');
      return;
    }

    deselectNode();
    clearFocus();
    setScreen('world');
  }

  function changeProjectSubview(subview: ProjectSubview) {
    deselectNode();
    clearFocus();
    setProjectSubview(subview);
    setView(subview === 'map' ? 'map' : subview);
  }

  function completeAction(point: { x: number; y: number }) {
    if (!currentProjectId || !currentAction) return;

    const completed = completeNextAction(currentProjectId, currentAction.id);
    if (!completed) return;

    setCompletedAction(currentAction);
    setRewardBurst({
      id: `${Date.now()}-${Math.random()}`,
      x: point.x,
      y: point.y,
      coins: currentAction.rewardCoins,
      xp: currentAction.isFallback ? 5 : 20,
    });
    window.setTimeout(() => setRewardBurst(null), 1500);
  }

  async function handleSignOut() {
    clearCloudUser();
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <main className="foru-personal-shell">
      <Toaster position="bottom-center" toastOptions={{ className: 'foru-hot-toast' }} />
      <header className="foru-personal-header">
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>

        <label className="foru-personal-project-select">
          <span>Proyecto</span>
          <select
            value={currentProjectId ?? ''}
            onChange={(event) => openDashboard(event.target.value)}
          >
            {dashboardProjects.map(({ project }) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <div className="foru-personal-header-stats">
          <button type="button" className="foru-chat-open-button" onClick={() => setIsChatOpen(true)}>
            Hablar con For U 💬
          </button>
          <button type="button" className="foru-world-button" onClick={openWorld}>
            🌍 Mi Mundo
          </button>
          <Link className="foru-header-quiet-button" to="/whatsapp">
            WhatsApp
          </Link>
          <span title="Tu plan actual">Plan {planLabel}</span>
          <span title="Inicia sesión cada día para mantener tu racha">📅 Racha: {dailyStreak} {dailyStreak === 1 ? 'dia' : 'dias'}</span>
          <span title="Gana monedas completando acciones">🪙 {coins} monedas</span>
          <button type="button" className="foru-header-quiet-button" onClick={handleSignOut}>
            Salir
          </button>
        </div>
      </header>

      {screen === 'world' ? (
        <section className="foru-integrated-view">
          <button type="button" className="foru-integrated-back" onClick={() => openDashboard(currentProjectId ?? undefined)}>
            ← Volver al tablero
          </button>
          <Suspense fallback={<WorldLoader />}>
            <World3D onBackToMap={() => openDashboard(currentProjectId ?? undefined)} onOpenProject={viewProject} />
          </Suspense>
        </section>
      ) : screen === 'project' ? (
        <section className="foru-integrated-view">
          <div className="foru-project-workbar">
            <button type="button" onClick={() => openDashboard(currentProjectId ?? undefined)}>
              ← Volver al tablero
            </button>
            <p>{currentProject?.name ? `Aquí tienes todo lo de ${currentProject.name}, Nicole.` : 'Aquí tienes el proyecto completo, Nicole.'}</p>
            <div className="foru-project-subtabs" aria-label="Vistas del proyecto">
              <button type="button" className={projectSubview === 'kanban' ? 'is-active' : ''} onClick={() => changeProjectSubview('kanban')}>
                📋 Tareas
              </button>
              <button type="button" className={projectSubview === 'map' ? 'is-active' : ''} onClick={() => changeProjectSubview('map')}>
                🧠 Mapa
              </button>
              <button type="button" className={projectSubview === 'gantt' ? 'is-active' : ''} onClick={() => changeProjectSubview('gantt')}>
                📊 Tiempo
              </button>
            </div>
          </div>

          {projectSubview === 'kanban' ? (
            <Suspense fallback={<ScreenLoader label="Cargando tareas..." />}>
              <KanbanView />
            </Suspense>
          ) : null}
          {projectSubview === 'map' ? (
            <Suspense fallback={<ScreenLoader label="Cargando mapa..." />}>
              <ProjectCanvas />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </Suspense>
          ) : null}
          {projectSubview === 'gantt' ? (
            <Suspense fallback={<ScreenLoader label="Cargando cronograma..." />}>
              <GanttView />
            </Suspense>
          ) : null}
        </section>
      ) : screen === 'action' ? (
        <Suspense fallback={<ScreenLoader label="Cargando acción..." />}>
          <ActionView
            project={currentProject}
            action={currentAction}
            completedAction={completedAction}
            onComplete={completeAction}
            onNext={() => setCompletedAction(null)}
            onBack={() => openDashboard(currentProjectId ?? undefined)}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<ScreenLoader label="Cargando tablero..." />}>
          <PersonalDashboard
            name="Nicole"
            planLabel={planLabel}
            projects={dashboardProjects}
            onStart={startProject}
            onViewProject={viewProject}
          />
        </Suspense>
      )}

      <AnimatePresence>
        {planLimitNotice ? (
          <div className="foru-upgrade-backdrop" role="dialog" aria-modal="true">
            <div className="foru-upgrade-modal">
              <span>✨</span>
              <h2>{planLimitNotice.title}</h2>
              <p>{planLimitNotice.message}</p>
              <div>
                <button type="button" onClick={() => navigate('/pricing')}>Ver planes</button>
                <button type="button" onClick={clearPlanLimitNotice}>Ahora no</button>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {currentProject ? <EmotionalOnboardingModal project={currentProject} /> : null}
      </AnimatePresence>
      <Suspense fallback={null}>
        <ForUChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </Suspense>
      <FloatingReward burst={rewardBurst} />
    </main>
  );
}

function WorldLoader() {
  return (
    <section className="foru-world-loader">
      <span>🌍</span>
      <strong>Cargando Mi Mundo...</strong>
    </section>
  );
}

function ScreenLoader({ label }: { label: string }) {
  return (
    <section className="foru-world-loader">
      <span>✨</span>
      <strong>{label}</strong>
    </section>
  );
}
