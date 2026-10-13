import { privateMediaPath, isPrivateMedia, mediaReference } from '../components/shared/mediaReference';
export type Piece = { id:string; title:string; objective:string; text:string; script:string; shots:string; date:string; status:'idea'|'draft'|'ready'|'published-manual'; files:{path:string;name:string}[] };
export type SocialDocument = { version:1; projectId:string; photo:string; name:string; bio:string; link:string; highlights:{id:string;title:string;cover:string}[]; main:string[]; pieces:Piece[] };
export const uuid = (value:unknown):value is string => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function emptySocial(projectId:string):SocialDocument {return {version:1,projectId,photo:'',name:'',bio:'',link:'',highlights:[],main:[],pieces:[]};}
export function newPiece():Piece {return {id:crypto.randomUUID(),title:'',objective:'',text:'',script:'',shots:'',date:'',status:'idea',files:[]};}
export function parseSocial(value:unknown,projectId:string,userId?:string):SocialDocument {
 const d=value as SocialDocument;
 const text=(v:unknown,n:number)=>typeof v==='string'&&v.length<=n;
 const file=(p:string)=>{try{mediaReference(p);return !userId||p.startsWith(`${userId}/${projectId}/`);}catch{return false;}};
 const photo=(p:string)=>!isPrivateMedia(p)||!userId||!!privateMediaPath(p,userId,projectId);
 if(!d||d.version!==1||d.projectId!==projectId||!text(d.photo,2000)||!text(d.name,120)||!text(d.bio,2000)||!text(d.link,2000)||!Array.isArray(d.main)||d.main.length>3||new Set(d.main).size!==d.main.length||!Array.isArray(d.pieces)||d.pieces.length>100||!Array.isArray(d.highlights)||d.highlights.length>20) throw new Error('El perfil guardado no es compatible. No se reemplazó.');
 if(!photo(d.photo)||d.highlights.some(h=>typeof h.cover==='string'&&!photo(h.cover)))throw new Error('Una foto no pertenece a este proyecto.');
 if(d.link&&!/^https?:\/\//i.test(d.link))throw new Error('El enlace del perfil debe comenzar con https:// o http://.');
 if(d.pieces.some(p=>!uuid(p.id)||!text(p.title,160)||!text(p.objective,2000)||!text(p.text,10000)||!text(p.script,20000)||!text(p.shots,10000)||!text(p.date,10)||(p.date!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(p.date))||!['idea','draft','ready','published-manual'].includes(p.status)||!Array.isArray(p.files)||p.files.length>30||p.files.some(f=>!text(f.path,2000)||!text(f.name,200)||!file(f.path))))throw new Error('Revisa los datos y archivos de las piezas.');
 if(new Set(d.pieces.map(p=>p.id)).size!==d.pieces.length||d.main.some(id=>!d.pieces.some(p=>p.id===id))||d.highlights.some(h=>!uuid(h.id)||!text(h.title,80)||!text(h.cover,2000)))throw new Error('Revisa las referencias del perfil.');
 return d;
}
export function getPiece(value:unknown,projectId:string,pieceId:string,userId?:string){const document=parseSocial(value,projectId,userId);const piece=document.pieces.find(p=>p.id===pieceId);if(!piece)throw new Error('Esta pieza no está disponible en el proyecto.');return {document,piece};}
export function changePiece(document:SocialDocument,pieceId:string,patch:Partial<Piece>):SocialDocument {if(!document.pieces.some(p=>p.id===pieceId))throw new Error('Esta pieza no está disponible.');return {...document,pieces:document.pieces.map(p=>p.id===pieceId?{...p,...patch,id:p.id}:p)};}
export const pieceQuery=(projectId:string,id:string)=>`?project=${encodeURIComponent(projectId)}&piece=${encodeURIComponent(id)}`;
