import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
import { FORU_SYSTEM_PROMPT } from '../prompts/foruSystemPrompt';

export type ForUChatRole = 'user' | 'model';

export type ForUChatMessage = {
  role: ForUChatRole;
  text: string;
};

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(geminiApiKey);

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(geminiApiKey) : null;

export const foruGeminiModel = genAI?.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: FORU_SYSTEM_PROMPT,
});

export async function sendForUChatMessage(messages: ForUChatMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.text ?? '';

  if (!foruGeminiModel) {
    return getLocalCalmFallback(lastUserMessage);
  }

  try {
    const history: Content[] = messages.slice(0, -1).map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    }));
    const chat = foruGeminiModel.startChat({ history });
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response.text().trim();

    return response || getLocalCalmFallback(lastUserMessage);
  } catch (error) {
    console.warn('Gemini no pudo responder todavía:', error);
    return getLocalCalmFallback(lastUserMessage);
  }
}

function getLocalCalmFallback(input: string) {
  const text = input.toLowerCase();
  const isOverwhelmed = /(no puedo|no puedo más|no puedo mas|agotada|abrumada|ansiosa|me duele la cabeza|caos|colaps)/.test(text);

  if (isOverwhelmed) {
    return [
      'Pausa, Nicole. 🫂',
      '',
      'Es verdad, tienes mucho encima.',
      '',
      'For U guarda esto por ti. Cierra los ojos 2 minutos.',
      '',
      'Cuando vuelvas, solo hacemos una cosa pequeña.',
    ].join('\n');
  }

  if (/(mucho|todo|tengo que|hacer|proyecto|tarea|pendiente)/.test(text)) {
    return [
      'Te leo. Vamos a bajar el ruido. 🌸',
      '',
      'Hoy no resolvemos toda la vida.',
      '',
      'Primer micro-paso: escribe una sola cosa que sí puedes abrir ahora.',
      '',
      'Nada más.',
    ].join('\n');
  }

  return [
    'Estoy aquí contigo. ✨',
    '',
    'Cuéntame una cosa a la vez.',
    '',
    'Yo te ayudo a convertirlo en un paso pequeño.',
  ].join('\n');
}
