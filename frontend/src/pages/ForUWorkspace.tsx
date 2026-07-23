import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ArchipelagoView from '../components/ArchipelagoView';
import GanttView from '../components/GanttView';
import IdeaJarFab from '../components/IdeaJarFab';
import KanbanView from '../components/KanbanView';
import Logo from '../components/Logo';
import NodeDetailPanel from '../components/NodeDetailPanel';
import ProjectDashboard from '../components/ProjectDashboard';
import ProjectNavigator from '../components/ProjectNavigator';
import World3D from '../components/World3D';
import { Sparkles } from '../lib/icons';
import { type ForUActiveProject, type ForUWorkspaceView, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function ForUWorkspace() {
  const [isWorldOpen, setIsWorldOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const rawNotes = useActiveProjectsStore((state) => state.rawNotes);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const currentView = useActiveProjectsStore((state) => state.currentView);
  const setView = useActiveProjectsStore((state) => state.setView);
  const panToIsland = useActiveProjectsStore((state) => state.panToIsland);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  function openProjectIsland(projectId: string) {
    panToIsland(projectId);
    deselectNode();
    clearFocus();
    setView('archipelago');
    setIsWorldOpen(false);
  }

  function openDashboard() {
    deselectNode();
    clearFocus();
    setView('dashboard');
    setIsWorldOpen(false);
  }

  function changeView(view: ForUWorkspaceView) {
    deselectNode();
    clearFocus();
    setIsWorldOpen(false);
    setView(view);
  }

  return (
    <main className="foru-shell">
      <Toaster position="bottom-center" toastOptions={{ className: 'foru-hot-toast' }} />
      <header className="foru-shell-header">
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <ProjectNavigator onOpenProject={openProjectIsland} onOpenDashboard={openDashboard} />
        <div className="foru-view-switcher" aria-label="Selector de vistas">
          {workspaceViews.map((view) => (
            <button
              key={view.key}
              type="button"
              className={!isWorldOpen && currentView === view.key ? 'is-active' : ''}
              onClick={() => changeView(view.key)}
            >
              {view.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="foru-world3d-toggle"
          onClick={() => {
            deselectNode();
            setIsWorldOpen(true);
          }}
        >
          Ver Mundito 3D
        </button>
      </header>

      <section className="foru-shell-main">
        <div className="foru-canvas-stage">
          <div className="foru-canvas-toolbar">
            <span className="foru-step-kicker">
              {isWorldOpen
                ? 'Fase 8 · Primer Mundo 3D'
                : currentView === 'dashboard'
                ? 'Dashboard · Archipiélago de Proyectos'
                : currentView === 'archipelago'
                ? 'Archipiélago · Todos los mapas mentales'
                : currentView === 'kanban'
                ? 'Kanban · Ejecución por estado'
                : currentView === 'gantt'
                ? 'Gantt · Línea de tiempo'
                : 'Archipiélago · Zoom continuo'}
            </span>
            <div className="foru-shell-metrics">
              <span><Sparkles size={16} /> {rawNotes.length} notas crudas</span>
              <span>{activeProject?.name ?? 'sin proyecto'}</span>
            </div>
          </div>
          <RouteProgressBar project={activeProject} />
          {isWorldOpen ? (
            <World3D onBackToMap={() => setIsWorldOpen(false)} />
          ) : currentView === 'dashboard' ? (
            <ProjectDashboard onEnterProject={openProjectIsland} />
          ) : currentView === 'archipelago' ? (
            <ArchipelagoView onEnterProject={openProjectIsland} />
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

      {!isWorldOpen && currentView === 'archipelago' ? <IdeaJarFab /> : null}
    </main>
  );
}

const workspaceViews: Array<{ key: ForUWorkspaceView; label: string }> = [
  { key: 'archipelago', label: '🗺️ Archipiélago' },
  { key: 'kanban', label: '📋 Kanban' },
  { key: 'gantt', label: '📊 Gantt' },
  { key: 'dashboard', label: '📊 Dashboard' },
];

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
