import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from '../components/Logo';

const steps = [
  {
    icon: '🫙',
    title: 'Captura',
    text: 'Echa tus ideas sin orden. For U las guarda como perlitas y las ordena cuando estes lista.',
    className: 'is-jar',
  },
  {
    icon: '✅',
    title: 'Ejecuta',
    text: 'Te dice exactamente que hacer hoy. Una accion concreta, un bloque corto, cero drama.',
    className: 'is-check',
  },
  {
    icon: '🌍',
    title: 'Explora',
    text: 'Tus proyectos viven como casitas e islas. Avanzas y el mundo se vuelve mas tuyo.',
    className: 'is-world',
  },
];

const audiences = [
  { icon: '🧠', text: 'Mentes creativas con demasiadas pestanas abiertas en la cabeza.' },
  { icon: '☕', text: 'Emprendedoras que necesitan una jefa amable, no otro panel frio.' },
  { icon: '🏝️', text: 'Soniadoras que quieren ver sus proyectos cobrar vida.' },
];

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    text: 'Para sentarte y saber que hacer ahora.',
    features: ['1 proyecto activo', '5 acciones al mes', 'Tablero personal'],
  },
  {
    name: 'Pro',
    price: '$12',
    text: 'Para trabajar sin friccion y jugar con tu mundo.',
    features: ['Proyectos ilimitados', 'Mundo 3D', 'Kanban + Mapa'],
    featured: true,
  },
  {
    name: 'Premium',
    price: '$24',
    text: 'Para crecer con plantillas, equipos e integraciones.',
    features: ['Todo Pro', 'Plantillas propias', 'Integraciones externas'],
  },
];

const floatingItems = [
  { className: 'island-one', label: '🏝️' },
  { className: 'island-two', label: '🏡' },
  { className: 'coin-one', label: '🪙' },
  { className: 'coin-two', label: '🪙' },
  { className: 'star-one', label: '✨' },
  { className: 'star-two', label: '✦' },
  { className: 'star-three', label: '✧' },
];

