import type { ContentTemplate } from '../../data/templates/types';
import type { ModuleProject } from '../../modules/moduleProjects';
export type ContentDraft = { id: string; projectId: string; title: string; subtitle: string; caption: string; format: 'post' | 'story'; background: string; foreground: string; imagePath: string; templateId: string | null; updatedAt: string };
export type ContentDocument = { version: 1; drafts: ContentDraft[] };
export const contentSizes = { post: { width: 1080, height: 1080 }, story: { width: 1080, height: 1920 } };
export function blankContent(projectId: string): ContentDraft {
  return { id: crypto.randomUUID(), projectId, title: '', subtitle: '', caption: '', format: 'post', background: '#ffffff', foreground: '#0f172a', imagePath: '', templateId: null, updatedAt: new Date().toISOString() };
}
export function contentFromTemplate(project: ModuleProject, template: ContentTemplate): ContentDraft {
  if (template.type !== project.type) throw new Error('Esta plantilla corresponde a otro rubro.');
  const personalize = (text: string) => text.replaceAll('{negocio}', project.name);
  return { ...blankContent(project.id), title: personalize(template.title), subtitle: personalize(template.subtitle), caption: personalize(template.caption), background: template.background, foreground: template.foreground, templateId: template.id };
}
export function saveContentDraft(document: ContentDocument, draft: ContentDraft, projectId: string): ContentDocument {
  if (draft.projectId !== projectId) throw new Error('El contenido pertenece a otro proyecto.');
  if (!draft.title.trim() && !draft.caption.trim()) throw new Error('Escribe un título o texto para guardar el contenido.');
  if (!/^#[\da-f]{6}$/i.test(draft.background) || !/^#[\da-f]{6}$/i.test(draft.foreground)) throw new Error('Selecciona colores válidos.');
  const value = { ...draft, updatedAt: new Date().toISOString() };
  return { version: 1, drafts: document.drafts.some(item => item.id === draft.id) ? document.drafts.map(item => item.id === draft.id ? value : item) : [...document.drafts, value] };
}
