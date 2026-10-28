import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyCampaigns,parseCampaigns} from '../workspace/contracts';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
import {pillarSuggestions,type BrandProfile} from '../experience/brandProfile';
import {readIdeaDraft,writeIdeaDraft} from './ideaDrafts';
import {firstContentSource,intentions,type Intent,type CreativeSource} from './model';
import StudioCanvas from './StudioCanvas';
export default function StudioComposer({sources,onBusy,brand}:{brand?:BrandProfile;sources:CreativeSource[];onBusy:(value:boolean)=>void}){
 const {projectId,userId,business}=useToolkit(),[params,setParams]=useSearchParams();
 const campaigns=usePrivateDocument(userId,projectId,'campaigns',()=>emptyCampaigns(projectId),value=>parseCampaigns(value,projectId));
 const campaign=campaigns.data.campaigns.find(row=>row.id===params.get('campaign'));
 const requestedIntent=intentions.some(row=>row.id===params.get('intent'))?params.get('intent') as Intent:'awareness';
 const suggested=pillarSuggestions[business.route||'services'];
 const incoming=brand?.pillars.includes(params.get('pillar')||'')?params.get('pillar')!:suggested.includes(params.get('topic')||'')?params.get('topic')!:'';
 const notes=brand?.pillarDetails?.find(row=>row.name===incoming)?.notes||'';
 const themes=brand?.pillars.length?brand.pillars.slice(0,3):suggested.slice(0,3);
 const fromLanding=params.get('from')==='landing';
 const linked=fromLanding?firstContentSource(sources,campaign?.intent||requestedIntent,params.get('section')||undefined,params.get('offer')||undefined):undefined;
 const [step,setStep]=useState<'topic'|'source'|'canvas'>(incoming||params.get('compose')==='idea'||linked?'canvas':fromLanding?'source':'topic'),[pillar,setPillar]=useState(incoming),[source,setSource]=useState<CreativeSource|null>(linked||null),[idea,setIdea]=useState(()=>readIdeaDraft(sessionStorage,userId,projectId,incoming,notes)),[selected,setSelected]=useState<CreativeSource|null>(null);
 useEffect(()=>{if(fromLanding){setSource(linked||null);if(linked)setIdea([linked.title,linked.body].filter(Boolean).join('\n\n'));setStep(linked?'canvas':'source');}else if(incoming||params.get('compose')==='idea'){setPillar(incoming);setIdea(readIdeaDraft(sessionStorage,userId,projectId,incoming,notes));setSource(null);setStep('canvas');}},[incoming,params.get('compose'),params.get('section'),params.get('offer'),params.get('pageRevision')]);
 function editIdea(value:string){setIdea(value);writeIdeaDraft(sessionStorage,userId,projectId,pillar,value);}
 function openIdea(theme:string){setPillar(theme);setSource(null);setIdea(readIdeaDraft(sessionStorage,userId,projectId,theme,brand?.pillarDetails?.find(row=>row.name===theme)?.notes||''));setStep('canvas');const next=new URLSearchParams(params);next.set('compose','idea');next.delete('topic');next.delete('pillar');if(brand?.pillars.includes(theme))next.set('pillar',theme);else if(theme)next.set('topic',theme);setParams(next,{replace:true});}
 const mainIndex=/^[012]$/.test(params.get('pin')||'')?Number(params.get('pin')):undefined;
 if(!campaigns.loaded)return <p role="status">Abriendo tu espacio creativo…</p>;
 if(campaigns.error)return <section role="alert"><p>{campaigns.error}</p><ButtonSecondary onClick={()=>void campaigns.reload()}>Reintentar</ButtonSecondary></section>;
 if(params.get('campaign')&&!campaign)return <p role="alert">Esta campaña no está disponible en este proyecto. Tu contenido sigue guardado.</p>;
 if(step==='canvas')return <StudioCanvas key={projectId+':'+pillar+':'+(source?.key||'idea')} idea={idea} onIdea={editIdea} pillar={pillar} brand={brand} source={source} campaign={campaign} mainIndex={mainIndex} onBack={()=>setStep('topic')} onBusy={onBusy}/>;
 return <section className="studio-flow"><header className="studio-flow-trail"><small>{campaign?.title||'TU PRÓXIMO CONTENIDO'}</small></header><h1>{step==='topic'?'¿Sobre qué quieres hablar?':'¿Qué quieres llevar a tu post?'}</h1>{step==='topic'?<><p>Elige un tema o empieza con una idea libre.</p><div className="studio-topic-bars">{themes.map((theme,index)=><button type="button" key={theme} aria-pressed={pillar===theme} onClick={()=>setPillar(theme)}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><strong>{theme}</strong></button>)}{themes.length<3&&<button type="button" onClick={()=>openIdea('')}><span aria-hidden="true">03</span><strong>Tengo otro tema</strong></button>}</div><ButtonPrimary disabled={!pillar} onClick={()=>openIdea(pillar)}>Continuar</ButtonPrimary><button type="button" className="studio-quiet-action" onClick={()=>openIdea('')}>Prefiero contar una idea libre</button><details className="studio-quiet-context"><summary>Ajustar mis temas</summary><Link className="studio-quiet-action" to={`/creator-studio?project=${projectId}&start=pillars`}>Abrir mis pilares →</Link></details><details className="studio-quiet-context"><summary>Usar algo que ya preparé</summary><ButtonSecondary onClick={()=>setStep('source')}>Elegir una oferta o sección de mi página →</ButtonSecondary></details></>:<><p>Lo que ya definiste puede ser tu punto de partida.</p><div className="studio-source-list">{sources.map(item=><button type="button" key={item.key} aria-pressed={selected?.key===item.key} onClick={()=>setSelected(item)}><strong>{item.title}</strong><span>{item.body.slice(0,100)}</span></button>)}</div><ButtonPrimary disabled={!selected} onClick={()=>{if(!selected)return;setSource(selected);setIdea([selected.title,selected.body].filter(Boolean).join('\n\n'));setStep('canvas');}}>Continuar</ButtonPrimary><button type="button" className="studio-quiet-action" onClick={()=>openIdea('')}>Prefiero escribir mi idea</button></>}</section>;
}
