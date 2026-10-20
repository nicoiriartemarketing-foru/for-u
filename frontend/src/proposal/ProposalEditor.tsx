import EditorSheet from '../toolkit/EditorSheet';
import '../toolkit/professionalEditor.css';
import JourneyImport from '../experience/JourneyImport';
import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToolkit } from '../toolkit/ToolkitContext';
import { defaultLanding, type LandingDraft } from '../toolkit/types';
import { ButtonPrimary, ButtonSecondary, Input, Textarea, Select } from '../components/ui/DesignSystem';
import ProjectImage from '../components/shared/ProjectImage';
import ProjectImageField from '../components/shared/ProjectImageField';
import DishOptionsEditor from '../modules/restaurant/DishOptionsEditor';
import type { ModuleType } from '../modules/moduleProjects';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { useWorkspaceFocus } from '../pages/dashboard/WorkspaceFocus';
import { blankOffer, changedPreparationFields, emptyProposal, parseProposal, nativeOffers, proposalOffers, offerPrice, prepareLanding, preparationFields, validateOffer, type Offer, type PreparationField, type Proposal } from './model';
import { updateNativePrice, createNativeProduct } from './catalogEditing';
import { readableStudioDraft } from '../pages/dashboard/studioJourney';
import './proposal.css';