export default function LandingPage() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const mockupY = useTransform(scrollYProgress, [0, 0.35], [0, -40]);
  const scrollScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const particles = useMemo(
    () => Array.from({ length: 28 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: `${(index % 9) * 0.35}s`,
      duration: `${5 + (index % 6)}s`,
    })),
    [],
  );

  useEffect(() => {
    function handleScroll() {
      setShowTopButton(window.scrollY > 520);
    }

    function handlePointerMove(event: PointerEvent) {
      const id = Date.now();
      setTrail((current) => [...current.slice(-8), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setTrail((current) => current.filter((item) => item.id !== id));
      }, 650);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  function scrollToFeatures() {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="foru-landing-page">
      <motion.div className="foru-scroll-progress" style={{ scaleX: scrollScaleX }} />
      <div className="foru-cursor-trail" aria-hidden="true">
        {trail.map((item) => (
          <i key={item.id} style={{ left: item.x, top: item.y }} />
        ))}
      </div>

      <header className="foru-landing-nav">
        <Link to="/" aria-label="FOR U" className="foru-landing-logo">
          <Logo />
        </Link>
        <nav>
          <button type="button" onClick={scrollToFeatures}>Cómo funciona</button>
          <Link to="/pricing">Precios</Link>
          <Link to="/login">Entrar</Link>
        </nav>
      </header>

      <section className="foru-landing-hero">
        <motion.div className="foru-hero-magic-layer" style={{ y: heroY }} aria-hidden="true">
          {floatingItems.map((item) => (
            <span key={item.className} className={`foru-floating-charm ${item.className}`}>{item.label}</span>
          ))}
          {particles.map((particle) => (
            <i
              key={particle.id}
              className="foru-ambient-particle"
              style={{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration }}
            />
          ))}
        </motion.div>

        <motion.div
          className="foru-landing-hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <motion.span
            className="foru-landing-pill"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            ✨ Nueva experiencia gamificada
          </motion.span>
          <h1><span>Deja de abrumarte con tus ideas.</span></h1>
          <p>For U las convierte en acciones claras. Tan útil como una jefa amable, tan divertida como entrar a tu propio mundo.</p>
          <div className="foru-landing-actions">
            <Link to="/register" className="foru-ripple-button">Empezar gratis</Link>
            <button type="button" className="foru-ripple-button is-soft" onClick={scrollToFeatures}>Ver cómo funciona</button>
          </div>
        </motion.div>

        <motion.div
          className="foru-landing-mockup"
          style={{ y: mockupY }}
          initial={{ opacity: 0, x: 80, rotate: 2, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 90 }}
          aria-label="Mockup del tablero personal"
        >
          <div className="foru-mockup-aura" />
          <div className="foru-mockup-window">
            <div className="foru-mockup-dots"><i /><i /><i /></div>
            <strong>☀️ Buenos días, Nicole</strong>
            <p>Hoy tienes 3 proyectos pidiendo atención. Empecemos por el más urgente.</p>
            <article>
              <span>Kiosco dulce</span>
              <b>Llamar a 2 proveedores de golosinas</b>
              <small>15 min · 20 monedas</small>
              <button type="button">Empezar</button>
            </article>
            <article>
              <span>Velas artesanales</span>
              <b>Investigar 3 proveedores de cera de soja</b>
              <small>15 min · 20 monedas</small>
              <button type="button">Empezar</button>
            </article>
            <div className="foru-mockup-world">
              <span>🏝️</span>
              <span>🏡</span>
              <span>🪙</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="como-funciona" className="foru-landing-section">
        <motion.div
          className="foru-landing-section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <span>Cómo funciona</span>
          <h2>Tres pasos. Cero drama. Mucha claridad.</h2>
        </motion.div>
        <div className="foru-landing-steps">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              className={step.className}
              initial={{ opacity: 0, y: 24, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.38, delay: index * 0.12 }}
              whileHover={{ y: -8, rotateX: 6, rotateY: -5, scale: 1.025 }}
            >
              <span>{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="foru-landing-audience">
        <div>
          <span>Para quién es</span>
          <h2>Para personas con demasiadas ideas y poca energía para ordenar.</h2>
        </div>
        <ul>
          {audiences.map((item, index) => (
            <motion.li
              key={item.text}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <span>{item.icon}</span>
              {item.text}
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="foru-landing-section">
        <motion.div
          className="foru-landing-section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <span>Planes</span>
          <h2>Empieza simple. Desbloquea magia cuando la necesites.</h2>
        </motion.div>
        <div className="foru-landing-pricing">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              className={plan.featured ? 'is-featured' : ''}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -7, scale: 1.015 }}
            >
              {plan.featured ? <em>Más Popular</em> : null}
              <h3>{plan.name}</h3>
              <strong>{plan.price}<small>/mes</small></strong>
              <p>{plan.text}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              {plan.featured ? <div className="foru-price-confetti" aria-hidden="true"><i /><i /><i /><i /><i /></div> : null}
            </motion.article>
          ))}
        </div>
        <div className="foru-landing-center-action">
          <Link to="/pricing" className="foru-ripple-button">Ver todos los detalles</Link>
        </div>
      </section>

      <footer className="foru-landing-footer">
        <div className="foru-footer-wave" aria-hidden="true" />
        <Link to="/" className="foru-footer-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <nav>
          <a href="mailto:hola@marketingforu.site">Contacto</a>
          <Link to="/pricing">Precios</Link>
          <a href="/terminos">Términos</a>
          <a href="/privacidad">Privacidad</a>
        </nav>
        <div>
          <a href="https://instagram.com" aria-label="Instagram">IG</a>
          <a href="https://tiktok.com" aria-label="TikTok">TT</a>
          <a href="https://linkedin.com" aria-label="LinkedIn">IN</a>
        </div>
      </footer>

      <motion.button
        type="button"
        className="foru-back-to-top"
        onClick={scrollToTop}
        initial={false}
        animate={showTopButton ? { opacity: 1, y: 0, pointerEvents: 'auto' } : { opacity: 0, y: 20, pointerEvents: 'none' }}
        aria-label="Volver arriba"
      >
        ↑
      </motion.button>
    </main>
  );
}
