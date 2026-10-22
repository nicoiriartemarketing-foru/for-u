import type {Campaign,SourceReference} from '../../workspace/contracts';
import {uuid} from '../../social/model';
import type { ContentTemplate } from '../../data/templates/types';
import type { ModuleProject } from '../../modules/moduleProjects';
export type ContentDraft = { layout?:'editorial'|'poster'|'split';creative?:{intent:Campaign['intent'];campaignId?:string;reference?:SourceReference;sourceKey:string}; logoPath?:string;carouselId?:string;slide?:number;sourceImageUrl?:string; brandName?:string; cta?:string; source?:{mode?:'draft'|'published';kind:'landing';revision:string;sectionId:string}; id: string; projectId: string; title: string; subtitle: string; caption: string; format: 'post' | 'portrait' | 'story'; background: string; foreground: string; imagePath: string; templateId: string | null; updatedAt: string };
export type ContentDocument = { version: 1; drafts: ContentDraft[] };
export const contentSizes = { post: { width: 1080, height: 1080 }, portrait: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } };
export function blankContent(projectId: string): ContentDraft {
  return { id: crypto.randomUUID(), projectId, title: '', subtitle: '', caption: '', format: 'post', background: '#ffffff', foreground: '#0f172a', imagePath: '', templateId: null, updatedAt: new Date().toISOString() };
}
export function contentFromTemplate(project: ModuleProject, template: ContentTemplate): ContentDraft {
  if (template.type !== project.type) throw new Error('Esta plantilla corresponde a otro rubro.');
  const personalize = (text: string) => text.replaceAll('{negocio}', project.name);
  return { ...blankContent(project.id), title: personalize(template.title), subtitle: personalize(template.subtitle), caption: personalize(template.caption), background: template.background, foreground: template.foreground, templateId: template.id };
}
export function saveContentDraft(document: ContentDocument, draft: ContentDraft, projectId: string): ContentDocument {
  validateCreativeContext(draft,projectId);
  if (draft.projectId !== projectId) throw new Error('El contenido pertenece a otro proyecto.');
  if (!draft.title.trim() && !draft.caption.trim()) throw new Error('Escribe un título o texto para guardar el contenido.');
  if (!/^#[\da-f]{6}$/i.test(draft.background) || !/^#[\da-f]{6}$/i.test(draft.foreground)) throw new Error('Selecciona colores válidos.');
  const value = { ...draft, updatedAt: new Date().toISOString() };
  return { version: 1, drafts: document.drafts.some(item => item.id === draft.id) ? document.drafts.map(item => item.id === draft.id ? value : item) : [...document.drafts, value] };
}

export function validateCreativeContext(draft:ContentDraft,project:string){
 if(draft.layout&&!['editorial','poster','split'].includes(draft.layout))throw new Error('Esta composición no es compatible. Conservamos el diseño.');
 const context=draft.creative;if(!context)return;
 if(!['awareness','conversation','trust','offer','followup','loyalty'].includes(context.intent)||typeof context.sourceKey!=='string'||context.sourceKey.length>300||(context.campaignId&&!uuid(context.campaignId)))throw new Error('Revisa el contexto de esta pieza.');
 const r=context.reference;if(r&&(r.projectId!==project||!['proposal','catalog','page','offer'].includes(r.kind)||typeof r.id!=='string'||!r.id||r.id.length>200||typeof r.revision!=='string'||!r.revision||r.revision.length>100))throw new Error('La fuente no pertenece a este proyecto.');
}
