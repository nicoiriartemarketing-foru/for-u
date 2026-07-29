export type WhatsAppButton = {
  id: string;
  number: string;
  label: string;
};

export const mainMenuButtons: WhatsAppButton[] = [
  { id: 'capture_ideas', number: '1', label: '📥 Echar ideas' },
  { id: 'next_action', number: '2', label: '📋 Ver próxima acción' },
  { id: 'view_projects', number: '3', label: '🌍 Ver mis proyectos' },
];

export const ideaCaptureButtons: WhatsAppButton[] = [
  { id: 'write_idea', number: '1', label: '✍️ Escribir idea' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export const ideaSavedButtons: WhatsAppButton[] = [
  { id: 'another_idea', number: '1', label: '➕ Otra idea' },
  { id: 'organize', number: '2', label: '✨ Organizar' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export const nextActionButtons: WhatsAppButton[] = [
  { id: 'start_task', number: '1', label: '▶️ Empezar' },
  { id: 'complete_task', number: '2', label: '✅ Ya la completé' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export const executingTaskButtons: WhatsAppButton[] = [
  { id: 'complete_task', number: '1', label: '✅ Completar' },
  { id: 'pause_task', number: '2', label: '⏸️ Pausar' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export const completedTaskButtons: WhatsAppButton[] = [
  { id: 'next_action', number: '1', label: '➡️ Siguiente acción' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export const routeButtons: WhatsAppButton[] = [
  { id: 'create_route', number: '1', label: '🗺️ Crear Ruta' },
  { id: 'details', number: '2', label: '👀 Ver detalles' },
  { id: 'back_menu', number: '0', label: '🔙 Volver al menú' },
];

export function renderButtons(buttons: WhatsAppButton[]) {
  return buttons.map((button) => `${button.number}. ${button.label}`).join('\n');
}

export function buttonIdFromReply(message: string, buttons: WhatsAppButton[]) {
  const cleanMessage = message.trim().toLowerCase();
  const directMatch = buttons.find((button) => cleanMessage === button.number || cleanMessage === button.id);
  if (directMatch) return directMatch.id;

  return buttons.find((button) => {
    const cleanLabel = button.label.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    return cleanLabel && cleanMessage.includes(cleanLabel);
  })?.id ?? null;
}
