import type { LandingDraft } from "./types";
import { safeHttps } from "./engine";

export function parseSiteData(value: unknown): LandingDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.name !== "string" ||
    typeof data.headline !== "string" ||
    !Array.isArray(data.blocks)
  )
    return null;
  const text = (key: string, limit: number, fallback = "") =>
    typeof data[key] === "string"
      ? (data[key] as string).slice(0, limit)
      : fallback;
  return {
    menuItems: Array.isArray(data.menuItems) ? data.menuItems.slice(0, 30).filter((item): item is { id: string; name: string; price: number } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 && item.price <= 1000000)).map(item => ({ id: item.id.slice(0, 80), name: item.name.slice(0, 120), price: item.price })) : [],
    gallery: Array.isArray(data.gallery) ? data.gallery.slice(0, 3).filter((item): item is { role: string; url: string; alt: string } => Boolean(item && typeof item === 'object' && typeof item.role === 'string' && typeof item.url === 'string' && typeof item.alt === 'string')).map(item => ({ role: item.role.slice(0, 30), url: safeHttps(item.url) || '', alt: item.alt.slice(0, 160) })).filter(item => item.url) : [],
    heroImage: safeHttps(text("heroImage", 2000)),
    heroImageAlt: text("heroImageAlt", 160),
    name: text("name", 100),
    slug: text("slug", 60),
    headline: text("headline", 180),
    description: text("description", 1000),
    cta: text("cta", 50, "Consultar"),
    template: text("template", 40, "services"),
    color: "#0A0A0A",
    whatsapp: /^\d{8,15}$/.test(text("whatsapp", 15))
      ? text("whatsapp", 15)
      : "",
    calendly: safeHttps(text("calendly", 400), "calendly.com"),
    blocks: data.blocks
      .slice(0, 8)
      .filter((block): block is { id: string; title: string; body: string } =>
        Boolean(
          block &&
          typeof block === "object" &&
          typeof block.id === "string" &&
          typeof block.title === "string" &&
          typeof block.body === "string",
        ),
      )
      .map((block) => ({
        id: block.id.slice(0, 80),
        title: block.title.slice(0, 150),
        body: block.body.slice(0, 2000),
      })),
    fields: Array.isArray(data.fields)
      ? [
          ...new Set(
            data.fields
              .filter(
                (field): field is string =>
                  typeof field === "string" && field.trim().length > 0,
              )
              .map((field) => field.slice(0, 60)),
          ),
        ].slice(0, 8)
      : [],
    published: true,
  };
}
