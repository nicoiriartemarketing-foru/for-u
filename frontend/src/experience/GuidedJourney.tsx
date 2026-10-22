import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {projectModuleType} from '../modules/moduleProjects';
import {emptyDiagnostic,parseDiagnostic,emptyProjectRoute,parseProjectRoute,type Diagnostic} from '../workspace/contracts';
import {emptyProposal,parseProposal} from '../proposal/model';
import {readableStudioDraft} from '../pages/dashboard/studioJourney';
import {useAreaDocuments} from '../pages/dashboard/AreaDocuments';
import {usePrivateDocument} from './usePrivateDocument';
import {emptyJourney,parseJourney} from './journeyModel';
import {buildQuestions,groupNames,list,selectChoice,choiceValues,normalizePriority,type Answer} from './personalizationModel';
import {canonicalAnswer,mergeRouteTasks,prepareRoutePage,routeSuggestions,suggestedStage} from './routePreparation';
import {projectRouteType,routeNames} from './GuidedProject';
import {ButtonPrimary,ButtonSecondary,Textarea} from '../components/ui/DesignSystem';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import MaterialAttachments from './MaterialAttachments';
import OrganizeMaterial from './OrganizeMaterial';
import {blankOffer} from '../proposal/model';
import './guidedProject.css';
export default function GuidedJourney({projectId}:{projectId:string}){
 const {user}=useAuth(),store=useActiveProjectsStore();const project=store.getProjectById(projectId)!;
 const businessRoute=projectRouteType(project),type=projectModuleType(project)!;
 const diagnostic=usePrivateDocument(user!.id,projectId,'project-diagnostic',()=>emptyDiagnostic(projectId,businessRoute),v=>{const parsed=parseDiagnostic(v,projectId);if(parsed.version!==2)throw new Error('Conservamos el diagnóstico anterior. Necesita una conversión explícita antes de editarse.');return parsed;});
 const proposal=usePrivateDocument(user!.id,projectId,'proposal',emptyProposal,parseProposal);
 const history=usePrivateDocument(user!.id,projectId,'project-journey',emptyJourney,parseJourney);
 const route=usePrivateDocument(user!.id,projectId,'project-route',()=>emptyProjectRoute(projectId),v=>parseProjectRoute(v,projectId));
 const page=usePrivateDocument(user!.id,projectId,'landing',()=>prepareRoutePage(project.name,businessRoute,{},emptyProposal()),v=>{if(!readableStudioDraft(v))throw new Error('Conservamos tu página anterior; su formato necesita recuperación.');return v;});
 const areas=useAreaDocuments(projectId,type),[params,setParams]=useSearchParams();
 const [custom,setCustom]=useState(false),[materialOpen,setMaterialOpen]=useState(false),[error,setError]=useState(''),[operation,setOperation]=useState(''),[chosen,setChosen]=useState<string[]|null>(null),[returnToSummary,setReturnToSummary]=useState(false),[recovery,setRecovery]=useState(false);
 const questionHeading=useRef<HTMLHeadingElement>(null);
 const lock=useRef(false),alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const busy=diagnostic.busy||proposal.busy||history.busy||route.busy||page.busy||!!operation;
 useUnsavedNavigation(diagnostic.dirty||proposal.dirty||history.dirty||!!operation);
 const commercial={offering:'offering',audience:'audience',need:'need'} as const;
 const a={...diagnostic.data.answers,offering:proposal.data.offering||diagnostic.data.answers.offering||'',audience:proposal.data.audience||diagnostic.data.answers.audience||'',need:proposal.data.need||diagnostic.data.answers.need||''};
 const questions=buildQuestions(businessRoute,a),cursor=diagnostic.data.cursor,question=questions.find(q=>q.key===cursor)??questions[0],index=questions.findIndex(q=>q.key===question.key);
 const suggestions=routeSuggestions(businessRoute,a),selected=chosen??suggestions.map(s=>s.key);
 const open=params.get('setup')==='1',summary=cursor==='review'||cursor==='prepared';
 useEffect(()=>{if(open){questionHeading.current?.focus({preventScroll:true});window.scrollTo({top:0});}},[open,question.key,summary]);
 const loaded=diagnostic.loaded&&proposal.loaded&&history.loaded&&route.loaded&&page.loaded&&!!areas.entry?.loaded;
 const problem=error||diagnostic.error||proposal.error||history.error||route.error||page.error||areas.entry?.error;
 function close(){const next=new URLSearchParams(params);next.delete('setup');next.set('view','map');setParams(next);}
 function changeAnswer(key:string,value:Answer){
  setError('');const field=commercial[key as keyof typeof commercial];
  if(field)proposal.change({...proposal.data,[field]:Array.isArray(value)?value.join(' · '):value});
  else diagnostic.change({...diagnostic.data,answers:normalizePriority({...diagnostic.data.answers,[key]:value})});
 }
 async function go(cursor:string,skip=false){
  if(lock.current)return;lock.current=true;setError('');const previous=diagnostic.data;let moved=false;
  try{
   if(proposal.dirty&&!await proposal.save())throw new Error('No se guardó la respuesta comercial. Sigue en pantalla; vuelve a intentarlo.');
   if(history.dirty&&!await history.save())throw new Error('El material sigue pendiente de guardar. Conservamos tu respuesta.');
   const answers=normalizePriority({...diagnostic.data.answers});if(skip&&question.key==='marketingStart')answers.marketingStart='Más adelante';
   diagnostic.change({...diagnostic.data,answers,cursor});moved=true;
   if(!await diagnostic.save())throw new Error('No se guardó este paso. Puedes reintentar sin volver a escribir.');
   if(alive.current){setCustom(false);setMaterialOpen(false);setChosen(null);}
  }catch(e){if(alive.current){if(moved)diagnostic.change(previous);setError((e as Error).message);}}finally{lock.current=false;}
 }
 async function prepare(){
  if(lock.current||!loaded||!areas.entry)return;lock.current=true;setError('');setOperation('Guardando tus elecciones…');
  try{
   if([diagnostic,proposal,history,route,page].some(d=>d.conflict)||areas.entry.taskStatus==='conflict')throw new Error('Hay una versión guardada en otra ventana. Revisa el conflicto antes de preparar; tus cambios se conservan.');
   if(proposal.dirty&&!await proposal.save())throw new Error('Tu propuesta necesita reintento. No se modificó tu página.');
   if(history.dirty&&!await history.save())throw new Error('Tu material necesita reintento. No se modificó tu página.');
   if(diagnostic.dirty&&!await diagnostic.save())throw new Error('Tus respuestas necesitan reintento.');
   const merged=mergeRouteTasks(areas.entry.tasks,projectId,suggestions,selected);
   if(JSON.stringify(merged.tasks)!==JSON.stringify(areas.entry.tasks)){setOperation('Guardando los pasos que elegiste…');areas.change({tasks:merged.tasks});if(!await areas.save())throw new Error('No se guardaron tus pasos. Siguen pendientes; reintenta para continuar.');}
   if(!page.revision){setOperation('Preparando la estructura de tu página…');page.change(prepareRoutePage(project.name,businessRoute,a,proposal.data));if(!await page.save())throw new Error('Tus pasos están guardados. Falta guardar la página; reintenta para continuar.');}
   setOperation('Conectando tu ruta y tu mapa…');route.change({...route.data,stage:suggestedStage(a),diagnosticRevision:diagnostic.revision,taskIds:merged.ids,reasons:merged.reasons});if(!await route.save())throw new Error('Tu página y tus pasos están guardados. Falta conectar la ruta; el reintento no los duplicará.');
   diagnostic.change({...diagnostic.data,cursor:'prepared'});if(!await diagnostic.save())throw new Error('Tu espacio está preparado. Falta guardar el punto donde retomarás.');
  }catch(e){if(alive.current)setError((e as Error).message);}finally{lock.current=false;if(alive.current)setOperation('');}
 }
 if(!open)return <div className="guide-resume"><span aria-hidden="true">⛵</span><div><strong>{route.revision?'Tu ruta, a tu manera':'Antes de hacer, encontraremos tu rumbo.'}</strong><p>{route.revision?'Puedes ajustar tus elecciones sin borrar lo que ya creaste.':'Una pregunta a la vez. Puedes explorar o crear directamente.'}</p></div><Link to={`/dashboard?project=${projectId}&setup=1`}>{route.revision?'Ajustar mi ruta':'Preparar mi ruta'} →</Link></div>;
 if(!loaded)return <section className="guided-session" role={problem?'alert':'status'}><p>{problem||'Abriendo tu ruta guardada…'}</p>{problem&&<ButtonSecondary onClick={()=>{void diagnostic.reload();void proposal.reload();void history.reload();void route.reload();void page.reload();void areas.reload();}}>Reintentar lectura</ButtonSecondary>}<ButtonSecondary onClick={close}>Volver a mi mapa</ButtonSecondary></section>;
 const current=canonicalAnswer(diagnostic.data,proposal.data,question.key),values=choiceValues(question,current);
 const answered=questions.filter(q=>list(a[q.key]).length);
 const essentials=new Set(['stage','offering','audience','needs','goal']);
 const facts=(items:typeof questions)=><div className="guide-facts">{items.map(q=><button key={q.key} onClick={()=>edit(q.key)} disabled={busy}><small>{q.group==='project'?'Tu barco':groupNames[q.group]}</small>{list(a[q.key]).join(' · ')} <span aria-hidden="true">✎</span></button>)}</div>;
 const edit=(key:string)=>{diagnostic.change({...diagnostic.data,cursor:key});setReturnToSummary(true);setCustom(false);};
 return <section className="guided-session" aria-label="Preparar mi ruta"><header className="guide-session-top"><ButtonSecondary disabled={busy} onClick={close}>← Continuar después</ButtonSecondary><Link to={`/dashboard/tools/landing?project=${projectId}`}>Crear manualmente ↗</Link></header>
 {summary?<div className="guide-summary"><small>{routeNames[businessRoute]} · {project.name}</small><h1>{cursor==='prepared'?'Tu espacio ya tiene un rumbo.':'Esto entendimos de ti.'}</h1><p>{cursor==='prepared'?'Lo que elegiste ya está guardado. Ahora puedes tocar, cambiar y hacer tuyo el resultado.':'Revisa tus elecciones. Ninguna te obliga a seguir un camino ni publica algo en tu nombre.'}</p>
 {facts(answered.filter(q=>essentials.has(q.key)))}{answered.some(q=>!essentials.has(q.key))&&<details><summary>Revisar mis otras elecciones</summary>{facts(answered.filter(q=>!essentials.has(q.key)))}</details>}{cursor!=='prepared'&&questions.some(q=>!list(a[q.key]).length)&&<ButtonSecondary disabled={busy} onClick={()=>void go(questions.find(q=>!list(a[q.key]).length)!.key)}>Seguir explorando mis opciones →</ButtonSecondary>}
 {cursor==='prepared'?<div className="guide-prepared"><strong>{project.name}</strong><ul><li>{page.revision?'Tu página tiene un borrador editable.':'Tu página está pendiente de guardar.'}</li><li>{route.data.taskIds.length} pasos elegidos, con su motivo.</li><li>Mapa, Kanban y Calendario comparten el mismo trabajo.</li></ul><div className="guide-summary-actions"><Link to={`/dashboard/tools/landing?project=${projectId}&tour=1`}>Hacer mía mi página ↗</Link><Link to={`/dashboard?project=${projectId}&view=map`}>Ver mi mapa →</Link></div></div>:<><h2>Un comienzo que tiene sentido para ti</h2><p>{page.revision?'Tu página existente se conservará. No reemplazaremos sus textos, fotos ni secciones.':'Prepararemos una estructura de '+routeNames[businessRoute].toLocaleLowerCase()+', sin inventar productos, precios ni historias.'}</p><div className="guide-result-list" role="group" aria-label="Pasos que quiero preparar">{suggestions.map(s=><label key={s.key}><input type="checkbox" checked={selected.includes(s.key)} disabled={busy} onChange={e=>setChosen(e.target.checked?[...selected,s.key]:selected.filter(k=>k!==s.key))}/><span><strong>{s.title}</strong><p>{s.reason}</p></span></label>)}</div><ButtonPrimary disabled={busy} onClick={()=>void prepare()}>{operation||'Preparar mi espacio →'}</ButtonPrimary><p className="guide-save-note">La composición se prepara con reglas. No consume IA ni publica tu página.</p></>}
 </div>:<><div className="guide-steps" aria-label={`Paso ${index+1} de ${questions.length}`}><span style={{width:`${(index+1)/questions.length*100}%`}}/></div><p className="guide-group-name">{groupNames[question.group]} {question.multi?'· Puedes elegir varias':''}</p><div className="guided-question"><span className="guide-question-symbol" aria-hidden="true">{question.group==='marketing'?'✦':question.group==='other'?'⌁':'⛵'}</span><h1 ref={questionHeading} tabIndex={-1} id="guide-question-title">{question.title}</h1><p>{question.why}</p>
 {question.options?<div className="guide-options" aria-labelledby="guide-question-title">{question.options.map((value,i)=><button type="button" key={value} disabled={busy} className={values.includes(value)?'is-selected':''} aria-pressed={values.includes(value)} onClick={()=>changeAnswer(question.key,selectChoice(question,values,value))}><span aria-hidden="true">{values.includes(value)?'✓':['◌','✧','⌁','◇'][i%4]}</span>{value}</button>)}</div>:<Textarea label={question.text||'Tu respuesta'} value={typeof current==='string'?current:''} maxLength={2000} disabled={busy} onChange={e=>changeAnswer(question.key,e.target.value)}/>}
 {question.custom&&<div className="guide-custom"><ButtonSecondary disabled={busy} aria-expanded={custom} onClick={()=>setCustom(!custom)}>{custom?'Cerrar texto libre':'✎ '+question.custom}</ButtonSecondary>{custom&&<Textarea label="Tu respuesta, con tus palabras" maxLength={2000} disabled={busy} value={commercial[question.key as keyof typeof commercial]?proposal.data[commercial[question.key as keyof typeof commercial]]:String(diagnostic.data.answers[question.customKey||question.key+'Custom']||'')} onChange={e=>changeAnswer(commercial[question.key as keyof typeof commercial]?question.key:question.customKey||question.key+'Custom',e.target.value)}/>}</div>}
 <p className="guide-answer-note">{values.length?'Tu elección se guarda al continuar. Siempre puedes cambiarla.':'Puedes elegir, responder con tus palabras o dejarlo para después.'}</p>
 <div className="guide-question-actions">{index>0&&<ButtonSecondary disabled={busy} onClick={()=>void go(questions[index-1].key)}>← Atrás</ButtonSecondary>}<ButtonPrimary disabled={busy} onClick={()=>{const next=returnToSummary?'review':questions[index+1]?.key||'review';setReturnToSummary(false);void go(next);}}>{busy?'Guardando…':returnToSummary?'Guardar y volver al resumen':index===questions.length-1?'Revisar mi ruta →':'Continuar →'}</ButtonPrimary><ButtonSecondary disabled={busy} onClick={()=>void go(question.key==='marketingStart'?buildQuestions(businessRoute,{...a,marketingStart:'Más adelante'}).find(q=>q.key==='sections')!.key:questions[index+1]?.key||'review',true)}>Omitir</ButtonSecondary></div>
 <ButtonSecondary disabled={busy} onClick={()=>void go('review')}>Revisar lo que ya elegí</ButtonSecondary>
 <div className="guide-custom"><ButtonSecondary disabled={busy} aria-expanded={materialOpen} onClick={()=>setMaterialOpen(!materialOpen)}>◉ Prefiero contar mi respuesta</ButtonSecondary>{materialOpen&&<><MaterialAttachments user={user!.id} project={projectId} files={history.data.files||[]} disabled={busy} onChange={files=>history.change({...history.data,files})}/><OrganizeMaterial project={projectId} files={history.data.files||[]} revision={history.revision} proposalRevision={proposal.revision} disabled={busy||history.dirty||proposal.dirty} onAccept={value=>{if(proposal.data.offers.length+value.offers.length>30){setError('Puedes conservar hasta 30 ofertas. Revisa las actuales antes de añadir otras.');return;}proposal.change({...proposal.data,...Object.fromEntries((['offering','audience','message','cta'] as const).filter(k=>value[k]).map(k=>[k,value[k]])),offers:[...proposal.data.offers,...value.offers.filter(o=>!proposal.data.offers.some(x=>x.name.trim().toLowerCase()===o.name.trim().toLowerCase())).map(o=>({...blankOffer(),name:o.name,description:o.description}))]});history.change({...history.data,transcript:value.transcript});}}/></>}</div>
 </div></>}
 {problem&&<p role="alert" className="guide-error">{problem}</p>}{!problem&&busy&&<p role="status" className="guide-save-note">{operation||'Guardando tu paso…'}</p>}
 {problem&&<ButtonSecondary disabled={busy} onClick={()=>setRecovery(true)}>Revisar recuperación</ButtonSecondary>}{recovery&&<section className="guide-error"><p>¿Recuperar la versión guardada? Sustituirá los cambios pendientes de esta ruta y propuesta.</p><ButtonSecondary onClick={()=>setRecovery(false)}>Conservar mis cambios</ButtonSecondary><ButtonPrimary disabled={busy} onClick={()=>void Promise.all([diagnostic.recover(),proposal.recover(),history.recover(),route.recover(),page.recover(),areas.recover()]).then(()=>{setRecovery(false);setError('');})}>Recuperar versión guardada</ButtonPrimary></section>}
 </section>;
}
