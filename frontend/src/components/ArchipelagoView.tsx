import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MiniMapIsland from './MiniMapIsland';
import { Sailboat } from '../lib/icons';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type ArchipelagoViewProps = {
  onEnterProject: (projectId: string) => void;
};

export default function ArchipelagoView({ onEnterProject }: ArchipelagoViewProps) {
  const [boatProjectId, setBoatProjectId] = useState<string | null>(null);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const lastCreatedProjectId = useActiveProjectsStore((state) => state.lastCreatedProjectId);
  const clearLastCreatedProject = useActiveProjectsStore((state) => state.clearLastCreatedProject);
  const openProject = useActiveProjectsStore((state) => state.openProject);

  const projects = useMemo(() => {
    return activeProjectIds.map((projectId) => projectsById[projectId]).filter(Boolean);
  }, [activeProjectIds, projectsById]);

  const selectedProjectId = boatProjectId ?? activeProjectId ?? projects[0]?.id ?? null;
  const selectedIndex = Math.max(0, projects.findIndex((project) => project.id === selectedProjectId));
  const gridSize = getGridSize(projects.length);
  const boatColumn = (selectedIndex % gridSize) + 1;
  const boatRow = Math.floor(selectedIndex / gridSize) + 1;
  const boatLeft = `${((boatColumn - 0.5) / gridSize) * 100}%`;
  const boatTop = `${1.5 + (boatRow - 1) * 24.5}rem`;

  useEffect(() => {
    if (!lastCreatedProjectId) return;

    setBoatProjectId(lastCreatedProjectId);
    const timeoutId = window.setTimeout(() => {
      clearLastCreatedProject();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [clearLastCreatedProject, lastCreatedProjectId]);

  function travelToProject(projectId: string) {
    setBoatProjectId(projectId);
    window.setTimeout(() => onEnterProject(projectId), 220);
  }

  function createIsland() {
    const name = window.prompt('Nombre de la nueva isla', `Proyecto ${projects.length + 1}`);
    if (!name) return;

    const projectId = openProject({ name });
    setBoatProjectId(projectId);
  }

  return (
    <section className="foru-archipelago-view" aria-label="Archipiélago de mapas mentales">
      <header className="foru-archipelago-header">
        <div>
          <span>Archipiélago</span>
          <h1>Tus proyectos como islas mentales</h1>
          <p>Se muestran {projects.length} islas activas. Haz clic en una isla para entrar a su mapa completo.</p>
        </div>
        <button type="button" onClick={createIsland}>+ Nueva isla</button>
      </header>

      <div className={`foru-archipelago-ocean has-${gridSize}-grid`}>
        <motion.div
          className="foru-archipelago-boat"
          drag
          dragMomentum={false}
          style={{
            left: boatLeft,
            top: boatTop,
          } as CSSProperties}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <span className="foru-boat-trail" />
          <Sailboat size={26} />
        </motion.div>

        <div className="foru-archipelago-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="foru-archipelago-island-slot"
              layout
              initial={project.id === lastCreatedProjectId ? { opacity: 0, scale: 0 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 190, damping: 18, delay: Math.min(index * 0.04, 0.3) }}
              onMouseEnter={() => setBoatProjectId(project.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => travelToProject(project.id)}
            >
              <MiniMapIsland
                project={project}
                position={{ column: (index % gridSize) + 1, row: Math.floor(index / gridSize) + 1 }}
                isNew={project.id === lastCreatedProjectId}
                isActive={project.id === selectedProjectId}
                onEnter={() => travelToProject(project.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lastCreatedProjectId ? (
          <IslandBirthAnimation key={lastCreatedProjectId} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function IslandBirthAnimation() {
  return (
    <motion.div
      className="foru-island-birth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      aria-live="polite"
    >
      <motion.div
        className="foru-island-birth-card"
        initial={{ scale: 0.7, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <div className="foru-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <i
              key={index}
              style={{
                left: `${8 + index * 5}%`,
                animationDelay: `${index * -0.08}s`,
              }}
            />
          ))}
        </div>
        <strong>¡🎉 Nueva isla creada!</strong>
        <span>Tu proyecto acaba de aparecer en el archipiélago.</span>
      </motion.div>
    </motion.div>
  );
}

function getGridSize(projectCount: number) {
  if (projectCount <= 1) return 1;
  if (projectCount <= 4) return 2;
  return 3;
}
