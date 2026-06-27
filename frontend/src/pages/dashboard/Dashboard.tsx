import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clipboard,
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

type CampaignTab = 'today' | 'organic' | 'ads' | 'manychat' | 'closing';

type CampaignCopyBlock = {
  id: string;
  label: string;
  text: string;
};

type CampaignTask = {
  id: string;
  tag: string;
  tagTone: 'urgent' | 'content' | 'ads' | 'many' | 'close';
  title: string;
  description?: string;
  copies?: CampaignCopyBlock[];
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

const campaignStorageKey = 'foru:campaign-studio-v1';
const campaignDoneStorageKey = 'foru:campaign-studio-done-v1';

const campaignSchedule = [
  ['AHORA', 'Subir Video Día 1 + Carrusel 1', 'Orgánico'],
  ['+10 min', 'Subir Video Día 2 + Carrusel 2', 'Orgánico'],
  ['+10 min', 'Subir Video Día 3 + Carrusel 3', 'Orgánico'],
  ['+10 min', 'Subir Video Día 4 + Carrusel 4', 'Orgánico'],
  ['+10 min', 'Subir Video Día 5 + Carrusel 5 + Carrusel 6', 'Orgánico'],
  ['TARDE', 'Configurar 3 workflows de ManyChat', 'ManyChat'],
  ['NOCHE', 'Terminar campaña en Meta Ads para mañana 5 AM', 'Ads'],
];

const campaignTasks: Record<CampaignTab, CampaignTask[]> = {
  today: [
    { id: 't1', tag: 'Urgente', tagTone: 'urgent', title: 'Subir los 5 videos + 6 carruseles', description: 'Todo de una para crear efecto serie.' },
    { id: 't2', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "IA"', description: 'Para el Video Día 1.' },
    { id: 't3', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "SISTEMA"', description: 'Para todos los videos.' },
    { id: 't4', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "MAS INFO"', description: 'Para el caso real.' },
    { id: 't5', tag: 'Ads', tagTone: 'ads', title: 'Configurar campaña Meta Ads', description: 'Interacción -> IG Direct · S/10/día · 5 días.' },
    { id: 't6', tag: 'Ads', tagTone: 'ads', title: 'Programar anuncio para mañana 5 AM', description: 'Con el video del caso real.' },
  ],
  organic: [
    {
      id: 'v1',
      tag: 'Video Día 1',
      tagTone: 'content',
      title: 'Las IAs que uso',
      description: 'CTA: Comenta "IA"',
      copies: [{ id: 'v1-caption', label: 'Caption', text: 'Las IAs que uso todos los días para crear sistemas digitales.\n\nNo son las más famosas, pero son las que realmente me funcionan.\n\nEn este video te muestro cuáles son y cómo las integro en mi flujo de trabajo.\n\nComenta "IA" y te mando los links directos.' }],
    },
    {
      id: 'v2',
      tag: 'Video Día 2',
      tagTone: 'content',
      title: 'Arquitectura del sistema',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v2-caption', label: 'Caption', text: 'Día 2 del reto: 1 sistema digital cada 7 días.\n\nHoy te muestro cómo diseño la arquitectura de un sistema antes de escribir una línea de código.\n\nPorque un sistema no es solo una web bonita. Es un motor que trabaja por ti.\n\nComenta "SISTEMA" si quieres que te ayude a construir el tuyo.' }],
    },
    {
      id: 'v3',
      tag: 'Video Día 3',
      tagTone: 'content',
      title: 'Automatizaciones',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v3-caption', label: 'Caption', text: 'Día 3: Las automatizaciones que hacen que un sistema digital trabaje solo.\n\nChatbots, respuestas automáticas, flujos de WhatsApp... todo conectado.\n\nAsí es como tu negocio puede vender mientras duermes.\n\nComenta "SISTEMA" si quieres uno así para tu negocio.' }],
    },
    {
      id: 'v4',
      tag: 'Video Día 4',
      tagTone: 'content',
      title: 'Chatbot con IA',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v4-caption', label: 'Caption', text: 'Día 4: Así entreno un chatbot con IA para que responda como tú.\n\nNo es un bot genérico. Es un asistente que entiende tu negocio, tu tono y tus clientes.\n\nResponde dudas, califica leads y agenda citas 24/7.\n\nComenta "SISTEMA" si quieres uno así.' }],
    },
    {
      id: 'v5',
      tag: 'Video Día 5',
      tagTone: 'content',
      title: 'Integraciones',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v5-caption', label: 'Caption', text: 'Día 5: Conectando todas las piezas.\n\nWeb + WhatsApp + Instagram + calendario + base de datos.\n\nTodo hablando el mismo idioma. Eso es un sistema digital real.\n\nComenta "SISTEMA" si quieres que te lo construya.' }],
    },
    {
      id: 'v6',
      tag: 'Video Día 6 · Anuncio',
      tagTone: 'urgent',
      title: 'Caso real: Somos Cíclicas',
      description: 'CTA: Comenta "MAS INFO"',
      copies: [{ id: 'v6-caption', label: 'Caption', text: 'La obsesión es un arma de doble filo. Te hace avanzar cuando otros duermen... pero hoy me pasó la cuenta.\n\nPero seguimos con el reto: 1 sistema digital cada 7 días. Hoy cerramos detalles de Somos Cíclicas.\n\nVoy a tomar pocos casos para crear un sistema digital a medida para tu negocio, con un 40% de descuento real.\n\nEs para las que ya tienen su contenido listo y solo necesitan la tecnología que lo convierta en una experiencia que trabaje por ellas.\n\nComenta "MAS INFO" y te cuento cómo postular.' }],
    },
    {
      id: 'ca1',
      tag: 'Carrusel 1',
      tagTone: 'content',
      title: '3 errores al pasar tu negocio a digital',
      copies: [{ id: 'ca1-caption', label: 'Caption', text: '3 errores que cometes al pasar tu negocio físico a digital y cómo solucionarlos hoy.\n\nDesliza para verlos.\n\nComenta "SISTEMA" si quieres que te ayude a implementarlo.' }],
    },
    {
      id: 'ca2',
      tag: 'Carrusel 2',
      tagTone: 'content',
      title: 'Por qué tu web no convierte',
      copies: [{ id: 'ca2-caption', label: 'Caption', text: 'Tienes web, tienes tráfico, pero no vendes.\n\nEl problema no es tu producto. Es que tu web no está diseñada para convertir.\n\nDesliza para ver los errores más comunes.\n\nComenta "SISTEMA" si quieres que revise la tuya.' }],
    },
    {
      id: 'ca3',
      tag: 'Carrusel 3',
      tagTone: 'content',
      title: 'Qué es un sistema digital',
      copies: [{ id: 'ca3-caption', label: 'Caption', text: 'Un sistema digital no es solo una web.\n\nEs el motor que hace que tu negocio funcione por ti:\n- Automatizaciones\n- Chatbots\n- Reservas automáticas\n- Productos digitales\n- Campañas\n\nTodo integrado. Todo trabajando por ti.\n\nComenta "SISTEMA" si quieres el tuyo.' }],
    },
  ],
  ads: [
    {
      id: 'a1',
      tag: 'Campaña',
      tagTone: 'ads',
      title: 'Configuración de campaña',
      copies: [
        { id: 'a1-name', label: 'Nombre de campaña', text: 'ForU - Sistema Digital - Interacción - S/50' },
        { id: 'a1-objective', label: 'Objetivo', text: 'Interacción' },
        { id: 'a1-config', label: 'Configuración', text: 'Manual. No Advantage+.\nDesactivar presupuesto Advantage+ Campaign Budget.\nDesactivar compartir presupuesto con otros conjuntos.' },
      ],
    },
    {
      id: 'a2',
      tag: 'Conjunto',
      tagTone: 'ads',
      title: 'Conjunto de anuncios',
      copies: [
        { id: 'a2-name', label: 'Nombre', text: 'ForU - IG Direct - Mujeres 26-45 - Perú' },
        { id: 'a2-budget', label: 'Presupuesto', text: 'S/10 diarios\nInicio: Mañana 5:00 AM\nFin: 5 días después' },
        { id: 'a2-audience', label: 'Audiencia', text: 'Ubicación: Perú\nEdad: 26-45\nGénero: Mujeres\nIdioma: Español\n\nIntereses:\n- Emprendimiento\n- Pequeñas y medianas empresas\n- Marketing digital\n- Comercio electrónico' },
      ],
    },
    {
      id: 'a3',
      tag: 'Anuncio',
      tagTone: 'ads',
      title: 'Anuncio: caso real',
      copies: [
        { id: 'a3-text', label: 'Texto principal', text: 'La obsesión es un arma de doble filo. Te hace avanzar cuando otros duermen... pero hoy me pasó la cuenta.\n\nSeguimos con el reto: 1 sistema digital cada 7 días. Hoy cerramos detalles de Somos Cíclicas.\n\nVoy a tomar pocos casos para crear un sistema digital a medida para tu negocio, con un 40% de descuento real.\n\nEscríbeme "SISTEMA" y te cuento cómo postular.' },
        { id: 'a3-title', label: 'Título', text: 'Sistema digital a medida · 40% OFF' },
        { id: 'a3-description', label: 'Descripción', text: 'Pocos casos este mes' },
      ],
    },
  ],
  manychat: [
    {
      id: 'm1',
      tag: 'Keyword IA',
      tagTone: 'many',
      title: 'Workflow 1: Keyword "IA"',
      description: 'Trigger: Video Día 1.',
      copies: [{ id: 'm1-message', label: 'Mensaje automático', text: '¡Hola! Gracias por tu interés en las IAs que usé en el video.\n\nAquí te dejo los links:\n\nChatGPT: https://chat.openai.com\nClaude: https://claude.ai\nPerplexity: https://perplexity.ai\n\n¿Te gustaría saber cómo integrar estas herramientas en un sistema digital para tu negocio?\n\nEscríbeme "SISTEMA" y te cuento sobre el 40% OFF disponible.' }],
    },
    {
      id: 'm2',
      tag: 'Keyword SISTEMA',
      tagTone: 'many',
      title: 'Workflow 2: Keyword "SISTEMA"',
      description: 'Trigger: todos los videos.',
      copies: [{ id: 'm2-message', label: 'Mensaje automático', text: '¡Hola! Gracias por escribirme por el sistema digital.\n\nCuéntame rápido:\n1. ¿Qué tipo de negocio tienes?\n2. ¿Hace cuánto que estás vendiendo?\n\nAsí te digo si el descuento del 40% aplica para ti.' }],
    },
    {
      id: 'm3',
      tag: 'Keyword MAS INFO',
      tagTone: 'many',
      title: 'Workflow 3: Keyword "MAS INFO"',
      description: 'Trigger: caso real.',
      copies: [{ id: 'm3-message', label: 'Mensaje automático', text: '¡Hola! Vi que te interesó el 40% OFF en sistemas digitales.\n\nTe cuento rápido:\n\n- Web completa + automatizaciones + chatbot con IA\n- Listo en 7-15 días\n- Desde S/600\n- Solo tomo 5 casos este mes\n\n¿Te gustaría agendar una llamada de 15 minutos para ver si encajamos?\n\nResponde "SI" y te mando el link para agendar.' }],
    },
  ],
  closing: [
    {
      id: 'cl1',
      tag: 'Paso 1',
      tagTone: 'close',
      title: 'Calificar el negocio',
      copies: [{ id: 'cl1-message', label: 'Tu mensaje', text: 'Perfecto. Y ahora mismo, ¿cuánto estás facturando al mes aprox? Es para saber si tiene sentido que trabajemos juntas con el descuento del 40%.' }],
    },
    {
      id: 'cl2',
      tag: 'Paso 2',
      tagTone: 'close',
      title: 'Ofrecer el sistema',
      copies: [{ id: 'cl2-message', label: 'Tu mensaje', text: 'Te cuento: estoy tomando 5 casos este mes para crear sistemas digitales a medida con 40% de descuento.\n\nDependiendo de lo que necesites, puede ser desde S/600 hasta S/1000.\n\nEl sistema incluye: web completa, automatizaciones, chatbot con IA y todo lo que necesites para que tu negocio trabaje solo.\n\n¿Te gustaría que agendemos una llamada de 15 minutos para ver exactamente qué necesitas? Es sin compromiso.' }],
    },
    {
      id: 'cl3',
      tag: 'Paso 3',
      tagTone: 'close',
      title: 'Si piden más detalles',
      copies: [{ id: 'cl3-message', label: 'Tu mensaje', text: 'Te cuento qué incluye exactamente:\n\n1. Web completa diseñada para convertir\n2. Chatbot con IA que responde y califica clientes 24/7\n3. Sistema de reservas o pedidos automáticos\n4. Integración con WhatsApp e Instagram\n5. Hosting + dominio el primer año\n6. Soporte VIP por 15 días\n\nEl proceso es: anticipo del 50% para empezar, trabajo 10-15 días y entregas el otro 50% cuando está listo.\n\n¿Te sirve así o prefieres que agendemos una llamada para verlo juntas?' }],
    },
  ],
};

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
              newTitle={newTitle}
              onNewTitle={setNewTitle}
              onAdd={addContent}
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
  newTitle,
  onNewTitle,
  onAdd,
}: {
  newTitle: string;
  onNewTitle: (value: string) => void;
  onAdd: () => void;
}) {
  const allTasks = Object.values(campaignTasks).flat();
  const defaultTextMap = allTasks.reduce<Record<string, string>>((accumulator, task) => {
    task.copies?.forEach((copy) => {
      accumulator[copy.id] = copy.text;
    });
    return accumulator;
  }, {});
  const [activeTab, setActiveTab] = useState<CampaignTab>('today');
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(campaignDoneStorageKey) || '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const [copyTextMap, setCopyTextMap] = useState<Record<string, string>>(() => {
    try {
      return { ...defaultTextMap, ...(JSON.parse(localStorage.getItem(campaignStorageKey) || '{}') as Record<string, string>) };
    } catch {
      return defaultTextMap;
    }
  });
  const [copiedId, setCopiedId] = useState('');
  const currentTasks = campaignTasks[activeTab];
  const completedCount = allTasks.filter((task) => doneMap[task.id]).length;
  const progress = Math.round((completedCount / allTasks.length) * 100);

  function updateCopyText(id: string, value: string) {
    const nextMap = { ...copyTextMap, [id]: value };
    setCopyTextMap(nextMap);
    localStorage.setItem(campaignStorageKey, JSON.stringify(nextMap));
  }

  function toggleDone(id: string) {
    const nextMap = { ...doneMap, [id]: !doneMap[id] };
    setDoneMap(nextMap);
    localStorage.setItem(campaignDoneStorageKey, JSON.stringify(nextMap));
    playUiTone(nextMap[id] ? 'success' : 'tap');
  }

  async function copyBlock(id: string) {
    await navigator.clipboard.writeText(copyTextMap[id] ?? '');
    setCopiedId(id);
    playUiTone('success');
    window.setTimeout(() => setCopiedId(''), 1600);
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-gray-400">Campaña activa</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">Lanzamiento 40% OFF</h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#1a1a1a]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-gray-500">{completedCount} de {allTasks.length} tareas</p>

          <div className="mt-5 grid gap-2">
            {[
              ['today', 'Hoy', Home],
              ['organic', 'Contenido orgánico', Clapperboard],
              ['ads', 'Meta Ads', Rocket],
              ['manychat', 'ManyChat', Bot],
              ['closing', 'Cierre de ventas', CheckCircle2],
            ].map(([id, label, Icon]) => (
              <button
                key={id as string}
                type="button"
                onClick={() => setActiveTab(id as CampaignTab)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === id ? 'foru-gradient-button' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} /> {label as string}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-gray-400">Estudio de campaña</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">
                {activeTab === 'today' && 'Plan de hoy'}
                {activeTab === 'organic' && 'Textos para copiar y pegar'}
                {activeTab === 'ads' && 'Configuración de Meta Ads'}
                {activeTab === 'manychat' && 'Workflows automáticos'}
                {activeTab === 'closing' && 'Script de cierre'}
              </h2>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input value={newTitle} onChange={(event) => onNewTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAdd()} placeholder="Nueva idea rápida..." className="foru-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
              <button type="button" onClick={onAdd} title="Agregar idea" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl foru-dark-gradient text-white"><Plus size={19} /></button>
            </div>
          </div>

          {activeTab === 'today' && (
            <section className="mt-6 rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
              <h3 className="font-serif text-2xl font-bold">Cronograma de hoy</h3>
              <div className="mt-4 divide-y divide-gray-100">
                {campaignSchedule.map(([time, content, badge]) => (
                  <div key={`${time}-${content}`} className="grid gap-2 py-3 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                    <p className="text-xs font-black uppercase text-gray-400">{time}</p>
                    <input
                      defaultValue={content}
                      className="rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm font-semibold outline-none focus:border-[#6EE7B7] focus:bg-white"
                    />
                    <span className="w-fit rounded-full foru-gradient-button px-3 py-1 text-xs font-black">{badge}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab !== 'today' && (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
              Todos los textos son editables. Ajusta lo que quieras y copia con el botón de cada bloque.
            </div>
          )}

          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            {currentTasks.map((task) => (
              <CampaignTaskCard
                key={task.id}
                task={task}
                done={Boolean(doneMap[task.id])}
                copiedId={copiedId}
                copyTextMap={copyTextMap}
                onToggleDone={toggleDone}
                onUpdateCopy={updateCopyText}
                onCopy={copyBlock}
              />
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}

function CampaignTaskCard({
  task,
  done,
  copiedId,
  copyTextMap,
  onToggleDone,
  onUpdateCopy,
  onCopy,
}: {
  task: CampaignTask;
  done: boolean;
  copiedId: string;
  copyTextMap: Record<string, string>;
  onToggleDone: (id: string) => void;
  onUpdateCopy: (id: string, value: string) => void;
  onCopy: (id: string) => void;
}) {
  const tagClasses = {
    urgent: 'bg-[#FEF3C7] text-[#92400E]',
    content: 'bg-[#DBEAFE] text-[#1E40AF]',
    ads: 'bg-[#FCE7F3] text-[#9D174D]',
    many: 'bg-[#D1FAE5] text-[#065F46]',
    close: 'bg-[#EDE9FE] text-[#5B21B6]',
  };

  return (
    <article className={`rounded-2xl border border-black/6 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          aria-label={done ? 'Marcar pendiente' : 'Marcar listo'}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
            done ? 'border-[#6EE7B7] bg-[#6EE7B7] text-white' : 'border-gray-300 bg-white'
          }`}
        >
          {done && '✓'}
        </button>
        <div className="min-w-0">
          <span className={`inline-flex rounded px-2 py-1 text-[10px] font-black uppercase ${tagClasses[task.tagTone]}`}>{task.tag}</span>
          <h3 className={`mt-2 font-serif text-xl font-bold leading-tight ${done ? 'line-through' : ''}`}>{task.title}</h3>
          {task.description && <p className="mt-1 text-sm font-semibold leading-6 text-gray-500">{task.description}</p>}
        </div>
      </div>

      {task.copies?.map((copy) => (
        <div key={copy.id} className="relative mt-4 rounded-xl border border-black/6 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase text-gray-400">{copy.label}</p>
            <button
              type="button"
              onClick={() => onCopy(copy.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition ${
                copiedId === copy.id ? 'border-[#6EE7B7] bg-[#6EE7B7] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-[#6EE7B7]'
              }`}
            >
              <Clipboard size={14} /> {copiedId === copy.id ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <textarea
            value={copyTextMap[copy.id] ?? copy.text}
            onChange={(event) => onUpdateCopy(copy.id, event.target.value)}
            className="min-h-36 w-full resize-y rounded-lg border border-transparent bg-transparent text-sm font-semibold leading-7 text-gray-700 outline-none focus:border-[#93C5FD] focus:bg-white focus:p-3"
          />
        </div>
      ))}
    </article>
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
