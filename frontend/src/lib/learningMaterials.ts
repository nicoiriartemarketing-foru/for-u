import { loadLocalDraft, type DigitalWorldDraft } from './digitalWorldDraft';

export type LearningPhase = 'base' | 'oferta' | 'confianza' | 'landing' | 'contenido' | 'lanzamiento';
export type MaterialFormat = 'Curso' | 'Ebook' | 'Workbook' | 'Tutorial' | 'Checklist';

export type LearningMaterial = {
  id: string;
  title: string;
  format: MaterialFormat;
  phase: LearningPhase;
  level: 'Esencial' | 'Practico' | 'Avanzado';
  minutes: number;
  summary: string;
  whyItMatters: string;
  deliverable: string;
  aiUse: string;
  prompts: string[];
  bestFor: string[];
};

export const phaseLabels: Record<LearningPhase, string> = {
  base: 'Base estrategica',
  oferta: 'Oferta y ventas',
  confianza: 'Confianza',
  landing: 'Landing inmediata',
  contenido: 'Contenido',
  lanzamiento: 'Lanzamiento',
};

export const learningMaterials: LearningMaterial[] = [
  {
    id: 'mapa-mundo-digital',
    title: 'Mapa del Mundo Digital',
    format: 'Curso',
    phase: 'base',
    level: 'Esencial',
    minutes: 38,
    summary: 'Define que piezas necesita un negocio antes de crear web, catalogo, reservas o IA.',
    whyItMatters: 'Evita construir herramientas sueltas y ayuda a decidir que va primero.',
    deliverable: 'Mapa de piezas digitales por prioridad.',
    aiUse: 'La IA lo usa para detectar la fase actual y no recomendar tareas fuera de tiempo.',
    prompts: ['Que pieza digital me falta primero?', 'Ordena mi mundo digital por prioridad real.'],
    bestFor: ['general', 'servicios', 'restaurante', 'tienda', 'hospedaje'],
  },
  {
    id: 'claridad-cliente',
    title: 'Cliente, Dolor y Deseo',
    format: 'Workbook',
    phase: 'base',
    level: 'Esencial',
    minutes: 30,
    summary: 'Ejercicios para entender a quien se le vende, que quiere resolver y que necesita escuchar.',
    whyItMatters: 'Una landing clara nace de una persona clara, no de decorar secciones.',
    deliverable: 'Perfil de cliente y mensajes clave.',
    aiUse: 'La IA cruza tus respuestas con este workbook para escribir promesas mas precisas.',
    prompts: ['Quien es mi cliente principal?', 'Convierte este dolor en una promesa clara.'],
    bestFor: ['general', 'salud', 'belleza', 'bienestar', 'educacion'],
  },
  {
    id: 'oferta-visible',
    title: 'Oferta Visible en 5 Segundos',
    format: 'Ebook',
    phase: 'oferta',
    level: 'Esencial',
    minutes: 24,
    summary: 'Como nombrar, ordenar y presentar una oferta para que se entienda sin explicaciones largas.',
    whyItMatters: 'Si la oferta no se entiende rapido, la visita no sabe si quedarse.',
    deliverable: 'Promesa principal, CTA y tres beneficios concretos.',
    aiUse: 'La IA lo usa para convertir ideas dispersas en portada, boton y secciones de venta.',
    prompts: ['Haz mi oferta entendible en 5 segundos.', 'Dame 3 versiones de CTA segun mi rubro.'],
    bestFor: ['servicios', 'tienda', 'eventos', 'creativo', 'restaurante'],
  },
  {
    id: 'arquitectura-confianza',
    title: 'Arquitectura de Confianza',
    format: 'Curso',
    phase: 'confianza',
    level: 'Practico',
    minutes: 42,
    summary: 'Aprende que pruebas, testimonios, fotos, garantias o credenciales reducen dudas.',
    whyItMatters: 'La gente no solo compra lo bonito; compra lo que entiende y le da seguridad.',
    deliverable: 'Lista de pruebas de confianza y seccion de credibilidad.',
    aiUse: 'La IA detecta vacios de confianza y recomienda que prueba agregar primero.',
    prompts: ['Que prueba de confianza me falta?', 'Escribe una seccion de confianza sin sonar exagerado.'],
    bestFor: ['salud', 'hospedaje', 'belleza', 'servicios', 'inmobiliaria'],
  },
  {
    id: 'landing-en-una-tarde',
    title: 'Landing en una Tarde',
    format: 'Tutorial',
    phase: 'landing',
    level: 'Practico',
    minutes: 50,
    summary: 'Estructura minima para publicar una pagina con portada, oferta, confianza, preguntas y contacto.',
    whyItMatters: 'Publicar rapido permite validar antes de hacer un sistema grande.',
    deliverable: 'Landing lista para revisar y compartir.',
    aiUse: 'La IA lo usa como plantilla viva para crear la primera version desde el registro.',
    prompts: ['Crea mi landing minima.', 'Que seccion debo editar antes de compartir?'],
    bestFor: ['general', 'restaurante', 'hospedaje', 'servicios', 'tienda'],
  },
  {
    id: 'biblioteca-contenido',
    title: 'Biblioteca de Contenido que Vende',
    format: 'Workbook',
    phase: 'contenido',
    level: 'Practico',
    minutes: 35,
    summary: 'Convierte preguntas frecuentes, objeciones y casos reales en contenido para redes y web.',
    whyItMatters: 'El contenido deja de ser ocurrencia y empieza a alimentar ventas.',
    deliverable: '20 ideas de contenido conectadas a la oferta.',
    aiUse: 'La IA recomienda posts, historias y emails segun el material que falta en la fase actual.',
    prompts: ['Dame 10 contenidos para explicar mi oferta.', 'Convierte mis preguntas frecuentes en posts.'],
    bestFor: ['creativo', 'educacion', 'bienestar', 'belleza', 'servicios'],
  },
  {
    id: 'checklist-publicacion',
    title: 'Checklist antes de Compartir',
    format: 'Checklist',
    phase: 'lanzamiento',
    level: 'Esencial',
    minutes: 18,
    summary: 'Revision final de claridad, contacto, confianza, mobile, CTA y siguiente accion.',
    whyItMatters: 'Ayuda a publicar sin esperar perfeccion, pero sin olvidar lo importante.',
    deliverable: 'Landing aprobada para WhatsApp, Instagram o QR.',
    aiUse: 'La IA lo usa para marcar el proximo ajuste exacto antes de lanzar.',
    prompts: ['Revisa mi landing como cliente.', 'Dime solo el siguiente ajuste antes de publicar.'],
    bestFor: ['general', 'restaurante', 'tienda', 'eventos', 'inmobiliaria'],
  },
  {
    id: 'sistema-post-lanzamiento',
    title: 'Sistema Post Lanzamiento',
    format: 'Ebook',
    phase: 'lanzamiento',
    level: 'Avanzado',
    minutes: 32,
    summary: 'Que mirar despues de publicar: mensajes recibidos, clics, dudas repetidas y mejoras.',
    whyItMatters: 'Un mundo digital mejora con señales reales, no con suposiciones eternas.',
    deliverable: 'Tablero simple de aprendizaje y mejoras.',
    aiUse: 'La IA transforma conversaciones y dudas reales en nuevas mejoras de landing y contenido.',
    prompts: ['Que aprendi de mis primeros contactos?', 'Actualiza mi landing con estas dudas reales.'],
    bestFor: ['general', 'servicios', 'hospedaje', 'salud', 'educacion'],
  },
];

export function getLearningPhaseFromDraft(draft: DigitalWorldDraft = loadLocalDraft()): LearningPhase {
  const text = `${draft.mainGoal} ${draft.primaryCta} ${draft.businessType}`.toLowerCase();

  if (text.includes('contenido') || text.includes('redes')) return 'contenido';
  if (text.includes('confianza') || text.includes('testimonio') || text.includes('credencial')) return 'confianza';
  if (text.includes('public') || text.includes('compart') || text.includes('lanz')) return 'lanzamiento';
  if (text.includes('reserv') || text.includes('pedido') || text.includes('venta') || text.includes('diagnostico')) return 'oferta';

  return 'landing';
}

export function getRecommendedMaterials(phase: LearningPhase, draft: DigitalWorldDraft = loadLocalDraft()) {
  return [...learningMaterials]
    .map((material) => {
      const phaseScore = material.phase === phase ? 8 : material.phase === 'base' ? 2 : 0;
      const businessScore = material.bestFor.includes(draft.businessType) || material.bestFor.includes('general') ? 3 : 0;
      const essentialScore = material.level === 'Esencial' ? 1 : 0;

      return { material, score: phaseScore + businessScore + essentialScore };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.material);
}
