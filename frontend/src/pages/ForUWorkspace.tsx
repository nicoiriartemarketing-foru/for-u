import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import IdeaJarFab from '../components/IdeaJarFab';
import Logo from '../components/Logo';
import NodeDetailPanel from '../components/NodeDetailPanel';
import ProjectCanvas from '../components/ProjectCanvas';
import ProjectTabBar from '../components/ProjectTabBar';
import World3D from '../components/World3D';
import { Sparkles } from '../lib/icons';
import { baseBranches, type ForUBranchKey, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function ForUWorkspace() {
  const [viewMode, setViewMode] = useState<'map' | 'world'>('map');
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const rawNotes = useActiveProjectsStore((state) => state.rawNotes);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const focusedBranch = useActiveProjectsStore((state) => state.focusedBranch);
  const setFocusBranch = useActiveProjectsStore((state) => state.setFocusBranch);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  return (
    <main className="foru-shell">
      <Toaster position="bottom-center" toastOptions={{ className: 'foru-hot-toast' }} />
      <header className="foru-shell-header">
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <div className="foru-shell-tabs">
          <ProjectTabBar />
        </div>
        {viewMode === 'map' ? (
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
            setViewMode('world');
          }}
        >
          Ver Mundito 3D
        </button>
      </header>

      <section className="foru-shell-main">
        <div className="foru-canvas-stage">
          <div className="foru-canvas-toolbar">
            <span className="foru-step-kicker">
              {viewMode === 'world' ? 'Fase 8 · Primer Mundo 3D' : 'Fase 6 · Mapa Mental Radial'}
            </span>
            <div className="foru-shell-metrics">
              <span><Sparkles size={16} /> {rawNotes.length} notas crudas</span>
              <span>{activeProject?.name ?? 'sin proyecto'}</span>
            </div>
          </div>
          {viewMode === 'world' ? (
            <World3D onBackToMap={() => setViewMode('map')} />
          ) : (
            <>
              <ProjectCanvas />
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {viewMode === 'map' ? <IdeaJarFab /> : null}
    </main>
  );
}
