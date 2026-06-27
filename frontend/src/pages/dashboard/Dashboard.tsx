import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Edit3,
  Eye,
  Home,
  Lightbulb,
  Menu,
  Mic2,
  Plus,
  Rocket,
  Send,
  Sparkles,
  Video,
} from '../../lib/icons';
import { loadConstructorState, loadDigitalWorldPage, loadLocalDraft } from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

type StudioView = 'today' | 'content' | 'calendar' | 'web' | 'publish';
type ContentStatus = 'idea' | 'script' | 'record' | 'edit' | 'publish';

type ContentItem = {
  id: string;
  title: string;
  format: string;
  day: number;
  status: ContentStatus;
};

type AiMessage = {
  role: 'bot' | 'user';
  text: string;
};

const contentStorageKey = 'foru:content-studio-v1';

const statusOptions: Array<{ id: ContentStatus; label: string; icon: typeof Lightbulb; color: string }> = [
  { id: 'idea', label: 'Idea', icon: Lightbulb, color: '#FDE68A' },
  { id: 'script', label: 'Guion', icon: Mic2, color: '#93C5FD' },
  { id: 'record', label: 'Grabar', icon: Video, color: '#F9A8D4' },
  { id: 'edit', label: 'Editar', icon: Clapperboard, color: '#C4B5FD' },
  { id: 'publish', label: 'Publicar', icon: Send, color: '#6EE7B7' },
];

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function loadContentItems(): ContentItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(contentStorageKey) || '[]') as ContentItem[];
    if (saved.length) return saved;
  } catch {
    // Use the starter plan below.
  }

  return [
    { id: 'starter-1', title: 'Explica tu oferta en 30 segundos', format: 'Reel', day: 1, status: 'script' },
    { id: 'starter-2', title: 'Responde una duda frecuente', format: 'Historia', day: 3, status: 'record' },
    { id: 'starter-3', title: 'Muestra un resultado real', format: 'Carrusel', day: 5, status: 'idea' },
  ];
}

