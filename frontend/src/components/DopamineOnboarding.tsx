import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { persistModuleProject } from '../services/moduleDocuments';
import { moduleLabels, type ModuleType } from '../modules/moduleProjects';
import { compassEmotions, saveProjectCompass, loadProjectConfig } from '../services/projectCompass';
import { markOnboardingStep, type OnboardingState, saveOnboardingState } from '../hooks/useDopamineRoute';
import { useRewardBurst } from '../hooks/useRewardBurst';
import RewardCelebration from './RewardCelebration';
import { playUiTone } from '../lib/sound';
import type { CSSProperties, FormEvent } from 'react';
import MagicButton from './ui/MagicButton';
import GradientText from './ui/GradientText';
import MagicCard from './ui/MagicCard';

// ---------------------------------------------------------------------------
// DopamineOnboarding — Full-screen 4-step onboarding flow
// Replaces modal-over-empty-dashboard with a guided, linear experience.
// ---------------------------------------------------------------------------

type OnboardingStep = 'welcome' | 'industry' | 'compass' | 'firstMission';

const moduleOptions: Array<{ value: ModuleType; label: string; emoji: string; description: string }> = [
  { value: 'restaurant',  label: 'Gastronomía',        emoji: '🍽️', description: 'Restaurantes, cafeterías, dark kitchens, catering.' },
  { value: 'ecommerce',   label: 'Tienda / productos', emoji: '🛍️', description: 'Productos físicos o digitales, e-commerce.' },
  { value: 'hospitality', label: 'Hospedaje',           emoji: '🏡', description: 'Hoteles, hostales, alojamientos, Airbnb.' },
  { value: 'tourism',     label: 'Turismo / experiencias', emoji: '🗺️', description: 'Tours, actividades, retiros, experiencias.' },
  { value: 'courses',     label: 'Cursos / educación',  emoji: '🎓', description: 'Cursos online, talleres, mentoría.' },
];

type DopamineOnboardingProps = {
  /** Called when the full onboarding is done, with the new project ID */
  onComplete: (projectId: string) => void;
};

