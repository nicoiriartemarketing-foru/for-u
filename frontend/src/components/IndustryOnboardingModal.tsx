import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import type { ForUIndustryKey } from '../templates/industryTemplates';

export type IndustryOnboardingInput = {
  industryKey: Extract<ForUIndustryKey, 'tourism' | 'gastronomy'>;
  projectName: string;
  offerType: string;
  location: string;
  idealTraveler: string;
  primaryChannel: string;
  assets: string[];
};

type IndustryOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateIndustryProject: (input: IndustryOnboardingInput) => void;
};

const industryOptions = [
  {
    key: 'tourism',
    title: 'Turismo / experiencias',
    description: 'Tours, hospedajes, retiros, rutas, experiencias locales y reservas por WhatsApp.',
    enabled: true,
  },
  {
    key: 'gastronomy',
    title: 'Gastronomía',
    description: 'Menú, delivery, reservas, combos, contenido y promociones.',
    enabled: true,
  },
  {
    key: 'wellness',
    title: 'Belleza / bienestar',
    description: 'Servicios, agenda, paquetes, antes/después y fidelización.',
    enabled: false,
  },
  {
    key: 'education',
    title: 'Educación',
    description: 'Cursos, módulos, comunidad, leads y calendario de lanzamientos.',
    enabled: false,
  },
];

const copyByIndustry = {
  tourism: {
    badge: 'Turismo',
    title: 'Armemos la base turística',
    intro: 'Responde lo mínimo. Con esto For U crea ruta, tareas y próximas acciones específicas.',
    defaultProjectName: 'Sistema turismo experiencial',
    offerLabel: '¿Qué vendes?',
    offerPlaceholder: 'Ej: tours, hospedaje, retiro, caminata, experiencia cultural',
    locationLabel: '¿Dónde ocurre?',
    locationPlaceholder: 'Ej: Cusco, Churín, Valle Sagrado',
    customerLabel: '¿Quién compra?',
    customerPlaceholder: 'Ej: turistas extranjeros, parejas, familias, viajeros espirituales',
    submit: 'Crear estrategia turística',
    assets: ['Fotos', 'Testimonios', 'Precios', 'Calendario', 'Instagram', 'Web', 'WhatsApp'],
  },
  gastronomy: {
    badge: 'Gastronomía',
    title: 'Armemos la base gastronómica',
    intro: 'Con esto For U crea producto estrella, flujo de pedido, contenido y tareas de venta.',
    defaultProjectName: 'Sistema gastronómico',
    offerLabel: '¿Qué vendes?',
    offerPlaceholder: 'Ej: cafetería, menú ejecutivo, catering, dark kitchen, postres',
    locationLabel: '¿Dónde vendes?',
    locationPlaceholder: 'Ej: Lima, Miraflores, delivery por WhatsApp, local propio',
    customerLabel: '¿Quién compra?',
    customerPlaceholder: 'Ej: oficinas, familias, turistas, universitarios, eventos',
    submit: 'Crear estrategia gastronómica',
    assets: ['Fotos', 'Menú', 'Precios', 'Delivery', 'Instagram', 'Reseñas', 'WhatsApp'],
  },
} satisfies Record<Extract<ForUIndustryKey, 'tourism' | 'gastronomy'>, {
  badge: string;
  title: string;
  intro: string;
  defaultProjectName: string;
  offerLabel: string;
  offerPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  customerLabel: string;
  customerPlaceholder: string;
  submit: string;
  assets: string[];
}>;

