import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  ChevronLeft,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Map,
  PartyPopper,
  Scissors,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from '../../lib/icons';
import {
  createDefaultPage,
  generateDigitalDiagnosis,
  saveConstructorState,
  saveDigitalWorldDraft,
  saveDigitalWorldPage,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

type BusinessOption = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: typeof Store;
  accent: string;
  opening: string;
  questions: string[];
  world: string[];
  nextSteps: string[];
};

const businessOptions: BusinessOption[] = [
  {
    id: 'restaurante',
    title: 'Restaurante, cafe o bar',
    shortName: 'Restaurante',
    description: 'Menu digital, reservas, horarios y pedidos por WhatsApp.',
    icon: UtensilsCrossed,
    accent: '#D4A574',
    opening: 'Perfecto. Para comida, el mundo digital debe abrir apetito y quitar friccion para reservar o pedir.',
    questions: ['Que tipo de cocina ofreces?', 'Trabajas con reservas, delivery o ambos?', 'Tienes platos estrella o promociones por horario?'],
    world: ['Menu digital con categorias', 'Boton directo a WhatsApp', 'Reservas por fecha y hora', 'Galeria de platos destacados'],
    nextSteps: ['Ordenar tu menu por intencion de compra', 'Definir platos gancho', 'Crear una landing con horarios, ubicacion y reservas'],
  },
  {
    id: 'hospedaje',
    title: 'Hotel, hostal o alojamiento',
    shortName: 'Hospedaje',
    description: 'Habitaciones, disponibilidad, reglas, fotos y solicitudes de reserva.',
    icon: BedDouble,
    accent: '#93C5FD',
    opening: 'Aqui la confianza visual manda. Tu ruta debe mostrar descanso, ubicacion y claridad antes del precio.',
    questions: ['Cuantos tipos de habitacion tienes?', 'Aceptas reservas instantaneas o prefieres confirmar?', 'Que servicios hacen especial tu estadia?'],
    world: ['Catalogo de habitaciones', 'Formulario de fechas', 'Mapa y puntos cercanos', 'Politicas de check-in y cancelacion'],
    nextSteps: ['Separar habitaciones por tipo de viajero', 'Crear galeria por ambientes', 'Activar solicitudes de reserva con WhatsApp'],
  },
  {
    id: 'experiencias',
    title: 'Tours y experiencias',
    shortName: 'Experiencia',
    description: 'Itinerarios, cupos, dificultad, puntos de encuentro y pagos.',
    icon: Map,
    accent: '#6EE7B7',
    opening: 'Tu web debe vender la emocion, pero tambien responder las dudas logisticas antes de que aparezcan.',
    questions: ['La experiencia es privada, grupal o ambas?', 'Cuanto dura y que incluye?', 'Que debe llevar la persona?'],
    world: ['Itinerario por etapas', 'Cupos y horarios', 'Nivel de dificultad', 'Preguntas frecuentes antes de reservar'],
    nextSteps: ['Escribir el recorrido como historia', 'Definir cupos y politicas', 'Crear una ficha clara para cada experiencia'],
  },
  {
    id: 'belleza',
    title: 'Belleza y salon',
    shortName: 'Belleza',
    description: 'Servicios, agenda, paquetes, antes/despues y recordatorios.',
    icon: Scissors,
    accent: '#F9A8D4',
    opening: 'En belleza, la confianza nace viendo resultados. Tu ruta necesita mostrar estilo, agenda y prueba social.',
    questions: ['Que servicios quieres agendar online?', 'Trabajas por profesional o por sede?', 'Tienes paquetes o membresias?'],
    world: ['Agenda por servicio', 'Galeria antes/despues', 'Paquetes destacados', 'Recordatorio por WhatsApp'],
    nextSteps: ['Agrupar servicios por necesidad', 'Subir fotos de resultados', 'Definir tiempos y precios base'],
  },
  {
    id: 'bienestar',
    title: 'Fitness, yoga o bienestar',
    shortName: 'Bienestar',
    description: 'Clases, planes, horarios, membresias y seguimiento.',
    icon: Dumbbell,
    accent: '#A7F3D0',
    opening: 'Tu mundo digital debe ayudar a la persona a imaginar constancia, no solo una clase suelta.',
    questions: ['Vendes clases, planes o sesiones individuales?', 'Tus horarios son fijos o personalizados?', 'Quieres manejar membresias?'],
    world: ['Calendario de clases', 'Planes o membresias', 'Perfil de instructores', 'Formulario de evaluacion inicial'],
    nextSteps: ['Definir niveles de entrada', 'Ordenar planes por objetivo', 'Crear una bienvenida para nuevos alumnos'],
  },
  {
    id: 'servicios',
    title: 'Servicios profesionales',
    shortName: 'Servicios',
    description: 'Consultas, diagnosticos, propuestas, casos y captacion de leads.',
    icon: BriefcaseBusiness,
    accent: '#C4B5FD',
    opening: 'Para servicios, tu web debe traducir experiencia en claridad: problema, proceso y siguiente accion.',
    questions: ['Que problema principal resuelves?', 'Como calificas a un buen cliente?', 'Ofreces llamada inicial o diagnostico?'],
    world: ['Landing de propuesta de valor', 'Formulario de diagnostico', 'Casos o testimonios', 'Agenda para llamadas'],
    nextSteps: ['Nombrar tu oferta principal', 'Crear preguntas filtro', 'Mostrar resultados concretos y proceso'],
  },
  {
    id: 'educacion',
    title: 'Cursos, talleres o clases',
    shortName: 'Educacion',
    description: 'Programas, inscripciones, materiales, comunidad y pagos.',
    icon: GraduationCap,
    accent: '#FDE68A',
    opening: 'Aqui la ruta debe mostrar transformacion: de donde empieza la persona y que logra al terminar.',
    questions: ['Es curso grabado, taller en vivo o clases 1:1?', 'Cuanto dura el programa?', 'Que entregables recibe la persona?'],
    world: ['Programa por modulos', 'Inscripcion online', 'Recursos descargables', 'Comunidad o seguimiento'],
    nextSteps: ['Ordenar temario por resultado', 'Crear pagina de inscripcion', 'Definir bonos y preguntas frecuentes'],
  },
  {
    id: 'tienda',
    title: 'Tienda o producto fisico',
    shortName: 'Tienda',
    description: 'Catalogo, colecciones, pedidos, stock simple y WhatsApp.',
    icon: ShoppingBag,
    accent: '#FDBA74',
    opening: 'Tu ruta debe hacer que comprar se sienta facil: ver, elegir, preguntar y cerrar.',
    questions: ['Cuantos productos quieres mostrar al inicio?', 'Vendes por coleccion, categoria o pedido personalizado?', 'Como coordinas entrega o recojo?'],
    world: ['Catalogo por categorias', 'Ficha de producto', 'Pedido por WhatsApp', 'Colecciones destacadas'],
    nextSteps: ['Elegir productos gancho', 'Ordenar categorias', 'Crear mensajes rapidos para cerrar pedidos'],
  },
  {
    id: 'eventos',
    title: 'Eventos y celebraciones',
    shortName: 'Eventos',
    description: 'Paquetes, fechas, locaciones, proveedores y cotizaciones.',
    icon: PartyPopper,
    accent: '#F0ABFC',
    opening: 'En eventos, la persona compra tranquilidad. Tu mundo digital debe ordenar opciones sin apagar la emocion.',
    questions: ['Que tipo de eventos atiendes?', 'Vendes paquetes cerrados o cotizas a medida?', 'Necesitas revisar disponibilidad de fecha?'],
    world: ['Paquetes por tipo de evento', 'Formulario de cotizacion', 'Galeria por estilo', 'Calendario de disponibilidad'],
    nextSteps: ['Crear paquetes base', 'Separar galerias por ocasion', 'Armar un formulario breve de cotizacion'],
  },
  {
    id: 'salud',
    title: 'Salud y consultorio',
    shortName: 'Salud',
    description: 'Especialidades, citas, ubicacion, indicaciones y confianza profesional.',
    icon: HeartPulse,
    accent: '#7DD3FC',
    opening: 'Aqui la experiencia debe sentirse clara y serena: credenciales, citas y preparacion del paciente.',
    questions: ['Que especialidades o servicios atiendes?', 'Las citas son presenciales, virtuales o ambas?', 'Necesitas indicaciones previas por servicio?'],
    world: ['Agenda de citas', 'Servicios por especialidad', 'Indicaciones previas', 'Perfil profesional y ubicacion'],
    nextSteps: ['Organizar servicios por necesidad', 'Definir horarios de atencion', 'Crear mensajes de preparacion para cada cita'],
  },
  {
    id: 'inmobiliaria',
    title: 'Inmobiliaria o alquileres',
    shortName: 'Inmobiliaria',
    description: 'Propiedades, filtros, visitas, ubicacion y solicitudes.',
    icon: Home,
    accent: '#86EFAC',
    opening: 'Tu ruta debe ayudar a comparar rapido y pedir una visita sin dar vueltas.',
    questions: ['Publicas venta, alquiler o ambos?', 'Cuantas propiedades manejas?', 'Quieres filtrar por zona, precio o tipo?'],
    world: ['Catalogo de propiedades', 'Filtros simples', 'Agenda de visitas', 'Mapa y datos clave'],
    nextSteps: ['Definir campos obligatorios por propiedad', 'Crear fichas visuales', 'Activar solicitudes de visita'],
  },
  {
    id: 'creativo',
    title: 'Fotografia, diseno o creativo',
    shortName: 'Creativo',
    description: 'Portafolio, paquetes, brief, agenda y propuestas.',
    icon: Camera,
    accent: '#BAE6FD',
    opening: 'Tu mundo digital debe dejar que el trabajo hable y guiar a la persona hacia el brief correcto.',
    questions: ['Que tipo de proyectos quieres atraer?', 'Vendes paquetes o propuestas personalizadas?', 'Tienes portafolio organizado por categoria?'],
    world: ['Portafolio curado', 'Paquetes de servicio', 'Formulario de brief', 'Agenda de llamada creativa'],
    nextSteps: ['Elegir proyectos representativos', 'Nombrar paquetes', 'Crear brief para filtrar clientes ideales'],
  },
];

