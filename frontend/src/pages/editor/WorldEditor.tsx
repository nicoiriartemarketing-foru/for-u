import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Edit3,
  Eye,
  HelpCircle,
  Image,
  ListChecks,
  MessageCircle,
  Monitor,
  Palette,
  Paintbrush,
  Save,
  Sparkles,
  Smartphone,
  Type,
} from '../../lib/icons';
import {
  type DigitalWorldPage,
  type LandingTheme,
  getLandingTheme,
  landingThemes,
  loadConstructorState,
  loadDigitalWorldPage,
  loadLocalDraft,
  saveDigitalWorldPage,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

const tabs = [
  { id: 'hero', label: '1. Portada', icon: Sparkles },
  { id: 'featured', label: '2. Oferta', icon: ListChecks },
  { id: 'trust', label: '3. Confianza', icon: BadgeCheck },
  { id: 'visual', label: '4. Visual', icon: Image },
  { id: 'story', label: '5. Historia', icon: Edit3 },
  { id: 'style', label: '6. Estilo', icon: Palette },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const tabHelp: Record<string, { title: string; text: string }> = {
  hero: {
    title: 'Lo primero que ve tu cliente',
    text: 'Edita el nombre, la promesa principal y el boton que quieres que la persona toque.',
  },
  featured: {
    title: 'Lo que vendes o quieres mostrar',
    text: 'Convierte la ruta de la IA en secciones simples: servicios, menu, paquetes, habitaciones o productos.',
  },
  trust: {
    title: 'Razones para confiar',
    text: 'Agrega pruebas concretas: resultados, reseñas, experiencia, credenciales o detalles que bajen dudas.',
  },
  visual: {
    title: 'Que se vea vivo sin complicarte',
    text: 'Elige portada, tipografia y forma de bloques. Son controles simples para sentir que la landing es tuya.',
  },
  story: {
    title: 'La explicacion humana',
    text: 'Cuenta por que existe el negocio y que experiencia puede esperar la persona.',
  },
  style: {
    title: 'Personalidad visual de la landing',
    text: 'Elige un look para la pagina publica. For U sigue colorido por dentro; la landing puede ser sobria o boutique.',
  },
  faq: {
    title: 'Dudas antes de escribirte',
    text: 'Responde lo que normalmente te preguntan antes de reservar, comprar o pedir informacion.',
  },
};

export default function WorldEditor() {
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const initialPage = useMemo(() => loadDigitalWorldPage(draft, constructorState), [draft, constructorState]);
  const [page, setPage] = useState<DigitalWorldPage>(initialPage);
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);
  const theme = getLandingTheme(page.themeId);
  const publicPath = `/p/${page.publicSlug || 'preview'}`;
  const fontClass = page.fontStyle === 'modern' ? 'font-sans' : page.fontStyle === 'rounded' ? 'font-sans' : 'font-serif';

  function updatePage(nextPage: Partial<DigitalWorldPage>) {
    setSaved(false);
    setPage((currentPage) => ({ ...currentPage, ...nextPage }));
  }

  function applyTheme(themeId: DigitalWorldPage['themeId']) {
    playUiTone('success');
    setPage((currentPage) => {
      const updatedPage = { ...currentPage, themeId, updatedAt: new Date().toISOString() };
      saveDigitalWorldPage(updatedPage);
      return updatedPage;
    });
    setSaved(true);
  }

  function savePage() {
    playUiTone('success');
    saveDigitalWorldPage(page);
    setSaved(true);
  }

  function updateFeaturedItem(index: number, field: 'title' | 'description' | 'detail', value: string) {
    const nextItems = page.featuredItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    updatePage({ featuredItems: nextItems });
  }

  function updateFaqItem(index: number, field: 'question' | 'answer', value: string) {
    const nextItems = page.faqItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    updatePage({ faqItems: nextItems });
  }

  return (
    <div className="foru-app-bg min-h-screen text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-black/10 foru-glass px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              onClick={() => playUiTone('tap')}
              className="tap-boost inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 foru-glass text-gray-800 shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-sm font-black text-[#7C5CFF]">Editor visual</p>
              <h1 className="font-serif text-2xl font-bold text-gray-950">Editor del Mundo Digital</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={publicPath}
              onClick={() => playUiTone('next')}
              className="tap-boost hidden items-center gap-2 rounded-xl border border-gray-200 foru-glass px-4 py-3 text-sm font-black text-gray-800 shadow-sm sm:inline-flex"
            >
              Ver publica <Eye size={17} />
            </Link>
            <button
              type="button"
              onClick={savePage}
              className="tap-boost inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-black text-white shadow-lg"
            >
              <Save size={17} /> {saved ? 'Guardado' : 'Guardar cambios de texto'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-5 md:p-8 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
            <span className="foru-badge">Claridad, estilo y vista publica</span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-gray-950">Edita una cosa a la vez</h2>
            <p className="foru-subtitle mt-2">
              Sigue los pasos de izquierda a derecha. La vista previa cambia al instante y puedes guardar cuando algo ya se sienta bien.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playUiTone('tap');
                      setActiveTab(tab.id);
                    }}
                    className={`tap-boost flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black ${
                      active ? 'foru-gradient-button text-[#1a1a1a]' : 'foru-soft-panel text-gray-700'
                    }`}
                  >
                    <Icon size={15} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
            <div className="mb-5 rounded-2xl foru-soft-panel p-4">
              <p className="text-sm font-black text-[#7C5CFF]">{tabHelp[activeTab].title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-700">{tabHelp[activeTab].text}</p>
            </div>

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <Field label="Nombre o titulo principal" hint="Ej. Casa Brava, Studio Luna, Dra. Ana Perez" value={page.heroTitle} onChange={(value) => updatePage({ heroTitle: value })} />
                <Area label="Promesa principal" hint="Una frase clara que diga que haces y por que deberian contactarte." value={page.heroSubtitle} onChange={(value) => updatePage({ heroSubtitle: value })} />
                <Field label="Texto del boton" hint="La accion mas importante: reservar, pedir info, agendar cita..." value={page.ctaLabel} onChange={(value) => updatePage({ ctaLabel: value })} />
                <Field label="Linea corta de contacto" hint="Una frase para reforzar el siguiente paso." value={page.contactLine} onChange={(value) => updatePage({ contactLine: value })} />
              </div>
            )}

            {activeTab === 'story' && (
              <div className="space-y-4">
                <Field label="Titulo de la historia" hint="Una entrada breve para presentar el negocio." value={page.storyTitle} onChange={(value) => updatePage({ storyTitle: value })} />
                <Area label="Texto de historia" hint="Cuenta el enfoque, la experiencia o el diferencial de manera humana." value={page.storyText} onChange={(value) => updatePage({ storyText: value })} />
              </div>
            )}

            {activeTab === 'featured' && (
              <div className="space-y-5">
                <Field label="Titulo de oferta" hint="Ej. Servicios principales, Menu destacado, Habitaciones, Planes." value={page.featuredTitle} onChange={(value) => updatePage({ featuredTitle: value })} />
                {page.featuredItems.map((item, index) => (
                  <div key={index} className="foru-soft-panel rounded-2xl p-4">
                    <p className="mb-3 text-xs font-black uppercase text-gray-500">Parte visible {index + 1}</p>
                    <div className="grid gap-3">
                      <Field label="Nombre de esta parte" hint="Servicio, producto, paquete o parte de la experiencia." value={item.title} onChange={(value) => updateFeaturedItem(index, 'title', value)} />
                      <Area label="Descripcion corta" hint="Explica lo suficiente para que la persona entienda si le interesa." value={item.description} onChange={(value) => updateFeaturedItem(index, 'description', value)} compact />
                      <Field label="Etiqueta pequeña" hint="Ej. Desde S/..., Popular, Para grupos, 45 min." value={item.detail} onChange={(value) => updateFeaturedItem(index, 'detail', value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="space-y-4">
                {page.trustItems.map((item, index) => (
                  <Area
                    key={index}
                    label={`Confianza ${index + 1}`}
                    hint="Una razon concreta para creer en el negocio."
                    value={item}
                    onChange={(value) => {
                      const nextItems = page.trustItems.map((trustItem, itemIndex) => itemIndex === index ? value : trustItem);
                      updatePage({ trustItems: nextItems });
                    }}
                    compact
                  />
                ))}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {landingThemes.map((option) => {
                    const selected = option.id === page.themeId;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => applyTheme(option.id)}
                        className={`tap-boost rounded-2xl p-4 text-left transition ${selected ? 'foru-gradient-border ring-2 ring-[#7C5CFF]/20' : 'foru-soft-panel'}`}
                      >
                        <span className="mb-4 flex gap-2">
                          {[option.background, option.surface, option.accent, option.text].map((color) => (
                            <span key={color} className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                          ))}
                        </span>
                        <span className="block text-base font-black text-gray-950">{option.name}</span>
                        <span className="mt-1 block text-sm font-semibold leading-6 text-gray-600">{option.description}</span>
                        <span className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-black text-gray-600">{option.bestFor}</span>
                        {selected && <span className="ml-2 mt-3 inline-flex rounded-full bg-[#7C5CFF] px-3 py-1 text-xs font-black text-white">Activo</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'illustration', label: 'Ilustracion friendly', icon: Paintbrush },
                    { id: 'image', label: 'Imagen propia', icon: Image },
                    { id: 'none', label: 'Sin portada visual', icon: Type },
                  ].map((option) => {
                    const Icon = option.icon;
                    const active = page.heroVisual === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updatePage({ heroVisual: option.id as DigitalWorldPage['heroVisual'] })}
                        className={`tap-boost rounded-2xl p-4 text-left ${active ? 'foru-gradient-border' : 'foru-soft-panel'}`}
                      >
                        <Icon size={20} className="mb-3 text-[#7C5CFF]" />
                        <span className="block text-sm font-black text-gray-950">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {page.heroVisual === 'image' && (
                  <Field
                    label="URL de imagen de portada"
                    hint="Pega una URL de foto o mockup. Si lo dejas vacio, aparece una ilustracion suave."
                    value={page.heroImageUrl}
                    onChange={(value) => updatePage({ heroImageUrl: value })}
                  />
                )}

                <div>
                  <p className="text-sm font-black text-gray-700">Tipografia</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['serif', 'Editorial'],
                      ['modern', 'Moderna'],
                      ['rounded', 'Amable'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePage({ fontStyle: id as DigitalWorldPage['fontStyle'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.fontStyle === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-gray-700">Forma de venta</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['cards', 'Tarjetas'],
                      ['steps', 'Pasos'],
                      ['spotlight', 'Destacado'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePage({ offerLayout: id as DigitalWorldPage['offerLayout'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.offerLayout === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-gray-700">Bloques</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['soft', 'Suave'],
                      ['cards', 'Ordenado'],
                      ['bold', 'Fuerte'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePage({ blockStyle: id as DigitalWorldPage['blockStyle'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.blockStyle === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-5">
                {page.faqItems.map((item, index) => (
                  <div key={index} className="foru-soft-panel rounded-2xl p-4">
                    <p className="mb-3 text-xs font-black uppercase text-gray-500">Pregunta {index + 1}</p>
                    <div className="grid gap-3">
                      <Field label="Pregunta" hint="Una duda comun antes de contactarte." value={item.question} onChange={(value) => updateFaqItem(index, 'question', value)} />
                      <Area label="Respuesta" hint="Responde corto, claro y sin sonar robotico." value={item.answer} onChange={(value) => updateFaqItem(index, 'answer', value)} compact />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 foru-glass p-4 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#7C5CFF]">Vista en vivo</p>
              <h2 className="font-serif text-2xl font-bold text-gray-950">Asi lo ve tu cliente</h2>
            </div>
            <div className="foru-soft-panel flex rounded-2xl p-1">
              {[
                { id: 'desktop', label: 'Compu', icon: Monitor },
                { id: 'mobile', label: 'Celular', icon: Smartphone },
              ].map((mode) => {
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPreviewMode(mode.id as 'desktop' | 'mobile')}
                    className={`tap-boost inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${previewMode === mode.id ? 'foru-gradient-button' : 'text-gray-600'}`}
                  >
                    <Icon size={15} /> {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mx-auto overflow-hidden rounded-3xl border shadow-sm transition-all ${previewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-full'}`} style={{ backgroundColor: theme.background, borderColor: theme.border }}>
            <div className={`relative grid min-h-[430px] items-center gap-8 overflow-hidden px-6 py-12 ${previewMode === 'mobile' ? 'text-left' : 'lg:grid-cols-[1fr_0.82fr]'} ${fontClass}`} style={{ backgroundColor: theme.background, color: theme.text }}>
              <div className="absolute inset-x-8 top-8 h-32 rounded-full opacity-70 blur-3xl" style={{ backgroundColor: theme.accentSoft }} />
              <div className="relative z-10">
                <p className="mb-5 text-sm font-black uppercase" style={{ color: theme.accent }}>{draft.businessTitle}</p>
                <h2 className={`${fontClass} text-4xl font-bold leading-tight ${previewMode === 'mobile' ? '' : 'md:text-6xl'}`}>{page.heroTitle}</h2>
                <p className="mt-6 max-w-2xl text-base font-medium leading-8" style={{ color: theme.muted }}>{page.heroSubtitle}</p>
                <button
                  type="button"
                  onClick={() => playUiTone('next')}
                  className="tap-boost mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-4 text-sm font-black"
                  style={{ backgroundColor: theme.button, color: theme.buttonText }}
                >
                  {page.ctaLabel} <MessageCircle size={17} />
                </button>
              </div>
              {page.heroVisual !== 'none' && (
                <HeroVisual page={page} theme={theme} compact={previewMode === 'mobile'} />
              )}
            </div>

            <div className={`grid gap-6 p-6 ${previewMode === 'mobile' ? '' : 'lg:grid-cols-[1fr_0.72fr]'} ${fontClass}`} style={{ backgroundColor: theme.background }}>
              <div className="space-y-6">
                <section className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <h3 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.storyTitle}</h3>
                  <p className="mt-4 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{page.storyText}</p>
                </section>

                <section className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <h3 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.featuredTitle}</h3>
                  <div className={`mt-5 grid gap-4 ${page.offerLayout === 'spotlight' || previewMode === 'mobile' ? '' : 'sm:grid-cols-2'}`}>
                    {page.featuredItems.map((item) => (
                      <article key={item.title} className={`rounded-2xl border p-4 ${page.blockStyle === 'bold' ? 'shadow-lg' : ''}`} style={{ backgroundColor: page.offerLayout === 'spotlight' ? theme.accentSoft : theme.background, borderColor: theme.border }}>
                        <p className="text-base font-black" style={{ color: theme.text }}>
                          {page.offerLayout === 'steps' && <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs" style={{ backgroundColor: theme.button, color: theme.buttonText }}>{page.featuredItems.indexOf(item) + 1}</span>}
                          {item.title}
                        </p>
                        <p className="mt-2 break-words text-sm font-semibold leading-6" style={{ color: theme.muted }}>{item.description}</p>
                        <span className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>{item.detail}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <h3 className="font-serif text-2xl font-bold" style={{ color: theme.text }}>Confianza</h3>
                  <div className="mt-4 space-y-3">
                    {page.trustItems.map((item) => (
                      <div key={item} className="flex gap-3 rounded-2xl p-4" style={{ backgroundColor: theme.accentSoft }}>
                        <BadgeCheck className="mt-1 shrink-0" style={{ color: theme.accent }} size={18} />
                        <p className="text-sm font-bold leading-6" style={{ color: theme.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <h3 className="font-serif text-2xl font-bold" style={{ color: theme.text }}>Preguntas frecuentes</h3>
                  <div className="mt-4 space-y-4">
                    {page.faqItems.map((item) => (
                      <div key={item.question}>
                        <p className="text-sm font-black" style={{ color: theme.text }}>{item.question}</p>
                        <p className="mt-1 text-sm font-semibold leading-6" style={{ color: theme.muted }}>{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl p-6 shadow-sm" style={{ backgroundColor: theme.text, color: theme.surface }}>
                  <p className="text-sm font-bold leading-6 opacity-85">{page.contactLine}</p>
                  <button
                    type="button"
                    onClick={() => playUiTone('success')}
                    className="tap-boost mt-4 w-full rounded-xl px-4 py-3 text-sm font-black"
                    style={{ backgroundColor: theme.surface, color: theme.text }}
                  >
                    {page.ctaLabel}
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroVisual({ page, theme, compact }: { page: DigitalWorldPage; theme: LandingTheme; compact: boolean }) {
  if (page.heroVisual === 'image' && page.heroImageUrl.trim()) {
    return (
      <div className={`relative z-10 overflow-hidden rounded-3xl border shadow-xl ${compact ? 'aspect-[4/3]' : 'aspect-[4/5]'}`} style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
        <img src={page.heroImageUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative z-10 overflow-hidden rounded-3xl border p-5 shadow-xl ${compact ? 'min-h-56' : 'min-h-80'}`} style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full" style={{ backgroundColor: theme.accentSoft }} />
      <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full opacity-80" style={{ backgroundColor: theme.accentSoft }} />
      <div className="relative grid h-full gap-4">
        <div className="rounded-2xl p-4" style={{ backgroundColor: theme.accentSoft }}>
          <p className="text-xs font-black uppercase" style={{ color: theme.accent }}>Mundo digital</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((item) => (
              <span key={item} className="h-16 rounded-2xl bg-white/80 shadow-sm" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[0.68fr_1fr] gap-3">
          <div className="rounded-2xl p-4" style={{ backgroundColor: theme.text, color: theme.surface }}>
            <Sparkles size={20} />
            <p className="mt-3 text-sm font-black leading-5">Oferta clara</p>
          </div>
          <div className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: theme.border }}>
            <p className="text-sm font-black" style={{ color: theme.text }}>{page.ctaLabel}</p>
            <p className="mt-2 text-xs font-bold leading-5" style={{ color: theme.muted }}>Un camino simple para que te escriban.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-semibold leading-5 text-gray-500">{hint}</span>}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="foru-input mt-2 w-full rounded-xl p-4 text-sm font-semibold text-gray-800 outline-none transition"
      />
    </label>
  );
}

function Area({ label, hint, value, onChange, compact = false }: { label: string; hint?: string; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-semibold leading-5 text-gray-500">{hint}</span>}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`foru-input mt-2 w-full rounded-xl p-4 text-sm font-semibold leading-7 text-gray-800 outline-none transition ${compact ? 'min-h-24' : 'min-h-36'}`}
      />
    </label>
  );
}
