import type {ContentDraft} from '../components/shared/contentModel';
import {contentSizes} from '../components/shared/contentModel';
export type Box={x:number;y:number;w:number;h:number};
export type TextBox=Box&{text:string;size:number;weight:number;lines:string[]};
export function artworkLayout(draft:ContentDraft,hasImage:boolean,measure:(text:string,size:number,weight:number)=>number){
 const {width:w,height:h}=contentSizes[draft.format],pad=72;
 const layout=draft.layout||'editorial';
 const image:Box|null=!hasImage?null:layout==='poster'?{x:pad,y:h*.57,w:w-pad*2,h:h*.28}:layout==='split'?{x:w*.54,y:pad,w:w*.39,h:h-pad*2}:{x:0,y:0,w,h:h*.43};
 const textArea:Box=layout==='split'&&hasImage?{x:pad,y:h*.17,w:w*.41,h:h*.65}:layout==='poster'?{x:pad,y:h*.14,w:w-pad*2,h:hasImage?h*.38:h*.66}:{x:pad,y:hasImage?h*.48:h*.25,w:w-pad*2,h:hasImage?h*.36:h*.58};
 function wrap(text:string,size:number,weight:number,width:number){const lines:string[]=[];for(const p of text.split('\n')){let line='';for(const word of p.split(/\s+/)){const candidate=line?line+' '+word:word;if(measure(candidate,size,weight)<=width){line=candidate;continue;}if(line){lines.push(line);line='';}let chunk='';for(const character of word){if(chunk&&measure(chunk+character,size,weight)>width){lines.push(chunk);chunk='';}chunk+=character;}line=chunk;}lines.push(line);}return lines;}
 function fit(text:string,box:Box,initial:number,weight:number):TextBox{let size=initial,lines=wrap(text,size,weight,box.w);while(size>22&&lines.length*size*1.2>box.h){size-=2;lines=wrap(text,size,weight,box.w);}return {...box,text,size,weight,lines};}
 const title=fit(draft.title,{...textArea,h:textArea.h*.54},layout==='poster'?96:layout==='split'?76:84,700);
 const body=fit(draft.subtitle,{...textArea,y:textArea.y+textArea.h*.59,h:textArea.h*.41},32,400);
 const brand=fit(draft.brandName||'',{x:pad,y:hasImage&&layout==='editorial'?h*.445:pad,w:w-pad*2,h:38},24,600);
 const cta=fit(draft.cta||'',{x:pad,y:h-128,w:w-pad*2-180,h:66},30,600);
 return {width:w,height:h,image,title,body,brand,cta,overflow:[title,body,brand,cta].some(b=>b.lines.length*b.size*1.2>b.h)};
}
