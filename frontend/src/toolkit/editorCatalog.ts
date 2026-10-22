import {nativeOffers} from '../proposal/model';
import type {ModuleType} from '../modules/moduleProjects';
import type {LandingDraft} from './types';
/** A module-bound draft previews its confirmed catalog. Public snapshots are untouched. */
export function editorCatalog(draft:LandingDraft,type:ModuleType|undefined,payload:unknown):LandingDraft{
 if(draft.catalogSource!=='module'||!type||payload===undefined)return draft;
 return {...draft,offers:nativeOffers(type,payload),menuItems:undefined};
}
