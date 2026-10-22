import {landingOrigin} from './navigation';
import {useEffect,useRef,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyCampaigns,parseCampaigns} from '../workspace/contracts';
import {ButtonPrimary,ButtonSecondary,Textarea} from '../components/ui/DesignSystem';
import {type ContentDraft} from '../components/shared/contentModel';
import DesignThumbnail from '../experience/DesignThumbnail';
import {intentions,compositionOptions,type Intent,type CreativeSource} from './model';
import {saveComposition} from './saveComposition';
export default function StudioComposer({sources,onBusy}:{sources:CreativeSource[];onBusy:(value:boolean)=>void}){
 const {projectId,userId,business}=useToolkit(),navigate=useNavigate(),[params]=useSearchParams();
 const campaigns=usePrivateDocument(userId,projectId,'campaigns',()=>emptyCampaigns(projectId),v=>parseCampaigns(v,projectId));
 const campaign=params.get('campaign')?campaigns.data.campaigns.find(c=>c.id===params.get('campaign')):undefined;
 const [step,setStep]=useState<'intent'|'source'|'idea'|'format'|'result'>('intent'),[intent,setIntent]=useState<Intent>('awareness'),[source,setSource]=useState<CreativeSource|null>(null),[idea,setIdea]=useState(()=>{try{return sessionStorage.getItem(`foru:studio-idea:${userId}:${projectId}`)||'';}catch{return '';}}),[results,setResults]=useState<ContentDraft[]>([]),[selected,setSelected]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{try{if(idea)sessionStorage.setItem(`foru:studio-idea:${userId}:${projectId}`,idea);else sessionStorage.removeItem(`foru:studio-idea:${userId}:${projectId}`);}catch{}},[idea,userId,projectId]);
 const mainIndex=/^[012]$/.test(params.get('pin')||'')?Number(params.get('pin')):undefined;
 const heading=useRef<HTMLHeadingElement>(null),locked=useRef(false),live=useRef(true);
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 useEffect(()=>{heading.current?.focus();setError('');},[step]);
 useEffect(()=>{onBusy(busy);return()=>onBusy(false);},[busy]);
 useEffect(()=>{if(campaign){setIntent(campaign.intent);setStep('source');}},[campaign?.id]);
 const fromSection=params.get('section')?sources.find(s=>s.reference?.kind==='page'&&s.reference.id===params.get('section')):undefined;
 useEffect(()=>{const requested=params.get('intent');if(!campaign&&intentions.some(i=>i.id===requested)){setIntent(requested as Intent);if(fromSection&&requested!=='offer'){setSource(fromSection);setStep('format');}else setStep('source');}},[params.get('intent'),fromSection?.key]);
 function chooseIntent(value:Intent){setIntent(value);if(fromSection){setSource(fromSection);setStep('format');}else setStep('source');}
 function prepare(format:ContentDraft['format']){if(!source)return;try{setResults(compositionOptions(source,intent,format,projectId,userId,business.name,campaign).map(d=>({...d,creative:d.creative?{...d.creative,origin:landingOrigin(params,projectId)}:undefined})));setSelected(0);setStep('result');}catch(e){setError((e as Error).message);}}
 async function store(){if(locked.current||!results[selected])return;locked.current=true;setBusy(true);setError('');try{await saveComposition(userId,projectId,results[selected],setStatus,undefined,mainIndex);if(live.current)navigate(`/content-creator?project=${projectId}&design=${results[selected].id}${mainIndex!==undefined?'&return=profile':''}`);}catch(e){if(live.current)setError((e as Error).message);}finally{locked.current=false;if(live.current){setBusy(false);setStatus('');}}}
 const activeIntent=intentions.find(i=>i.id===intent)!;
 const matches=sources.filter(s=>(intent!=='offer'||s.group==='offer'||s.group==='proposal')&&(!query||[s.title,s.body].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
 if(!campaigns.loaded)return <p role="status">Abriendo tu espacio creativo…</p>;
 if(campaigns.error)return <section role="alert"><p>{campaigns.error}</p><ButtonSecondary onClick={()=>void campaigns.reload()}>Reintentar</ButtonSecondary></section>;
 if(params.get('campaign')&&!campaign)return <section role="alert"><p>Esta campaña no está disponible en este proyecto.</p><ButtonSecondary onClick={()=>navigate(`/creator-studio?project=${projectId}&tab=campaigns`)}>Volver a mis campañas</ButtonSecondary></section>;
 return <section className="studio-flow" aria-busy={busy}>
 <header className="studio-flow-trail">{step!=='intent'&&<ButtonSecondary disabled={busy} onClick={()=>{if(campaign&&step==='source')navigate(`/creator-studio?project=${projectId}&tab=campaigns`);else setStep(step==='result'?'format':step==='format'?fromSection?'intent':'source':campaign?'source':'intent');}}>← Atrás</ButtonSecondary>}<small>{campaign?campaign.title:step==='intent'?'UNA IDEA, UN PASO':activeIntent.title}</small></header>
 <h2 ref={heading} tabIndex={-1}>{({intent:'¿Qué quieres conseguir con este contenido?',source:'¿Qué quieres compartir?',idea:'Cuéntame tu idea.',format:'¿Dónde lo vas a compartir?',result:'Tu idea, en tres formas.'})[step]}</h2>
 {step==='intent'&&<><p>Elige lo que necesitas hoy. Después veremos cómo darle forma.</p><div className="studio-answer-grid">{intentions.map(item=><button key={item.id} type="button" onClick={()=>chooseIntent(item.id)}><span aria-hidden="true">{item.icon}</span><strong>{item.title}</strong><small>{item.hint}</small></button>)}</div></>}
 {step==='source'&&<><p>Usa lo que ya definiste o empieza con una idea. No necesitas fotos.</p>{sources.length>6&&<input className="studio-source-search" aria-label="Buscar en mis ofertas y secciones" placeholder="Buscar una oferta o sección…" value={query} onChange={e=>setQuery(e.target.value)}/>}<div className="studio-source-list">{matches.slice(0,query?30:6).map(item=><button key={item.key} onClick={()=>{setSource(item);setStep('format');}}><small>{item.group==='offer'?'TU OFERTA':item.group==='page'?'DE TU PÁGINA':'TU PROPUESTA'}</small><strong>{item.title}</strong><span>{item.body.slice(0,110)}</span><i aria-hidden="true">→</i></button>)}<button className="studio-own-idea" onClick={()=>setStep('idea')}><small>CON TUS PALABRAS</small><strong>Una idea propia</strong><span>Escribe lo que tienes en mente.</span><i aria-hidden="true">＋</i></button></div>{matches.length===0&&<p>No hay ofertas guardadas para este objetivo. Puedes empezar con tus palabras y preparar la oferta después.</p>}</>}
 {step==='idea'&&<><p>Una frase es suficiente para empezar. El diseño usará tus palabras.</p><Textarea label="Mi idea" value={idea} maxLength={2000} onChange={e=>setIdea(e.target.value)}/><ButtonPrimary disabled={!idea.trim()} onClick={()=>{setSource({key:'idea',title:idea.trim().split('\n')[0].slice(0,160),body:idea.trim().slice(Math.min(160,idea.trim().split('\n')[0].length)).trim(),image:'',cta:'',reference:null,group:'idea'});setStep('format');}}>Darle forma →</ButtonPrimary></>}
 {step==='format'&&<><p>El texto y las fotos seguirán siendo editables.</p><div className="studio-answer-grid studio-formats">{([{id:'portrait',title:'Publicación vertical',hint:'Para el feed · 4:5',symbol:'▯'},{id:'post',title:'Publicación cuadrada',hint:'Para el feed · 1:1',symbol:'□'},{id:'story',title:'Historia',hint:'Pantalla completa · 9:16',symbol:'▯'}] as const).map(item=><button key={item.id} onClick={()=>prepare(item.id)}><span aria-hidden="true">{item.symbol}</span><strong>{item.title}</strong><small>{item.hint}</small></button>)}</div></>}
 {step==='result'&&<><p>Elige una para hacerla tuya. Estas composiciones usan tus recursos; no consumen IA.</p><div className="studio-proposals" role="group" aria-label="Propuestas de composición">{results.map((draft,i)=><button key={draft.id} disabled={busy} aria-pressed={selected===i} onClick={()=>setSelected(i)}><DesignThumbnail draft={draft} user={userId} project={projectId}/><span>{['Editorial','Mensaje protagonista','Contraste suave'][i]}{selected===i?' · Elegida':''}</span></button>)}</div><ButtonPrimary disabled={busy} onClick={()=>void store()}>{busy?status||'Guardando…':mainIndex!==undefined?'Crear y añadir a mi perfil →':'Editar esta propuesta →'}</ButtonPrimary><small className="studio-flow-note">{mainIndex!==undefined?'Se guardará en el espacio elegido de tu perfil y en tu biblioteca. Nada se publica.':'Se guardará en tu biblioteca, con su texto y espacio para guion. Nada se publica.'}</small></>}
 {error&&<p className="studio-error" role="alert">{error}</p>}
 </section>;
}
