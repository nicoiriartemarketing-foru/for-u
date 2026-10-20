import {useEffect,useRef,type ReactNode} from 'react';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import {useDialogFocus} from './useDialogFocus';
/** Contextual controls share one accessible drawer on desktop and bottom sheet on mobile. */
export default function EditorSheet({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLElement>(null);
 useDialogFocus(ref,open,onClose);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
 if(!open)return null;
 return <div className="pe-sheet-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} className="pe-context-sheet"><header><h2>{title}</h2><ButtonSecondary aria-label="Cerrar panel" onClick={onClose}>Listo ×</ButtonSecondary></header><div className="pe-sheet-content">{children}</div></section></div>;
}
