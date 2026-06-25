import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Edit3, Sparkles } from '../lib/icons';
import { draftStorageKey, loadDigitalWorldPage, loadLocalDraft } from '../lib/digitalWorldDraft';
import { playUiTone } from '../lib/sound';

export default function Home() {
  const hasBusiness = typeof window !== 'undefined' && Boolean(localStorage.getItem(draftStorageKey));
  const draft = loadLocalDraft();
  const page = loadDigitalWorldPage(draft);
  const primaryPath = hasBusiness ? '/editor' : '/metodologia';

  return (
    <div className="min-h-screen bg-white text-[#171717]">
      <nav className="foru-nav foru-container">
        <Link to="/" className="foru-logo">FOR <span>U</span></Link>
        {hasBusiness && (
          <Link
            to={`/p/${page.publicSlug}`}
            onClick={() => playUiTone('next')}
            className="inline-flex items-center gap-2 text-sm font-black text-gray-700"
          >
            Ver mi landing <ArrowRight size={16} />
          </Link>
        )}
      </nav>

      <main className="foru-container flex min-h-[calc(100vh-92px)] items-center py-8">
        <section className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <span className="foru-badge">{hasBusiness ? `Hola, ${draft.businessName}` : 'Empieza sin enredarte'}</span>
            <h1 className="mx-auto mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.04] md:text-7xl">
              {hasBusiness ? '¿Qué quieres hacer ahora?' : 'Construye tu mundo digital paso a paso.'}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-7 text-gray-600">
              {hasBusiness
                ? 'For U ya tiene la información de tu negocio. Elige una sola acción y continúa desde ahí.'
                : 'Comienza con una guía corta. Después la IA te dirá qué material usar y qué crear primero.'}
            </p>
          </div>

          <Link
            to={primaryPath}
            onClick={() => playUiTone('next')}
            className="tap-boost mx-auto mt-8 flex max-w-2xl items-center justify-between gap-5 rounded-2xl foru-dark-gradient p-6 text-white shadow-2xl"
          >
            <span className="flex items-center gap-4 text-left">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl foru-gradient-button text-gray-950">
                {hasBusiness ? <Edit3 size={25} /> : <Sparkles size={25} />}
              </span>
              <span>
                <span className="block text-xs font-black uppercase text-[#6EE7B7]">Recomendado</span>
                <span className="mt-1 block text-xl font-black">{hasBusiness ? 'Editar mi landing' : 'Descubrir por dónde empezar'}</span>
                <span className="mt-1 block text-sm font-semibold text-white/65">
                  {hasBusiness ? 'Editor y vista previa juntos.' : 'Haz el Radar For U en pocos minutos.'}
                </span>
              </span>
            </span>
            <ArrowRight className="shrink-0" />
          </Link>

          <div className="mx-auto mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
            <Link to="/ia" onClick={() => playUiTone('tap')} className="tap-boost flex items-center gap-3 rounded-xl border border-black/10 p-4 font-black">
              <Bot className="text-[#7C5CFF]" size={20} /> Preguntar a IA For U
            </Link>
            <Link to="/metodologia" onClick={() => playUiTone('tap')} className="tap-boost flex items-center gap-3 rounded-xl border border-black/10 p-4 font-black">
              <BookOpen className="text-[#7C5CFF]" size={20} /> Ver contenidos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
