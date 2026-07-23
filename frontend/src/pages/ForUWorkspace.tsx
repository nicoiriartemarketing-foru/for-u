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
import ProjectCanvas from '../components/ProjectCanvas';
import ProjectDashboard from '../components/ProjectDashboard';
import ProjectNavigator from '../components/ProjectNavigator';
import TaskBoard from '../components/TaskBoard';
import World3D from '../components/World3D';
import { Sparkles } from '../lib/icons';
import { baseBranches, type ForUBranchKey, type ForUWorkspaceView, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function ForUWorkspace() {
  const [isWorldOpen, setIsWorldOpen] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const rawNotes = useActiveProjectsStore((state) => state.rawNotes);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const focusedBranch = useActiveProjectsStore((state) => state.focusedBranch);
  const setFocusBranch = useActiveProjectsStore((state) => state.setFocusBranch);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const currentView = useActiveProjectsStore((state) => state.currentView);
  const setView = useActiveProjectsStore((state) => state.setView);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const isTaskBoardOpen = !isWorldOpen && currentView === 'map' && focusedBranch;

  function openProjectMap(projectId: string) {
    switchProject(projectId);
    deselectNode();
    clearFocus();
    setView('map');
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
    if (view !== 'map') clearFocus();
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
        <ProjectNavigator onOpenProject={openProjectMap} onOpenDashboard={openDashboard} />
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
        {!isWorldOpen && currentView === 'map' ? (
          <div className="foru-focus-control">
            <button
              type="button"
              className={focusedBranch ? 'is-active' : ''}
              onClick={() => setIsFocusMenuOpen((current) => !current)}
            >
              {focusedBranch ? '👁️ Ver Todo' : '🔍 Modo Enfoque'}
            </button>
            <AnimatePresence>
              {isFocusMenuOpen ? (
                <div className="foru-focus-menu">
                  {baseBranches.map((branch) => (
                    <button
                      key={branch.key}
                      type="button"
                      onClick={() => {
                        setFocusBranch(branch.key as ForUBranchKey);
                        setIsFocusMenuOpen(false);
                      }}
                    >
                      {branch.icon} {branch.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      clearFocus();
                      setIsFocusMenuOpen(false);
                    }}
                  >
                    Volver a ver todo
                  </button>
                </div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
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
                : focusedBranch
                  ? 'Modo Enfoque · Ejecutar sin ruido'
                  : 'Fase 6 · Mapa Mental Radial'}
            </span>
            <div className="foru-shell-metrics">
              <span><Sparkles size={16} /> {rawNotes.length} notas crudas</span>
              <span>{activeProject?.name ?? 'sin proyecto'}</span>
            </div>
          </div>
          {isWorldOpen ? (
            <World3D onBackToMap={() => setIsWorldOpen(false)} />
          ) : currentView === 'dashboard' ? (
            <ProjectDashboard onEnterProject={openProjectMap} />
          ) : currentView === 'archipelago' ? (
            <ArchipelagoView onEnterProject={openProjectMap} />
          ) : currentView === 'kanban' ? (
            <>
              <KanbanView />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : currentView === 'gantt' ? (
            <GanttView />
          ) : isTaskBoardOpen ? (
            <>
              <TaskBoard
                branchKey={focusedBranch}
                onBackToMap={() => {
                  clearFocus();
                  deselectNode();
                }}
              />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          ) : (
            <>
              <button type="button" className="foru-back-archipelago" onClick={() => changeView('archipelago')}>
                Volver al Archipiélago
              </button>
              <ProjectCanvas />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {!isWorldOpen && currentView === 'map' ? <IdeaJarFab /> : null}
    </main>
  );
}

const workspaceViews: Array<{ key: ForUWorkspaceView; label: string }> = [
  { key: 'map', label: '🗺️ Mapa' },
  { key: 'kanban', label: '📋 Kanban' },
  { key: 'gantt', label: '📊 Gantt' },
  { key: 'archipelago', label: '🏝️ Archipiélago' },
  { key: 'dashboard', label: '📊 Dashboard' },
];
