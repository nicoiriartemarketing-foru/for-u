import { Link } from 'react-router-dom';
import IdeaJarFab from '../components/IdeaJarFab';
import ProjectCanvas from '../components/ProjectCanvas';
import ProjectTabBar from '../components/ProjectTabBar';
import { Sparkles } from '../lib/icons';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function ForUWorkspace() {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const rawNotes = useActiveProjectsStore((state) => state.rawNotes);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  return (
    <main className="foru-shell">
      <header className="foru-shell-header">
        <Link to="/" className="foru-shell-logo">FOR <span>U</span></Link>
        <div className="foru-shell-tabs">
          <ProjectTabBar />
        </div>
      </header>

      <section className="foru-shell-main">
        <div className="foru-canvas-stage">
          <div className="foru-canvas-toolbar">
            <span className="foru-step-kicker">Fase 3 · Lienzo Radial</span>
            <div className="foru-shell-metrics">
              <span><Sparkles size={16} /> {rawNotes.length} notas crudas</span>
              <span>{activeProject?.name ?? 'sin proyecto'}</span>
            </div>
          </div>
          <ProjectCanvas />
        </div>
      </section>

      <IdeaJarFab />
    </main>
  );
}
