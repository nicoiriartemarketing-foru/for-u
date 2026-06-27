import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  MessageCircle,
  Rocket,
  Settings,
  Sparkles,
  Store,
} from '../lib/icons';
import { playUiTone } from '../lib/sound';

const services = [
  { label: 'Presencia', title: 'Webs & apps a medida', icon: Store, text: 'Landing pages, sitios completos o web apps para que tu marca se vea clara y vendible.' },
  { label: 'Automatización', title: 'Chatbots & respuestas IA', icon: Bot, text: 'Atención automática para responder dudas, guiar clientes y no perder oportunidades.' },
  { label: 'Operación', title: 'Reservas & pedidos', icon: CalendarDays, text: 'Agenda, pedidos, catálogos o consultas conectadas a la forma real en que vendes.' },
  { label: 'Integración', title: 'Configuración completa', icon: Settings, text: 'Conectamos web, WhatsApp, calendario, base de datos y publicación en una sola ruta.' },
];

const plans = [
  { name: 'Esencial', oldPrice: 'S/ 649', price: 'S/ 389', tag: 'Sistema base', text: 'Landing estratégica + botón de contacto. Para empezar a convertir visitas en mensajes.', featured: false },
  { name: 'Profesional', oldPrice: 'S/ 1,149', price: 'S/ 689', tag: 'Más popular', text: 'Sitio completo + automatizaciones + reservas. Para vender sin estar explicando todo a mano.', featured: true },
  { name: 'Premium', oldPrice: 'S/ 1,650', price: 'S/ 990', tag: 'A medida', text: 'Web app + IA + productos digitales + campañas. Para convertir tu negocio en sistema.', featured: false },
];

const process = ['Diagnóstico gratuito', 'Diseño del sistema', 'Construcción guiada', 'Lanzamiento'];

export default function MundoDigital() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      <nav className="sticky top-0 z-40 border-b border-black/8 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" onClick={() => playUiTone('tap')} className="foru-logo">FOR <span>U</span></Link>
          <div className="flex items-center gap-2">
            <a href="#planes" className="hidden rounded-full border border-black/10 px-4 py-2 text-sm font-black text-gray-700 sm:inline-flex">Planes</a>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-black text-gray-800">
              <ArrowLeft size={16} /> Hub
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden px-5 py-16 text-center">
          <div className="foru-reference-blur foru-reference-blur--gold" />
          <div className="foru-reference-blur foru-reference-blur--green" />
          <div className="foru-reference-blur foru-reference-blur--pink" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <span className="foru-badge gap-2"><Sparkles size={16} /> Oferta limitada · 40% OFF</span>
            <h1 className="mx-auto mt-8 max-w-4xl font-serif text-5xl font-bold leading-[1.06] md:text-7xl">
              Tienes el producto. Tienes los clientes. <span className="foru-reference-gradient-text italic">Te falta el sistema.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg font-semibold leading-8 text-gray-600">
              Un mundo digital no es solo una web. Es la estructura que une tu oferta, contenido, reservas, automatizaciones, IA y venta para que tu negocio trabaje con más orden.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="#diagnostico" className="foru-btn">Agendar sesión gratis <ArrowRight size={18} /></a>
              <a href="#planes" className="foru-btn foru-btn--outline">Ver planes con 40% OFF</a>
            </div>
            <p className="mt-5 text-sm font-bold text-gray-400">Diagnóstico gratuito de 15 minutos · Sin compromiso</p>
          </div>
        </section>

        <section id="diagnostico" className="px-5 py-14">
          <div className="mx-auto max-w-4xl rounded-[24px] border border-black/6 bg-white px-6 py-12 text-center shadow-sm md:px-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl foru-gradient-button"><BadgeCheck size={28} /></span>
            <h2 className="mt-6 font-serif text-4xl font-bold">¿No sabes exactamente qué necesita tu negocio?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-gray-600">
              Perfecto. Para eso existe For U: traducimos tu idea en tecnología real y te decimos qué pieza falta primero.
            </p>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-4xl font-bold md:text-5xl">Un sistema digital es <span className="foru-reference-gradient-text">mucho más</span> que una web</h2>
              <p className="mt-4 text-base font-semibold leading-8 text-gray-600">Instalamos solo las piezas que tu negocio necesita, conectadas entre sí.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article key={service.title} className="foru-reference-card min-h-[260px] w-full text-left">
                    <span className="foru-reference-card-icon mx-0 h-14 w-14"><Icon size={24} /></span>
                    <p className="mt-0 text-xs font-black uppercase text-gray-400">{service.label}</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold">{service.title}</h3>
                    <p>{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="planes" className="bg-white px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="foru-badge">Oferta por tiempo limitado</span>
              <h2 className="mt-5 font-serif text-4xl font-bold md:text-5xl">Tu sistema digital a medida <span className="foru-reference-gradient-text">con 40% OFF</span></h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <article key={plan.name} className={`relative rounded-[20px] border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${plan.featured ? 'foru-gradient-border' : 'border-black/6'}`}>
                  {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full foru-gradient-button px-4 py-1 text-xs font-black">Más popular</span>}
                  <p className="text-xs font-black uppercase text-gray-400">{plan.tag}</p>
                  <h3 className="mt-3 font-serif text-4xl font-bold">{plan.name}</h3>
                  <p className="mt-5 text-sm font-bold text-gray-400 line-through">Antes {plan.oldPrice}</p>
                  <p className="font-serif text-5xl font-bold">{plan.price}</p>
                  <p className="mt-4 min-h-16 text-sm font-semibold leading-7 text-gray-600">{plan.text}</p>
                  <a href="#diagnostico" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-4 text-sm font-black text-white">
                    Quiero este plan <MessageCircle size={17} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-4xl font-bold md:text-5xl">Cómo <span className="foru-reference-gradient-text">trabajamos</span></h2>
            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {process.map((step, index) => (
                <article key={step} className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full foru-gradient-border bg-white font-serif text-2xl font-bold">{index + 1}</span>
                  <h3 className="mt-5 text-base font-black">{step}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <Rocket className="mx-auto text-[#7C5CFF]" size={34} />
            <h2 className="mt-5 font-serif text-5xl font-bold">Tu marca, <span className="foru-reference-gradient-text">en su mejor versión.</span></h2>
            <a href="#diagnostico" className="foru-btn mt-8">Empezar ahora <ArrowRight size={18} /></a>
          </div>
        </section>
      </main>
    </div>
  );
}
