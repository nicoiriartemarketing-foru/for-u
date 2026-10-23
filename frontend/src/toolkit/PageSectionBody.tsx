import type {LandingBlock,LandingDraft} from './types';
import {offerPrice} from '../proposal/model';
import {faqRows,sectionKind,sectionLayout,compositionRows} from './sectionComposition';
export function CatalogCards({draft,onEditOffer}:{draft:LandingDraft;onEditOffer?:(id:string)=>void}){
 return <div className="tk-public-offers">{draft.offers?.map(offer=><article key={offer.id}>
  {offer.image?<img src={offer.image} alt={offer.name} loading="lazy"/>:<span className="page-offer-symbol" aria-hidden="true">{({restaurant:'◒',ecommerce:'◇',hospitality:'⌂',tourism:'↗',courses:'▤'} as Record<string,string>)[draft.template]||'✦'}</span>}
  <h3>{offer.name}</h3><p>{offer.description}</p><strong>{offerPrice(offer)}</strong>
  {offer.conditions&&<p className="page-offer-conditions">{offer.conditions}</p>}
  {!!offer.variants?.length&&<details><summary>Presentaciones</summary><ul>{offer.variants.map(v=><li key={v.id}>{v.name} · S/ {v.price.toFixed(2)}</li>)}</ul></details>}
  {!!offer.extras?.length&&<details><summary>Extras</summary><ul>{offer.extras.map(v=><li key={v.id}>{v.name} · +S/ {v.price.toFixed(2)}</li>)}</ul></details>}
  {onEditOffer&&<button type="button" className="pe-action-link" onClick={e=>{e.stopPropagation();onEditOffer(offer.id);}}>Editar {offer.name}</button>}
 </article>)}</div>;
}
export default function SectionComposition({block,draft,onEditOffer}:{block:LandingBlock;draft:LandingDraft;onEditOffer?:(id:string)=>void}){
 const kind=sectionKind(block);
 if(kind==='catalog')return <CatalogCards draft={draft} onEditOffer={onEditOffer}/>;
 if(kind==='faq'&&faqRows(block.body).length)return <div className="page-faq">{faqRows(block.body).map((row,i)=><details key={i}><summary>{row.question}</summary><p>{row.answer}</p></details>)}</div>;
 if(kind==='location')return <div className="page-contact"><span aria-hidden="true">⌖</span><p>{block.body}</p>{draft.whatsapp&&<a href={`https://wa.me/${draft.whatsapp}`} target="_blank" rel="noreferrer">Consultar por WhatsApp ↗</a>}</div>;
 if(draft.presentationVersion===4){const layout=sectionLayout(block),rows=compositionRows(block.body);
  if(layout==='steps')return <ol className="page-process">{rows.map((row,index)=><li key={index}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><p>{row}</p></li>)}</ol>;
  if(layout==='features')return <ul className="page-features">{rows.map((row,index)=><li key={index}><span aria-hidden="true">✓</span><p>{row}</p></li>)}</ul>;
  if(layout==='quotes')return <div className="page-quotes">{rows.map((row,index)=><blockquote key={index}><span aria-hidden="true">“</span><p>{row}</p></blockquote>)}</div>;
 }
 return <p className={kind==='story'?'page-story':''}>{block.body}</p>;
}
