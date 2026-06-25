import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Edit3, Sparkles } from '../lib/icons';
import { draftStorageKey, loadDigitalWorldPage, loadLocalDraft } from '../lib/digitalWorldDraft';
import { playUiTone } from '../lib/sound';

export default function Home() {
  const hasBusiness = typeof window !== 'undefined' && Boolean(localStorage.getItem(draftStorageKey));
  const draft = loadLocalDraft();
  const page = loadDigitalWorldPage(draft);
  const primaryPath = hasBusiness ? '/ia' : '/metodologia';

  return (
    <div className="foru-app-bg relative min-h-screen overflow-hidden text-[#171717]">
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
            <span className="foru-badge">{hasBusiness ? `Hola, ${draft.businessName}` : 'Tu ecosistema digital'}</span>
            <h1 className="mx-auto mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.04] md:text-7xl">
              Vive la experiencia <span className="text-gradient-animated">For U</span> completa.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-7 text-gray-600">
              Déjate guiar: entiende tu negocio, recibe el contenido correcto y convierte tus ideas en una web lista para compartir.
            </p>
          </div>

          <Link
            to={primaryPath}
            onClick={() => playUiTone('next')}
            className="tap-boost mx-auto mt-8 flex max-w-2xl items-center justify-between gap-5 rounded-2xl foru-dark-gradient p-6 text-white shadow-2xl"
          >
            <span className="flex items-center gap-4 text-left">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl foru-gradient-button text-gray-950">
                <Sparkles size={25} />
              </span>
              <span>
                <span className="block text-xs font-black uppercase text-[#6EE7B7]">Ruta recomendada</span>
                <span className="mt-1 block text-xl font-black">Guíame de una</span>
                <span className="mt-1 block text-sm font-semibold text-white/65">
                  For U te dice qué hacer primero y te acompaña hasta publicarlo.
                </span>
              </span>
            </span>
            <ArrowRight className="shrink-0" />
          </Link>

          <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-3">
            <Link to="/metodologia" onClick={() => playUiTone('tap')} className="tap-boost flex min-h-24 flex-col justify-between rounded-xl border border-black/10 bg-white/80 p-4 font-black shadow-sm backdrop-blur">
              <BookOpen className="text-[#7C5CFF]" size={21} />
              <span>Metodología</span>
            </Link>
            <Link to="/ia" onClick={() => playUiTone('tap')} className="tap-boost flex min-h-24 flex-col justify-between rounded-xl border border-black/10 bg-white/80 p-4 font-black shadow-sm backdrop-blur">
              <Bot className="text-[#7C5CFF]" size={21} />
              <span>IA For U</span>
            </Link>
            <Link to={hasBusiness ? '/editor' : '/register'} onClick={() => playUiTone('tap')} className="tap-boost flex min-h-24 flex-col justify-between rounded-xl border border-black/10 bg-white/80 p-4 font-black shadow-sm backdrop-blur">
              <Edit3 className="text-[#7C5CFF]" size={21} />
              <span>{hasBusiness ? 'Editar mi web' : 'Quiero mi web'}</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
