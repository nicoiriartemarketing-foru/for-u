export type AiNodeType = 'idea' | 'accion' | 'recurso';

export type AiProcessedNode = {
  id: string;
  type: AiNodeType;
  data: {
    label: string;
    icon: string;
  };
  position: {
    x: number;
    y: number;
  };
};

export type AiProcessResponse = {
  nodos: AiProcessedNode[];
  mensaje: string;
};

export const FOR_U_AI_SYSTEM_PROMPT = `Eres For U, un asistente empático y juguetón para emprendedores con TDAH. Usas analogías de mar y navegación (⛵, 🌊, ✨). Recibes una lista de ideas crudas y desordenadas. Tu tarea es agruparlas en categorías lógicas (ej: "Marketing", "Finanzas", "Ideas") y convertirlas en micro-tareas de máximo 15 minutos. Responde SOLO en formato JSON con esta estructura exacta:
{ "nodos": [ { "id": "string", "type": "idea" | "accion" | "recurso", "data": { "label": "string", "icon": "string" }, "position": { "x": number, "y": number } } ], "mensaje": "string" }`;

const mockDelayMs = 1200;

export async function processRawNotes(rawNotes: string[], projectName: string): Promise<AiProcessResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, mockDelayMs));

  const usableNotes = rawNotes.map((note) => note.trim()).filter(Boolean);
  const notes = usableNotes.length > 0 ? usableNotes : ['Ordenar ideas del proyecto'];
  const centerX = 260;
  const centerY = 160;

  const nodos = notes.slice(0, 8).map<AiProcessedNode>((note, index) => {
    const angle = (index / Math.max(notes.length, 1)) * Math.PI * 2;
    const radius = index === 0 ? 0 : 170;
    const type = inferNodeType(note, index);

    return {
      id: `ai-node-${Date.now()}-${index}`,
      type,
      data: {
        label: toMicroTaskLabel(note, type),
        icon: iconByType[type],
      },
      position: {
        x: Math.round(centerX + Math.cos(angle) * radius),
        y: Math.round(centerY + Math.sin(angle) * radius),
      },
    };
  });

  return {
    nodos,
    mensaje: `⛵ Listo, organicé ${nodos.length} ideas para "${projectName}". Tu mapa ya tiene rutas pequeñas para navegar sin culpa.`,
  };
}

function inferNodeType(note: string, index: number): AiNodeType {
  const text = note.toLowerCase();

  if (/(link|canva|drive|recurso|archivo|plantilla|referencia|foto|video)/.test(text)) return 'recurso';
  if (/(hacer|llamar|enviar|publicar|comprar|crear|revisar|agenda|cotizar|escribir)/.test(text)) return 'accion';
  if (index % 3 === 1) return 'accion';
  if (index % 3 === 2) return 'recurso';

  return 'idea';
}

function toMicroTaskLabel(note: string, type: AiNodeType) {
  const cleanNote = note.replace(/\s+/g, ' ').trim();
  const shortNote = cleanNote.length > 70 ? `${cleanNote.slice(0, 67)}...` : cleanNote;

  if (type === 'accion') return `15 min: ${shortNote}`;
  if (type === 'recurso') return `Recurso: ${shortNote}`;

  return `Idea: ${shortNote}`;
}

const iconByType: Record<AiNodeType, string> = {
  idea: '💡',
  accion: '✅',
  recurso: '🔗',
};