const stageLabels = ['Tipo', 'Conversacion', 'Ruta', 'Resumen'];

export default function RegisterWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState('restaurante');
  const [businessName, setBusinessName] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [tone, setTone] = useState('calido');

  const selectedBusiness = useMemo(
    () => businessOptions.find((option) => option.id === selectedId) ?? businessOptions[0],
    [selectedId],
  );

  const displayName = businessName.trim() || `tu ${selectedBusiness.shortName.toLowerCase()}`;
  const previewSlug = displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42) || 'mi-negocio';
  const progress = (step / stageLabels.length) * 100;
  const goal = mainGoal.trim() || 'conseguir mas clientes sin depender solo de redes sociales';
  const generatedPitch = `${displayName} necesita una presencia digital ${tone}, clara y accionable para ${goal}. La primera version debe mostrar confianza rapido, explicar la oferta principal y llevar a la persona a una accion sin friccion.`;
  const primaryCta = selectedBusiness.id === 'tienda'
    ? 'Pedir por WhatsApp'
    : selectedBusiness.id === 'hospedaje'
      ? 'Consultar disponibilidad'
      : selectedBusiness.id === 'salud' || selectedBusiness.id === 'belleza'
        ? 'Agendar cita'
        : selectedBusiness.id === 'servicios'
          ? 'Solicitar diagnostico'
          : 'Quiero mas informacion';
  const diagnosis = generateDigitalDiagnosis({
    businessName: displayName,
    businessType: selectedBusiness.id,
    businessShortName: selectedBusiness.shortName,
    tone,
    mainGoal: goal,
    primaryCta,
    world: selectedBusiness.world,
    nextSteps: selectedBusiness.nextSteps,
  });

  const createDraft = () => {
    const draft = {
      businessName: displayName,
      businessType: selectedBusiness.id,
      businessTitle: selectedBusiness.title,
      businessShortName: selectedBusiness.shortName,
      tone,
      mainGoal: goal,
      generatedPitch,
      primaryCta,
      world: selectedBusiness.world,
      nextSteps: selectedBusiness.nextSteps,
      questions: selectedBusiness.questions,
      diagnosis,
      createdAt: new Date().toISOString(),
    };

    return draft;
  };

  const nextStep = () => {
    playUiTone(step === stageLabels.length - 1 ? 'success' : 'next');
    setStep((current) => Math.min(current + 1, stageLabels.length));
  };
  const prevStep = () => {
    playUiTone('tap');
    setStep((current) => Math.max(current - 1, 1));
  };

  return (
    <div className="foru-app-bg relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="foru-blur foru-blur--gold" />
      <div className="foru-blur foru-blur--green" />
      <div className="foru-blur foru-blur--pink" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playUiTone('tap');
              navigate('/');
            }}
            className="foru-logo"
          >
            FOR <span>U</span>
          </button>
          <span className="foru-badge">Crear mundo digital</span>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="foru-aurora-card pulse-soft rounded-3xl p-6">
            <div className="mb-6">
              <span className="foru-badge">IA For U</span>
              <h1 className="foru-title mt-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.6rem)' }}>
                Hagamos que <span className="text-gradient-animated">{displayName}</span> tenga su propio camino.
              </h1>
              <p className="foru-subtitle mt-4">
                Te hago pocas preguntas, entiendo tu negocio y te recomiendo una ruta digital con prioridad real.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2">
              {['Entender', 'Ordenar', 'Lanzar'].map((label, index) => (
                <div key={label} className="foru-soft-panel rounded-2xl p-3 text-center shadow-md">
                  <span className="text-gradient-animated block text-lg font-black">{index + 1}</span>
                  <span className="text-xs font-bold text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FDE68A] via-[#6EE7B7] to-[#93C5FD]">
                  <Sparkles size={18} />
                </span>
                <div className="foru-soft-panel rounded-2xl rounded-tl-md p-4 text-sm font-medium leading-6 text-gray-800">
                  {selectedBusiness.opening}
                </div>
              </div>

              {businessName && (
                <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-md bg-[#1a1a1a] p-4 text-sm leading-6 text-white">
                  Mi negocio se llama {businessName}. Quiero que mi web se sienta {tone} y me ayude con {mainGoal || 'mis proximos clientes'}.
                </div>
              )}

              <div className="flex gap-3">
                <span className="foru-gradient-button mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <BadgeCheck size={18} />
                </span>
                <div className="foru-soft-panel rounded-2xl rounded-tl-md p-4 text-sm font-medium leading-6 text-gray-800">
                  Si empezamos hoy, priorizaria: {selectedBusiness.nextSteps[0].toLowerCase()}, luego {selectedBusiness.nextSteps[1].toLowerCase()}.
                </div>
              </div>

              {step >= 3 && (
                <div className="foru-gradient-border rounded-2xl p-4">
                  <p className="text-xs font-black uppercase text-[#7C5CFF]">Diagnostico vivo</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">{generatedPitch}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full foru-gradient-button" style={{ width: `${diagnosis.clarityScore}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-black text-[#7C5CFF]">{diagnosis.clarityScore}% de claridad inicial</p>
                </div>
              )}
            </div>
          </aside>

          <main className="foru-aurora-card rounded-3xl p-6">
            <div className="mb-7">
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full foru-gradient-button transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-xs font-bold text-gray-500">
                {stageLabels.map((label, index) => (
                  <span key={label} className={index + 1 <= step ? 'text-[#7C5CFF]' : ''}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="float-in">
                <h2 className="font-serif text-3xl text-[#1a1a1a]">Que tipo de negocio quieres digitalizar?</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                  Elige el punto de partida mas cercano. Despues la ruta se ajusta con tus respuestas.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {businessOptions.map((option) => {
                    const Icon = option.icon;
                    const active = option.id === selectedId;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          playUiTone('tap');
                          setSelectedId(option.id);
                        }}
                        className={`tap-boost min-h-[168px] rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'foru-gradient-border shadow-lg'
                            : 'foru-soft-panel hover:shadow-lg'
                        }`}
                      >
                        <span
                          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${option.accent}33`, color: '#1a1a1a' }}
                        >
                          <Icon size={22} strokeWidth={1.8} />
                        </span>
                        <span className="block text-base font-semibold text-gray-950">{option.title}</span>
                        <span className="mt-2 block text-sm font-medium leading-5 text-gray-600">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="float-in">
                <h2 className="font-serif text-3xl text-[#1a1a1a]">Ahora cuentame lo esencial.</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                  Estas respuestas hacen que la recomendacion se sienta tuya, no una plantilla.
                </p>

                <div className="mt-7 grid gap-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Nombre del negocio</span>
                    <input
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      className="foru-input mt-2 w-full rounded-xl p-4 outline-none transition"
                      placeholder="Ej. La Casona del Chef"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Que quieres lograr primero?</span>
                    <textarea
                      value={mainGoal}
                      onChange={(event) => setMainGoal(event.target.value)}
                      className="foru-input mt-2 min-h-28 w-full rounded-xl p-4 outline-none transition"
                      placeholder="Ej. recibir reservas, ordenar mis servicios, vender por WhatsApp..."
                    />
                  </label>

                  <div>
                    <span className="text-sm font-semibold text-gray-700">Como quieres que se sienta tu marca?</span>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {['calido', 'premium', 'moderno'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            playUiTone('tap');
                            setTone(option);
                          }}
                          className={`tap-boost rounded-xl border px-4 py-3 text-sm font-bold capitalize transition ${
                            tone === option
                              ? 'foru-gradient-button border-transparent text-[#1a1a1a]'
                              : 'foru-soft-panel text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="float-in">
                <h2 className="font-serif text-3xl text-[#1a1a1a]">Lo que se crea ahora</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                  La primera landing nace con estas partes, sin esperar a completar todo el sistema.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {selectedBusiness.world.slice(0, 3).map((item, index) => (
                    <div key={item} className="tap-boost foru-soft-panel rounded-2xl p-5">
                      <span className="text-xs font-black uppercase text-gray-500">
                        Seccion {index + 1}
                      </span>
                      <p className="mt-2 text-lg font-semibold text-gray-950">{item}</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                        {diagnosis.launchPlan[index] ?? 'Texto inicial listo para editar despues.'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-[#7C5CFF]/10 bg-[#fff8fb] p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#7C5CFF]">
                    <CalendarDays size={17} /> Siguiente ajuste exacto
                  </div>
                  <p className="foru-soft-panel rounded-xl p-4 text-sm font-medium leading-6 text-gray-700 shadow-sm">
                    {selectedBusiness.nextSteps[0]}. Despues podras editarlo desde el panel si quieres afinar textos, fotos o contacto.
                  </p>
                </div>

                <div className="foru-gradient-border mt-5 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-black uppercase text-gray-500">Boton principal sugerido</p>
                  <p className="mt-2 text-xl font-black text-gray-950">{primaryCta}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                    Este sera el camino mas visible para convertir visitas en conversaciones reales.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="foru-soft-panel rounded-2xl p-5">
                    <p className="text-xs font-black uppercase text-gray-500">Riesgo a evitar</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">{diagnosis.risks[0]}</p>
                  </div>
                  <div className="foru-soft-panel rounded-2xl p-5">
                    <p className="text-xs font-black uppercase text-gray-500">Herramienta clave</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">{diagnosis.recommendedTools[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="float-in">
                <h2 className="font-serif text-3xl text-[#1a1a1a]">Resumen para empezar</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                  Esta seria la primera version del mundo digital de {displayName}.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="foru-gradient-border rounded-2xl p-5">
                    <p className="text-xs font-black uppercase text-[#7C5CFF]">Propuesta inicial</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">{generatedPitch}</p>
                  </div>

                  <div className="foru-soft-panel rounded-2xl p-5">
                    <p className="text-xs font-black uppercase text-gray-500">Prioridad IA</p>
                    <p className="mt-2 text-base font-black text-gray-950">{diagnosis.priority}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-gray-600">{diagnosis.strategicRead}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['1', 'Landing creada', 'Portada, oferta y confianza salen de tus respuestas.'],
                      ['2', 'Ruta lista', `Se abre en /p/${previewSlug}.`],
                      ['3', 'Siguiente ajuste', selectedBusiness.nextSteps[0]],
                    ].map(([number, title, description]) => (
                      <div key={title} className="foru-soft-panel rounded-2xl p-5 shadow-sm">
                        <span className="foru-gradient-button flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                          {number}
                        </span>
                        <p className="mt-4 font-semibold text-gray-950">{title}</p>
                        <p className="mt-1 text-sm font-medium leading-6 text-gray-600">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    playUiTone('success');
                    const draft = createDraft();
                    const constructorState = {
                      approvedBlocks: ['diagnosis', 'landing'],
                      completedTasks: ['Landing generada desde el registro'],
                      editedPitch: draft.generatedPitch,
                      selectedBlockId: 'landing',
                      privatePreviewReady: true,
                      updatedAt: new Date().toISOString(),
                    };
                    const page = {
                      ...createDefaultPage(draft, constructorState),
                      publishStatus: 'ready' as const,
                    };

                    await saveDigitalWorldDraft(draft);
                    saveConstructorState(constructorState);
                    saveDigitalWorldPage(page);
                    navigate(`/p/${page.publicSlug}`);
                  }}
                  className="tap-boost mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl foru-dark-gradient px-6 py-4 font-medium text-white transition hover:shadow-xl"
                >
                  Crear landing y verla ahora <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-gray-950"
                >
                  <ChevronLeft size={18} /> Atras
                </button>
              ) : (
                <span />
              )}

              {step < stageLabels.length && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="tap-boost inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-bold text-white transition hover:shadow-xl"
                >
                  Continuar <ArrowRight size={17} />
                </button>
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
