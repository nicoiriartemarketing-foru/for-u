import type {Segment} from './engine';
export type TimelineEdge='start'|'end'|'move';
export function adjustTimeline(rows:Segment[],index:number,edge:TimelineEdge,delta:number,duration:number):Segment[]{
 const row=rows[index];if(!row||!Number.isFinite(delta)||!Number.isFinite(duration))return rows;
 const min=.05,left=index?rows[index-1].end:0,right=index+1<rows.length?rows[index+1].start:duration;
 const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));let next:Segment;
 if(edge==='start')next={...row,start:clamp(row.start+delta,left,row.end-min)};
 else if(edge==='end')next={...row,end:clamp(row.end+delta,row.start+min,right)};
 else {const offset=clamp(delta,left-row.start,right-row.end);next={...row,start:row.start+offset,end:row.end+offset};}
 return rows.map((value,i)=>i===index?next:value);
}
export function splitTimeline(rows:Segment[],time:number):Segment[]{
 const i=rows.findIndex(row=>time>row.start+.1&&time<row.end-.1);if(i<0)return rows;
 return [...rows.slice(0,i),{...rows[i],end:time},{...rows[i],start:time},...rows.slice(i+1)];
}
export function timelineClock(time:number){const safe=Math.round(Math.max(0,Number.isFinite(time)?time:0)*10)/10;return `${Math.floor(safe/60)}:${(safe%60).toFixed(1).padStart(4,'0')}`;}
