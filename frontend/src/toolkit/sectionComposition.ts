import type {LandingBlock,LandingDraft} from './types';
export const sectionKinds=['catalog','story','faq','location','details'] as const;
export type SectionKind=typeof sectionKinds[number];
/** Titles from earlier drafts remain readable; only new/explicit saves persist a kind. */
export function sectionKind(block:LandingBlock):SectionKind|undefined{
 if(block.kind)return block.kind;
 const title=block.title.toLocaleLowerCase();
 if(/menú|productos|habitaciones|servicios|experiencias|cursos|catálogo/.test(title))return 'catalog';
 if(/preguntas|faq/.test(title))return 'faq';
 if(/historia|conócenos/.test(title))return 'story';
 if(/ubicación|visítanos|contacto/.test(title))return 'location';
 return undefined;
}
export function faqRows(body:string):{question:string;answer:string}[]{
 return body.trim().split(/\n\s*\n/).filter(Boolean).map(group=>{const [question,...answer]=group.split('\n');return {question:question.trim(),answer:answer.join('\n').trim()};}).filter(row=>row.question&&row.answer);
}
export function sectionConfigured(block:LandingBlock,draft:LandingDraft):boolean{
 return sectionKind(block)==='catalog'?Boolean(draft.offers?.length):Boolean(block.body.trim());
}
export function sectionHint(kind:SectionKind|undefined,route:string):string{
 if(kind==='catalog')return ({restaurant:'Añade tu primer plato o bebida. Su precio y opciones vendrán de tu menú.',ecommerce:'Añade tu primer producto con sus opciones.',tourism:'Añade una experiencia con duración y condiciones.',hospitality:'Añade una habitación o estadía.',courses:'Añade un curso y organiza sus materiales.'} as Record<string,string>)[route]||'Define tu primer servicio o paquete.';
 if(kind==='faq')return 'Una pregunta en la primera línea y su respuesta debajo. Separa cada pareja con una línea vacía.';
 if(kind==='location')return 'Comparte dónde te encuentran y cuándo pueden contactarte. Puedes completarlo después.';
 if(kind==='story')return 'Tu historia tiene su lugar aquí. Escríbela cuando quieras, con tus propias palabras.';
 return 'Cuenta esta parte a tu manera. Solo se publicará lo que hayas definido.';
}
