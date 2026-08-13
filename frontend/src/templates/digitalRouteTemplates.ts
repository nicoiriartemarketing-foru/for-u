import type { ForUBranchKey, ForUIndustryKey, ForUNodePriority } from '../stores/useActiveProjectsStore';

export type ForUDigitalRouteStepStatus = 'pending' | 'in_progress' | 'ready';

export type ForUDigitalRouteTaskTemplate = {
  title: string;
  description: string;
  branchKey: ForUBranchKey;
  priority: ForUNodePriority;
};

export type ForUDigitalRouteStepTemplate = {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  outcome: string;
  why: string;
  primaryAction: string;
  outputKey: string;
  artifactLabel: string;
  tasks: ForUDigitalRouteTaskTemplate[];
  defaultOutputs: Record<string, string>;
};

export type ForUDigitalRouteTemplate = {
  industryKey: ForUIndustryKey | 'generic';
  title: string;
  description: string;
  steps: ForUDigitalRouteStepTemplate[];
};

const tourismDefaults = {
  destination: '[destino]',
  traveler: '[viajero ideal]',
  offer: '[experiencia principal]',
  channel: 'WhatsApp',
};

export const tourismDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  industryKey: 'tourism',
  title: 'Ruta Digital Turismo',
  description: 'De experiencia suelta a sistema completo: oferta, landing, reservas, contenido, Google, confianza y mejora.',
  steps: [
    {
      id: 'strategy-base',
      title: 'Base Estratégica',
      shortTitle: 'Base',
      badge: 'Claridad',
      outcome: 'Brief claro del negocio y de la experiencia que se quiere vender.',
      why: 'Si la base está clara, la landing, el contenido y WhatsApp dejan de sentirse como piezas sueltas.',
      primaryAction: 'Completar brief base',
      outputKey: 'strategyBrief',
      artifactLabel: 'Brief estratégico',
      defaultOutputs: {
        offer: `Una ${tourismDefaults.offer} en ${tourismDefaults.destination}.`,
        audience: `Pensada para ${tourismDefaults.traveler}.`,
        promise: 'Una experiencia fácil de entender, confiar y reservar.',
      },
      tasks: [
        {
          title: 'Escribir qué experiencia se vende en una frase',
          description: 'Define qué vive la persona, dónde ocurre y por qué debería importarle.',
          branchKey: 'ideas',
          priority: 'high',
        },
        {
          title: 'Definir viajero ideal y principal deseo',
          description: 'Describe quién compra, qué busca sentir y qué duda necesita resolver.',
          branchKey: 'marketing',
          priority: 'high',
        },
      ],
    },
    {
      id: 'signature-offer',
      title: 'Oferta / Producto Estrella',
      shortTitle: 'Oferta',
      badge: 'Venta',
      outcome: 'Oferta principal lista para comunicar con beneficios, precio base y objeciones.',
      why: 'For U necesita una oferta estrella para que todo lo demás apunte al mismo destino.',
      primaryAction: 'Diseñar oferta estrella',
      outputKey: 'signatureOffer',
      artifactLabel: 'Oferta vendible',
      defaultOutputs: {
        name: 'Experiencia principal',
        includes: 'Incluye guía/anfitrión, momentos clave, detalles logísticos y siguiente paso de reserva.',
        objections: 'Precio, seguridad, disponibilidad, duración y qué pasa si cambia la fecha.',
      },
      tasks: [
        {
          title: 'Definir nombre, duración y precio base de la experiencia',
          description: 'Crea una oferta concreta que se pueda explicar en menos de 30 segundos.',
          branchKey: 'finances',
          priority: 'high',
        },
        {
          title: 'Escribir 3 beneficios concretos para el viajero',
          description: 'Transforma características en razones para reservar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'landing',
      title: 'Landing / Página de Venta',
      shortTitle: 'Landing',
      badge: 'Editor',
      outcome: 'Página editable y publicable con promesa, beneficios, confianza, FAQ y CTA.',
      why: 'La landing es el lugar donde el viajero entiende, confía y decide escribir.',
      primaryAction: 'Abrir editor de landing',
      outputKey: 'landingDraft',
      artifactLabel: 'Landing editable',
      defaultOutputs: {
        hero: `Vive una ${tourismDefaults.offer} en ${tourismDefaults.destination}.`,
        cta: `Reservar por ${tourismDefaults.channel}`,
        sections: 'Portada, beneficios, itinerario, confianza, galería, preguntas y reserva.',
      },
      tasks: [
        {
          title: 'Escribir portada de la landing',
          description: 'Título, subtítulo y botón principal para explicar la experiencia.',
          branchKey: 'marketing',
          priority: 'high',
        },
        {
          title: 'Elegir 5 fotos reales para la landing',
          description: 'Selecciona fotos de lugar, personas, detalle, confianza y experiencia.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'whatsapp-conversion',
      title: 'WhatsApp / Conversión',
      shortTitle: 'WhatsApp',
      badge: 'Reservas',
      outcome: 'Guion simple para responder consultas y convertir interesados en reservas.',
      why: 'La venta real suele pasar en conversación, no solo en la página.',
      primaryAction: 'Crear guion de WhatsApp',
      outputKey: 'whatsappFlow',
      artifactLabel: 'Guion de conversión',
      defaultOutputs: {
        welcome: 'Gracias por escribir. Te cuento cómo funciona la experiencia y qué necesito para confirmar disponibilidad.',
        data: 'Fecha, cantidad de personas, idioma/ritmo, restricciones y contacto.',
        followup: 'Mensaje amable para retomar si la persona no responde.',
      },
      tasks: [
        {
          title: 'Redactar mensaje de bienvenida para consultas',
          description: 'Mensaje breve con experiencia recomendada, disponibilidad y siguiente paso.',
          branchKey: 'actions',
          priority: 'high',
        },
        {
          title: 'Definir datos mínimos para confirmar reserva',
          description: 'Evita conversaciones eternas pidiendo solo lo necesario.',
          branchKey: 'finances',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'content-system',
      title: 'Contenido',
      shortTitle: 'Contenido',
      badge: 'Atracción',
      outcome: 'Ideas de posts, reels e historias para atraer, educar, generar confianza y vender.',
      why: 'El contenido debe alimentar la ruta, no convertirse en una lista infinita.',
      primaryAction: 'Crear plan de contenido',
      outputKey: 'contentPlan',
      artifactLabel: 'Plan de contenido',
      defaultOutputs: {
        pillars: 'Deseo de viaje, confianza, detrás de escena, prueba social y reserva.',
        weekly: '1 reel, 2 historias, 1 post de confianza y 1 CTA directo.',
      },
      tasks: [
        {
          title: 'Crear 5 ideas de contenido para vender la experiencia',
          description: 'Incluye deseo, confianza, detrás de escena y llamado a reservar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Escribir 3 historias con detrás de escena',
          description: 'Muestra preparación, anfitrión y detalles reales.',
          branchKey: 'marketing',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'google-presence',
      title: 'Google / Presencia Local',
      shortTitle: 'Google',
      badge: 'Visibilidad',
      outcome: 'Checklist para aparecer mejor y generar confianza desde Google.',
      why: 'Muchas personas buscan antes de escribir. Google debe confirmar que el negocio existe y es confiable.',
      primaryAction: 'Completar checklist de Google',
      outputKey: 'googleChecklist',
      artifactLabel: 'Perfil local',
      defaultOutputs: {
        category: 'Experiencia turística / guía local / agencia, según el caso.',
        essentials: 'Descripción, ubicación, horarios, fotos, servicios, reseñas y preguntas frecuentes.',
      },
      tasks: [
        {
          title: 'Escribir descripción corta para Google Business',
          description: 'Texto claro con ubicación, experiencia, público y forma de reserva.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Preparar 8 fotos para Google',
          description: 'Mezcla lugar, equipo/anfitrión, experiencia, señalización y detalles.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'trust-assets',
      title: 'Confianza / Prueba Social',
      shortTitle: 'Confianza',
      badge: 'Seguridad',
      outcome: 'Activos que reducen dudas: historia, testimonios, fotos reales y garantías.',
      why: 'La confianza convierte curiosidad en reserva.',
      primaryAction: 'Crear activos de confianza',
      outputKey: 'trustAssets',
      artifactLabel: 'Pruebas de confianza',
      defaultOutputs: {
        story: 'Historia breve del anfitrión y por qué existe la experiencia.',
        proof: 'Testimonios, fotos reales, datos logísticos y respuestas a dudas.',
      },
      tasks: [
        {
          title: 'Escribir historia breve del anfitrión',
          description: 'Cuenta por qué esta experiencia existe y por qué se puede confiar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Recolectar 3 pruebas de confianza',
          description: 'Testimonios, fotos, menciones, reseñas o datos logísticos claros.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'metrics-improvement',
      title: 'Métricas y Mejora',
      shortTitle: 'Mejora',
      badge: 'Ciclo',
      outcome: 'Sistema simple para medir mensajes, reservas, dudas y próxima mejora.',
      why: 'La ruta no termina al publicar. Se mejora con señales reales.',
      primaryAction: 'Definir tablero de mejora',
      outputKey: 'metricsLoop',
      artifactLabel: 'Ciclo de mejora',
      defaultOutputs: {
        metrics: 'Visitas, clics a WhatsApp, mensajes, reservas, dudas repetidas y contenido que más conecta.',
        next: 'Una mejora semanal basada en conversaciones reales.',
      },
      tasks: [
        {
          title: 'Definir 4 métricas simples para revisar cada semana',
          description: 'Elige números que ayuden a mejorar sin abrumarte.',
          branchKey: 'finances',
          priority: 'low',
        },
        {
          title: 'Crear lista de dudas repetidas para mejorar landing y contenido',
          description: 'Cada duda real se convierte en FAQ, post o ajuste de oferta.',
          branchKey: 'actions',
          priority: 'low',
        },
      ],
    },
  ],
};

export const gastronomyDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  ...tourismDigitalRouteTemplate,
  industryKey: 'gastronomy',
  title: 'Ruta Digital Gastronomía',
  description: 'Oferta estrella, menú/landing, pedidos, contenido, Google, confianza y recompra.',
  steps: tourismDigitalRouteTemplate.steps.map((step) => {
    const replacements: Record<string, Partial<ForUDigitalRouteStepTemplate>> = {
      'signature-offer': {
        title: 'Producto Estrella',
        shortTitle: 'Producto',
        outcome: 'Producto o combo principal listo para vender con precio, margen y forma de pedido.',
        primaryAction: 'Diseñar producto estrella',
      },
      landing: {
        title: 'Menú / Página de Venta',
        shortTitle: 'Menú',
        outcome: 'Página simple con producto estrella, combos, fotos, horarios, zona de entrega y pedido por WhatsApp.',
      },
      'whatsapp-conversion': {
        title: 'WhatsApp / Pedidos',
        shortTitle: 'Pedidos',
        outcome: 'Flujo simple para recibir pedidos, confirmar pago y coordinar entrega o reserva.',
      },
      'metrics-improvement': {
        title: 'Métricas y Recompra',
        shortTitle: 'Recompra',
        outcome: 'Sistema simple para medir pedidos, clientes frecuentes, ticket promedio y promociones.',
      },
    };

    return {
      ...step,
      ...(replacements[step.id] ?? {}),
    };
  }),
};

export const genericDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  ...tourismDigitalRouteTemplate,
  industryKey: 'generic',
  title: 'Ruta Digital Base',
  description: 'Oferta, página, contacto, contenido, Google, confianza y mejora para cualquier negocio.',
};

export function getDigitalRouteTemplate(industryKey?: ForUIndustryKey): ForUDigitalRouteTemplate {
  if (industryKey === 'tourism') return tourismDigitalRouteTemplate;
  if (industryKey === 'gastronomy') return gastronomyDigitalRouteTemplate;
  return genericDigitalRouteTemplate;
}

export function getStepCompletionStatus(completedTaskCount: number, totalTaskCount: number): ForUDigitalRouteStepStatus {
  if (totalTaskCount > 0 && completedTaskCount >= totalTaskCount) return 'ready';
  if (completedTaskCount > 0) return 'in_progress';
  return 'pending';
}
