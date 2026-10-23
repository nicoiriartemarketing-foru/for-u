import {useSavedNavigation} from '../lib/useSavedNavigation';
import {useLocation} from 'react-router-dom';
import ProfileOverview from './ProfileOverview';
import PieceWorkspace from './PieceWorkspace';
import {blankContent,saveContentDraft,type ContentDocument,type ContentDraft} from '../components/shared/contentModel';
import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToolkit } from '../toolkit/ToolkitContext';
import { ButtonPrimary, ButtonSecondary } from '../components/ui/DesignSystem';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { emptySocial, parseSocial, changePiece, type SocialDocument, type Piece } from './model';
import '../proposal/proposal.css';
import './social.css';
export default function SocialProfile(){const t=useToolkit();try {const initial=t.docs['module-social-profile']===undefined?emptySocial(t.projectId):parseSocial(t.docs['module-social-profile'],t.projectId,t.userId);return <Session initial={initial}/>;}catch(e){return <section role="alert"><p>{(e as Error).message}</p><ButtonSecondary onClick={()=>void t.reload()}>Reintentar carga</ButtonSecondary></section>;}}
function Session({initial}:{initial:SocialDocument}){
 const {userId,projectId,docs,save,reload,documentRevision,business}=useToolkit();const [params,setParams]=useSearchParams();
 const [data,setData]=useState(initial),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[recover,setRecover]=useState(false),[overview,setOverview]=useState(false);const lock=useRef(false);
 const initialDesign=docs['module-content-creator'] as ContentDocument|undefined;
 const designCompatible=!initialDesign||(initialDesign.version===1&&Array.isArray(initialDesign.drafts)&&initialDesign.drafts.every(d=>d.projectId===projectId));
 const [designs,setDesigns]=useState<ContentDocument>(designCompatible&&initialDesign?initialDesign:{version:1,drafts:[]});const [designDirty,setDesignDirty]=useState(false);
 const location=useLocation();const navigateAfterSave=useSavedNavigation(!dirty&&!designDirty&&!busy);
 const selected=params.get('piece');const piece=data.pieces.find(p=>p.id===selected);useUnsavedNavigation(dirty||designDirty||busy);
 const patch=(value:Partial<SocialDocument>)=>{if(lock.current)return;setData(d=>({...d,...value}));setDirty(true);setError('');setNotice('');};
 const edit=(value:Partial<Piece>)=>{if(piece&&!lock.current){setData(d=>changePiece(d,piece.id,value));setDirty(true);setError('');setNotice('');}};
 async function store(){
  if(lock.current)return false;
  lock.current=true;setBusy(true);setError('');let designSaved=false;
  try{
   const profile=parseSocial(data,projectId,userId);
   if(designDirty){await save('module-content-creator',canvas?saveContentDraft(designs,canvas,projectId):designs);designSaved=true;setDesignDirty(false);}
   await save('module-social-profile',profile);setDirty(false);setNotice('Tu trabajo está guardado en FOR U.');return true;
  }catch(e){setError((designSaved?'El diseño se guardó; el texto y guion siguen pendientes. ':'')+(e as Error).message);return false;}
  finally{lock.current=false;setBusy(false);}
 }

 async function open(id:string){if(lock.current)return;if((dirty||designDirty)&&!await store())return;setOverview(false);const p=new URLSearchParams(params);p.set('piece',id);navigateAfterSave(location.pathname+'?'+p.toString());}


 if(!designCompatible)return <section role="alert"><p>El diseño guardado no es compatible. No lo reemplazamos.</p><ButtonSecondary onClick={()=>void reload()}>Reintentar carga</ButtonSecondary></section>;
 const savedDesign=piece?designs.drafts.find(d=>d.id===piece.id):undefined;
 const canvas=piece?savedDesign??{...blankContent(projectId),id:piece.id,title:piece.title,subtitle:piece.text,layout:'poster' as const,brandName:data.name||business.name,caption:piece.text,imagePath:piece.files.find(f=>/\.(jpe?g|png|webp)$/i.test(f.path))?.path||'',background:'#EDE7F7',foreground:'#24232A'}:null;
 function editDesign(patch:Partial<ContentDraft>){if(!canvas||lock.current)return;const next={...canvas,...patch};setDesigns(current=>({...current,drafts:current.drafts.some(d=>d.id===next.id)?current.drafts.map(d=>d.id===next.id?next:d):[...current.drafts,next]}));setDesignDirty(true);setError('');}
 if(piece&&canvas&&!overview)return <><PieceWorkspace key={piece.id} piece={piece} design={canvas} user={userId} project={projectId} dirty={dirty||designDirty} busy={busy} error={error} status={notice} revision={documentRevision('module-social-profile')} onEdit={edit} onDesign={editDesign} onSave={()=>void store()} onBack={()=>{const next=new URLSearchParams(params);next.delete('piece');setParams(next);}} onRecover={()=>setRecover(true)}/>{recover&&<section role="alert"><p>Recuperar sustituirá las ediciones pendientes por la versión guardada.</p><ButtonSecondary onClick={()=>setRecover(false)}>Conservar cambios</ButtonSecondary><ButtonPrimary onClick={()=>void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}</>;
 return <><ProfileOverview data={data} designs={designs} user={userId} project={projectId} business={business.name} route={business.route||business.moduleType||business.industry} campaigns={docs['module-campaigns']} busy={busy} dirty={dirty||designDirty} error={error} status={notice} onPatch={patch} onOpen={open} onSave={()=>void store()} onRecover={()=>setRecover(true)}/>{selected&&!piece&&<p role="alert">Esta pieza no existe en el proyecto. Puedes elegir otra de tu perfil.</p>}{recover&&<section role="alert"><p>Recuperar descartará las ediciones pendientes de este perfil y sus piezas.</p><ButtonSecondary onClick={()=>setRecover(false)}>Conservar cambios</ButtonSecondary><ButtonPrimary onClick={()=>void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}</>;
}
