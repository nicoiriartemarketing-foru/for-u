import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  BriefcaseBusiness,
  Camera,
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
  icon: typeof Store;
  world: string[];
  nextSteps: string[];
};

const businessOptions: BusinessOption[] = [
  { id: 'restaurante', title: 'Restaurante, café o bar', shortName: 'Restaurante', icon: UtensilsCrossed, world: ['Menú digital', 'Reservas', 'WhatsApp', 'Galería'], nextSteps: ['Ordenar el menú principal', 'Definir platos gancho', 'Publicar horarios y ubicación'] },
  { id: 'hospedaje', title: 'Hotel o alojamiento', shortName: 'Hospedaje', icon: BedDouble, world: ['Habitaciones', 'Disponibilidad', 'Mapa', 'Reglas'], nextSteps: ['Separar habitaciones por tipo', 'Subir fotos reales', 'Activar consulta de reserva'] },
  { id: 'experiencias', title: 'Tours y experiencias', shortName: 'Experiencia', icon: Map, world: ['Itinerario', 'Cupos', 'Dificultad', 'FAQ'], nextSteps: ['Escribir el recorrido', 'Definir cupos', 'Crear ficha de experiencia'] },
  { id: 'belleza', title: 'Belleza y salón', shortName: 'Belleza', icon: Scissors, world: ['Servicios', 'Agenda', 'Antes/después', 'Paquetes'], nextSteps: ['Agrupar servicios', 'Subir resultados', 'Definir tiempos base'] },
  { id: 'bienestar', title: 'Fitness, yoga o bienestar', shortName: 'Bienestar', icon: Dumbbell, world: ['Clases', 'Planes', 'Horarios', 'Membresías'], nextSteps: ['Definir niveles de entrada', 'Ordenar planes', 'Crear bienvenida'] },
  { id: 'servicios', title: 'Servicios profesionales', shortName: 'Servicios', icon: BriefcaseBusiness, world: ['Propuesta', 'Diagnóstico', 'Casos', 'Agenda'], nextSteps: ['Nombrar tu oferta principal', 'Crear preguntas filtro', 'Mostrar proceso'] },
  { id: 'educacion', title: 'Cursos o talleres', shortName: 'Educación', icon: GraduationCap, world: ['Programa', 'Inscripción', 'Recursos', 'Comunidad'], nextSteps: ['Ordenar temario', 'Crear inscripción', 'Definir bonos'] },
  { id: 'tienda', title: 'Tienda o producto físico', shortName: 'Tienda', icon: ShoppingBag, world: ['Catálogo', 'Colecciones', 'Pedidos', 'Stock'], nextSteps: ['Elegir productos gancho', 'Ordenar categorías', 'Crear mensajes rápidos'] },
  { id: 'eventos', title: 'Eventos y celebraciones', shortName: 'Eventos', icon: PartyPopper, world: ['Paquetes', 'Fechas', 'Galería', 'Cotización'], nextSteps: ['Crear paquetes base', 'Separar galerías', 'Armar formulario breve'] },
  { id: 'salud', title: 'Salud y consultorio', shortName: 'Salud', icon: HeartPulse, world: ['Citas', 'Especialidades', 'Indicaciones', 'Perfil'], nextSteps: ['Organizar servicios', 'Definir horarios', 'Crear indicaciones'] },
  { id: 'inmobiliaria', title: 'Inmobiliaria o alquileres', shortName: 'Inmobiliaria', icon: Home, world: ['Propiedades', 'Filtros', 'Visitas', 'Mapa'], nextSteps: ['Definir campos clave', 'Crear fichas visuales', 'Activar visitas'] },
  { id: 'creativo', title: 'Fotografía, diseño o creativo', shortName: 'Creativo', icon: Camera, world: ['Portafolio', 'Paquetes', 'Brief', 'Agenda'], nextSteps: ['Elegir proyectos', 'Nombrar paquetes', 'Crear brief'] },
];

