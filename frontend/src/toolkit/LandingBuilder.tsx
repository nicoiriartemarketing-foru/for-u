import FaqSectionEditor from './FaqSectionEditor';
import {sectionKind} from './sectionComposition';
import {useSavedNavigation} from '../lib/useSavedNavigation';
import {Monitor,Smartphone,Undo2,Redo2,MoreHorizontal} from 'lucide-react';
import {parseLandingWorkspace,workspaceKey} from './landingWorkspace';
import {prepareRoutePage} from '../experience/routePreparation';
import {emptyProposal} from '../proposal/model';
import type {BusinessRoute} from '../workspace/contracts';
import {readableStudioDraft} from '../pages/dashboard/studioJourney';
import {applyPreviewText} from './editorBridge';
import ProjectImageField from '../components/shared/ProjectImageField';
import { MediaScope } from '../components/shared/mediaScope';
import { mediaReference } from '../components/shared/mediaReference';
import EditorSheet from './EditorSheet';
import EditorDecision from './EditorDecision';
import {editorCatalog} from './editorCatalog';
import { insertEditorSection } from './editorSections';
import PageAI from '../experience/PageAI';
import PresentationReview from '../presentation/PresentationReview';
import {LandingPreview as DesignPreview} from './LandingPreview';
import WidgetEditor from '../widgets/WidgetEditor';
import { nativeOffers, offerPrice, sameOffers, type Offer, type ProposalSource } from '../proposal/model';
import { readProposalSource } from '../proposal/sourceRepository';
import { readLandingPublication, writeLandingPublication, landingPublicSnapshot, type LandingPublication } from '../services/landingPublication';
import { privateMediaPath, isPrivateMedia } from '../components/shared/mediaReference';
import { resolveMediaPath } from '../components/shared/mediaStorage';
import { moduleLabels, type ModuleType } from '../modules/moduleProjects';
import { Link, useSearchParams } from 'react-router-dom';
import { Select as DSSelect } from '../components/ui/DesignSystem';
import { useUnsavedNavigation } from "../lib/useUnsavedNavigation";
import { Textarea, InfoIcon } from "../components/ui/DesignSystem";
import { createEditorSection, editorIndustry, reorderEditorSections, sectionPresets } from "./editorSections";
import "./professionalEditor.css";
import { editorHistory, type EditorHistory } from "./editorHistory";
import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import LandingWizard from "../components/LandingWizard";
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
import { compressImage } from "./media";
import { askAI } from "./api";
import { moveItem, safeHttps } from "./engine";
import { defaultLanding, type LandingDraft } from "./types";
export { LandingPreview } from "./LandingPreview";
export default function LandingBuilder(props: {wizard?:boolean}) {
 const {docs,reload,business}=useToolkit();
 if(docs.landing!==undefined&&!readableStudioDraft(docs.landing))return <section role="alert"><h2>Conservamos tu borrador</h2><p>Su formato necesita revisión. No lo sustituimos por una plantilla.</p><DSButtonSecondary onClick={()=>void reload()}>Reintentar lectura</DSButtonSecondary></section>;
 try{if((docs.landing as LandingDraft|undefined)?.catalogSource==='module'&&business.moduleType&&docs['module-'+business.moduleType]!==undefined)nativeOffers(business.moduleType as ModuleType,docs['module-'+business.moduleType]);}catch{return <section role="alert"><h2>Tu catálogo necesita revisión</h2><p>Conservamos tu página. Revisa el catálogo de este proyecto antes de seguir.</p><DSButtonSecondary onClick={()=>void reload()}>Reintentar lectura</DSButtonSecondary></section>;}
 return <LandingBuilderSession {...props}/>;
}
function LandingBuilderSession({ wizard = false }: { wizard?: boolean }) {
  const { business, docs, save, reload, userId, projectId, demo, track, documentRevision } = useToolkit();
  const [routeParams] = useSearchParams();
  const [nextStep,setNextStep]=useState<'intro'|'intent'|null>(()=>{try{return routeParams.get('tour')==='1'&&sessionStorage.getItem(`foru:landing-tour:${userId}:${projectId}`)!=='done'?'intro':null;}catch{return null;}});
  function dismissNext(){setNextStep(null);try{sessionStorage.setItem(`foru:landing-tour:${userId}:${projectId}`,'done');}catch{}}
  async function createFromPage(intent?:string){if(busy)return;if(dirty||!docs.landing){if(!await saveDraft())return;}dismissNext();navigateAfterSave(`/creator-studio?project=${encodeURIComponent(projectId)}&from=landing&section=${encodeURIComponent(selectedId)}&viewport=${viewport}${intent?'&intent='+intent:''}`);}
  const requestedStep = routeParams.get("step");
  const [history, dispatchHistory] = useReducer(editorHistory<LandingDraft>, { past: [], present: editorCatalog((docs.landing as LandingDraft) ?? prepareRoutePage(business.name,(business.route||business.moduleType||'services') as BusinessRoute,{},emptyProposal()),business.moduleType as ModuleType|undefined,docs['module-'+business.moduleType],docs['module-proposal']), future: [] } as EditorHistory<LandingDraft>);
  const draft = history.present;
  const [initialWorkspace]=useState(()=>{try{return parseLandingWorkspace(sessionStorage.getItem(workspaceKey(userId,projectId)),draft.blocks);}catch{return parseLandingWorkspace(null,draft.blocks);}});
  const setDraft = useCallback((value: LandingDraft | ((current: LandingDraft) => LandingDraft)) => dispatchHistory({ type: 'edit', value }), []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [textSuggestion,setTextSuggestion]=useState<{headline:string;description:string}|null>(null);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publication, setPublication] = useState<LandingPublication | null>(null);
  const [publicationReady, setPublicationReady] = useState(false);
  const [publicationError, setPublicationError] = useState('');
  const [publicationAttempt, setPublicationAttempt] = useState(0);
  const [offerReview, setOfferReview] = useState<{ offers: Offer[]; source?: ProposalSource } | null>(null);
  const [previewImageError, setPreviewImageError] = useState('');
  const previewDraft = useRef(draft);
  useEffect(() => {
    let active = true;
    if (!supabase || demo) return;
    setPublicationReady(false); setPublicationError('');
    void readLandingPublication(supabase, userId, projectId).then(value => {
      if (active) { setPublication(value); setPublicationReady(true); setPublishedUrl(value?.published ? window.location.origin + '/s/' + value.slug : ''); }
    }).catch(error => { if (active) setPublicationError(error.message); });
    return () => { active = false; };
  }, [userId, projectId, demo, publicationAttempt]);
  const [dirty, setDirty] = useState(false);
  useUnsavedNavigation(!wizard && (dirty || busy));
  const navigateAfterSave=useSavedNavigation(!dirty&&!busy);
  const drag = useRef(-1);
  const uploading = useRef(false);
  const [selectionActive,setSelectionActive]=useState(Boolean(requestedStep||routeParams.get('section')||initialWorkspace.sectionId!=='hero'));
  const [selectedId, setSelectedId] = useState(routeParams.get('section') || (requestedStep === 'offer' ? ((docs.landing as LandingDraft)?.blocks?.[0]?.id ?? 'hero') : initialWorkspace.sectionId));
  const [sectionsOpen, setSectionsOpen] = useState(requestedStep === "offer");
  const [settingsOpen, setSettingsOpen] = useState(requestedStep === "identity" || requestedStep === "publish");
  const [propertiesOpen, setPropertiesOpen] = useState(requestedStep === "identity" || requestedStep === "offer");
  const [imageRole, setImageRole] = useState('hero');
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [context, setContext] = useState<'text'|'image'|'cta'|'offer'|'catalog'>('text');
  const [insertBefore, setInsertBefore] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>(routeParams.get('viewport')==='mobile'?'mobile':routeParams.get('viewport')==='desktop'?'desktop':initialWorkspace.viewport);
  useEffect(()=>{try{sessionStorage.setItem(workspaceKey(userId,projectId),JSON.stringify({sectionId:selectedId,viewport}));}catch{}},[userId,projectId,selectedId,viewport]);
  const moduleType = business.moduleType && business.moduleType in moduleLabels ? business.moduleType as ModuleType : null;
  const industry = editorIndustry(business.route || business.moduleType || business.industry);
  const selectedBlock = draft.blocks.find(block => block.id === selectedId);
  const selectedPhoto = imageRole==='hero'?{url:draft.heroImage||'',alt:draft.heroImageAlt||''}:draft.gallery?.find(photo=>photo.role===imageRole.slice(8));
  const updatePhoto=(patch:{url?:string;alt?:string})=>{if(imageRole==='hero')update({...('url'in patch?{heroImage:patch.url}:{}),...('alt'in patch?{heroImageAlt:patch.alt}:{})});else update({gallery:draft.gallery?.map(photo=>photo.role===imageRole.slice(8)?{...photo,...patch}:photo)});};
  const frame = useRef<HTMLIFrameElement>(null);
  const [channel] = useState(() => crypto.randomUUID());
  const [saveError,setSaveError]=useState('');
  const [recoverOpen,setRecoverOpen]=useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const draftRef = useRef(draft);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const pending = useRef<LandingDraft | null>(null);
  useEffect(() => {
    draftRef.current = draft;
    let active = true;
    const previewImage = async (value: string) => {
      if (!isPrivateMedia(value)) return value;
      const path = privateMediaPath(value, userId, projectId);
      if (!path) throw new Error('Una foto no pertenece al proyecto abierto.');
      return resolveMediaPath(path);
    };
    void (async () => {
      try {
        const resolved = { ...draft, heroImage: await previewImage(draft.heroImage || ''), gallery: draft.gallery ? await Promise.all(draft.gallery.map(async image => ({...image, url: await previewImage(image.url)}))) : undefined, offers: draft.offers ? await Promise.all(draft.offers.map(async offer => ({ ...offer, image: await previewImage(offer.image) }))) : undefined };
        if (!active) return;
        previewDraft.current = resolved; setPreviewImageError('');
        frame.current?.contentWindow?.postMessage({ type: 'foru:render', channel, projectId, draft: resolved, selectedId: selectedRef.current }, window.location.origin);
      } catch (error) { if (active) setPreviewImageError((error as Error).message); }
    })();
    return () => { active = false; };
  }, [draft, channel, selectedId, userId, projectId]);
  useEffect(() => {
    if (selectedId !== 'hero' && !draft.blocks.some(block => block.id === selectedId)) {
      setSelectedId('hero');
    }
  }, [draft.blocks, selectedId]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      if (event.data.type === "foru:ready") {
        frame.current?.contentWindow?.postMessage(
          { type: "foru:render", channel, projectId, draft: previewDraft.current, selectedId: selectedRef.current, resumeSelection: routeParams.get('resume')==='1'||initialWorkspace.sectionId!=='hero' },
          window.location.origin,
        );
        return;
      }
      if (busy) return;
      if(event.data.type==='foru:configure'&&['catalog','text'].includes(event.data.kind)&&draftRef.current.blocks.some(b=>b.id===event.data.id)){
        setSelectedId(event.data.id);setSelectionActive(true);setContext(event.data.kind);setPropertiesOpen(true);return;
      }
      if (event.data.type === 'foru:context') {
        setSelectionActive(true);
        if (['image','cta'].includes(event.data.target)) { setImageRole('hero'); setSelectedId('hero'); setContext(event.data.target); setPropertiesOpen(true); }
        else if(event.data.target==='gallery'&&draftRef.current.gallery?.some(photo=>photo.role===event.data.role)){setImageRole('gallery:'+event.data.role);setContext('image');setPropertiesOpen(true);}
        else if (event.data.target === 'offer' && draftRef.current.offers?.some(offer => offer.id === event.data.id)) { setSelectedOfferId(event.data.id); setContext('offer'); setPropertiesOpen(true); }
        return;
      }
      if (event.data.type === 'foru:sections') {
        const before = event.data.beforeId;
        if (before !== null && !draftRef.current.blocks.some(block => block.id === before)) return;
        setInsertBefore(before); setSectionsOpen(true); return;
      }
      if (event.data.type === 'foru:image-drop' && event.data.target === 'hero' && event.data.file instanceof File) { void uploadPrivateCover(event.data.file); return; }
      if (event.data.type === 'foru:select' && typeof event.data.id === 'string') {
        if (event.data.id === 'hero' || draftRef.current.blocks.some(block => block.id === event.data.id)) {setSelectedId(event.data.id);setSelectionActive(true);}
        return;
      }
      if (event.data.type === 'foru:move' && typeof event.data.from === 'string' && typeof event.data.to === 'string') {
        setDraft(current => ({ ...current, blocks: reorderEditorSections(current.blocks, event.data.from, event.data.to) })); setDirty(true); return;
      }
      if (event.data.type === 'foru:add' && typeof event.data.preset === 'string') {
        const block = createEditorSection(business.route || business.moduleType || business.industry, event.data.preset);
        if (block && draftRef.current.blocks.length < 8 && (event.data.beforeId == null || draftRef.current.blocks.some(item => item.id === event.data.beforeId))) { setDraft(current => ({ ...current, blocks: insertEditorSection(current.blocks, block, event.data.beforeId ?? null) })); setSelectedId(block.id); setDirty(true); }
        return;
      }
      if (
        busy ||
        event.data.type !== "foru:edit" ||
        typeof event.data.value !== "string"
      )
        return;
      const next = applyPreviewText(draftRef.current, event.data);
      if (next !== draftRef.current) { setDraft(next); setDirty(true); }

    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [channel, busy, business.industry, business.moduleType, setDraft]);
  useEffect(() => {
    if (!dirty || busy || wizard || saveError) return;
    const snapshot = draft;
    pending.current = snapshot;
    const timer = window.setTimeout(() => {
      setAutosaveStatus("Guardando borrador…");
      void save("landing", snapshot).then(
        () => {
          if (pending.current === snapshot) {
            pending.current = null;
            setDirty(false);
            setAutosaveStatus("Borrador guardado"); setSaveError('');
          }
        },
        (error) => {
          setSaveError((error as Error).message);
          setAutosaveStatus(
            "No se guardó el último cambio. Usa Guardar borrador para reintentar.",
          );
        },
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, dirty, busy, save, wizard, saveError]);
  const update = (patch: Partial<LandingDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      return next;
    });
    setDirty(true);
  };
  async function uploadPrivateCover(file: File) {
    if (uploading.current) return;
    if (!supabase || demo) { setNotice('Inicia sesión para subir una foto.'); return; }
    uploading.current=true; setBusy(true); setNotice('Subiendo foto de portada…');
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${projectId}/${crypto.randomUUID()}.jpg`;
      const {error} = await supabase.storage.from('user-uploads').upload(path, blob, {contentType:'image/jpeg',upsert:false});
      if (error) throw new Error('No se subió la foto. Conservamos la anterior; vuelve a intentarlo.');
      update({heroImage:mediaReference(path),heroImageAlt:file.name.replace(/\.[^.]+$/, '').slice(0,160)});
      setNotice('Foto en tu borrador privado. Publicar actualizará la página pública.');
    } catch(error) { setNotice((error as Error).message); }
    finally { uploading.current=false; setBusy(false); }
  }
  async function saveDraft() {
    setBusy(true);
    try {
      await save("landing", draft); setSaveError('');
      pending.current = null;
      setDirty(false);
      setNotice(
        "Borrador guardado. Publica para actualizar la página visible a tus clientes.",
      );
      return true;
    } catch (e) {
      setSaveError((e as Error).message); setNotice((e as Error).message);return false;
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!supabase || demo) return;
    setBusy(true);
    setNotice("");
    try {
      if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(draft.slug))
        throw new Error(
          "Usa una dirección de 3 a 60 letras minúsculas, números o guiones.",
        );
      if (draft.ctaDesign?.url && !safeHttps(draft.ctaDesign.url)) throw new Error("El destino del botón debe ser un enlace HTTPS válido.");
      if (!draft.headline.trim())
        throw new Error("Agrega un título a tu página.");
      if (draft.whatsapp && !/^\d{8,15}$/.test(draft.whatsapp))
        throw new Error(
          "WhatsApp necesita el código de país y número, sin espacios.",
        );
      if (draft.calendly && !safeHttps(draft.calendly, "calendly.com"))
        throw new Error("Usa un enlace HTTPS de calendly.com.");
      if (draft.menuItems?.some(item => !item.name.trim() || !Number.isFinite(item.price) || item.price < 0 || item.price > 1000000)) throw new Error("Revisa los nombres y precios de tus productos.");
      if (!publicationReady) throw new Error('Comprueba el estado de publicación antes de publicar.');
      let verified = draft;
      if (draft.catalogSource === 'proposal' || draft.catalogSource === 'module') {
        if (!moduleType&&draft.catalogSource==='module') throw new Error('No pudimos identificar el catálogo de este proyecto.');
        let offers: Offer[], source: ProposalSource | undefined;
        if (draft.catalogSource === 'proposal') {
          const saved = await readProposalSource(supabase, userId, projectId, moduleType||undefined);
          offers = saved.offers; source = saved.source;
        } else {
          const result = await supabase.from('toolkit_documents').select('payload').eq('user_id', userId).eq('project_id', projectId).eq('kind', 'module-' + moduleType).maybeSingle();
          if (result.error) throw new Error('No pudimos comprobar el catálogo. Tu publicación anterior no cambió.');
          if (!result.data) throw new Error('No encontramos el catálogo guardado. Tu publicación anterior no cambió.');
          offers = nativeOffers(moduleType!, result.data.payload);
        }
        if (!sameOffers(offers, draft.offers) || (source && (source.proposalRevision !== draft.proposalSource?.proposalRevision || source.catalogRevision !== draft.proposalSource?.catalogRevision))) {
          setOfferReview({ offers, source });
          setNotice('Revisa las ofertas guardadas antes de publicar. Tus textos manuales se conservarán.');
          return;
        }
        verified = { ...draft, offers, menuItems: undefined };
      }
      const snapshot = await landingPublicSnapshot(userId, projectId, verified);
      await save('landing', verified);
      const published = await writeLandingPublication(supabase, userId, projectId, snapshot, publication);
      setPublication(published);
      const publishedDraft = { ...verified, published: true };
      setDraft(publishedDraft);
      pending.current = null;
      setDirty(false);
      setPublishedUrl(`${window.location.origin}/s/${draft.slug}`);
      track("landing", true);
      setNotice("Tu página está publicada. Puedes compartir el enlace.");
      try { await save("landing", publishedDraft); }
      catch { setNotice("La página está publicada, pero no pudimos actualizar el estado del borrador. Guarda el borrador para reintentar."); setDirty(true); }
    } catch (e) {
      setNotice((e as Error).message);
      setPublicationReady(false); setPublicationError("Revisa el estado de publicación antes de reintentar.");
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    if (!supabase || demo) return;
    setBusy(true);
    try {
      if (!publicationReady || !publication) throw new Error('Revisa el estado de publicación antes de retirar la página.');
      const published = await writeLandingPublication(supabase, userId, projectId, publication.content as LandingDraft, publication, false);
      setPublication(published);
      const next = { ...draft, published: false };
      setDraft(next);
      setPublishedUrl("");
      await save("landing", next);
      pending.current = null;
      setDirty(false);
      setNotice("La página dejó de estar disponible al público.");
    } catch {
      setNotice(
        "No pudimos completar la actualización. Revisa el estado antes de compartir.",
      );
      setPublicationReady(false); setPublicationError("Revisa el estado de publicación antes de reintentar.");
    } finally {
      setBusy(false);
    }
  }
  async function uploadCover(file: File, role = "Portada") {
    if (!supabase || demo) return;
    setBusy(true);
    setNotice("");
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${projectId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw new Error("No se pudo subir la imagen. Puedes reintentar.");
      const url = mediaReference(path);
      const alt = file.name.replace(/\.[^.]+$/, "");
      if (role === "Portada") update({ heroImage: url, heroImageAlt: alt });
      else update({ gallery: [...(draft.gallery || []).filter(photo => photo.role !== role), { role, url, alt }] });
      setNotice("Foto subida. Guarda el borrador para conservar la portada.");
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  async function suggestStory() {
    setBusy(true);
    setNotice("");
    try {
      const result = await askAI("landing", `Ayuda a escribir la historia de este negocio sin inventar datos. Texto actual: ${draft.description}`, business, {projectId});
      update({ description: result.slice(0, 1000) });
      setNotice("Sugerencia preparada. Revísala antes de publicar.");
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  const proposalChanged = draft.proposalSource &&
    (documentRevision('module-proposal') !== draft.proposalSource.proposalRevision || (draft.catalogSource === 'proposal' && documentRevision('module-' + moduleType) !== draft.proposalSource.catalogRevision));
  const sourcePanel = <>
    <PresentationReview latest={3} value={draft.presentationVersion} disabled={busy} onChange={presentationVersion=>update({presentationVersion})} render={presentationVersion=><DesignPreview draft={{...draft,presentationVersion}}/>}/>
    {publicationError && <section role="alert" className="pe-proposal-notice"><p>{publicationError}</p><DSButtonSecondary disabled={busy} onClick={() => setPublicationAttempt(value => value + 1)}>Revisar estado de publicación</DSButtonSecondary></section>}
    {draft.proposalSource && <section className="pe-proposal-notice"><strong>{proposalChanged ? 'Tu página necesita revisión' : 'Ofertas vinculadas a Mi propuesta'}</strong><p>Los precios se editan en su fuente. Guardar la propuesta no actualiza la publicación.</p><Link to={'/dashboard/tools/proposal?project=' + projectId}>Revisar mi propuesta →</Link></section>}
    {offerReview && <section className="pe-proposal-notice" aria-label="Revisar ofertas para publicar"><h2>Ofertas guardadas que se publicarán</h2><p>Compara con la página en vivo. Actualizaremos solo las ofertas; conservaremos tus textos, imágenes de portada y dirección.</p><ul>{offerReview.offers.map(offer => <li key={offer.id}><strong>{offer.name}</strong> · {offerPrice(offer)}<p>{offer.description}</p>{offer.conditions && <p>{offer.conditions}</p>}</li>)}</ul><DSButtonPrimary disabled={busy} onClick={() => { update({ offers:offerReview.offers, menuItems:undefined, proposalSource:offerReview.source }); setOfferReview(null); setNotice('Ofertas revisadas en el borrador. Pulsa Publicar para actualizar la página pública.'); }}>Actualizar ofertas y conservar mis textos</DSButtonPrimary><DSButtonSecondary onClick={() => setOfferReview(null)}>Volver sin actualizar</DSButtonSecondary></section>}
  </>;
  if (wizard) return <>{sourcePanel}<LandingWizard draft={draft} update={update} busy={busy} dirty={dirty} demo={demo} notice={notice} publishedUrl={publishedUrl} onSave={async()=>{await saveDraft();}} onPublish={publish} onUpload={uploadCover} onSuggest={suggestStory} /></>;
  return (
    <div className={`foru-professional-editor pe-wide-editor tk-visual-editor ${sectionsOpen ? 'pe-sections-open' : ''}`} inert={busy} aria-busy={busy}>
      <header className="pe-studio-bar">
        <Link className="pe-action-link" to={`/creator-studio?project=${encodeURIComponent(projectId)}`} aria-label="Regresar a Creator Studio">← <span>Studio</span></Link>
        <div className="pe-studio-title"><strong>{draft.name || 'Tu página'}</strong><small role="status">{busy ? 'Guardando…' : autosaveStatus || (dirty ? 'Cambios pendientes' : 'Borrador cargado')}</small></div>
        <div className="pe-device-switch" aria-label="Tamaño de vista previa"><DSButtonSecondary aria-label="Vista escritorio" aria-pressed={viewport==='desktop'} onClick={()=>setViewport('desktop')}><Monitor size={18} aria-hidden="true"/></DSButtonSecondary><DSButtonSecondary aria-label="Vista móvil" aria-pressed={viewport==='mobile'} onClick={()=>setViewport('mobile')}><Smartphone size={18} aria-hidden="true"/></DSButtonSecondary></div>
        <DSButtonSecondary aria-label="Deshacer" disabled={busy||!history.past.length} onClick={()=>{dispatchHistory({type:'undo'});setDirty(true);}}><Undo2 size={18} aria-hidden="true"/></DSButtonSecondary>
        <DSButtonSecondary aria-label="Rehacer" disabled={busy||!history.future.length} onClick={()=>{dispatchHistory({type:'redo'});setDirty(true);}}><Redo2 size={18} aria-hidden="true"/></DSButtonSecondary>
        <DSButtonSecondary aria-label="Herramientas de página" aria-expanded={advancedOpen} onClick={()=>setAdvancedOpen(true)}><MoreHorizontal size={20} aria-hidden="true"/></DSButtonSecondary>
        <DSButtonPrimary disabled={busy||demo} onClick={publish}>Publicar</DSButtonPrimary>
      </header>
      <EditorSheet open={nextStep!==null} title={nextStep==='intent'?'¿Con qué contenido quieres empezar?':'Tu página es el comienzo.'} onClose={dismissNext}>
        {nextStep==='intro'?<><p>Lo que acabas de definir también puede convertirse en tus primeros contenidos. Podrás elegir un diseño y cambiarlo antes de guardar.</p><DSButtonPrimary onClick={()=>setNextStep('intent')}>Crear mis primeros contenidos →</DSButtonPrimary><DSButtonSecondary onClick={dismissNext}>Seguir editando mi página</DSButtonSecondary></>:<><p>Elige un propósito. Usaremos información confirmada de tu página; no necesitas fotos ni consumir IA.</p>{([{id:'awareness',title:'Conóceme',hint:'Presenta quién eres y qué haces.'},{id:'conversation',title:'Conversemos',hint:'Invita a conocer mejor tu propuesta.'},{id:'offer',title:'Mi oferta',hint:'Comparte una oferta que ya definiste.'}] as const).map(item=><DSButtonSecondary key={item.id} disabled={busy} onClick={()=>void createFromPage(item.id)}>{item.title} · {item.hint}</DSButtonSecondary>)}</>}
      </EditorSheet>
      {saveError&&<section className="pe-feedback" role="alert"><p>{saveError}</p><DSButtonSecondary disabled={busy||/otra pestaña|otra versión|otra ventana/i.test(saveError)} onClick={()=>void saveDraft()}>Reintentar guardado</DSButtonSecondary><DSButtonSecondary onClick={()=>setRecoverOpen(true)}>Recuperar versión guardada</DSButtonSecondary></section>}
      <EditorSheet open={recoverOpen} title="Recuperar borrador" onClose={()=>setRecoverOpen(false)}><p>Recuperar sustituirá las ediciones pendientes por el borrador guardado. Tu publicación no cambia.</p><DSButtonSecondary onClick={()=>setRecoverOpen(false)}>Conservar mis cambios</DSButtonSecondary><DSButtonPrimary onClick={()=>{pending.current=null;setDirty(false);setRecoverOpen(false);void reload();}}>Descartar pendientes y recuperar</DSButtonPrimary></EditorSheet>
      {(notice || previewImageError) && <p className="pe-feedback" role={previewImageError ? 'alert' : 'status'}>{previewImageError || notice}</p>}
      {selectionActive?<div className="pe-selection-strip"><span>Toca lo que quieres transformar</span><DSButtonSecondary onClick={()=>{setContext('text');setPropertiesOpen(true);}}>Editar selección</DSButtonSecondary><DSButtonSecondary disabled={busy} onClick={()=>void createFromPage()}>✦ Crear contenido de esta sección</DSButtonSecondary></div>:<p className="pe-tap-hint">Toca un texto, una foto o un botón para transformarlo.</p>}
      <EditorSheet open={advancedOpen} title="Tu página · herramientas" onClose={()=>setAdvancedOpen(false)}>
        <div className="pe-tool-choices"><DSButtonSecondary onClick={()=>{setAdvancedOpen(false);setSectionsOpen(true);setInsertBefore(null);}}>Secciones y orden</DSButtonSecondary><DSButtonSecondary onClick={()=>{setAdvancedOpen(false);setSettingsOpen(true);}}>Configuración y contacto</DSButtonSecondary><DSButtonSecondary disabled={busy} onClick={saveDraft}>Guardar borrador ahora</DSButtonSecondary></div>
        {sourcePanel}
        <PageAI draft={draft} disabled={dirty||busy||demo} onApply={update}/>
      {moduleType && draft.catalogSource !== 'proposal' && <details className="pe-catalog-panel"><summary>Oferta de tu negocio {draft.catalogSource === 'module' ? '· vinculada' : ''}</summary><p>{draft.catalogSource === 'module' ? 'Al publicar consultaremos los precios y la disponibilidad guardados. La página pública solo cambia cuando publicas.' : 'Puedes usar el catálogo de tu negocio en esta página. Primero revisa los cambios en la vista previa.'}</p><Link className="pe-action-link" to={`/modules/${moduleType}/editor?project=${encodeURIComponent(projectId)}`}>Editar mi oferta</Link><DSButtonSecondary type="button" onClick={() => {
        try {
          const items = nativeOffers(moduleType, docs[`module-${moduleType}`]);
          if ((draft.menuItems?.length || draft.offers?.length) && draft.catalogSource !== 'module' && !window.confirm('¿Reemplazar los productos de esta landing por el catálogo guardado? Puedes deshacer antes de publicar.')) return;
          update({ catalogSource: 'module', offers: items, menuItems: undefined, proposalSource: undefined });
          setNotice(`${items.length} ofertas del catálogo en la vista previa. Guarda o publica cuando estén listas.`);
        } catch (error) { setNotice((error as Error).message); }
      }}>{draft.catalogSource === 'module' ? 'Actualizar vista previa del catálogo' : 'Usar mi catálogo guardado'}</DSButtonSecondary></details>}

        <WidgetEditor projectId={projectId} widgets={draft.widgets} onChange={widgets=>update({widgets})} disabled={busy||demo}/>
        <nav className="pe-tool-choices"><Link className="pe-action-link" to={`/dashboard/tools/proposal?project=${projectId}`}>Mi propuesta</Link><Link className="pe-action-link" to={`/dashboard/tools/teleprompter?project=${projectId}&section=${encodeURIComponent(selectedId)}`}>Teleprompter</Link></nav>
      </EditorSheet>
      <EditorSheet open={propertiesOpen} title={context==='catalog'?'Tu catálogo conectado':context==='image'?'Tu foto':context==='cta'?'Tu llamada a la acción':context==='offer'?'Tu oferta':'Editar selección'} onClose={()=>setPropertiesOpen(false)}>
        {context==='catalog'?<><p>Los productos y sus precios se editan en su catálogo original. Esta sección mostrará los que hayas guardado.</p><Link className="pe-action-link" to={moduleType?`/modules/${moduleType}/editor?project=${projectId}`:`/dashboard/tools/proposal?project=${projectId}`}>Preparar {moduleType==='restaurant'?'mi menú':'mis ofertas'} →</Link></>:context==='offer'?<><p>Esta oferta conserva sus precios, variantes y extras en su catálogo original.</p><Link className="pe-action-link" to={selectedOfferId.startsWith(`${moduleType}:`)?`/modules/${moduleType}/editor?project=${projectId}&offer=${encodeURIComponent(selectedOfferId.slice(selectedOfferId.indexOf(':')+1))}`:`/dashboard/tools/proposal?project=${projectId}&offer=${encodeURIComponent(selectedOfferId)}`}>Editar esta oferta →</Link></>:<EditorDecision key={`${context}:${selectedId}:${imageRole}`} choices={context==='image'?[
          {id:'photo',title:'Elegir mi foto',hint:'Sube una imagen o elige una del proyecto. También puedes encuadrarla.',icon:'▧',content:<MediaScope.Provider value={{userId,projectId}}><ProjectImageField label="Foto de portada" value={selectedPhoto?.url||''} onChange={url=>updatePhoto({url})}/></MediaScope.Provider>},
          {id:'alt',title:'Describir la foto',hint:'Ayuda a entender la imagen a quienes usan lectores de pantalla.',icon:'≋',content:<DSInput label="Descripción de la foto" value={selectedPhoto?.alt||''} maxLength={160} onChange={e=>updatePhoto({alt:e.target.value})}/>}
        ]:context==='cta'?[
          {id:'text',title:'Texto del botón',hint:'Una acción concreta: ver el menú, consultar o reservar.',icon:'✎',content:<DSInput label="Texto del botón" value={draft.cta} maxLength={50} onChange={e=>update({cta:e.target.value})}/>},
          {id:'url',title:'Destino del botón',hint:'Sin enlace propio, abrirá el contacto de tu página.',icon:'↗',content:<DSInput label="Destino HTTPS (opcional)" type="url" value={draft.ctaDesign?.url||''} onChange={e=>update({ctaDesign:{...draft.ctaDesign,version:1,url:e.target.value}})}/>},
          {id:'align',title:'Alineación del botón',hint:'Elige la posición que mejor acompaña a tu mensaje.',icon:'↔',content:<DSSelect label="Alineación" value={draft.ctaDesign?.align||'start'} onChange={e=>update({ctaDesign:{...draft.ctaDesign,version:1,align:e.target.value as 'start'|'center'|'end'}})}><option value="start">Izquierda</option><option value="center">Centro</option><option value="end">Derecha</option></DSSelect>},
          {id:'tone',title:'Elige su color',hint:'Tres acentos de FOR U, con texto legible.',icon:'◉',content:<DSSelect label="Color del botón" value={draft.ctaDesign?.tone||'violet'} onChange={e=>update({ctaDesign:{...draft.ctaDesign,version:1,tone:e.target.value as 'violet'|'mint'|'gold'}})}><option value="violet">Violeta</option><option value="mint">Mint</option><option value="gold">Dorado</option></DSSelect>}
        ]:selectedBlock?[
          {id:'title',title:'El título de esta sección',hint:'También puedes escribir directamente sobre la página.',icon:'✎',content:<DSInput label="Título de sección" value={selectedBlock.title} maxLength={150} onChange={e=>update({blocks:draft.blocks.map(block=>block.id===selectedBlock.id?{...block,title:e.target.value}:block)})}/>},
          {id:'body',title:sectionKind(selectedBlock)==='faq'?'Preguntas y respuestas':'Cuenta esta parte',hint:sectionKind(selectedBlock)==='faq'?'Resuelve una duda por vez. Verás el resultado desplegable en tu página.':'Usa tus palabras y datos confirmados de tu negocio.',icon:'≋',content:sectionKind(selectedBlock)==='faq'?<FaqSectionEditor body={selectedBlock.body} disabled={busy} onChange={body=>{if(body.length>2000){setNotice('Esta sección admite hasta 2000 caracteres. Conservamos el texto anterior; acorta una respuesta antes de continuar.');return;}update({blocks:draft.blocks.map(block=>block.id===selectedBlock.id?{...block,useModuleDetails:false,body}:block)});}}/>:<Textarea label="Texto de sección" value={selectedBlock.body} maxLength={2000} onChange={e=>update({blocks:draft.blocks.map(block=>block.id===selectedBlock.id?{...block,useModuleDetails:false,body:e.target.value}:block)})}/>}

        ]:[
          {id:'headline',title:'Tu mensaje principal',hint:'¿Qué quieres que alguien entienda al llegar?',icon:'✦',content:<DSInput label="Título principal" value={draft.headline} maxLength={180} onChange={e=>update({headline:e.target.value})}/>},
          {id:'description',title:'Cuéntalo con tus palabras',hint:'Una explicación breve de lo que ofreces.',icon:'≋',content:<Textarea label="Descripción" value={draft.description} maxLength={1000} onChange={e=>update({description:e.target.value})}/>},
          {id:'cta',title:'La invitación para continuar',hint:'El texto de la acción principal de tu página.',icon:'↗',content:<DSInput label="Texto del botón" value={draft.cta} maxLength={50} onChange={e=>update({cta:e.target.value})}/>}
        ]}/>}</EditorSheet>
      <EditorSheet open={sectionsOpen} title="Secciones de tu página" onClose={()=>setSectionsOpen(false)}><EditorDecision key={sectionsOpen?'sections-open':'sections-closed'} choices={[
        {id:'add',title:'Añadir una sección',hint:'Elige una composición. Se colocará donde pulsaste ＋ Sección.',icon:'＋',content:<div className="pe-section-options">{sectionPresets(business.route||business.moduleType||business.industry).map(preset=><button type="button" key={preset.key} disabled={busy||draft.blocks.length>=8} onClick={()=>{const block=createEditorSection(business.route||business.moduleType||business.industry,preset.key);if(block){update({blocks:insertEditorSection(draft.blocks,block,insertBefore)});setSelectedId(block.id);setSectionsOpen(false);}}}><span className={`pe-preset-sample pe-preset-${preset.key}`} aria-hidden="true"><i/><i/><i/></span><strong>{preset.title}</strong><small>{preset.description}</small></button>)}<DSButtonSecondary disabled={busy||draft.blocks.length>=8} onClick={()=>{const block={id:crypto.randomUUID(),title:'Nueva sección',body:''};update({blocks:insertEditorSection(draft.blocks,block,insertBefore)});setSelectedId(block.id);setSectionsOpen(false);}}>＋ Sección libre</DSButtonSecondary>{draft.blocks.length>=8&&<p>Tu página ya tiene ocho secciones. Puedes editar o quitar una antes de añadir otra.</p>}</div>},
        {id:'order',title:'Ordenar mis secciones',hint:'Mueve una sección con las flechas o arrástrala. Quitarla del borrador se puede deshacer.',icon:'↕',content:<div className="pe-section-order">        {draft.blocks.map((block, i) => (
          <article
            className="tk-block-editor"
            key={block.id}
            draggable={!busy}
            onDragStart={() => {
              drag.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag.current >= 0)
                update({ blocks: moveItem(draft.blocks, drag.current, i) });
              drag.current = -1;
            }}
          >
            <DSButtonSecondary type="button" aria-pressed={selectedId === block.id} tooltip={`Editar la sección ${block.title}`} onClick={() => setSelectedId(block.id)}>{block.title}</DSButtonSecondary>
            <div className="tk-toolbar">
              <DSButtonSecondary
                aria-label={"Subir " + block.title}
                disabled={i === 0 || busy}
                onClick={() =>
                  update({ blocks: moveItem(draft.blocks, i, i - 1) })
                }
              >
                ↑
              </DSButtonSecondary>
              <DSButtonSecondary
                aria-label={"Bajar " + block.title}
                disabled={i === draft.blocks.length - 1 || busy}
                onClick={() =>
                  update({ blocks: moveItem(draft.blocks, i, i + 1) })
                }
              >
                ↓
              </DSButtonSecondary>
              <DSButtonSecondary
                disabled={busy}
                onClick={() =>
                  update({
                    blocks: draft.blocks.filter((b) => b.id !== block.id),
                  })
                }
              >
                Quitar
              </DSButtonSecondary>
            </div>
          </article>
        ))}
</div>}
      ]}/></EditorSheet>
      {!docs.landing&&!dirty&&<section className="pe-start-page"><h2>Tu página de {industry.name.toLocaleLowerCase()}, lista para hacerla tuya</h2><p>Toca un texto para cambiarlo. Las fotos y el catálogo pueden venir después.</p><Link className="pe-action-link" to={`/dashboard/tools/proposal?project=${projectId}`}>Usar mi propuesta →</Link><DSButtonSecondary onClick={()=>void saveDraft()}>Guardar esta base</DSButtonSecondary></section>}
      <section className="tk-editor-preview pe-live-stage">

        {previewImageError && <p role="alert">{previewImageError}</p>}
        <div className={`pe-canvas pe-canvas-${viewport}`}><iframe
          ref={frame}
          title="Vista previa editable de tu página"
          src={"/site-preview?channel=" + channel}
          style={{ border: 'none', borderRadius: '8px' }}
        /></div>
        <p role="status">
          {autosaveStatus ||
            (dirty ? "Cambios pendientes" : "Borrador guardado")}
        </p>
      </section>
      <EditorSheet open={settingsOpen} title="Tu página, a tu manera" onClose={()=>setSettingsOpen(false)}><EditorDecision key={settingsOpen?'settings-open':'settings-closed'} groups={[{id:'identity',title:'Identidad y estilo',hint:'Nombre, portada y estructura de tu página.',icon:'✦',ids:['name','template','photo','image-description']},{id:'contact',title:'Contacto y reservas',hint:'Cómo podrán encontrarte y coordinar contigo.',icon:'◌',ids:['whatsapp','booking','calendly']},{id:'publication',title:'Dirección y publicación',hint:'Tu enlace, guardado y página pública.',icon:'↗',ids:['address','publication']},{id:'message',title:'Ayuda para tu mensaje',hint:'Una sugerencia de IA que podrás revisar.',icon:'✧',ids:['ai']}]} choices={[
        {id:'name',title:'El nombre de tu negocio',hint:'Así aparecerá en la página.',icon:'✎',content:<DSInput label="Nombre" disabled={busy} value={draft.name} maxLength={100} onChange={e=>update({name:e.target.value})}/>},
        {id:'address',title:'La dirección de tu página',hint:'Cambiarla afectará la URL únicamente cuando publiques.',icon:'↗',content:<DSInput label="Dirección de tu página" disabled={busy} value={draft.slug} maxLength={60} onChange={e=>update({slug:e.target.value.toLowerCase()})}/>},
        {id:'template',title:'La estructura de tu página',hint:'Conserva tus textos. El rubro de tu proyecto no cambia.',icon:'▦',content:<DSSelect label="Plantilla" disabled={busy} value={draft.template} onChange={e=>update({template:e.target.value})}>{[...new Set([draft.template,'restaurant','shop','tourism','hospitality','courses','services','event'])].map(value=><option key={value} value={value}>{({restaurant:'Restaurante',shop:'Tienda',tourism:'Turismo',hospitality:'Hospedaje',courses:'Cursos',services:'Servicios',event:'Evento'} as Record<string,string>)[value]||value}</option>)}</DSSelect>},
        {id:'photo',title:'Tu foto de portada',hint:'Es opcional. Puedes subirla, elegirla o cambiar el encuadre.',icon:'▧',content:<MediaScope.Provider value={{userId,projectId}}><ProjectImageField label="Foto de portada" value={draft.heroImage||''} onChange={heroImage=>update({heroImage})}/></MediaScope.Provider>},
        {id:'image-description',title:'Descripción accesible de la foto',hint:'Ayuda a quienes usan lectores de pantalla.',icon:'≋',content:<DSInput label="Descripción de la imagen" disabled={busy} value={draft.heroImageAlt||''} maxLength={160} onChange={e=>update({heroImageAlt:e.target.value})}/>},
        {id:'whatsapp',title:'Tu contacto por WhatsApp',hint:'Usa código de país y solo números. Puedes dejarlo vacío.',icon:'◌',content:<DSInput label="WhatsApp" disabled={busy} value={draft.whatsapp} maxLength={15} placeholder="51999999999" onChange={e=>update({whatsapp:e.target.value})}/>},
        {id:'booking',title:'¿Mostrar reservas?',hint:'La agenda requiere disponibilidad configurada. Activarla aquí no crea horarios.',icon:'◷',content:<label><input type="checkbox" checked={draft.bookingEnabled===true||(draft.bookingEnabled===undefined&&draft.offers===undefined)} disabled={busy} onChange={e=>update({bookingEnabled:e.target.checked})}/> Mostrar agenda de reservas</label>},
        {id:'calendly',title:'Tu enlace de Calendly',hint:'Opcional. Añadirlo no activa una sincronización.',icon:'↗',content:<DSInput label="Calendly (opcional)" disabled={busy} value={draft.calendly} maxLength={400} placeholder="https://calendly.com/tu-negocio/cita" onChange={e=>update({calendly:e.target.value})}/>},
        {id:'ai',title:'Una propuesta para tu mensaje',hint:'La IA solo se utiliza al pulsar el botón. Revisa el texto antes de incorporarlo.',icon:'✦',content:<><DSButtonSecondary disabled={busy||demo} onClick={async()=>{setBusy(true);try{const result=await askAI('landing','Propón título y descripción separados por un salto de línea.',business,{projectId});const [headline,...rest]=result.split('\n').filter(Boolean);if(!headline||!rest.length)throw new Error('La respuesta no contiene un título y una descripción completos. Tu página no cambió.');setTextSuggestion({headline:headline.slice(0,180),description:rest.join('\n').slice(0,1000)});}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}}>Sugerir texto con IA</DSButtonSecondary>{textSuggestion&&<section><h4>Propuesta para revisar</h4><strong>{textSuggestion.headline}</strong><p>{textSuggestion.description}</p><DSButtonPrimary onClick={()=>{update(textSuggestion);setTextSuggestion(null);}}>Usar esta propuesta</DSButtonPrimary><DSButtonSecondary onClick={()=>setTextSuggestion(null)}>Descartar propuesta</DSButtonSecondary></section>}</>},
        {id:'publication',title:'Guardado y publicación',hint:'El borrador y tu página pública son independientes.',icon:'✓',content:<><DSButtonSecondary disabled={busy} onClick={saveDraft}>Guardar borrador</DSButtonSecondary><DSButtonPrimary disabled={busy||demo} onClick={publish}>Publicar página</DSButtonPrimary>{draft.published&&<DSButtonSecondary disabled={busy||demo} onClick={unpublish}>Retirar publicación</DSButtonSecondary>}{publishedUrl&&<a className="pe-action-link" href={publishedUrl} target="_blank" rel="noreferrer">Ver página publicada ↗</a>}{notice&&<p role="status">{notice}</p>}</>}
      ]}/></EditorSheet>
    </div>
  );
}
