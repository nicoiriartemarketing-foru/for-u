import { motion } from 'framer-motion';
import {
  feelingLabels,
  type ForUActiveProject,
  type ForUNextAction,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';
import AutonomousOrganizer from './AutonomousOrganizer';
import EmotionalWellbeingPanel from './EmotionalWellbeingPanel';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import GradientText from './ui/GradientText';

type PersonalDashboardItem = {
  project: ForUActiveProject;
  nextAction: ForUNextAction | null;
  pendingCount: number;
};

type PersonalDashboardProps = {
  name?: string;
  planLabel: string;
  projects: PersonalDashboardItem[];
  onStart: (projectId: string) => void;
  onViewProject: (projectId: string) => void;
};

export default function PersonalDashboard({
  name = 'Nicole',
  planLabel,
  projects,
  onStart,
  onViewProject,
}: PersonalDashboardProps) {
  const greeting = getGreeting();
  const attentiveProjects = projects.filter((item) => item.pendingCount > 0).length;
  const getFeelingProgress = useActiveProjectsStore((state) => state.getFeelingProgress);
  const focusProjectId = projects[0]?.project.id ?? null;

  return (
    <section className="foru-personal-dashboard" aria-label="Tablero de Control Personal">
      <motion.div
        className="foru-personal-dashboard-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <span>{greeting.icon}</span>
        <div>
          <h1><GradientText>{greeting.text}, {name}</GradientText></h1>
          <p>{getBossMessage(attentiveProjects)}</p>
          <MagicBadge className="foru-plan-badge">Plan {planLabel}</MagicBadge>
        </div>
      </motion.div>

      <div className="foru-dashboard-emotional-grid">
        <EmotionalWellbeingPanel projectId={focusProjectId} />
        <AutonomousOrganizer projectId={focusProjectId} />
      </div>

      <div className="foru-personal-project-list">
        {projects.map(({ project, nextAction, pendingCount }, index) => (
          <MagicCard
            as="article"
            key={project.id}
            className={pendingCount > 0 ? 'foru-personal-project-card has-pending' : 'foru-personal-project-card'}
          >
            <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.04 }}
          >
            <div className="foru-personal-project-main">
              <div>
                <span className="foru-personal-project-status">{pendingCount > 0 ? `${pendingCount} pendientes` : 'Sin pendientes'}</span>
                <h2>{project.name}</h2>
              </div>
              <strong>{formatPriority(nextAction?.priority)}</strong>
            </div>

            <div className="foru-personal-next-action">
              <span>Proxima accion</span>
              <p>{nextAction?.title ?? 'Crear una accion concreta para empezar'}</p>
              {project.targetFeelings[0] ? (
                <small className="foru-task-feeling-line">
                  Esto te acerca a sentir: {feelingLabels[project.targetFeelings[0]].icon} {feelingLabels[project.targetFeelings[0]].label}
                </small>
              ) : null}
              <small>{nextAction?.estimatedMinutes ?? 5} min · {nextAction?.rewardCoins ?? 5} monedas</small>
              {isProjectQuiet(project) ? (
                <em>Nicole, este proyecto te extraña. ¿Le dedicamos 10 minutos?</em>
              ) : null}
            </div>

            {project.targetFeelings.length > 0 ? (
              <div className="foru-feeling-bars">
                {project.targetFeelings.slice(0, 3).map((feeling) => {
                  const progress = getFeelingProgress(project.id, feeling);
                  return (
                    <div key={feeling}>
                      <span>{feelingLabels[feeling].icon} {feelingLabels[feeling].label}</span>
                      <strong>{progress}%</strong>
                      <i><b style={{ width: `${progress}%` }} /></i>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="foru-personal-project-actions">
              <MagicButton type="button" onClick={() => onStart(project.id)}>
                Empezar
              </MagicButton>
              <MagicButton type="button" variant="soft" onClick={() => onViewProject(project.id)}>
                Ver proyecto completo
              </MagicButton>
            </div>
            </motion.div>
          </MagicCard>
        ))}
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { icon: '☀️', text: 'Buenos dias' };
  if (hour < 19) return { icon: '🌤️', text: 'Buenas tardes' };
  return { icon: '🌙', text: 'Buenas noches' };
}

function formatPriority(priority?: ForUNextAction['priority']) {
  if (priority === 'high') return 'Urgente';
  if (priority === 'medium') return 'Importante';
  return 'Suave';
}

function getBossMessage(count: number) {
  if (count === 0) return 'Hoy no hay incendios. Podemos elegir un proyecto y avanzar suave, diez minutos cuentan.';
  if (count === 1) return 'Hay un proyecto pidiendo atención. Empecemos por una acción chiquita y concreta.';
  return `Hoy tienes ${count} proyectos pidiendo atención. Empecemos por el más urgente, sin abrir mil pestañas.`;
}

function isProjectQuiet(project: ForUActiveProject) {
  const lastUpdate = new Date(project.updatedAt).getTime();
  if (!Number.isFinite(lastUpdate)) return false;
  return Date.now() - lastUpdate > 48 * 60 * 60 * 1000;
}