export default function RegisterWizard() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('restaurante');
  const [businessName, setBusinessName] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [tone, setTone] = useState('moderno');

  const selectedBusiness = useMemo(
    () => businessOptions.find((option) => option.id === selectedId) ?? businessOptions[0],
    [selectedId],
  );

  const displayName = businessName.trim() || `tu ${selectedBusiness.shortName.toLowerCase()}`;
  const goal = mainGoal.trim() || 'conseguir más clientes sin depender solo de redes sociales';
  const primaryCta = selectedBusiness.id === 'tienda'
    ? 'Pedir por WhatsApp'
    : selectedBusiness.id === 'hospedaje'
      ? 'Consultar disponibilidad'
      : selectedBusiness.id === 'salud' || selectedBusiness.id === 'belleza'
        ? 'Agendar cita'
        : 'Quiero más información';

  const generatedPitch = `${displayName} necesita una presencia digital ${tone}, clara y accionable para ${goal}. La primera versión debe mostrar la oferta, generar confianza y llevar al botón "${primaryCta}".`;
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

  async function createLanding() {
    playUiTone('success');
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
      questions: ['¿Qué vendes primero?', '¿Qué prueba de confianza tienes?', '¿Dónde quieres recibir mensajes?'],
      diagnosis,
      createdAt: new Date().toISOString(),
    };
    const constructorState = {
      approvedBlocks: ['business-basics', 'landing'],
      completedTasks: ['Configuración básica creada'],
      editedPitch: generatedPitch,
      selectedBlockId: 'landing',
      privatePreviewReady: true,
      updatedAt: new Date().toISOString(),
    };
    const page = { ...createDefaultPage(draft, constructorState), publishStatus: 'ready' as const };

    await saveDigitalWorldDraft(draft);
    saveConstructorState(constructorState);
    saveDigitalWorldPage(page);
    navigate('/editor');
  }

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <nav className="foru-lp-nav">
        <Link to="/" className="foru-logo">FOR <span>U</span></Link>
        <span className="foru-lp-badge">Configurar negocio</span>
      </nav>

      <section className="relative overflow-hidden px-5 pb-16 pt-8">
        <div className="foru-reference-blur foru-reference-blur--gold" />
        <div className="foru-reference-blur foru-reference-blur--green" />
        <div className="foru-reference-blur foru-reference-blur--pink" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="rounded-[24px] border border-black/6 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
            <span className="foru-lp-badge"><Sparkles size={16} /> Studio Digital</span>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-tight">
              Configura lo básico y entra directo al editor.
            </h1>
            <p className="mt-5 text-base font-light leading-8 text-gray-500">
              Sin cuestionario largo. Solo nombre, rubro y objetivo para que For U arme una primera landing editable.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Negocio', 'Landing', 'Editor'].map((label, index) => (
                <div key={label} className="rounded-2xl border border-black/6 bg-white p-4 text-center shadow-sm">
                  <span className="foru-reference-gradient-text block text-2xl font-black">{index + 1}</span>
                  <span className="text-xs font-bold text-gray-500">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-[#f5f5f5] p-5">
              <p className="text-xs font-black uppercase text-gray-400">Vista previa de ruta</p>
              <p className="mt-2 font-serif text-2xl font-bold">{displayName}</p>
              <p className="mt-3 text-sm font-light leading-7 text-gray-600">{generatedPitch}</p>
            </div>
          </aside>

          <section className="rounded-[24px] border border-black/6 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
            <div className="grid gap-5">
              <label>
                <span className="text-sm font-bold text-gray-700">Nombre del negocio</span>
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Ej. Casa Brava"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold outline-none transition focus:border-[#6EE7B7] focus:ring-4 focus:ring-[#6EE7B7]/20"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-gray-700">Objetivo principal</span>
                <input
                  value={mainGoal}
                  onChange={(event) => setMainGoal(event.target.value)}
                  placeholder="Ej. recibir reservas, vender por WhatsApp, conseguir leads..."
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold outline-none transition focus:border-[#93C5FD] focus:ring-4 focus:ring-[#93C5FD]/20"
                />
              </label>

              <div>
                <span className="text-sm font-bold text-gray-700">Rubro</span>
                <div className="mt-3 grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                  {businessOptions.map((option) => {
                    const Icon = option.icon;
                    const active = option.id === selectedId;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(option.id);
                          playUiTone('tap');
                        }}
                        className={`tap-boost rounded-2xl border p-4 text-left transition ${
                          active ? 'foru-gradient-border shadow-lg' : 'border-black/8 bg-white hover:shadow-md'
                        }`}
                      >
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5]">
                          <Icon size={20} />
                        </span>
                        <span className="block text-sm font-black">{option.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-sm font-bold text-gray-700">Personalidad</span>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {['moderno', 'premium', 'cálido'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTone(option)}
                      className={`rounded-xl px-4 py-3 text-sm font-black capitalize ${
                        tone === option ? 'foru-gradient-button' : 'border border-black/8 bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={createLanding}
              className="foru-btn mt-7 w-full"
            >
              Crear landing y abrir editor <ArrowRight size={18} />
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