export default function ProposalEditor() {
  const toolkit = useToolkit();
  try {
    if (toolkit.docs.landing !== undefined && !readableStudioDraft(toolkit.docs.landing)) throw new Error('El borrador anterior necesita recuperación. No se reemplazó por una plantilla.');
    const proposal = toolkit.docs['module-proposal'] === undefined ? emptyProposal() : parseProposal(toolkit.docs['module-proposal']);
    nativeOffers(toolkit.business.moduleType as ModuleType, toolkit.docs['module-' + toolkit.business.moduleType]);
    return <ProposalSession initial={proposal} />;
  } catch (error) { return <section role="alert"><h1>No pudimos abrir tu propuesta</h1><p>{(error as Error).message}</p><ButtonSecondary onClick={() => void toolkit.reload()}>Reintentar</ButtonSecondary></section>; }
}
function ProposalSession({ initial }: { initial: Proposal }) {
  const { docs, save, business, projectId, demo, documentRevision, reload } = useToolkit();
  const type = business.moduleType as ModuleType;
  const catalogKey = 'module-' + type;
  const query = '?project=' + encodeURIComponent(projectId);
  const navigate = useNavigate();
  const [routeParams]=useSearchParams();
  const { remember } = useWorkspaceFocus();
  const [proposal, setProposal] = useState(initial);
  const [field, setField] = useState<'offering'|'audience'|'need'|'value'|'message'|'conditions'|'cta'|'whatsapp'|null>(null);
  const cardLabels={offering:'¿Qué ofreces?',audience:'¿Para quién?',need:'¿Qué le facilitas?',value:'¿Qué hace especial tu oferta?',message:'Tu mensaje principal',conditions:'Condiciones',cta:'Tu invitación a actuar',whatsapp:'Contacto de WhatsApp'};
  const proposalRef=useRef(proposal);proposalRef.current=proposal;
  const [step, setStep] = useState(routeParams.has('offer')?1:0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [offer, setOffer] = useState<Offer | null>(()=>initial.offers.find(o=>o.id===routeParams.get('offer'))??null);
  const [offerPanel,setOfferPanel]=useState(true);
  const editOffer=(item:Offer)=>{setOffer(item);setOfferPanel(true);};
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [free, setFree] = useState<Record<string, boolean>>({});
  const [preparing, setPreparing] = useState(false);
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  const [chosen, setChosen] = useState<PreparationField[]>([]);
  const native = nativeOffers(type, docs[catalogKey]);
  const uncommitted = Object.keys(prices).length > 0 || offer !== null;
  useUnsavedNavigation(dirty || uncommitted || busy);
  const patch = (value: Partial<Proposal>) => { setProposal(current => ({ ...current, ...value })); setDirty(true); setError(''); setNotice(''); };
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function storeProposal() {
    await run(async () => { const snapshot=proposal;await save('module-proposal', parseProposal(snapshot));if(proposalRef.current===snapshot){setDirty(false);setField(null);} setNotice('Propuesta guardada en tu cuenta. Tu página pública no cambió.'); });
  }
  async function storePrice(item: Offer) {
    await run(async () => {
      const raw = prices[item.id];
      if (raw === undefined || !raw.trim()) throw new Error('Escribe un precio; un campo vacío no es gratis.');
      const price = Number(raw);
      if (price === 0 && !free[item.id]) throw new Error('Confirma Gratis para usar un precio de cero.');
      await save(catalogKey, updateNativePrice(type, docs[catalogKey], item.id, price));
      setPrices(current => { const next = { ...current }; delete next[item.id]; return next; });
      setNotice('Precio guardado en el catálogo original. La publicación anterior no cambió.');
    });
  }
  async function applyOffer() {
    if (!offer) return;
    await run(async () => {
      validateOffer(offer, true);
      const nativeData = createNativeProduct(type, docs[catalogKey], offer, business.name);
      if (nativeData !== null && !proposal.offers.some(o => o.id === offer.id)) {
        await save(catalogKey, nativeData);
        patch({ nativeIds: [...new Set([...proposal.nativeIds, type + ':' + offer.id])] });
        setNotice('Producto guardado en tu catálogo. Guarda la propuesta para conservar su selección.');
      } else patch({ offers: proposal.offers.some(o => o.id === offer.id) ? proposal.offers.map(o => o.id === offer.id ? offer : o) : [...proposal.offers, offer] });
      setOffer(null);
    });
  }
  const canPrepare = !dirty && !busy && !uncommitted && !!documentRevision('module-proposal') && !demo;
  function openPreparation() {
    try {
      if (!canPrepare) throw new Error('Guarda la propuesta y aplica los cambios de ofertas antes de preparar la página.');
      if (!proposal.offering.trim() || !proposal.message.trim() || !proposal.cta.trim()) throw new Error('Completa qué ofreces, tu mensaje y la llamada a la acción.');
      proposalOffers(proposal, type, docs[catalogKey]);
      setChosen(docs.landing ? [] : [...preparationFields]); setPreparing(true); setError('');
    } catch (e) { setError((e as Error).message); }
  }
  const base = (docs.landing as LandingDraft | undefined) ?? { ...defaultLanding(business), headline: '', description: '', cta: '', blocks: [], fields: [], bookingEnabled: false };
  const labels: Record<PreparationField,string> = { headline:'Título principal', description:'Descripción', cta:'Botón de contacto', whatsapp:'WhatsApp', conditions:'Condiciones', offers:'Ofertas y sus precios guardados' };
  function previewValue(field: PreparationField, updated: boolean) {
    if (field === 'offers') return updated ? (proposal.nativeIds.length + proposal.offers.length) + ' ofertas vinculadas' : (base.offers?.length ?? base.menuItems?.length ?? 0) + ' ofertas';
    if (field === 'conditions') return updated ? proposal.conditions : base.blocks.find(b => b.id === 'proposal-conditions')?.body ?? '';
    const values = { headline:proposal.message, description:[proposal.offering,proposal.value].filter(Boolean).join('\n'), cta:proposal.cta, whatsapp:proposal.whatsapp };
    return updated ? values[field] : base[field];
  }
  return <section className="proposal-page">
    <header><span className="proposal-kicker">MI PROPUESTA · {business.name}</span><h2>Una idea clara. Tu siguiente paso.</h2><p>Tu negocio puede ofrecer más de una cosa.</p></header>
    <JourneyImport proposal={proposal} onApply={patch}/><nav className="proposal-steps" aria-label="Pasos de mi propuesta">{['Qué ofrezco y para quién','Mis ofertas','Mensaje y contacto'].map((title,i) => <ButtonSecondary key={title} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>{i+1}. {title}</ButtonSecondary>)}</nav>
    <fieldset disabled={busy} className="proposal-fields">
      {step === 0 && <><h2>Así toma forma tu idea</h2><div className="proposal-definition-cards">{(['offering','audience','need','value'] as const).map((key,i)=><button type="button" className={`proposal-definition-card proposal-card-${i}`} key={key} onClick={()=>setField(key)}><span aria-hidden="true">{['✦','◉','♡','✧'][i]}</span><h3>{cardLabels[key]}</h3><p>{proposal[key]||'Toca para darle forma'}</p><small>{proposal[key]?'Editar →':'Comenzar →'}</small></button>)}</div></>}
      {step === 1 && <><div className="proposal-section-title"><h2>Mis ofertas</h2><ButtonSecondary onClick={() => editOffer(blankOffer())}>＋ Añadir oferta</ButtonSecondary></div>
        <p>Productos, servicios y paquetes juntos. Los precios del catálogo se editan en su fuente.</p>
        <Link to={'/modules/' + type + '/editor' + query}>Abrir mi catálogo →</Link>
        {!native.length && !proposal.offers.length && <p>Aún no hay ofertas. Añade la primera cuando estés lista.</p>}
        <div className="proposal-offer-grid">{native.map(item => <article className="proposal-offer" key={item.id}>
          <ProjectImage value={item.image} alt={item.name} /><h3>{item.name}</h3><p>{item.description}</p><strong>{offerPrice(item)}</strong>
          <label><input type="checkbox" checked={proposal.nativeIds.includes(item.id)} onChange={e => patch({ nativeIds:e.target.checked ? [...proposal.nativeIds,item.id] : proposal.nativeIds.filter(id => id !== item.id) })} /> Incluir {item.name} en mi propuesta</label>
          <details><summary>Editar precio en el catálogo</summary><Input label={'Precio de ' + item.name} type="number" min="0" step="0.01" value={prices[item.id] ?? item.price ?? ''} onChange={e => setPrices(current => ({ ...current,[item.id]:e.target.value }))} /><label><input type="checkbox" checked={!!free[item.id]} onChange={e => setFree(current => ({ ...current,[item.id]:e.target.checked }))} /> Confirmar Gratis si el precio es cero</label><ButtonSecondary disabled={prices[item.id] === undefined} onClick={() => void storePrice(item)}>Guardar precio de {item.name}</ButtonSecondary></details>
        </article>)}{proposal.offers.map(item => <article className="proposal-offer" key={item.id}><ProjectImage value={item.image} alt={item.name} /><h3>{item.name}</h3><p>{item.description}</p><strong>{offerPrice(item)}</strong><small>{item.kind === 'package' ? 'Paquete' : item.kind === 'service' ? 'Servicio' : 'Producto'} · oferta complementaria</small><ButtonSecondary onClick={() => editOffer(item)}>Editar {item.name}</ButtonSecondary><ButtonSecondary onClick={() => patch({ offers:proposal.offers.filter(o => o.id !== item.id) })}>Quitar de la propuesta {item.name}</ButtonSecondary></article>)}</div>
        {offer && <EditorSheet open={offerPanel} title="Tu oferta" onClose={()=>setOfferPanel(false)}><section className="proposal-offer-form" aria-label="Editar oferta"><h3>Tu oferta</h3><Select label="Tipo de oferta" value={offer.kind} onChange={e => setOffer({ ...offer,kind:e.target.value as Offer['kind'] })}><option value="product">Producto</option><option value="service">Servicio</option><option value="package">Paquete</option></Select><Input label="Nombre de la oferta" value={offer.name} maxLength={120} onChange={e => setOffer({ ...offer,name:e.target.value })} /><Textarea label="Descripción de la oferta" value={offer.description} maxLength={2000} onChange={e => setOffer({ ...offer,description:e.target.value })} /><Select label="Cómo mostrar el precio" value={offer.pricing} onChange={e => { const pricing = e.target.value as Offer['pricing']; setOffer({ ...offer,pricing,price:pricing === 'free' ? 0 : null }); }}><option value="quote">Solicitar cotización</option><option value="fixed">Precio fijo confirmado</option><option value="free">Gratis (confirmado)</option></Select>{offer.pricing === 'fixed' && <Input label="Precio confirmado (S/)" type="number" min="0.01" step="0.01" value={offer.price ?? ''} onChange={e => setOffer({ ...offer,price:e.target.value === '' ? null : e.target.valueAsNumber })} />}<Textarea label="Condiciones de esta oferta" value={offer.conditions} maxLength={2000} onChange={e => setOffer({ ...offer,conditions:e.target.value })} /><ProjectImageField label="Foto de la oferta" value={offer.image} onChange={image => setOffer({ ...offer,image })} />{offer.kind === 'product' && <><DishOptionsEditor title="Presentaciones" help="Cada presentación reemplaza el precio base." options={offer.variants} onChange={variants => setOffer({ ...offer,variants })} /><DishOptionsEditor title="Extras" help="Cada extra se suma por unidad." options={offer.extras} onChange={extras => setOffer({ ...offer,extras })} /></>}<ButtonPrimary onClick={() => void applyOffer()}>Aplicar oferta</ButtonPrimary><ButtonSecondary onClick={() => setOffer(null)}>Cancelar edición de oferta</ButtonSecondary></section></EditorSheet>}{offer&&!offerPanel&&<ButtonSecondary onClick={()=>setOfferPanel(true)}>Retomar mi oferta pendiente</ButtonSecondary>}
      </>}
      {step === 2 && <><h2>Invita a dar el siguiente paso</h2><div className="proposal-definition-cards">{(['message','cta','whatsapp','conditions'] as const).map((key,i)=><button type="button" className={`proposal-definition-card proposal-card-${i}`} key={key} onClick={()=>setField(key)}><h3>{cardLabels[key]}</h3><p>{proposal[key]||'Lo puedes definir después'}</p><small>Editar →</small></button>)}</div></>}
    </fieldset>
    <EditorSheet open={field!==null} title={field?cardLabels[field]:''} onClose={()=>setField(null)}>{field&&<><Textarea disabled={busy} label={cardLabels[field]} autoFocus value={proposal[field]} maxLength={field==='cta'?50:field==='message'?180:field==='whatsapp'?30:2000} onChange={e=>patch({[field]:e.target.value})}/><p>Escribe con tus palabras. Podrás volver a cambiarlo.</p><ButtonPrimary disabled={busy} onClick={()=>void storeProposal()}>Guardar esta parte</ButtonPrimary></>}</EditorSheet>
    <footer className="proposal-actions">{dirty?<ButtonPrimary disabled={busy||uncommitted} onClick={()=>void storeProposal()}>{busy?'Guardando…':'Guardar mis cambios'}</ButtonPrimary>:step<2?<ButtonPrimary disabled={busy} onClick={()=>setStep(step+1)}>Continuar →</ButtonPrimary>:<ButtonPrimary disabled={!canPrepare} onClick={openPreparation}>Ver mi página →</ButtonPrimary>}<Link className="pe-action-link" to={'/dashboard/tools/landing'+query}>Abrir editor visual</Link></footer>
    <p role={error ? 'alert' : 'status'}>{error || (busy ? 'Guardando…' : uncommitted ? 'Aplica o cancela las ediciones de ofertas pendientes.' : dirty ? 'Propuesta pendiente de guardar.' : notice || (documentRevision('module-proposal') ? 'Propuesta guardada en tu cuenta.' : 'Aún no guardaste tu propuesta.'))}</p>
    {error && <ButtonSecondary disabled={busy} onClick={() => { if (dirty || uncommitted) setConfirmRecovery(true); else void reload(); }}>Recuperar datos guardados</ButtonSecondary>}
    {confirmRecovery && <section className="proposal-preparation" aria-label="Confirmar recuperación"><h2>¿Recuperar la versión guardada?</h2><p>Se descartarán las ediciones pendientes de esta propuesta. Puedes cancelar para conservarlas en pantalla.</p><ButtonSecondary onClick={() => setConfirmRecovery(false)}>Conservar mis cambios pendientes</ButtonSecondary><ButtonPrimary disabled={busy} onClick={() => void reload()}>Descartar pendientes y recuperar</ButtonPrimary></section>}
    {preparing && <section className="proposal-preparation" aria-label="Revisar cambios de la página"><h2>{docs.landing ? 'Elige qué actualizar' : 'Tu página está por nacer'}</h2><p>Conservaremos tus secciones, imágenes y dirección. Esto cambia el borrador; no publica.</p>{(docs.landing?changedPreparationFields(base,proposal,proposalOffers(proposal,type,docs[catalogKey])):[...preparationFields]).map(field => <label key={field}><input type="checkbox" checked={chosen.includes(field)} onChange={e => setChosen(current => e.target.checked ? [...current,field] : current.filter(f => f !== field))} /><span><strong>{labels[field]}</strong>{docs.landing && <small>Actual: {previewValue(field,false) || 'Vacío'}</small>}<small>Propuesta: {previewValue(field,true) || 'Vacío'}</small></span></label>)}{docs.landing&&!changedPreparationFields(base,proposal,proposalOffers(proposal,type,docs[catalogKey])).length&&<p>No hay diferencias con el borrador. Puedes abrir el editor para seguir creando.</p>}<ButtonPrimary disabled={busy || !chosen.length} onClick={() => void run(async () => {
      const source = { proposalRevision:documentRevision('module-proposal')!, catalogRevision:documentRevision(catalogKey) };
      const landing = prepareLanding(base,proposal,proposalOffers(proposal,type,docs[catalogKey]),source,chosen);
      await save('landing',landing); setPreparing(false); remember({ projectId,tool:'landing' }); navigate('/dashboard/tools/landing' + query);
    })}>Aplicar al borrador y abrir editor</ButtonPrimary><ButtonSecondary onClick={() => setPreparing(false)}>Volver a mi propuesta</ButtonSecondary></section>}
  </section>;
}