export default function Dashboard() {
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const page = loadDigitalWorldPage(draft, constructorState);
  const publicPath = `/p/${page.publicSlug || 'preview'}`;
  const [activeView, setActiveView] = useState<StudioView>('today');
  const [mobileNav, setMobileNav] = useState(false);
  const [items, setItems] = useState<ContentItem[]>(loadContentItems);
  const [newTitle, setNewTitle] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      role: 'bot',
      text: 'Estoy aquí para bajarte el ruido. Puedes pedirme una idea, un guion corto, o qué hacer hoy.',
    },
  ]);

  const nextItem = items.find((item) => item.status !== 'publish') ?? items[0];
  const publishedCount = items.filter((item) => item.status === 'publish').length;
  const weekProgress = items.length ? Math.round((publishedCount / items.length) * 100) : 0;

  const navigation = [
    { id: 'today' as const, label: 'Hoy', icon: Home },
    { id: 'content' as const, label: 'Contenido', icon: Clapperboard },
    { id: 'calendar' as const, label: 'Calendario', icon: CalendarDays },
    { id: 'web' as const, label: 'Mi web', icon: Edit3 },
    { id: 'publish' as const, label: 'Publicar', icon: Rocket },
  ];

  function selectView(view: StudioView) {
    playUiTone('tap');
    setActiveView(view);
    setMobileNav(false);
  }

  function saveItems(nextItems: ContentItem[]) {
    setItems(nextItems);
    localStorage.setItem(contentStorageKey, JSON.stringify(nextItems));
  }

  function addContent() {
    if (!newTitle.trim()) return;
    saveItems([
      ...items,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        format: 'Reel',
        day: Math.min(items.length + 1, 6),
        status: 'idea',
      },
    ]);
    setNewTitle('');
    playUiTone('success');
  }

  function updateStatus(id: string, status: ContentStatus) {
    saveItems(items.map((item) => item.id === id ? { ...item, status } : item));
    playUiTone(status === 'publish' ? 'success' : 'tap');
  }

  function updateDay(id: string, day: number) {
    saveItems(items.map((item) => item.id === id ? { ...item, day } : item));
  }

  function askStudioAi(prompt?: string) {
    const question = (prompt ?? aiInput).trim();
    if (!question) return;

    const lowerQuestion = question.toLowerCase();
    const answer = lowerQuestion.includes('guion') || lowerQuestion.includes('grabar')
      ? 'Hazlo así: gancho de 3 segundos, una idea central, ejemplo concreto y cierre con “escríbeme si quieres que te ayude”. Graba una sola toma de 40 segundos.'
      : lowerQuestion.includes('calendario') || lowerQuestion.includes('semana')
        ? 'Esta semana: lunes explica tu oferta, miércoles responde una pregunta frecuente, viernes muestra prueba o resultado. Tres piezas bastan.'
        : lowerQuestion.includes('web') || lowerQuestion.includes('landing')
          ? 'Primero mejora la portada: promesa clara, una imagen/ilustración amable y un botón único. Luego agrega confianza y preguntas frecuentes.'
          : 'Empieza por una cosa: elige una duda frecuente de tu cliente y conviértela en una pieza corta. Después la pasamos por Idea → Guion → Grabar → Editar → Publicar.';

    setAiMessages((current) => [...current, { role: 'user', text: question }, { role: 'bot', text: answer }]);
    setAiInput('');
    setAiOpen(true);
    playUiTone('tap');
  }

  return (
    <div className="foru-studio-surface flex min-h-screen text-[#171717]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-black/8 bg-white p-4 transition-transform md:sticky md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="foru-logo block px-3 py-4">FOR <span>U</span></Link>
        <div className="foru-studio-sidebar-card mt-3 p-4">
          <p className="text-xs font-black uppercase text-[#10B981]">Estudio digital</p>
          <p className="mt-2 font-serif text-xl font-bold text-gray-950">{draft.businessName}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full foru-gradient-button" style={{ width: `${Math.max(18, weekProgress)}%` }} />
          </div>
        </div>

        <nav className="mt-5 grid gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectView(item.id)}
                className={`tap-boost flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black ${
                  activeView === item.id ? 'foru-gradient-button' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={19} /> {item.label}
              </button>
            );
          })}
        </nav>

        <button type="button" onClick={() => setAiOpen(true)} className="mt-auto flex items-center gap-3 rounded-xl bg-[#F3F0FF] p-4 text-left text-sm font-black text-[#5B3FD1] transition hover:-translate-y-0.5">
          <Bot size={20} /> Preguntar a IA
        </button>
      </aside>

      {mobileNav && <button type="button" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-black/20 md:hidden" />}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/8 bg-white/95 px-4 backdrop-blur md:px-7">
          <button type="button" onClick={() => setMobileNav(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 md:hidden">
            <Menu size={20} />
          </button>
          <div>
            <p className="text-xs font-black uppercase text-[#7C5CFF]">Estudio For U</p>
            <h1 className="text-lg font-black">{navigation.find((item) => item.id === activeView)?.label}</h1>
          </div>
          <Link to={publicPath} className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-black">
            <Eye size={16} /> <span className="hidden sm:inline">Ver landing</span>
          </Link>
        </header>

        <div className="mx-auto max-w-7xl p-4 md:p-7">
          {activeView === 'today' && (
            <TodayView
              draftName={draft.businessName}
              nextItem={nextItem}
              itemCount={items.length}
              publishedCount={publishedCount}
              onOpenContent={() => selectView('content')}
              onOpenCalendar={() => selectView('calendar')}
              onAskAi={askStudioAi}
            />
          )}
          {activeView === 'content' && (
            <ContentView
              items={items}
              newTitle={newTitle}
              onNewTitle={setNewTitle}
              onAdd={addContent}
              onStatus={updateStatus}
            />
          )}
          {activeView === 'calendar' && <CalendarView items={items} onDay={updateDay} onOpenContent={() => selectView('content')} />}
          {activeView === 'web' && <WebView pageTitle={page.heroTitle} publicPath={publicPath} />}
          {activeView === 'publish' && <PublishView items={items} publicPath={publicPath} />}
        </div>
      </main>

      <StudioAiDock
        open={aiOpen}
        messages={aiMessages}
        input={aiInput}
        onInput={setAiInput}
        onClose={() => setAiOpen(false)}
        onAsk={askStudioAi}
      />
    </div>
  );
}

function TodayView({
  draftName,
  nextItem,
  itemCount,
  publishedCount,
  onOpenContent,
  onOpenCalendar,
  onAskAi,
}: {
  draftName: string;
  nextItem?: ContentItem;
  itemCount: number;
  publishedCount: number;
  onOpenContent: () => void;
  onOpenCalendar: () => void;
  onAskAi: (prompt?: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-2xl foru-dark-gradient p-6 text-white shadow-xl md:p-8">
        <div className="absolute right-6 top-6 grid grid-cols-2 gap-2 opacity-80">
          {[Lightbulb, Mic2, Video, Send].map((Icon, index) => (
            <span key={index} className="float-in flex h-11 w-11 items-center justify-center rounded-xl bg-white/10" style={{ animationDelay: `${index * 90}ms` }}>
              <Icon size={19} />
            </span>
          ))}
        </div>
        <div className="relative max-w-2xl">
          <p className="text-sm font-black text-[#6EE7B7]">Hola, {draftName}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">Hoy toca crear, no organizarlo todo.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onOpenContent} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black text-gray-950">
            Abrir mi tarea <ArrowRight size={17} />
          </button>
          <button type="button" onClick={() => onAskAi('No sé por dónde empezar hoy')} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-4 text-sm font-black text-white ring-1 ring-white/15">
            Preguntar IA <Bot size={17} />
          </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <button type="button" onClick={onOpenContent} className="tap-boost flex min-h-56 flex-col justify-between rounded-2xl border border-black/8 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4C2]"><Video size={22} /></span>
            <span className="rounded-full bg-[#F3F0FF] px-3 py-1 text-xs font-black text-[#6D4AFF]">SIGUIENTE</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">{nextItem?.format || 'Contenido'}</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">{nextItem?.title || 'Crea tu primera idea'}</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-[#6D4AFF]">Continuar <ArrowRight size={16} /></span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Clapperboard} value={itemCount} label="Piezas" color="#93C5FD" />
          <Metric icon={Send} value={publishedCount} label="Publicadas" color="#6EE7B7" />
          <button type="button" onClick={onOpenCalendar} className="tap-boost col-span-2 flex items-center justify-between rounded-2xl border border-black/8 bg-white p-5 text-left shadow-sm">
            <span>
              <span className="text-xs font-black uppercase text-gray-500">Esta semana</span>
              <span className="mt-1 block text-lg font-black">Ver calendario</span>
            </span>
            <CalendarDays className="text-[#7C5CFF]" size={28} />
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => onAskAi('Dame una idea de contenido para mi negocio')} className="tap-boost flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-4 text-left text-sm font-black shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9A8D4]"><Bot size={19} /></span>
          Pedir una idea
        </button>
        <QuickAction to="/metodologia" icon={BookOpen} title="Aprender algo" color="#FDE68A" />
        <QuickAction to="/editor" icon={Edit3} title="Editar mi web" color="#6EE7B7" />
      </section>
    </div>
  );
}

function ContentView({
  items,
  newTitle,
  onNewTitle,
  onAdd,
  onStatus,
}: {
  items: ContentItem[];
  newTitle: string;
  onNewTitle: (value: string) => void;
  onAdd: () => void;
  onStatus: (id: string, status: ContentStatus) => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="foru-badge">Fábrica de contenido</span>
          <h2 className="mt-4 font-serif text-4xl font-bold">De idea a publicado.</h2>
        </div>
        <div className="flex w-full max-w-md gap-2">
          <input value={newTitle} onChange={(event) => onNewTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAdd()} placeholder="Nueva idea..." className="foru-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
          <button type="button" onClick={onAdd} title="Agregar idea" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl foru-dark-gradient text-white"><Plus size={19} /></button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const currentStatus = statusOptions.find((status) => status.id === item.status) ?? statusOptions[0];
          const CurrentIcon = currentStatus.icon;
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
              <div className="flex items-start gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: currentStatus.color }}>
                  <CurrentIcon size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase text-gray-500">{item.format}</p>
                  <h3 className="mt-1 text-lg font-black leading-tight">{item.title}</h3>
                </div>
              </div>
              <div className="grid grid-cols-5 border-t border-black/8">
                {statusOptions.map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      title={status.label}
                      onClick={() => onStatus(item.id, status.id)}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 border-r border-black/8 text-[10px] font-black last:border-r-0 ${item.status === status.id ? 'text-gray-950' : 'text-gray-400'}`}
                      style={{ backgroundColor: item.status === status.id ? `${status.color}66` : 'transparent' }}
                    >
                      <Icon size={17} /> {status.label}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({ items, onDay, onOpenContent }: { items: ContentItem[]; onDay: (id: string, day: number) => void; onOpenContent: () => void }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="foru-badge">Calendario de contenido</span>
          <h2 className="mt-4 font-serif text-4xl font-bold">Tu semana de grabación.</h2>
        </div>
        <button type="button" onClick={onOpenContent} className="hidden items-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-black text-white sm:inline-flex">
          <Plus size={17} /> Nueva idea
        </button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekDays.map((day, dayIndex) => {
          const dayItems = items.filter((item) => item.day === dayIndex);
          return (
            <section key={day} className="min-h-48 rounded-2xl border border-black/8 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">{day}</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-black">{dayIndex + 1}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {dayItems.map((item) => {
                  const status = statusOptions.find((option) => option.id === item.status) ?? statusOptions[0];
                  return (
                    <button key={item.id} type="button" onClick={() => onDay(item.id, (dayIndex + 1) % 7)} className="tap-boost rounded-xl p-3 text-left" style={{ backgroundColor: `${status.color}77` }}>
                      <p className="text-[10px] font-black uppercase">{item.format}</p>
                      <p className="mt-1 text-xs font-black leading-4">{item.title}</p>
                    </button>
                  );
                })}
                {!dayItems.length && <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-black/10 text-xs font-bold text-gray-350">Libre</div>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-bold text-gray-500">Toca una pieza para moverla al día siguiente.</p>
    </div>
  );
}

function WebView({ pageTitle, publicPath }: { pageTitle: string; publicPath: string }) {
  return (
    <div>
      <span className="foru-badge">Tu web</span>
      <h2 className="mt-4 font-serif text-4xl font-bold">Una página que trabaja contigo.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Link to="/editor" className="tap-boost flex min-h-64 flex-col justify-between rounded-2xl foru-dark-gradient p-6 text-white shadow-xl">
          <Edit3 size={30} className="text-[#F9A8D4]" />
          <div>
            <p className="text-sm font-bold text-white/60">Editor en vivo</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">{pageTitle}</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black">Editar web <ArrowRight size={16} /></span>
        </Link>
        <Link to={publicPath} className="tap-boost flex min-h-64 flex-col justify-between rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          <Eye size={30} className="text-[#7C5CFF]" />
          <div>
            <p className="text-sm font-bold text-gray-500">Vista pública</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">Mírala como cliente.</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-[#6D4AFF]">Abrir landing <ArrowRight size={16} /></span>
        </Link>
      </div>
    </div>
  );
}

function PublishView({ items, publicPath }: { items: ContentItem[]; publicPath: string }) {
  const readyItems = useMemo(() => items.filter((item) => item.status === 'publish'), [items]);
  return (
    <div>
      <span className="foru-badge">Centro de publicación</span>
      <h2 className="mt-4 font-serif text-4xl font-bold">Lo que ya está listo.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-[1fr_0.7fr]">
        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Contenido</h3>
            <Send className="text-[#7C5CFF]" size={21} />
          </div>
          <div className="mt-4 grid gap-3">
            {readyItems.length ? readyItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#ECFDF5] p-4">
                <CheckCircle2 className="text-[#087F5B]" size={19} />
                <span className="text-sm font-black">{item.title}</span>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-black/10 p-8 text-center">
                <Clapperboard className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-bold text-gray-500">Todavía no hay piezas publicadas.</p>
              </div>
            )}
          </div>
        </section>
        <Link to={publicPath} className="tap-boost flex flex-col justify-between rounded-2xl foru-gradient-button p-6 shadow-xl">
          <Rocket size={30} />
          <div>
            <p className="text-sm font-bold">Landing</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">Lista para compartir.</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black">Abrir link <ArrowRight size={16} /></span>
        </Link>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }: { icon: typeof Video; value: number; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: color }}><Icon size={18} /></span>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="text-xs font-black uppercase text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, color }: { to: string; icon: typeof Bot; title: string; color: string }) {
  return (
    <Link to={to} className="tap-boost flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-4 text-sm font-black shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: color }}><Icon size={19} /></span>
      {title}
    </Link>
  );
}

