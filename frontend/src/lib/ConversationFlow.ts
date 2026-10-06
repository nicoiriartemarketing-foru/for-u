export interface ConversationStep {
  id: string;
  question: string;
  hint: string;
  placeholder: string;
  contextualActions: string[];
}

export const MARKETING_FLOW: ConversationStep[] = [
  {
    id: 'idealClient',
    question: '¡Hola! Soy Munay. Imagina a tu cliente ideal. No pensemos en edad ni dónde vive. ¿En qué situación se encuentra para necesitar tu producto o servicio? Cuéntame.',
    hint: 'Puedes escribir o pensar en un audio. No hay respuesta incorrecta.',
    placeholder: 'Ej: Alguien que quiere regalar algo especial pero no sabe qué...',
    contextualActions: ['🎬 Grabar video para este cliente', '📝 Crear post sobre esta situación']
  },
  {
    id: 'story',
    question: 'Me encanta. Ahora cuéntame: ¿cómo nació tu emprendimiento? ¿Qué te inspiró a empezar? Cuéntamelo como a un amigo.',
    hint: 'Esta historia será el alma de tu landing page.',
    placeholder: 'Ej: Todo empezó cuando mi abuela me enseñó a hacer alfajores...',
    contextualActions: ['📖 Escribir historia para la web', '🎙️ Grabar audio contando esto']
  },
  {
    id: 'testimonials',
    question: 'Qué linda historia. ¿Qué te dicen normalmente tus clientes o amigos sobre lo que haces? ¿Qué palabras usan?',
    hint: 'Pueden ser frases reales o lo que sientes que dicen de ti.',
    placeholder: 'Ej: "Tus alfajores me recuerdan a mi infancia"...',
    contextualActions: ['✨ Crear carrusel de testimonios']
  }
];

export const FINANZAS_FLOW: ConversationStep[] = [];
export const LOGISTICA_FLOW: ConversationStep[] = [];
export const OPERACIONES_FLOW: ConversationStep[] = [];