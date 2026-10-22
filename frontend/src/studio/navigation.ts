export type LandingOrigin={kind:'landing';projectId:string;sectionId:string;viewport?:'desktop'|'mobile'};
export function validLandingOrigin(value:unknown,project:string):value is LandingOrigin {
 if(!value||typeof value!=='object')return false;
 const o=value as LandingOrigin;
 return o.kind==='landing'&&o.projectId===project&&typeof o.sectionId==='string'&&o.sectionId.length>0&&o.sectionId.length<=200&&(o.viewport===undefined||o.viewport==='desktop'||o.viewport==='mobile')&&!/[\x00-\x1f]/.test(o.sectionId);
}
export function landingOrigin(params:URLSearchParams,project:string):LandingOrigin|undefined {
 const o={kind:'landing',projectId:project,sectionId:params.get('section')||'hero',...(params.get('viewport')==='mobile'||params.get('viewport')==='desktop'?{viewport:params.get('viewport') as 'mobile'|'desktop'}:{})};
 return params.get('from')==='landing'&&validLandingOrigin(o,project)?o:undefined;
}
export function landingReturn(origin:unknown,project:string):string|undefined {
 return validLandingOrigin(origin,project)?`/dashboard/tools/landing?project=${encodeURIComponent(project)}&section=${encodeURIComponent(origin.sectionId)}&resume=1${origin.viewport?'&viewport='+origin.viewport:''}`:undefined;
}
