import EditorSheet from '../toolkit/EditorSheet';
import '../toolkit/professionalEditor.css';
import OrganizeMaterial from './OrganizeMaterial';
import {blankOffer} from '../proposal/model';
import {emptyProposal,parseProposal} from '../proposal/model';
import MaterialAttachments from './MaterialAttachments';
import {useEffect,useRef,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {moduleLabels,type ModuleType} from '../modules/moduleProjects';
import {persistModuleProject,loadModuleDocument,saveModuleDocument} from '../services/moduleDocuments';
import {initialTasks,parseAreaTasks} from '../pages/dashboard/areaModel';
import {useDialogFocus} from '../toolkit/useDialogFocus';
import {ButtonPrimary,ButtonSecondary,Input,Textarea} from '../components/ui/DesignSystem';
import {usePrivateDocument} from './usePrivateDocument';
import {emptyJourney,parseJourney,journeyQuestions} from './journeyModel';
export function ProjectWizard({onClose}:{onClose:()=>void}){
 const {user}=useAuth();const store=useActiveProjectsStore(),navigate=useNavigate();const dialog=useRef<HTMLFormElement>(null);const lock=useRef(false),retry=useRef<string|null>(null);
 const key=`foru-project-draft:${user!.id}`;const [draft,setDraft]=useState<{step:number;name:string;type:ModuleType|null}>(()=>{try{const d=JSON.parse(sessionStorage.getItem(key)||'null');if(d&&[0,1].includes(d.step)&&typeof d.name==='string'&&Object.hasOwn(moduleLabels,d.type))return d;}catch{}return {step:0,name:'',type:null};});
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;};},[]);
 useDialogFocus(dialog,true,()=>{if(!lock.current)onClose();});
 const patch=(v:Partial<typeof draft>)=>{const next={...draft,...v};setDraft(next);try{sessionStorage.setItem(key,JSON.stringify(next));}catch{}};
 async function create(){if(lock.current||!draft.name.trim()||!user||!draft.type)return;lock.current=true;setBusy(true);setError('');try{const id=retry.current??store.openProject({name:draft.name.trim(),industryKey:(draft.type==='restaurant'?'gastronomy':draft.type) as never,strategyProfile:{moduleType:draft.type}});retry.current=id;const project=useActiveProjectsStore.getState().getProjectById(id);if(!project)throw new Error('No pudimos preparar el proyecto.');await persistModuleProject(user.id,project);try{const tasks=await loadModuleDocument(user.id,id,'area-tasks');if(tasks)parseAreaTasks(tasks.payload);else await saveModuleDocument(user.id,id,'area-tasks',initialTasks(draft.type),null);}catch(e){throw new Error('Tu proyecto está guardado, pero su guía necesita reintento: '+(e as Error).message);}store.switchProject(id);sessionStorage.removeItem(key);navigate(`/dashboard?project=${id}&setup=1`);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 return <div className="project-modal-backdrop"><form ref={dialog} className="project-modal journey-card" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onSubmit={e=>{e.preventDefault();if(!draft.type)return;if(draft.step===0)patch({step:1});else void create();}}><ButtonSecondary type="button" disabled={busy} aria-label="Cerrar creación" onClick={onClose}>Cerrar ×</ButtonSecondary><small>Tu idea empieza aquí · {draft.step+1}/2</small><h2 id="new-project-title">{draft.step===0?'¿Qué estás construyendo?':'¿Cómo se llama tu proyecto?'}</h2><p>{draft.step===0?'Elige un punto de partida. Tu negocio puede crecer y combinar ofertas.':'Puedes cambiarlo más adelante.'}</p>{draft.step===0?<div className="journey-options">{Object.entries(moduleLabels).map(([id,title])=><ButtonSecondary key={id} type="button" aria-pressed={draft.type===id} onClick={()=>patch({type:id as ModuleType})}>{id==='ecommerce'?'Productos y servicios':title}</ButtonSecondary>)}</div>:<Input autoFocus label="Nombre del proyecto" value={draft.name} maxLength={120} disabled={Boolean(retry.current)} onChange={e=>patch({name:e.target.value})} placeholder="Tu idea, con nombre propio"/>}{error&&<p role="alert">{error}</p>}<div className="journey-actions">{draft.step>0&&<ButtonSecondary disabled={busy||Boolean(retry.current)} type="button" onClick={()=>patch({step:0})}>Atrás</ButtonSecondary>}<ButtonPrimary disabled={busy||!draft.type||(draft.step===1&&!draft.name.trim())}>{busy?'Guardando proyecto…':draft.step===0?'Continuar':retry.current?'Reintentar guardado':'Dar forma a mi proyecto'}</ButtonPrimary></div></form></div>;
}
export default function ProjectJourney({projectId}:{projectId:string}){
 const {user}=useAuth();const doc=usePrivateDocument(user!.id,projectId,'project-journey',emptyJourney,parseJourney);const proposal=usePrivateDocument(user!.id,projectId,'proposal',emptyProposal,parseProposal);const [params,setParams]=useSearchParams();const [recover,setRecover]=useState(false);const [localError,setLocalError]=useState('');const [extra,setExtra]=useState<'story'|'team'|'relationship'|null>(null);
 const open=params.get('setup')==='1';const close=()=>{const next=new URLSearchParams(params);next.delete('setup');setParams(next,{replace:true});};
 if(!open)return <div className="journey-summary"><ButtonSecondary onClick={()=>{const next=new URLSearchParams(params);next.set('setup','1');setParams(next);}}>{(Object.keys(doc.data.answers).length||proposal.data.offering||proposal.data.audience)?'Retomar las respuestas de mi proyecto':'Darle forma a mi idea'}</ButtonSecondary>{Object.entries(doc.data.answers).filter(([,v])=>v.trim()).slice(0,3).map(([k,v])=><span key={k}>✧ {v.slice(0,70)}</span>)}</div>;
 if(!doc.loaded)return <section role={doc.error?'alert':'status'}>{doc.error||'Preparando tus preguntas…'}{doc.error&&<ButtonSecondary onClick={()=>void doc.reload()}>Reintentar</ButtonSecondary>}</section>;
 const questions=doc.data.route==='brief'?journeyQuestions.filter(([key])=>['offer','audience','goal'].includes(key)):journeyQuestions;
 const step=Math.min(doc.data.step,questions.length-1),[id,title,placeholder]=questions[step];
 const commercial=id==='offer'?'offering':id==='audience'?'audience':id==='need'?'need':id==='conditions'?'conditions':null;
 const canonical=proposal.revision!==null||proposal.dirty;
 const value=commercial?(canonical?proposal.data[commercial]:doc.data.answers[id]||proposal.data[commercial]):doc.data.answers[id]||'';
 const busy=doc.busy||proposal.busy;
 const change=(value:string)=>{if(commercial)proposal.change({...proposal.data,[commercial]:value});else doc.change({...doc.data,answers:{...doc.data.answers,[id]:value}});};
 async function persist(nextStep:number,exit=false){
   setLocalError('');
   const adopt=Boolean(commercial&&!canonical&&doc.data.answers[id]);if(adopt&&commercial)proposal.change({...proposal.data,[commercial]:doc.data.answers[id].slice(0,2000)});
   if((proposal.dirty||adopt)&&!await proposal.save()){setLocalError('No se guardó tu propuesta. Conservamos tu respuesta; vuelve a intentarlo.');return;}
   const before=doc.data;doc.change({...before,step:nextStep});
   if(await doc.save()){if(exit)close();}else doc.change({...before,step});
 }
 return <section className="journey-card journey-focus" aria-label="Dar forma a mi proyecto"><div className="journey-orbit" aria-hidden="true">✦</div><small>Tu idea toma forma · {step+1}/{questions.length}</small><h2>{title}</h2><p>Una idea basta para empezar. Podrás cambiarla después.</p>
 <Textarea label="Tu respuesta" value={value} maxLength={commercial?2000:3000} disabled={busy||!proposal.loaded} placeholder={placeholder} onChange={e=>change(e.target.value)}/>
 {id==='goal'&&<div className="journey-options">{['Presentar mi negocio','Organizar mis ideas','Preparar contenido'].map(v=><ButtonSecondary key={v} disabled={busy} onClick={()=>change(v)}>{v}</ButtonSecondary>)}</div>}
 <MaterialAttachments user={user!.id} project={projectId} files={doc.data.files||[]} disabled={busy} onChange={files=>doc.change({...doc.data,files})}/>
 <OrganizeMaterial project={projectId} files={doc.data.files||[]} revision={doc.revision} proposalRevision={proposal.revision} disabled={busy||doc.dirty||proposal.dirty} onAccept={value=>{if(proposal.data.offers.length+value.offers.length>30){setLocalError('Tu propuesta admite hasta 30 ofertas. Revisa las actuales antes de añadir más.');return;}proposal.change({...proposal.data,...Object.fromEntries((['offering','audience','message','cta'] as const).filter(key=>value[key]).map(key=>[key,value[key]])),offers:[...proposal.data.offers,...value.offers.filter(o=>!proposal.data.offers.some(existing=>existing.name.trim().toLocaleLowerCase()===o.name.trim().toLocaleLowerCase())).map(o=>({...blankOffer(),name:o.name,description:o.description}))]});doc.change({...doc.data,transcript:value.transcript});}}/>
 <div className="journey-actions">{step>0&&<ButtonSecondary disabled={busy} onClick={()=>void persist(step-1)}>← Atrás</ButtonSecondary>}<ButtonPrimary disabled={busy||doc.conflict||proposal.conflict} onClick={()=>void persist(Math.min(step+1,questions.length),step===questions.length-1)}>{busy?'Guardando…':step===questions.length-1?'Ver cómo toma forma →':'Continuar →'}</ButtonPrimary><ButtonSecondary disabled={busy} onClick={()=>void persist(Math.min(step+1,questions.length),step===questions.length-1)}>Lo definiré después</ButtonSecondary></div>
 <p role={localError||doc.error||proposal.error?'alert':'status'}>{localError||doc.error||proposal.error||(busy?'Guardando tu paso…':doc.dirty||proposal.dirty?'Tu respuesta sigue aquí · pendiente de guardar':'Tu avance está guardado')}</p>
 <ButtonSecondary disabled={busy} onClick={()=>void persist(step,true)}>Ver mi mapa por ahora</ButtonSecondary>
 <details><summary>Más de mi proyecto · cuando lo necesites</summary><div className="journey-options">{([['story','Mi historia'],['team','Mi equipo'],['relationship','Cómo quiero atender']] as const).map(([key,label])=><ButtonSecondary key={key} disabled={busy} onClick={()=>setExtra(key)}>{label}</ButtonSecondary>)}</div></details>
 <EditorSheet open={extra!==null} title={extra==='team'?'¿Cómo trabajas?':extra==='story'?'Tu historia':'La experiencia de tus clientes'} onClose={()=>setExtra(null)}>{extra&&<><Textarea label="Tu respuesta" value={doc.data.answers[extra]||''} maxLength={3000} onChange={e=>doc.change({...doc.data,answers:{...doc.data.answers,[extra]:e.target.value}})}/>{extra==='team'&&<div className="journey-options">{['Lo llevo yo','Tengo un equipo','Estamos empezando'].map(value=><ButtonSecondary key={value} onClick={()=>doc.change({...doc.data,answers:{...doc.data.answers,team:value}})}>{value}</ButtonSecondary>)}</div>}<ButtonPrimary disabled={busy||doc.conflict} onClick={()=>void doc.save().then(ok=>{if(ok)setExtra(null);})}>Guardar esta parte</ButtonPrimary>{doc.error&&<p role="alert">{doc.error}</p>}</>}</EditorSheet>
 {(doc.error||proposal.error)&&<ButtonSecondary onClick={()=>setRecover(true)}>Recuperar versión guardada</ButtonSecondary>}{recover&&<div><p>Recuperar sustituirá las respuestas pendientes por la versión guardada.</p><ButtonSecondary onClick={()=>setRecover(false)}>Conservar mis cambios</ButtonSecondary><ButtonPrimary onClick={()=>void Promise.all([doc.recover(),proposal.recover()]).then(()=>setRecover(false))}>Recuperar</ButtonPrimary></div>}</section>;
}