export default function IndustryOnboardingModal({ isOpen, onClose, onCreateIndustryProject }: IndustryOnboardingModalProps) {
  const [step, setStep] = useState<'industry' | 'details'>('industry');
  const [industryKey, setIndustryKey] = useState<Extract<ForUIndustryKey, 'tourism' | 'gastronomy'>>('tourism');
  const [projectName, setProjectName] = useState(copyByIndustry.tourism.defaultProjectName);
  const [offerType, setOfferType] = useState('');
  const [location, setLocation] = useState('');
  const [idealTraveler, setIdealTraveler] = useState('');
  const [primaryChannel, setPrimaryChannel] = useState('WhatsApp');
  const [assets, setAssets] = useState<string[]>(['WhatsApp']);
  const activeCopy = copyByIndustry[industryKey];

  const canCreate = useMemo(
    () => Boolean(projectName.trim() && offerType.trim() && location.trim() && idealTraveler.trim()),
    [idealTraveler, location, offerType, projectName],
  );

  function resetAndClose() {
    setStep('industry');
    onClose();
  }

  function chooseIndustry(nextIndustryKey: Extract<ForUIndustryKey, 'tourism' | 'gastronomy'>) {
    setIndustryKey(nextIndustryKey);
    setProjectName(copyByIndustry[nextIndustryKey].defaultProjectName);
    setOfferType('');
    setLocation('');
    setIdealTraveler('');
    setPrimaryChannel('WhatsApp');
    setAssets(['WhatsApp']);
    setStep('details');
  }

  function toggleAsset(asset: string) {
    setAssets((current) =>
      current.includes(asset)
        ? current.filter((item) => item !== asset)
        : [...current, asset],
    );
  }

  function createProject() {
    if (!canCreate) return;

    onCreateIndustryProject({
      industryKey,
      projectName: projectName.trim(),
      offerType: offerType.trim(),
      location: location.trim(),
      idealTraveler: idealTraveler.trim(),
      primaryChannel,
      assets,
    });
    resetAndClose();
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="foru-industry-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="industry-modal-title"
        >
          <motion.section
            className="foru-industry-modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <header>
              <div>
                <MagicBadge>{step === 'industry' ? 'Nuevo proyecto' : activeCopy.badge}</MagicBadge>
                <h2 id="industry-modal-title">
                  {step === 'industry' ? '¿Qué tipo de negocio quieres ordenar?' : activeCopy.title}
                </h2>
                <p>
                  {step === 'industry'
                    ? 'For U cambia la estrategia según el rubro. Ya tenemos turismo y gastronomía como sistemas base.'
                    : activeCopy.intro}
                </p>
              </div>
              <button type="button" onClick={resetAndClose} aria-label="Cerrar selector de rubro">
                ×
              </button>
            </header>

            {step === 'industry' ? (
              <div className="foru-industry-grid">
                {industryOptions.map((industry) => (
                  <button
                    type="button"
                    key={industry.key}
                    className={industry.enabled ? 'foru-industry-option is-enabled' : 'foru-industry-option'}
                    onClick={() => industry.enabled && chooseIndustry(industry.key as Extract<ForUIndustryKey, 'tourism' | 'gastronomy'>)}
                    disabled={!industry.enabled}
                  >
                    <strong>{industry.title}</strong>
                    <span>{industry.description}</span>
                    {!industry.enabled ? <em>Próximamente</em> : <em>Disponible</em>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="foru-tourism-onboarding">
                <MagicCard as="div" className="foru-tourism-form-card">
                  <label>
                    <span>Nombre del proyecto</span>
                    <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
                  </label>
                  <label>
                    <span>{activeCopy.offerLabel}</span>
                    <input
                      value={offerType}
                      onChange={(event) => setOfferType(event.target.value)}
                      placeholder={activeCopy.offerPlaceholder}
                    />
                  </label>
                  <label>
                    <span>{activeCopy.locationLabel}</span>
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder={activeCopy.locationPlaceholder}
                    />
                  </label>
                  <label>
                    <span>{activeCopy.customerLabel}</span>
                    <input
                      value={idealTraveler}
                      onChange={(event) => setIdealTraveler(event.target.value)}
                      placeholder={activeCopy.customerPlaceholder}
                    />
                  </label>
                  <label>
                    <span>Canal principal</span>
                    <select value={primaryChannel} onChange={(event) => setPrimaryChannel(event.target.value)}>
                      <option>WhatsApp</option>
                      <option>Instagram</option>
                      <option>Web</option>
                      <option>Agencia / referidos</option>
                    </select>
                  </label>
                </MagicCard>

                <MagicCard as="div" className="foru-tourism-assets-card">
                  <h3>¿Qué tienes ya?</h3>
                  <p>Esto ayuda a priorizar las tareas iniciales.</p>
                  <div>
                    {activeCopy.assets.map((asset) => (
                      <button
                        type="button"
                        key={asset}
                        className={assets.includes(asset) ? 'is-selected' : ''}
                        onClick={() => toggleAsset(asset)}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </MagicCard>

                <footer>
                  <MagicButton type="button" variant="soft" onClick={() => setStep('industry')}>
                    Volver
                  </MagicButton>
                  <MagicButton type="button" onClick={createProject} disabled={!canCreate}>
                    {activeCopy.submit}
                  </MagicButton>
                </footer>
              </div>
            )}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
