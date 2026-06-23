import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clipboard,
  Eye,
  FileText,
  Home,
  LayoutDashboard,
  Link2,
  MapPin,
  Menu,
  Palette,
  Phone,
  Rocket,
  Settings,
  Sparkles,
  Users,
} from '../../lib/icons';
import {
  type ConstructorState,
  type DigitalWorldPage,
  getLandingTheme,
  loadConstructorState,
  loadDigitalWorldPage,
  loadLocalDraft,
  saveConstructorState,
  saveDigitalWorldPage,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

type RouteStep = {
  id: string;
  title: string;
  description: string;
  action: string;
  to?: string;
  icon: typeof Sparkles;
  done: boolean;
};

export default function Dashboard() {
  const draft = loadLocalDraft();
  const [constructorState, setConstructorState] = useState<ConstructorState>(() => loadConstructorState(draft));
  const [page, setPage] = useState<DigitalWorldPage>(() => loadDigitalWorldPage(draft, constructorState));
  const [copied, setCopied] = useState(false);
  const theme = getLandingTheme(page.themeId);
  const publicPath = `/p/${page.publicSlug || 'preview'}`;
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : publicPath;

  const publishChecklist = useMemo(() => [
    'La promesa principal se entiende en 5 segundos',
    'La oferta, confianza y preguntas ya estan revisadas',
    'El estilo visual se siente profesional para el negocio',
    'La vista publica fue revisada como cliente',
    'WhatsApp, horario o ubicacion ya estan definidos',
  ], []);

  const completedCount = constructorState.completedTasks.length;
  const requiredDone = Math.min(completedCount, publishChecklist.length);
  const hasLocation = page.locationText.trim() && page.locationText !== 'Ubicacion por definir';
  const hasHours = page.businessHours.trim() && page.businessHours !== 'Horarios por configurar';
  const hasContact = Boolean(page.contactWhatsapp.trim() || hasLocation || hasHours);
  const progress = Math.min(100, Math.round(
    ((requiredDone / publishChecklist.length) * 55)
    + (constructorState.privatePreviewReady ? 15 : 0)
    + (page.themeId ? 15 : 0)
    + (hasContact ? 15 : 0),
  ));

  const routeSteps: RouteStep[] = [
    {
      id: 'edit',
      title: 'Ajustar portada',
      description: 'Cambia solo titulo, promesa y boton si algo no suena tuyo.',
      action: 'Editar texto',
      to: '/editor',
      icon: FileText,
      done: completedCount > 1,
    },
    {
      id: 'contact',
      title: 'Completar contacto',
      description: hasContact ? 'Ya hay una forma clara de contactarte.' : 'Agrega WhatsApp, ubicacion u horario para que la landing convierta.',
      action: hasContact ? 'Listo' : 'Completar abajo',
      icon: Phone,
      done: hasContact,
    },
    {
      id: 'preview',
      title: 'Abrir ruta publica',
      description: `${publicPath} ya existe y se actualiza con tus cambios.`,
      action: 'Ver landing',
      to: publicPath,
      icon: Eye,
      done: constructorState.privatePreviewReady,
    },
    {
      id: 'publish',
      title: 'Compartir link',
      description: page.publishStatus === 'published' ? 'Tu link ya esta activado.' : 'Activa la publicacion cuando el contacto este listo.',
      action: page.publishStatus === 'published' ? 'Publicado' : 'Activar abajo',
      icon: Rocket,
      done: page.publishStatus === 'published',
    },
  ];

  function updateConstructor(nextState: Partial<ConstructorState>) {
    setConstructorState((currentState) => {
      const updatedState = { ...currentState, ...nextState, updatedAt: new Date().toISOString() };
      saveConstructorState(updatedState);
      return updatedState;
    });
  }

  function updatePage(nextPage: Partial<DigitalWorldPage>) {
    setPage((currentPage) => {
      const updatedPage = { ...currentPage, ...nextPage, updatedAt: new Date().toISOString() };
      saveDigitalWorldPage(updatedPage);
      return updatedPage;
    });
  }

  function toggleTask(task: string) {
    playUiTone('tap');
    const alreadyCompleted = constructorState.completedTasks.includes(task);
    updateConstructor({
      completedTasks: alreadyCompleted
        ? constructorState.completedTasks.filter((item) => item !== task)
        : [...constructorState.completedTasks, task],
    });
  }

  function publishPage() {
    playUiTone('success');
    updatePage({
      publishStatus: 'published',
      publishedAt: new Date().toISOString(),
    });
    updateConstructor({ privatePreviewReady: true });
  }

  async function copyPublicLink() {
    playUiTone('success');
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="foru-app-bg flex min-h-screen text-[#171717]">
      <aside className="hidden w-72 flex-col border-r border-black/10 foru-glass md:flex">
        <div className="flex h-20 items-center px-6">
          <h1 className="foru-logo">FOR <span>U</span></h1>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-4">
          {[
            { label: 'Inicio', icon: LayoutDashboard, active: true },
            { label: 'Tu plan', icon: Sparkles },
            { label: 'Editar pagina', icon: FileText },
            { label: 'Estilo', icon: Palette },
            { label: 'Publicar', icon: Rocket },
            { label: 'Reservas', icon: CalendarCheck },
            { label: 'Clientes', icon: Users },
            { label: 'Metricas', icon: BarChart3 },
            { label: 'Ajustes', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => playUiTone('tap')}
                className={`tap-boost flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  item.active
                    ? 'foru-gradient-button text-[#1a1a1a] shadow-md'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-950'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-black/10 foru-glass px-5 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => playUiTone('tap')}
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            <Menu size={24} />
          </button>
          <div>
            <p className="text-sm font-black text-[#7C5CFF]">Inicio</p>
            <h2 className="font-serif text-2xl font-bold text-gray-950">{draft.businessName}</h2>
          </div>
          <Link
            to={publicPath}
            onClick={() => {
              playUiTone('next');
              updateConstructor({ privatePreviewReady: true });
            }}
            className="tap-boost hidden items-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-bold text-white shadow-lg sm:inline-flex"
          >
            Ver pagina <Eye size={17} />
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
              <div className="pulse-soft rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
                <span className="foru-badge">Bloque 7: publicar</span>
                <h1 className="foru-title mt-5" style={{ fontSize: 'clamp(2.1rem, 4vw, 4rem)' }}>
                  Tu pagina publica, <span className="text-gradient-animated">lista para compartir</span>.
                </h1>
                <p className="foru-subtitle mt-4 max-w-2xl">
                  Ya existe una primera landing con ruta publica. Ahora solo toca ajustar lo necesario para compartirla.
                </p>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-black text-gray-700">Preparacion para publicar</span>
                    <span className="text-sm font-black text-[#7C5CFF]">{progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full foru-gradient-button transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 foru-dark-gradient p-6 text-white shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-[#6EE7B7]">Estado</p>
                    <h3 className="font-serif text-2xl">{page.publishStatus === 'published' ? 'Publicado' : 'Landing creada'}</h3>
                  </div>
                  <Rocket className="text-[#FDE68A]" />
                </div>
                <p className="rounded-2xl bg-white/10 p-4 text-sm font-medium leading-6 text-white/90">
                  {page.publishStatus === 'published'
                    ? 'Tu pagina ya tiene un link compartible. Todavia puedes editarla y volver a guardar cambios.'
                    : 'La landing ya esta generada. Completa contacto, revisa la ruta publica y activa el link cuando quieras compartirlo.'}
                </p>
                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-black uppercase text-white/60">Link</p>
                  <p className="mt-2 break-all text-sm font-bold leading-6">{publicUrl}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold">Siguientes pasos exactos</h3>
                  <p className="mt-1 text-sm font-semibold text-gray-600">Solo lo necesario para que la landing quede compartible.</p>
                </div>
                <Home className="text-[#7C5CFF]" />
              </div>

              <div className="grid gap-3 lg:grid-cols-4">
                {routeSteps.map((step, index) => {
                  const Icon = step.icon;
                  const content = (
                    <div className={`tap-boost h-full rounded-2xl p-4 text-left shadow-sm transition ${step.done ? 'foru-gradient-border' : 'foru-soft-panel'}`}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80">
                          <Icon size={19} />
                        </span>
                        <span className="rounded-full bg-white/75 px-2.5 py-1 text-xs font-black text-gray-600">{index + 1}</span>
                      </div>
                      <h4 className="text-base font-black text-gray-950">{step.title}</h4>
                      <p className="mt-2 min-h-16 text-sm font-semibold leading-6 text-gray-600">{step.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7C5CFF]">
                        {step.action} {step.to && <ArrowRight size={15} />}
                      </span>
                    </div>
                  );

                  return step.to ? (
                    <Link
                      key={step.id}
                      to={step.to}
                      onClick={() => {
                        playUiTone('next');
                        if (step.id === 'preview') updateConstructor({ privatePreviewReady: true });
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={step.id}>{content}</div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold">Datos reales</h3>
                      <p className="mt-1 text-sm font-semibold text-gray-600">Esto reemplaza los placeholders de la pagina publica.</p>
                    </div>
                    <Phone className="text-[#7C5CFF]" />
                  </div>

                  <div className="space-y-4">
                    <PublishField
                      icon={Link2}
                      label="Slug publico"
                      value={page.publicSlug}
                      placeholder="mi-negocio"
                      onChange={(value) => updatePage({ publicSlug: value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') })}
                    />
                    <PublishField
                      icon={Phone}
                      label="WhatsApp o telefono"
                      value={page.contactWhatsapp}
                      placeholder="+51 999 999 999"
                      onChange={(value) => updatePage({ contactWhatsapp: value })}
                    />
                    <PublishField
                      icon={MapPin}
                      label="Ubicacion"
                      value={page.locationText}
                      placeholder="Miraflores, Lima"
                      onChange={(value) => updatePage({ locationText: value })}
                    />
                    <PublishField
                      icon={CalendarCheck}
                      label="Horario o disponibilidad"
                      value={page.businessHours}
                      placeholder="Lunes a sabado, 9am a 7pm"
                      onChange={(value) => updatePage({ businessHours: value })}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold">Que falta para publicar</h3>
                      <p className="mt-1 text-sm font-semibold text-gray-600">Marca lo que ya revisaste.</p>
                    </div>
                    <CheckCircle2 className="text-[#7C5CFF]" />
                  </div>
                  <div className="space-y-3">
                    {publishChecklist.map((task) => {
                      const completed = constructorState.completedTasks.includes(task);

                      return (
                        <button
                          key={task}
                          type="button"
                          onClick={() => toggleTask(task)}
                          className={`tap-boost flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                            completed ? 'foru-gradient-border' : 'foru-soft-panel'
                          }`}
                        >
                          <CheckCircle2 className={completed ? 'text-[#7C5CFF]' : 'text-gray-400'} size={20} />
                          <span className={`text-sm font-bold ${completed ? 'text-[#7C5CFF]' : 'text-gray-800'}`}>{task}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 foru-glass p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Vista publica y link</h3>
                    <p className="mt-1 text-sm font-semibold text-gray-600">Esta tarjeta usa el estilo real de tu pagina.</p>
                  </div>
                  <Rocket className="text-[#7C5CFF]" />
                </div>
                <div className="overflow-hidden rounded-3xl border p-5" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                  <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>{draft.businessTitle}</p>
                    <h4 className="mt-3 font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.heroTitle}</h4>
                    <p className="mt-3 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{page.heroSubtitle}</p>
                    <div className="mt-5 grid gap-2 text-sm font-bold" style={{ color: theme.muted }}>
                      <span>{page.locationText || 'Ubicacion por definir'}</span>
                      <span>{page.businessHours || 'Horarios por configurar'}</span>
                      <span>{page.contactWhatsapp || 'WhatsApp pendiente'}</span>
                    </div>
                    <Link
                      to={publicPath}
                      onClick={() => {
                        playUiTone('next');
                        updateConstructor({ privatePreviewReady: true });
                      }}
                      className="tap-boost mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black"
                      style={{ backgroundColor: theme.button, color: theme.buttonText }}
                    >
                      Ver pagina <Eye size={16} />
                    </Link>
                  </div>

                  <div className="mt-4 rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Link compartible</p>
                    <p className="mt-2 break-all text-sm font-bold" style={{ color: theme.text }}>{publicUrl}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={copyPublicLink}
                        className="tap-boost inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black"
                        style={{ borderColor: theme.border, color: theme.text }}
                      >
                        <Clipboard size={16} /> {copied ? 'Copiado' : 'Copiar link'}
                      </button>
                      <button
                        type="button"
                        onClick={publishPage}
                        className="tap-boost inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black"
                        style={{ backgroundColor: theme.button, color: theme.buttonText }}
                      >
                        <Rocket size={16} /> {page.publishStatus === 'published' ? 'Publicado' : 'Activar publicacion'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function PublishField({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
}: {
  icon: typeof Link2;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-gray-700">
        <Icon size={16} /> {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="foru-input w-full rounded-xl p-4 text-sm font-semibold text-gray-800 outline-none transition"
      />
    </label>
  );
}
