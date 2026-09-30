import type { ModuleType } from './moduleProjects';

/** Initial validation: keep other modules and their data, but do not offer entry points. */
export function isModuleEnabled(type: ModuleType | null): boolean {
  return type === 'restaurant';
}

const reservedSlugs = new Set([
  'ia', 'metodologia', 'mundo-digital', 'aventura', 'workspace', 'modules',
  'content-creator', 'negocio', 'experiencias', 'herramientas', 'mapa',
  'site-preview', 's', 'whatsapp', 'pricing', 'studio', 'login', 'register',
  'register-wizard', 'dashboard', 'editor', 'reservas', 'p', 'api', 'assets',
  'demo', 'terminos', 'privacidad',
]);
export function isRestaurantSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,59}$/.test(slug) && !reservedSlugs.has(slug);
}
export function suggestRestaurantSlug(name: string): string {
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
  return isRestaurantSlug(slug) ? slug : 'mi-restaurante';
}
export function restaurantPublicPath(slug: string): string {
  // Old reserved slugs remain accessible using the original URL.
  return isRestaurantSlug(slug) ? `/${slug}` : `/negocio/${encodeURIComponent(slug)}`;
}
