import type {BusinessRoute,Diagnostic,ProjectRoute} from '../workspace/contracts';
import type {AreaId,AreaTask,AreaTasks} from '../pages/dashboard/areaModel';
import type {Proposal} from '../proposal/model';
import {defaultLanding,type LandingDraft} from '../toolkit/types';
import {list,meaningful,routeOptions,type Answers} from './personalizationModel';
export type RouteSuggestion={key:string;area:AreaId;title:string;tool:string;reason:string};
export function routeSuggestions(route:BusinessRoute,a:Answers):RouteSuggestion[]{
 const active=a.marketingStart!=='Más adelante';
 const choices=active?list(a.comfort):[],avoid=active?list(a.avoid):[],resources=active?list(a.resources):[];
 const camera=choices.includes('Hablando a cámara')&&!avoid.includes('Mostrar mi cara');
 const voice=choices.includes('Usando mi voz')&&!avoid.includes('Grabar mi voz');
 const hasImages=resources.includes('Fotos')||resources.includes('Videos');
 const tasks:RouteSuggestion[]=[
  {key:'page',area:'marketing',title:'Hacer mía mi página',tool:'landing',reason:list(a.sections).length?'La estructura parte de las secciones que elegiste. Puedes editarlas directamente.':'Puedes empezar con una estructura pequeña de tu actividad; no necesitas fotos.'},
  {key:'content',area:'marketing',title:camera||voice?'Preparar mi primer guion':'Crear mi primer contenido',tool:'studio',reason:(avoid.includes('Mostrar mi cara')?'Elegiste no mostrar tu cara. ':camera?'Te sientes a gusto hablando a cámara. ':voice?'Elegiste usar tu voz. ':'Puedes empezar con texto y diseño. ')+(hasImages?'Podrás elegir tus recursos al crear.':'Empezaremos con una composición tipográfica, sin pedir fotografías.')},
 ];
 if(a.goal==='Crear contenido')tasks.reverse();
 if(a.goal==='Vender una oferta')tasks.unshift({key:'offer',area:'marketing',title:'Preparar una oferta especial',tool:'proposal',reason:'Elegiste vender una oferta. Confirmaremos su beneficio y condiciones antes de activarla.'});
 if(list(a.otherAreas).includes('Finanzas'))tasks.push({key:'cost',area:'finance',title:a.cost==='Sí'?'Revisar los costos de mi oferta':'Entender el costo de mi oferta',tool:'summary',reason:`Elegiste Finanzas${a.cost?` y sobre costos respondiste «${a.cost}»`:''}. No trataremos un costo desconocido como cero.`});
 if(list(a.otherAreas).includes('Logística'))tasks.push({key:'logistics',area:'logistics',title:'Organizar cómo llega mi oferta',tool:'summary',reason:'Elegiste preparar Logística'+(list(a.delivery).length?': '+list(a.delivery).join(', ')+'.':'.')});
 if(list(a.otherAreas).includes('Operaciones')||a.goal==='Ordenar mi operación')tasks.push({key:'process',area:'operations',title:route==='restaurant'?'Organizar mis pedidos':route==='courses'?'Organizar mi contenido educativo':'Organizar mis solicitudes',tool:route==='restaurant'?'orders':'summary',reason:'Elegiste ordenar tu atención. Empezaremos por el proceso de tu actividad, sin conectar cuentas automáticamente.'});
 if(!active){const content=tasks.findIndex(task=>task.key==='content');if(content>=0)tasks.splice(content,1);}
 if(a.goal==='Ordenar mi operación')tasks.sort((x,y)=>Number(y.key==='process')-Number(x.key==='process'));
 return tasks;
}
export function suggestedStage(a:Answers):ProjectRoute['stage']{return a.stage==='Ya tengo un negocio'?'operate':a.stage==='Vengo a explorar'?'explore':'shape';}
/** Generated task identities are deterministic within one project. Historical
 * UUIDs, edits, first completions and claims are never replaced or inferred. */
export function mergeRouteTasks(previous:AreaTasks,projectId:string,suggestions:RouteSuggestion[],accepted:string[],now=new Date().toISOString()):{tasks:AreaTasks;ids:string[];reasons:Record<string,string>}{
 const chosen=suggestions.filter(s=>accepted.includes(s.key));const existing=new Map(previous.tasks.map(t=>[t.id,t]));
 const added:AreaTask[]=[],ids:string[]=[],reasons:Record<string,string>={};
 for(const suggestion of chosen){const id=`route:${projectId}:${suggestion.key}`;ids.push(id);reasons[id]=suggestion.reason;if(!existing.has(id))added.push({id,area:suggestion.area,title:suggestion.title,tool:suggestion.tool,done:false,status:'todo',createdAt:now});}
 return {tasks:{...previous,version:2,tasks:[...previous.tasks,...added]},ids,reasons};
}
export function prepareRoutePage(name:string,route:BusinessRoute,a:Answers,proposal:Proposal):LandingDraft{
 const sectionNames=list(a.sections).filter(x=>routeOptions[route].sections.includes(x));
 const sections=sectionNames.length?sectionNames:[routeOptions[route].sections[0],'Nuestra historia','Contacto'];
 const story=meaningful(a.originCustom)?a.originCustom:'';
 return {...defaultLanding({name,industry:route,moduleType:route,objective:'',audience:'',offer:'',location:''}),template:route,presentationVersion:3,color:'#7751B8',headline:proposal.message.trim()||name,description:proposal.offering.trim(),cta:proposal.cta.trim()||'Conocer más',whatsapp:proposal.whatsapp,fields:[],bookingEnabled:false,catalogSource:'module',blocks:sections.slice(0,8).map((title,index)=>({id:`route-section-${index}`,title,body:title==='Nuestra historia'?story:''}))};
}
export function canonicalAnswer(diagnostic:Diagnostic,proposal:Proposal,key:string):string|string[]|undefined{
 if(key==='offering')return proposal.offering||diagnostic.answers[key];
 if(key==='audience')return proposal.audience||diagnostic.answers[key];
 if(key==='need')return proposal.need||diagnostic.answers[key];
 return diagnostic.answers[key];
}
