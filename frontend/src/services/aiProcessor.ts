import type { ForUBranchKey } from '../stores/useActiveProjectsStore';

export type AiNodeType = 'idea' | 'accion' | 'recurso';

export type AiProcessedNode = {
  id: string;
  type: AiNodeType;
  branchKey: ForUBranchKey;
  data: {
    label: string;
    icon: string;
    description?: string;
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
{ "nodos": [ { "id": "string", "type": "idea" | "accion" | "recurso", "branchKey": "ideas" | "actions" | "finances" | "marketing" | "resources", "data": { "label": "string", "icon": "string", "description": "string" }, "position": { "x": number, "y": number } } ], "mensaje": "string" }`;

const mockDelayMs = 1200;

export async function processRawNotes(rawNotes: string[], projectName: string): Promise<AiProcessResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, mockDelayMs));

  const usableNotes = rawNotes.map((note) => note.trim()).filter(Boolean);
  const notes = usableNotes.length > 0 ? usableNotes : ['Ordenar ideas del proyecto'];

  const nodos = notes.slice(0, 8).map<AiProcessedNode>((note, index) => {
    const type = inferNodeType(note, index);
    const branchKey = inferBranchKey(note, type, index);
    const branchOrigin = branchOrigins[branchKey];
    const siblingIndex = notes.slice(0, index).filter((previousNote, previousIndex) => {
      return inferBranchKey(previousNote, inferNodeType(previousNote, previousIndex), previousIndex) === branchKey;
    }).length;
    const angle = branchOrigin.angle + siblingIndex * 0.42;
    const radius = 180 + siblingIndex * 28;

    return {
      id: `ai-node-${Date.now()}-${index}`,
      type,
      branchKey,
      data: {
        label: toMicroTaskLabel(note, type),
        icon: iconByType[type],
        description: `Nota original: ${note}`,
      },
      position: {
        x: Math.round(branchOrigin.x + Math.cos(angle) * radius),
        y: Math.round(branchOrigin.y + Math.sin(angle) * radius),
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

function inferBranchKey(note: string, type: AiNodeType, index: number): ForUBranchKey {
  const text = note.toLowerCase();

  if (/(finanza|finanzas|precio|costo|costos|presupuesto|venta|ventas|pago|factura|dinero|cobrar|cotizar)/.test(text)) {
    return 'finances';
  }

  if (/(marketing|instagram|tiktok|post|publicar|contenido|campaña|campana|marca|audiencia|redes|email)/.test(text)) {
    return 'marketing';
  }

  if (/(canva|drive|link|enlace|archivo|plantilla|referencia|foto|video|recurso|documento)/.test(text)) {
    return 'resources';
  }

  if (type === 'accion' || /(hacer|llamar|enviar|crear|revisar|agendar|comprar|escribir)/.test(text)) {
    return 'actions';
  }

  if (type === 'recurso') return 'resources';
  if (index % 5 === 2) return 'finances';
  if (index % 5 === 3) return 'marketing';

  return 'ideas';
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

const branchOrigins: Record<ForUBranchKey, { x: number; y: number; angle: number }> = {
  ideas: { x: 240, y: 210, angle: -2.35 },
  actions: { x: 760, y: 210, angle: -0.8 },
  finances: { x: 830, y: 400, angle: 0 },
  marketing: { x: 760, y: 590, angle: 0.8 },
  resources: { x: 240, y: 590, angle: 2.35 },
};
