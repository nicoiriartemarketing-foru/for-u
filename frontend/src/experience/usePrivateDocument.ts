import {loadAccountIdeas,saveAccountIdeas} from '../services/accountIdeas';
import {useEffect,useSyncExternalStore} from 'react';
import {loadModuleDocument,saveModuleDocument,type ModuleDocumentKind} from '../services/moduleDocuments';
type Entry<T>={data:T;revision:string|null;loaded:boolean;dirty:boolean;busy:boolean;error:string;conflict:boolean;operation:'loading'|'saving'|null};
const entries=new Map<string,Entry<unknown>>(),listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(f=>f());
const subscribe=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};};
// Cache is scoped by account AND project. Pending work survives tool navigation.
export function usePrivateDocument<T>(user:string,project:string,kind:ModuleDocumentKind,initial:()=>T,parse:(v:unknown)=>T){
 const key=JSON.stringify([user,project,kind]);
 if(!entries.has(key))entries.set(key,{data:initial(),revision:null,loaded:false,dirty:false,busy:false,error:'',conflict:false,operation:null});
 const snapshot=()=>entries.get(key) as Entry<T>;
 const entry=useSyncExternalStore(subscribe,snapshot);
 const patch=(value:Partial<Entry<T>>)=>{entries.set(key,{...snapshot(),...value});emit();};
 async function load(recover=false){
  const before=snapshot();if(before.busy)return;patch({busy:true,operation:'loading'});
  try{const doc=await (kind==='personal-ideas'?loadAccountIdeas(user):loadModuleDocument(user,project,kind)),data=doc?parse(doc.payload):initial();const current=snapshot();
   if(current.dirty&&!recover){if(current.revision!==(doc?.revision??null))patch({conflict:true,error:'Hay otra versión guardada. Conservamos tus cambios; recupera explícitamente para sustituirlos.'});}
   else if(recover&&current.data!==before.data)patch({conflict:true,error:'Llegaron cambios nuevos durante la recuperación. Se conservaron; revisa antes de recuperar otra vez.'});else patch({data,revision:doc?.revision??null,loaded:true,dirty:false,error:'',conflict:false});
  }catch(e){patch({error:(e as Error).message});}finally{patch({busy:false,operation:null});}
 }
 async function save(){const before=snapshot();if(!before.loaded||before.busy||before.conflict)return false;patch({busy:true,operation:'saving',error:''});
  try{const revision=await (kind==='personal-ideas'?saveAccountIdeas(user,parse(before.data),before.revision):saveModuleDocument(user,project,kind,parse(before.data),before.revision));patch({revision,dirty:snapshot().data!==before.data});return snapshot().data===before.data;}
  catch(e){const message=(e as Error).message;patch({error:message,conflict:/conflict|otra pestaña|otra versión|otra ventana|cambió/i.test(message)});return false;}finally{patch({busy:false,operation:null});}
 }
 useEffect(()=>{if(!snapshot().loaded)void load();const refresh=()=>{if(!document.hidden)void load();};window.addEventListener('focus',refresh);window.addEventListener('foru:documents-updated',refresh);const timer=setInterval(refresh,15000);return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('foru:documents-updated',refresh);clearInterval(timer);};},[key]);
 useEffect(()=>{if(!entry.dirty)return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[entry.dirty]);
 return {...entry,change:(data:T)=>{if(snapshot().loaded)patch({data,dirty:true});},save,reload:()=>load(),recover:()=>load(true)};
}