export default function DopamineOnboarding({ onComplete }: DopamineOnboardingProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const store = useActiveProjectsStore();
  const reward = useRewardBurst();

  // Step state
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Welcome step
  const displayName = user?.user_metadata?.display_name || '';

  // Industry step
  const [selectedType, setSelectedType] = useState<ModuleType>('restaurant');
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Compass step
  const [goal, setGoal] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [savingCompass, setSavingCompass] = useState(false);

  const stepIndex = ['welcome', 'industry', 'compass', 'firstMission'].indexOf(step);
  const totalSteps = 4;

  // Pre-fill project name based on module type
  const defaultName = useMemo(() => {
    return `Mi ${moduleLabels[selectedType]?.toLowerCase() ?? 'negocio'}`;
  }, [selectedType]);

  // ---------------------------------------------------------------------------
  // Step transitions
  // ---------------------------------------------------------------------------

  function goToStep(nextStep: OnboardingStep) {
    const nextIndex = ['welcome', 'industry', 'compass', 'firstMission'].indexOf(nextStep);
    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStep(nextStep);
  }

  async function handleWelcomeNext() {
    markOnboardingStep('register');
    reward.trigger('register');
    goToStep('industry');
  }

  async function handleIndustryNext(event: FormEvent) {
    event.preventDefault();
    if (!user || creating) return;

    setCreating(true);
    try {
      const name = projectName.trim() || defaultName;
      const industryKey = (selectedType === 'restaurant' ? 'gastronomy' : selectedType) as never;
      const id = store.openProject({
        name,
        industryKey,
        strategyProfile: { moduleType: selectedType },
      });

      const project = useActiveProjectsStore.getState().getProjectById(id);
      if (!project) throw new Error('No se pudo crear el proyecto.');

      await persistModuleProject(user.id, project);
      store.switchProject(id);
      setProjectId(id);

      markOnboardingStep('industry');
      reward.trigger('chooseIndustry');
      playUiTone('success');

      goToStep('compass');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  }

  async function handleCompassNext(event: FormEvent) {
    event.preventDefault();
    if (!user || !projectId || savingCompass) return;

    setSavingCompass(true);
    try {
      const config = await loadProjectConfig(user.id, projectId);
      await saveProjectCompass(user.id, projectId, config, goal || 'Lanzar mi negocio digital', selectedEmotion || 'proud');

      markOnboardingStep('compass');
      reward.trigger('saveCompass');

      goToStep('firstMission');
    } catch (error) {
      console.error('Error saving compass:', error);
    } finally {
      setSavingCompass(false);
    }
  }

  function handleFirstMissionGo() {
    if (!projectId) return;
    reward.trigger('firstMission');
    onComplete(projectId);
    navigate(`/dashboard?project=${encodeURIComponent(projectId)}&welcome=1`);
  }

  // ---------------------------------------------------------------------------
  // Animation variants
  // ---------------------------------------------------------------------------

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="foru-dopamine-onboarding">
      <RewardCelebration burst={reward.activeBurst} />

      {/* Progress bar */}
      <div className="foru-onboarding-progress" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`foru-onboarding-dot ${i < stepIndex ? 'is-done' : ''} ${i === stepIndex ? 'is-current' : ''}`}
          />
        ))}
        <small>{stepIndex + 1} de {totalSteps}</small>
      </div>

      {/* Ambient particles */}
      <div className="foru-onboarding-ambient" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i
            key={i}
            style={{
              '--float-delay': `${i * -0.6}s`,
              '--float-x': `${10 + (i * 7) % 80}%`,
              '--float-size': `${3 + (i % 3) * 2}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* STEP 1: Welcome */}
        {step === 'welcome' && (
          <motion.section
            key="welcome"
            className="foru-onboarding-step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="foru-onboarding-content">
              <motion.span
                className="foru-onboarding-icon"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
              >
                🌸
              </motion.span>

              <h1>
                <GradientText>
                  {displayName ? `Hola, ${displayName}` : 'Bienvenida a For U'}
                </GradientText>
              </h1>

              <p className="foru-onboarding-lead">
                En 90 segundos vas a tener tu primer sistema digital listo.
                <br />
                Sin prisa. Sin perfección. Solo tu primer paso.
              </p>

              <motion.div
                className="foru-onboarding-promise"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <span>✨</span>
                <p>
                  For U es tu compañera digital. Yo organizo, tú decides.
                  <br />
                  No necesitas saber todo ahora.
                </p>
              </motion.div>

              <MagicButton type="button" onClick={handleWelcomeNext}>
                Empezar mi aventura →
              </MagicButton>
            </div>
          </motion.section>
        )}

        {/* STEP 2: Choose Industry */}
        {step === 'industry' && (
          <motion.section
            key="industry"
            className="foru-onboarding-step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <form className="foru-onboarding-content" onSubmit={handleIndustryNext}>
              <span className="foru-onboarding-icon">🏝️</span>
              <h1><GradientText>¿Qué tipo de negocio quieres ordenar?</GradientText></h1>
              <p>Elige uno. Después puedes crear más islas para otros rubros.</p>

              <div className="foru-onboarding-industry-grid">
                {moduleOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    className={`foru-onboarding-industry-card ${selectedType === option.value ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedType(option.value);
                      playUiTone('tap');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="foru-industry-card-emoji">{option.emoji}</span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                    {selectedType === option.value && (
                      <motion.i
                        className="foru-industry-card-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                      >
                        ✓
                      </motion.i>
                    )}
                  </motion.button>
                ))}
              </div>

              <label className="foru-onboarding-name-label">
                <span>Nombre de tu negocio <small>(puedes cambiarlo después)</small></span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={defaultName}
                  maxLength={120}
                  className="foru-onboarding-name-input"
                />
              </label>

              <MagicButton type="submit" disabled={creating}>
                {creating ? 'Creando tu isla...' : 'Crear mi isla →'}
              </MagicButton>
            </form>
          </motion.section>
        )}

        {/* STEP 3: Emotional Compass */}
        {step === 'compass' && (
          <motion.section
            key="compass"
            className="foru-onboarding-step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <form className="foru-onboarding-content" onSubmit={handleCompassNext}>
              <span className="foru-onboarding-icon">🤍</span>
              <small className="foru-onboarding-kicker">Una pausa antes de avanzar</small>
              <h1><GradientText>Conectemos con el porqué</GradientText></h1>
              <p>
                Es normal sentirse abrumada cuando algo importa.
                For U va a guardar también la emoción que quieres cuidar.
              </p>

              <label className="foru-onboarding-goal-label">
                <span>¿Qué quieres lograr con este proyecto?</span>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ej: Lanzar mi taller de velas para Navidad"
                  rows={2}
                  maxLength={500}
                  className="foru-onboarding-goal-input"
                />
              </label>

              <div className="foru-onboarding-emotions">
                <strong>¿Cómo quieres sentirte al lograrlo?</strong>
                <div className="foru-onboarding-emotion-grid">
                  {compassEmotions.map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      className={`foru-onboarding-emotion ${selectedEmotion === item.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedEmotion(item.id);
                        playUiTone('tap');
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span>{item.icon}</span>
                      <em>{item.label}</em>
                    </motion.button>
                  ))}
                </div>
              </div>

              <MagicButton type="submit" disabled={savingCompass}>
                {savingCompass ? 'Guardando con calma...' : 'Guardar mi brújula →'}
              </MagicButton>

              <button
                type="button"
                className="foru-onboarding-skip"
                onClick={() => {
                  markOnboardingStep('compass');
                  goToStep('firstMission');
                }}
              >
                Explorar primero, después elijo
              </button>
            </form>
          </motion.section>
        )}

        {/* STEP 4: First Mission */}
        {step === 'firstMission' && (
          <motion.section
            key="firstMission"
            className="foru-onboarding-step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="foru-onboarding-content">
              <motion.div
                className="foru-onboarding-confetti"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.i
                    key={i}
                    initial={{ opacity: 0, y: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [0, -40 - Math.random() * 60],
                      x: [(Math.random() - 0.5) * 200],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.3 + i * 0.04,
                      ease: 'easeOut',
                    }}
                    style={{
                      '--hue': `${Math.random() * 360}`,
                    } as CSSProperties}
                  />
                ))}
              </motion.div>

              <span className="foru-onboarding-icon">🎯</span>
              <h1><GradientText>¡Tu isla está lista!</GradientText></h1>

              <MagicCard className="foru-onboarding-mission-card">
                <div className="foru-onboarding-mission-header">
                  <span className="foru-onboarding-ai-avatar">U</span>
                  <strong>For U</strong>
                </div>
                <p>
                  Creé tu ruta con 5 estaciones. La primera es cortita:
                  <strong> cuéntame qué vendes en una oración.</strong>
                  {' '}Yo me encargo del resto.
                </p>
                <small>⏱️ ~15 minutos · Sin presión</small>
              </MagicCard>

              <MagicButton type="button" onClick={handleFirstMissionGo}>
                🚀 Empezar mi primera misión
              </MagicButton>

              <p className="foru-onboarding-reassurance">
                Puedes pausar y volver cuando quieras. Tu progreso se guarda.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
