import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import MagicBadge from '../components/ui/MagicBadge';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';
import GradientText from '../components/ui/GradientText';
import { planConfigs, type ForUUserPlan, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const pricingCards: Array<{
  plan: ForUUserPlan;
  price: string;
  description: string;
  features: string[];
}> = [
  {
    plan: 'free',
    price: '$0',
    description: 'Para probar For U con una sola prioridad clara.',
    features: [
      '1 proyecto activo',
      '5 acciones al mes',
      'Tablero personal',
      'Acción del momento',
    ],
  },
  {
    plan: 'pro',
    price: '$12',
    description: 'Para trabajar sin fricción con todos tus proyectos.',
    features: [
      'Proyectos ilimitados',
      'Acciones ilimitadas',
      'Mundo 3D',
      'IA avanzada',
      'Kanban y mapa mental',
      'Estadísticas de progreso',
    ],
  },
  {
    plan: 'premium',
    price: '$24',
    description: 'Para crecer For U con equipo, plantillas e integraciones.',
    features: [
      'Todo lo de Pro',
      'Equipos y colaboración',
      'Plantillas personalizadas',
      'Integraciones externas',
      'Soporte prioritario',
    ],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const userPlan = useActiveProjectsStore((state) => state.userPlan);
  const setUserPlan = useActiveProjectsStore((state) => state.setUserPlan);

  function choosePlan(plan: ForUUserPlan) {
    setUserPlan(plan);
    window.alert(plan === 'free' ? 'Plan Gratis activado.' : `Stripe simulado: ${planConfigs[plan].label} activado.`);
    navigate('/workspace');
  }

  return (
    <main className="foru-pricing-page">
      <header className="foru-pricing-header">
        <Link to="/workspace" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <div>
          <MagicBadge>Planes For U</MagicBadge>
          <h1><GradientText>Elige cuánto apoyo quieres hoy, Nicole.</GradientText></h1>
          <p>Gratis te ayuda a empezar. Pro y Premium desbloquean el sistema completo.</p>
        </div>
      </header>

      <section className="foru-pricing-grid">
        {pricingCards.map((card) => (
          <MagicCard key={card.plan} className={card.plan === 'pro' ? 'foru-pricing-card is-featured' : 'foru-pricing-card'}>
            {card.plan === userPlan ? <MagicBadge className="foru-pricing-current">Plan actual</MagicBadge> : null}
            {card.plan === 'pro' ? <MagicBadge className="foru-pricing-best">Recomendado</MagicBadge> : null}
            <h2>{planConfigs[card.plan].label}</h2>
            <strong>{card.price}<small>/mes</small></strong>
            <p>{card.description}</p>
            <ul>
              {card.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <MagicButton type="button" onClick={() => choosePlan(card.plan)}>
              {card.plan === userPlan ? 'Mantener plan' : card.plan === 'free' ? 'Usar Gratis' : `Elegir ${planConfigs[card.plan].label}`}
            </MagicButton>
          </MagicCard>
        ))}
      </section>
    </main>
  );
}
