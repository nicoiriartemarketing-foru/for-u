import { supabase } from "../lib/supabaseClient";
import type { Business } from "./types";
import type { Segment } from "./engine";
export async function askAI(
  action: "caption" | "script" | "hashtags" | "chat" | "tags" | "landing",
  prompt: string,
  business: Business,
  extra: Record<string, unknown> = {},
): Promise<string> {
  if (!supabase)
    throw new Error(
      "Conecta tu cuenta para usar la IA. Puedes trabajar con una plantilla mientras tanto.",
    );
  const { data, error } = await supabase.functions.invoke("toolkit-ai", {
    body: { action, prompt, business, ...extra },
  });
  if (error || data?.error)
    throw new Error(
      data?.error ??
        "La IA no está disponible. Revisa la conexión o usa una plantilla.",
    );
  if (typeof data?.text !== "string" || !data.text.trim())
    throw new Error("La IA no devolvió contenido. Inténtalo de nuevo.");
  return data.text;
}
export async function transcribe(file: File): Promise<Segment[]> {
  if (!supabase)
    throw new Error(
      "Conecta tu cuenta para transcribir. También puedes agregar subtítulos manualmente.",
    );
  if (file.size > 24 * 1024 * 1024)
    throw new Error(
      "La transcripción admite hasta 24 MB. Usa un video más corto.",
    );
  const body = new FormData();
  body.set("file", file);
  const { data, error } = await supabase.functions.invoke("toolkit-ai", {
    body,
  });
  if (error || data?.error)
    throw new Error(
      data?.error ??
        "No se pudo transcribir. Puedes agregar subtítulos manualmente.",
    );
  if (!Array.isArray(data?.segments))
    throw new Error("No se recibió una transcripción válida.");
  return data.segments.filter(
    (s: Segment) =>
      Number.isFinite(s.start) &&
      Number.isFinite(s.end) &&
      s.end > s.start &&
      typeof s.text === "string",
  );
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
export function templateContent(b: Business, topic: string, format: string) {
  if (format === "script")
    return `¿Buscas ${b.offer}?\n\nEn ${b.name} lo hacemos pensando en ${b.audience}.\nHoy te mostramos ${topic || "cómo trabajamos"}.\n[Cuenta un beneficio real y muestra el proceso.]\n\nEscríbenos para conocer las opciones y elegir la tuya.`;
  if (format === "hashtags")
    return "#Emprendimiento #NegocioLocal #HechoConCariño #CompraLocal #MiNegocio";
  return `${topic || b.offer}: una idea para ti.\n\nEn ${b.name} creamos ${b.offer} para ${b.audience}. [Agrega aquí un beneficio concreto y verificable.]\n\nEscríbenos y te ayudamos a elegir.\n\n#Emprendimiento #NegocioLocal`;
}