function StudioAiDock({
  open,
  messages,
  input,
  onInput,
  onClose,
  onAsk,
}: {
  open: boolean;
  messages: AiMessage[];
  input: string;
  onInput: (value: string) => void;
  onClose: () => void;
  onAsk: (prompt?: string) => void;
}) {
  return (
    <section className={`foru-ai-dock ${open ? 'open' : ''}`}>
      <div className="flex h-full flex-col rounded-t-[20px] border border-black/10 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/8 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-[#10B981]">IA For U</p>
            <h2 className="font-serif text-xl font-bold">Tu guía de estudio</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar IA" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-black">×</button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            {['¿Qué hago hoy?', 'Dame un guion', 'Arma mi semana'].map((prompt) => (
              <button key={prompt} type="button" onClick={() => onAsk(prompt)} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-black text-gray-700">
                {prompt}
              </button>
            ))}
          </div>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                message.role === 'user'
                  ? 'ml-auto rounded-br bg-[#1a1a1a] text-white'
                  : 'rounded-bl bg-gray-100 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="flex gap-3 border-t border-black/8 p-4">
          <input
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onAsk()}
            placeholder="Pregúntame algo..."
            className="foru-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none"
          />
          <button type="button" onClick={() => onAsk()} aria-label="Enviar" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a1a] text-white">
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
