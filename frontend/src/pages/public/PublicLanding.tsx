import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Edit3,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from '../../lib/icons';
import defaultBusinessWorld from '../../assets/landing/default-business-world.jpg';
import {
  type DigitalWorldPage,
  type LandingTheme,
  draftStorageKey,
  getLandingTheme,
  loadConstructorState,
  loadDigitalWorldPage,
  loadLocalDraft,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

export default function PublicLanding() {
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const page = loadDigitalWorldPage(draft, constructorState);
  const theme = getLandingTheme(page.themeId);
  const fontClass = page.fontStyle === 'serif' ? 'font-serif' : 'font-sans';
  const hasLocalDraft = typeof window !== 'undefined' && Boolean(window.localStorage.getItem(draftStorageKey));
  const heroImage = page.heroVisual === 'image' && page.heroImageUrl.trim() ? page.heroImageUrl : defaultBusinessWorld;
  const phone = page.contactWhatsapp.replace(/\D/g, '');
  const contactHref = phone ? `https://wa.me/${phone}` : '#contacto';

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: theme.background, color: theme.text }}>
      <header className="relative z-20 border-b" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#inicio" className={`${fontClass} text-xl font-black`} style={{ color: theme.text }}>{page.heroTitle}</a>
          <div className="hidden items-center gap-7 text-sm font-bold md:flex" style={{ color: theme.muted }}>
            <a href="#oferta">Lo que ofrecemos</a>
            <a href="#nosotros">Nuestra historia</a>
            <a href="#preguntas">Preguntas</a>
          </div>
          <a href={contactHref} className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black" style={{ backgroundColor: theme.button, color: theme.buttonText }}>
            {page.ctaLabel} <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <main>
        <section
          id="inicio"
          className="relative isolate flex min-h-[78vh] items-center overflow-hidden border-b bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")`, borderColor: theme.border }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: `${theme.background}c4` }} />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-transparent lg:block" />
          <div className="relative mx-auto w-full max-w-7xl px-5 py-16">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
                <Sparkles size={15} /> {draft.businessTitle}
              </p>
              <h1 className={`mt-5 max-w-3xl ${fontClass} text-5xl font-bold leading-[1.02] md:text-7xl`}>{page.heroTitle}</h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8" style={{ color: theme.muted }}>{page.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={contactHref} onClick={() => playUiTone('next')} className="inline-flex items-center gap-2 rounded-lg px-6 py-4 text-sm font-black shadow-xl" style={{ backgroundColor: theme.button, color: theme.buttonText }}>
                  {page.ctaLabel} <MessageCircle size={18} />
                </a>
                <a href="#oferta" className="inline-flex items-center gap-2 rounded-lg border px-6 py-4 text-sm font-black" style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }}>
                  Ver opciones <ArrowRight size={17} />
                </a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold" style={{ color: theme.muted }}>
                {page.trustItems.slice(0, 3).map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <BadgeCheck size={17} style={{ color: theme.accent }} /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm font-bold sm:grid-cols-3" style={{ color: theme.muted }}>
            <span className="flex items-center gap-3"><MapPin style={{ color: theme.accent }} size={18} /> {page.locationText}</span>
            <span className="flex items-center gap-3"><Clock style={{ color: theme.accent }} size={18} /> {page.businessHours}</span>
            <span className="flex items-center gap-3"><Phone style={{ color: theme.accent }} size={18} /> {page.contactWhatsapp || page.ctaLabel}</span>
          </div>
        </section>

        <section id="oferta" className="py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr]">
              <div className="lg:sticky lg:top-10 lg:self-start">
                <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Elige tu mejor opción</p>
                <h2 className={`${fontClass} mt-4 text-4xl font-bold leading-tight md:text-5xl`}>{page.featuredTitle}</h2>
                <p className="mt-5 text-base font-semibold leading-8" style={{ color: theme.muted }}>
                  Todo lo necesario para pasar de “me interesa” a una acción concreta.
                </p>
              </div>

              <div className="border-t" style={{ borderColor: theme.border }}>
                {page.featuredItems.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="group grid gap-4 border-b py-8 md:grid-cols-[64px_1fr_auto] md:items-start" style={{ borderColor: theme.border }}>
                    <span className={`${fontClass} text-3xl font-bold`} style={{ color: theme.accent }}>0{index + 1}</span>
                    <div>
                      <h3 className={`${fontClass} text-2xl font-bold`}>{item.title}</h3>
                      <p className="mt-3 max-w-xl text-sm font-semibold leading-7" style={{ color: theme.muted }}>{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <span className="rounded-full px-3 py-2 text-xs font-black" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>{item.detail}</span>
                      <a href={contactHref} className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border transition group-hover:translate-x-1" style={{ borderColor: theme.border, color: theme.text }} aria-label={`Consultar ${item.title}`}>
                        <ArrowRight size={17} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" style={{ backgroundColor: theme.text, color: theme.surface }}>
          <div className="mx-auto max-w-7xl px-5">
            <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accentSoft }}>Por qué elegirnos</p>
            <div className="mt-6 grid gap-10 md:grid-cols-[0.5fr_0.5fr]">
              <h2 className={`${fontClass} text-4xl font-bold leading-tight md:text-6xl`}>Una experiencia pensada para que decidas con confianza.</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {page.trustItems.map((item, index) => (
                  <div key={item} className="border-t pt-4" style={{ borderColor: `${theme.surface}40` }}>
                    <p className="text-sm font-black" style={{ color: theme.accentSoft }}>0{index + 1}</p>
                    <p className="mt-3 text-base font-bold leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="nosotros" className="py-20" style={{ backgroundColor: theme.surface }}>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg">
              <img src={heroImage} alt="" className="aspect-[4/3] h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Conoce el corazón del negocio</p>
              <h2 className={`${fontClass} mt-4 text-4xl font-bold leading-tight md:text-5xl`}>{page.storyTitle}</h2>
              <p className="mt-6 text-base font-semibold leading-8" style={{ color: theme.muted }}>{page.storyText}</p>
              <a href={contactHref} className="mt-8 inline-flex items-center gap-2 text-sm font-black" style={{ color: theme.accent }}>
                Hablemos de lo que necesitas <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        <section id="preguntas" className="border-y py-20" style={{ borderColor: theme.border }}>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.36fr_0.64fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Antes de empezar</p>
              <h2 className={`${fontClass} mt-4 text-4xl font-bold`}>Preguntas frecuentes</h2>
            </div>
            <div className="border-t" style={{ borderColor: theme.border }}>
              {page.faqItems.map((item) => (
                <details key={item.question} className="group border-b py-5" style={{ borderColor: theme.border }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black">
                    {item.question}
                    <span className="text-2xl font-light transition group-open:rotate-45" style={{ color: theme.accent }}>+</span>
                  </summary>
                  <p className="max-w-2xl pb-2 pt-4 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="px-5 py-20">
          <div className="mx-auto max-w-7xl rounded-lg px-6 py-14 text-center md:px-14" style={{ backgroundColor: theme.accentSoft }}>
            <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Tu siguiente paso</p>
            <h2 className={`${fontClass} mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl`}>{page.contactLine}</h2>
            <a href={contactHref} className="mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-black shadow-xl" style={{ backgroundColor: theme.button, color: theme.buttonText }}>
              {page.ctaLabel} <MessageCircle size={18} />
            </a>
          </div>
        </section>
      </main>

      {hasLocalDraft && <CreatorDock page={page} theme={theme} />}
    </div>
  );
}

function CreatorDock({ page, theme }: { page: DigitalWorldPage; theme: LandingTheme }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl rounded-lg border p-3 shadow-2xl backdrop-blur" style={{ backgroundColor: `${theme.surface}f2`, borderColor: theme.border }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}><Eye size={18} /></span>
          <div>
            <p className="text-sm font-black" style={{ color: theme.text }}>Vista pública</p>
            <p className="hidden text-xs font-bold sm:block" style={{ color: theme.muted }}>Edita textos, imágenes y productos en tiempo real.</p>
          </div>
        </div>
        <Link to="/editor" onClick={() => playUiTone('tap')} className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black" style={{ backgroundColor: theme.button, color: theme.buttonText }}>
          Editar <Edit3 size={16} />
        </Link>
      </div>
    </div>
  );
}
