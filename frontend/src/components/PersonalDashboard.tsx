import { motion } from 'framer-motion';
import {
  type ForUActiveProject,
  type ForUNextAction,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';
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
  onViewProject: (projectId: string) => void;
  onCreateIndustryProject: () => void;
};

export default function PersonalDashboard({
  name = 'Nicole',
  planLabel,
  projects,
  onViewProject,
  onCreateIndustryProject,
}: PersonalDashboardProps) {
  const greeting = getGreeting();
  const attentiveProjects = projects.filter((item) => item.pendingCount > 0).length;
  const getCurrentDigitalRouteStep = useActiveProjectsStore((state) => state.getCurrentDigitalRouteStep);
  const getDigitalRouteSteps = useActiveProjectsStore((state) => state.getDigitalRouteSteps);
  const featuredProject = projects[0] ?? null;

  return (
    <section className="foru-personal-dashboard" aria-label="Tablero de Control Personal">
      <motion.div
        className="foru-personal-dashboard-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div>
          <h1><GradientText>{greeting.text}, {name}</GradientText></h1>
          <p>{getBossMessage(attentiveProjects)}</p>
        </div>
        <MagicBadge className="foru-plan-badge">Plan {planLabel}</MagicBadge>
      </motion.div>

      {featuredProject ? (
        <MagicCard as="section" className="foru-next-route-card">
          <div>
            <MagicBadge>Ahora</MagicBadge>
            <h2>{featuredProject.project.name}</h2>
            <p>{getRouteCardTitle(featuredProject.project.id, getCurrentDigitalRouteStep)}</p>
            <small>{getRouteCardSubtitle(featuredProject.project.id, getDigitalRouteSteps, featuredProject.nextAction?.title)}</small>
          </div>
          <MagicButton type="button" onClick={() => onViewProject(featuredProject.project.id)}>
            Continuar ruta
          </MagicButton>
        </MagicCard>
      ) : null}

      <div className="foru-personal-project-list" aria-label="Proyectos">
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
                <span className="foru-personal-project-status">{pendingCount > 0 ? `${pendingCount} acciones` : 'Sin pendientes'}</span>
                <h2>{project.name}</h2>
                {project.industryKey ? <MagicBadge>{getIndustryLabel(project.industryKey)}</MagicBadge> : null}
              </div>
              <strong>{formatPriority(nextAction?.priority)}</strong>
            </div>

            <div className="foru-personal-next-action">
              <span>Ruta Digital</span>
              <p>{getRouteCardTitle(project.id, getCurrentDigitalRouteStep)}</p>
              <small>{getRouteCardSubtitle(project.id, getDigitalRouteSteps, nextAction?.title)}</small>
              {isProjectQuiet(project) ? (
                <em>Nicole, este proyecto te extraña. ¿Le dedicamos 10 minutos?</em>
              ) : null}
            </div>

            <div className="foru-personal-project-actions">
              <MagicButton type="button" onClick={() => onViewProject(project.id)}>
                Continuar ruta
              </MagicButton>
              <MagicButton type="button" variant="soft" onClick={() => onViewProject(project.id)}>
                Ver proyecto
              </MagicButton>
            </div>
            </motion.div>
          </MagicCard>
        ))}
      </div>

      <MagicCard as="section" className="foru-industry-starter-card">
        <div>
          <MagicBadge>Nuevo sistema</MagicBadge>
          <h2>Crear otra Ruta Digital</h2>
          <p>Elige un rubro y For U prepara una ruta completa: oferta, landing, WhatsApp, contenido, Google y métricas.</p>
        </div>
        <MagicButton type="button" variant="soft" onClick={onCreateIndustryProject}>
          Elegir rubro
        </MagicButton>
      </MagicCard>
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

function getIndustryLabel(industryKey: NonNullable<ForUActiveProject['industryKey']>) {
  if (industryKey === 'gastronomy') return 'Gastronomía';
  return 'Turismo';
}

function getRouteCardTitle(
  projectId: string,
  getCurrentDigitalRouteStep: ReturnType<typeof useActiveProjectsStore.getState>['getCurrentDigitalRouteStep'],
) {
  const step = getCurrentDigitalRouteStep(projectId);
  return step ? `Siguiente estación: ${step.title}` : 'Crear Ruta Digital';
}

function getRouteCardSubtitle(
  projectId: string,
  getDigitalRouteSteps: ReturnType<typeof useActiveProjectsStore.getState>['getDigitalRouteSteps'],
  fallbackAction?: string,
) {
  const steps = getDigitalRouteSteps(projectId);
  if (steps.length === 0) return fallbackAction ?? 'For U preparará el primer paso.';
  const ready = steps.filter((step) => step.status === 'ready').length;
  return `${ready}/${steps.length} estaciones listas · Oferta, landing, WhatsApp, contenido, Google y mejora.`;
}
