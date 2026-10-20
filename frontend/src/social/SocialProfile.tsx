import PieceWorkspace from './PieceWorkspace';
import {blankContent,saveContentDraft,type ContentDocument,type ContentDraft} from '../components/shared/contentModel';
import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useToolkit } from '../toolkit/ToolkitContext';
import { ButtonPrimary, ButtonSecondary, Input, Textarea, Select } from '../components/ui/DesignSystem';
import ProjectImage from '../components/shared/ProjectImage';
import ProjectImageField from '../components/shared/ProjectImageField';
import { resolveMediaPath } from '../components/shared/mediaStorage';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { emptySocial, newPiece, parseSocial, changePiece, type SocialDocument, type Piece } from './model';
import '../proposal/proposal.css';
import './social.css';
export default function SocialProfile(){const t=useToolkit();try {const initial=t.docs['module-social-profile']===undefined?emptySocial(t.projectId):parseSocial(t.docs['module-social-profile'],t.projectId,t.userId);return <Session initial={initial}/>;}catch(e){return <section role="alert"><p>{(e as Error).message}</p><ButtonSecondary onClick={()=>void t.reload()}>Reintentar carga</ButtonSecondary></section>;}}
function Session({initial}:{initial:SocialDocument}){
 const {userId,projectId,docs,save,reload,documentRevision}=useToolkit();const [params,setParams]=useSearchParams();
 const [data,setData]=useState(initial),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[recover,setRecover]=useState(false),[overview,setOverview]=useState(false);const lock=useRef(false);
 const initialDesign=docs['module-content-creator'] as ContentDocument|undefined;
 const designCompatible=!initialDesign||(initialDesign.version===1&&Array.isArray(initialDesign.drafts)&&initialDesign.drafts.every(d=>d.projectId===projectId));
 const [designs,setDesigns]=useState<ContentDocument>(designCompatible&&initialDesign?initialDesign:{version:1,drafts:[]});const [designDirty,setDesignDirty]=useState(false);
 const selected=params.get('piece');const piece=data.pieces.find(p=>p.id===selected);useUnsavedNavigation(dirty||designDirty||busy);
 const patch=(value:Partial<SocialDocument>)=>{setData(d=>({...d,...value}));setDirty(true);setError('');setNotice('');};
 const edit=(value:Partial<Piece>)=>{if(piece&&!lock.current){setData(d=>changePiece(d,piece.id,value));setDirty(true);setError('');setNotice('');}};
 async function store(){
  if(lock.current)return;
  lock.current=true;setBusy(true);setError('');let designSaved=false;
  try{
   const profile=parseSocial(data,projectId,userId);
   if(designDirty){await save('module-content-creator',canvas?saveContentDraft(designs,canvas,projectId):designs);designSaved=true;setDesignDirty(false);}
   await save('module-social-profile',profile);setDirty(false);setNotice('Pieza guardada. Instagram no cambió.');
  }catch(e){setError((designSaved?'El diseño se guardó; el texto y guion siguen pendientes. ':'')+(e as Error).message);}
  finally{lock.current=false;setBusy(false);}
 }

 function open(id:string){setOverview(false);const p=new URLSearchParams(params);p.set('piece',id);setParams(p);}
 function add(main:boolean){if(data.pieces.length>=100){setError('Este proyecto admite hasta 100 piezas.');return;}const p=newPiece();patch({pieces:[...data.pieces,p],main:main?[...data.main,p.id]:data.main});open(p.id);}

 if(!designCompatible)return <section role="alert"><p>El diseño guardado no es compatible. No lo reemplazamos.</p><ButtonSecondary onClick={()=>void reload()}>Reintentar carga</ButtonSecondary></section>;
 const savedDesign=piece?designs.drafts.find(d=>d.id===piece.id):undefined;
 const canvas=piece?savedDesign??{...blankContent(projectId),id:piece.id,title:piece.title,subtitle:'',caption:piece.text,imagePath:piece.files.find(f=>/\.(jpe?g|png|webp)$/i.test(f.path))?.path||'',background:'#EDE7F7',foreground:'#24232A'}:null;
 function editDesign(patch:Partial<ContentDraft>){if(!canvas||lock.current)return;const next={...canvas,...patch};setDesigns(current=>({...current,drafts:current.drafts.some(d=>d.id===next.id)?current.drafts.map(d=>d.id===next.id?next:d):[...current.drafts,next]}));setDesignDirty(true);setError('');}
 if(piece&&canvas&&!overview)return <><PieceWorkspace key={piece.id} piece={piece} design={canvas} user={userId} project={projectId} dirty={dirty||designDirty} busy={busy} error={error} status={notice} revision={documentRevision('module-social-profile')} onEdit={edit} onDesign={editDesign} onSave={()=>void store()} onBack={()=>{const next=new URLSearchParams(params);next.delete('piece');setParams(next);}} onRecover={()=>setRecover(true)}/>{recover&&<section role="alert"><p>Recuperar sustituirá las ediciones pendientes por la versión guardada.</p><ButtonSecondary onClick={()=>setRecover(false)}>Conservar cambios</ButtonSecondary><ButtonPrimary onClick={()=>void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}</>;
 return <section className="proposal-page social-profile"><header><span className="proposal-kicker">MI PERFIL · PLANIFICACIÓN</span><h2>{piece?'Tu pieza, paso a paso':'Primero tu perfil. Después tus ideas.'}</h2><p>{piece?'Diseño, texto y guion del mismo contenido. Guardar no publica en Instagram.':'Maqueta para preparar Instagram. Guardar aquí no modifica tu cuenta ni publica contenido.'}</p>{piece&&<ButtonSecondary onClick={()=>setOverview(value=>!value)}>{overview?'Volver a enfocar esta pieza':'Ver mi perfil y otras piezas'}</ButtonSecondary>}</header><div hidden={Boolean(piece&&!overview)}>
 <fieldset disabled={busy} className="proposal-fields"><h2>Mi perfil</h2><section aria-label="Maqueta del perfil" className="social-mock"><ProjectImage value={data.photo} alt="Maqueta de foto del perfil"/><div><strong>{data.name||'Tu nombre de perfil'}</strong><p style={{whiteSpace:'pre-wrap'}}>{data.bio||'Tu biografía aparecerá aquí'}</p><span>{data.link||'Tu enlace'}</span><small>Vista de planificación · no conectada a Instagram</small></div></section><details><summary>Editar foto, nombre, biografía y enlace</summary><ProjectImageField label="Foto del perfil" value={data.photo} onChange={photo=>patch({photo})}/><Input label="Nombre del perfil" maxLength={120} value={data.name} onChange={e=>patch({name:e.target.value})}/><Textarea label="Biografía" maxLength={2000} value={data.bio} onChange={e=>patch({bio:e.target.value})}/><Input label="Enlace del perfil" value={data.link} onChange={e=>patch({link:e.target.value})}/></details><h3>Historias destacadas</h3><div className="proposal-offer-grid">{data.highlights.map(h=><article className="social-highlight" key={h.id}><ProjectImage value={h.cover} alt={h.title}/><strong>{h.title||'Tu destacado'}</strong><details><summary>Editar destacado</summary><Input label="Nombre del destacado" maxLength={80} value={h.title} onChange={e=>patch({highlights:data.highlights.map(i=>i.id===h.id?{...i,title:e.target.value}:i)})}/><ProjectImageField label="Portada del destacado" value={h.cover} onChange={cover=>patch({highlights:data.highlights.map(i=>i.id===h.id?{...i,cover}:i)})}/><ButtonSecondary onClick={()=>patch({highlights:data.highlights.filter(i=>i.id!==h.id)})}>Quitar destacado</ButtonSecondary></details></article>)}</div><ButtonSecondary disabled={data.highlights.length>=20} onClick={()=>patch({highlights:[...data.highlights,{id:crypto.randomUUID(),title:'',cover:''}]})}>Añadir destacado</ButtonSecondary>
 <h3>Mis tres publicaciones principales</h3><div className="proposal-offer-grid">{[0,1,2].map(i=>{const p=data.pieces.find(p=>p.id===data.main[i]);return <article className="proposal-offer" key={i}><strong>{i+1}. {p?.title||'Tu siguiente publicación'}</strong>{p?<><p>{p.text}</p><ButtonSecondary onClick={()=>open(p.id)}>Editar publicación {i+1}</ButtonSecondary><ButtonSecondary onClick={()=>patch({main:data.main.filter(id=>id!==p.id)})}>Pasar a contenido orgánico</ButtonSecondary>{i>0&&<ButtonSecondary onClick={()=>{const main=[...data.main];[main[i-1],main[i]]=[main[i],main[i-1]];patch({main});}}>Mover antes</ButtonSecondary>}</>:<ButtonSecondary onClick={()=>add(true)}>Crear publicación principal</ButtonSecondary>}</article>;})}</div></fieldset>
 <section className="proposal-fields"><h2>Después: contenido orgánico</h2><p>Ideas y publicaciones para continuar después de ordenar tu perfil.</p><ButtonSecondary disabled={busy} onClick={()=>add(false)}>Añadir pieza orgánica</ButtonSecondary>{data.pieces.filter(p=>!data.main.includes(p.id)).map(p=><ButtonSecondary key={p.id} onClick={()=>open(p.id)}>{p.title||'Pieza sin título'} · {p.date||'Sin fecha'}</ButtonSecondary>)}</section>
 </div>{selected&&!piece&&<p role="alert">Esta pieza no existe en el proyecto. Elige una publicación de la maqueta.</p>}

 <details className="piece-work-section"><summary>Biblioteca de este proyecto por pieza</summary><section className="proposal-fields">{data.pieces.filter(p=>p.files.length).map(p=><div key={p.id}><ButtonSecondary onClick={()=>open(p.id)}>{p.title||'Pieza sin título'} · {p.files.length} archivos</ButtonSecondary><p>{p.files.map(f=>f.name).join(' · ')}</p></div>)}<Link className="pe-action-link" to={'/dashboard/tools/images?project='+projectId}>Abrir fotos del proyecto →</Link></section></details>
 <ButtonPrimary disabled={busy||!dirty} onClick={()=>void store()}>{busy?'Guardando…':'Guardar perfil y piezas'}</ButtonPrimary><p role={error?'alert':'status'}>{error||(busy?'Guardando perfil y piezas…':dirty?'Cambios pendientes de guardar.':notice||'Perfil cargado.')}</p>{error&&<ButtonSecondary onClick={()=>setRecover(true)}>Recuperar versión guardada</ButtonSecondary>}{recover&&<section><p>Recuperar descartará las ediciones pendientes de este perfil y sus piezas.</p><ButtonSecondary onClick={()=>setRecover(false)}>Conservar cambios</ButtonSecondary><ButtonPrimary onClick={()=>void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}
 </section>;
}
