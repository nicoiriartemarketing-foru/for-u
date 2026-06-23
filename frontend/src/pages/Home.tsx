import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Sparkles } from '../lib/icons';
import { playUiTone } from '../lib/sound';

const hubItems = [
  {
    label: 'Aprende',
    title: 'Metodologia For U',
    description: 'Clases y recursos para ordenar tu marca, tu mensaje y la forma en que vendes.',
    to: '/metodologia',
    icon: BookOpen,
  },
  {
    label: 'Exclusivo',
    title: 'IA For U',
    description: 'Una guia conversacional para pensar ofertas, contenido, ventas y siguientes pasos.',
    to: '/ia',
    icon: Bot,
    premium: true,
  },
  {
    label: 'Crear',
    title: 'Mi Mundo Digital',
    description: 'Construye una ruta personalizada para que tu negocio tenga web, reservas, catalogo o menu.',
    to: '/register',
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <div className="foru-app-bg relative min-h-screen">
      <div className="foru-blur foru-blur--gold" />
      <div className="foru-blur foru-blur--green" />
      <div className="foru-blur foru-blur--pink" />

      <nav className="foru-nav foru-container">
        <Link to="/" className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-nav-links">
          <Link
            to="/register"
            onClick={() => playUiTone('next')}
            className="foru-btn foru-btn--outline py-2 px-6 text-sm"
          >
            Empezar
          </Link>
        </div>
      </nav>

      <main className="foru-container hub-container">
        <div className="hub-header">
          <span className="foru-badge">Tu Ecosistema Digital</span>
          <h1 className="foru-title mt-6">
            Bienvenido a <span className="text-gradient-animated">For U</span>
          </h1>
          <p className="foru-subtitle mx-auto mt-4 max-w-[520px]">
            Explora tu ecosistema, conversa con la IA y crea una presencia digital que se sienta hecha para tu negocio.
          </p>
          <div className="motivation-strip">
            <span className="motivation-pill">Ruta clara</span>
            <span className="motivation-pill">IA guiandote</span>
            <span className="motivation-pill">Web viva</span>
          </div>
        </div>

        <div className="hub-grid">
          {hubItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.to}
                onClick={() => playUiTone(item.to === '/register' ? 'next' : 'tap')}
                className={`hub-card ${item.premium ? 'hub-card--premium' : ''}`}
              >
                <span className="hub-card-icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <span className="hub-card-label">{item.label}</span>
                <h2 className="hub-card-title">{item.title}</h2>
                <p className="hub-card-desc">{item.description}</p>
                {item.premium && <span className="hub-lock">Solo miembros</span>}
                <span className="hub-card-arrow">
                  Abrir <ArrowRight size={16} strokeWidth={1.8} />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
