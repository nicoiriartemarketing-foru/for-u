import { useParams } from 'react-router-dom';
import { BadgeCheck, Clock, MapPin, MessageCircle, Phone, Share2, Sparkles } from '../../lib/icons';
import {
  type DigitalWorldPage,
  type LandingTheme,
  getLandingTheme,
  loadConstructorState,
  loadDigitalWorldPage,
  loadLocalDraft,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

export default function PublicLanding() {
  const { slug } = useParams();
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const page = loadDigitalWorldPage(draft, constructorState);
  const theme = getLandingTheme(page.themeId);
  const fontClass = page.fontStyle === 'modern' ? 'font-sans' : page.fontStyle === 'rounded' ? 'font-sans' : 'font-serif';

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: theme.background, color: theme.text }}>
      <header className="border-b" style={{ borderColor: theme.border }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <a href="#inicio" className="font-serif text-2xl font-bold" style={{ color: theme.text }}>
            {page.heroTitle}
          </a>
          <div className="hidden items-center gap-6 text-sm font-bold md:flex" style={{ color: theme.muted }}>
            <a href="#oferta">Oferta</a>
            <a href="#confianza">Confianza</a>
            <a href="#preguntas">Preguntas</a>
          </div>
          <button
            type="button"
            onClick={() => playUiTone('next')}
            className="tap-boost inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black"
            style={{ backgroundColor: theme.button, color: theme.buttonText }}
          >
            {page.ctaLabel} <MessageCircle size={17} />
          </button>
        </nav>
      </header>

      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:min-h-[72vh] lg:grid-cols-[1.02fr_0.98fr] lg:py-18">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>{draft.businessTitle}</p>
          <h1 className={`mt-5 max-w-4xl ${fontClass} text-5xl font-bold leading-[1.02] md:text-7xl`}>{page.heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8" style={{ color: theme.muted }}>{page.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => playUiTone('next')}
              className="tap-boost inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black shadow-lg"
              style={{ backgroundColor: theme.button, color: theme.buttonText }}
            >
              {page.ctaLabel} <MessageCircle size={18} />
            </button>
            <span className="rounded-full border px-4 py-3 text-sm font-bold" style={{ borderColor: theme.border, color: theme.muted }}>
              {slug ? `/${slug}` : 'perfil publico'}
            </span>
          </div>
        </div>

        <HeroVisual page={page} theme={theme} />
      </section>

      <div className="border-y" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm font-semibold md:justify-between" style={{ color: theme.muted }}>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" style={{ color: theme.accent }} /> {page.locationText || 'Ubicacion por definir'}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" style={{ color: theme.accent }} /> {page.businessHours || 'Horarios por configurar'}</div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4" style={{ color: theme.accent }} /> {page.contactWhatsapp || 'WhatsApp pendiente'}</div>
          <Share2 className="h-5 w-5 cursor-pointer transition" style={{ color: theme.accent }} />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.4fr]">
          <div className="space-y-8">
            <section id="oferta" className="rounded-3xl border p-7 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <p className="text-sm font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Oferta</p>
              <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.featuredTitle}</h2>
              <div className={`mt-6 grid gap-5 ${page.offerLayout === 'spotlight' ? '' : 'sm:grid-cols-2'}`}>
                {page.featuredItems.map((item, index) => (
                  <article key={item.title} className={`rounded-2xl border p-5 ${page.blockStyle === 'bold' ? 'shadow-lg' : ''}`} style={{ backgroundColor: page.offerLayout === 'spotlight' ? theme.accentSoft : theme.background, borderColor: theme.border }}>
                    <p className="text-lg font-black" style={{ color: theme.text }}>
                      {page.offerLayout === 'steps' && <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs" style={{ backgroundColor: theme.button, color: theme.buttonText }}>{index + 1}</span>}
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{item.description}</p>
                    <span className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>{item.detail}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border p-7 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h2 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.storyTitle}</h2>
              <p className="mt-5 text-base font-semibold leading-8" style={{ color: theme.muted }}>{page.storyText}</p>
            </section>

            <section id="preguntas" className="rounded-3xl border p-7 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h2 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>Preguntas frecuentes</h2>
              <div className="mt-6 grid gap-4">
                {page.faqItems.map((item) => (
                  <div key={item.question} className="rounded-2xl border p-5" style={{ borderColor: theme.border }}>
                    <p className="font-black" style={{ color: theme.text }}>{item.question}</p>
                    <p className="mt-2 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section id="confianza" className="sticky top-6 rounded-3xl border p-6 shadow-xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h3 className="font-serif text-2xl font-bold" style={{ color: theme.text }}>Confianza</h3>
              <div className="mt-5 space-y-3">
                {page.trustItems.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl p-4" style={{ backgroundColor: theme.accentSoft }}>
                    <BadgeCheck className="mt-1 shrink-0" style={{ color: theme.accent }} size={18} />
                    <p className="text-sm font-bold leading-6" style={{ color: theme.text }}>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: theme.text, color: theme.surface }}>
                <p className="text-sm font-bold leading-6 opacity-85">{page.contactLine}</p>
                <button
                  type="button"
                  onClick={() => playUiTone('success')}
                  className="tap-boost mt-4 w-full rounded-xl px-4 py-3 text-sm font-black"
                  style={{ backgroundColor: theme.surface, color: theme.text }}
                >
                  {page.ctaLabel}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function HeroVisual({ page, theme }: { page: DigitalWorldPage; theme: LandingTheme }) {
  if (page.heroVisual === 'none') {
    return (
      <div className="rounded-[2rem] border p-6 shadow-xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Listo para vender</p>
        <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.featuredTitle}</h2>
        <p className="mt-4 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{page.contactLine}</p>
      </div>
    );
  }

  if (page.heroVisual === 'image' && page.heroImageUrl.trim()) {
    return (
      <div className="overflow-hidden rounded-[2rem] border shadow-xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <img src={page.heroImageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
        <div className="p-5">
          <p className="text-sm font-black" style={{ color: theme.text }}>{page.featuredTitle}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: theme.muted }}>{page.contactLine}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border p-5 shadow-xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ backgroundColor: theme.accentSoft }} />
      <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full opacity-80" style={{ backgroundColor: theme.accentSoft }} />
      <div className="relative flex aspect-[4/3] flex-col justify-between rounded-[1.5rem] p-6" style={{ backgroundColor: theme.accentSoft }}>
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
            <Sparkles size={15} /> Camino simple
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.featuredTitle}</h2>
        </div>
        <div className="grid gap-3">
          {page.featuredItems.slice(0, 3).map((item, index) => (
            <div key={item.title} className="flex items-center gap-3 rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black" style={{ backgroundColor: theme.button, color: theme.buttonText }}>{index + 1}</span>
              <div>
                <p className="font-black" style={{ color: theme.text }}>{item.title}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: theme.muted }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
