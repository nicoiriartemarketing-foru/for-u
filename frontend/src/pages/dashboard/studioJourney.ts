import type { ModuleType } from '../../modules/moduleProjects';
import type { LandingDraft } from '../../toolkit/types';

export const studioOfferLabels: Record<ModuleType, string> = {
  restaurant: 'Presenta tu menú', ecommerce: 'Presenta tus productos',
  hospitality: 'Presenta tus habitaciones', tourism: 'Presenta tus experiencias', courses: 'Presenta tus cursos',
};
export function validStudioDraft(value: unknown): value is LandingDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<LandingDraft>;
  return typeof draft.headline === 'string' && Boolean(draft.headline.trim()) &&
    typeof draft.slug === 'string' && /^[a-z0-9][a-z0-9-]{2,59}$/.test(draft.slug) && Array.isArray(draft.blocks) && draft.blocks.every(block => Boolean(block) && typeof block.id === "string" && typeof block.title === "string" && typeof block.body === "string");
}
export function studioCatalog(type: ModuleType, value: unknown): Array<{id: string; name: string; price: number}> {
  if (!value || typeof value !== 'object') return [];
  const key = {restaurant:'dishes',ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'}[type];
  const items = (value as Record<string, unknown>)[key];
  if (!Array.isArray(items)) return [];
  return items.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim() && typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 && item.price <= 1000000 && item.available !== false && item.active !== false && item.status !== 'maintenance').map(item => ({id:item.id,name:item.name,price:item.price}));
}
export function studioJourney(type: ModuleType, value: unknown, published: boolean, catalog: unknown = null) {
  const valid = validStudioDraft(value);
  const draft = valid ? value : undefined;
  const identity = Boolean(draft?.name?.trim() && draft.description?.trim() && draft.heroImage);
  const offer = studioCatalog(type, catalog).length > 0 || Boolean(draft?.menuItems?.some(item => item && typeof item.name === 'string' && item.name.trim() && Number.isFinite(item.price) && item.price >= 0));
  return [
    { id: 'identity', icon: '🎨', title: 'Dale personalidad', hint: 'Tu historia, tus colores y una portada.', ready: identity, started: valid },
    { id: 'offer', icon: { restaurant: '🧁', ecommerce: '🛍️', hospitality: '🏡', tourism: '🗺️', courses: '🎓' }[type], title: studioOfferLabels[type], hint: 'Lo que ofreces, contado a tu manera.', ready: offer, started: Boolean(draft?.blocks.length) },
    { id: 'design', icon: '✨', title: 'Hazlo tuyo', hint: 'Dale forma a tu página en vivo.', ready: valid && identity && offer, started: valid },
    { id: 'publish', icon: '🚀', title: 'Compártelo', hint: 'Revisa, publica y comparte tu enlace.', ready: published, started: valid },
  ];
}
