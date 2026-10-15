import {supabase} from '../lib/supabaseClient';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
export async function requestCreative(projectId:string,body:Record<string,unknown>):Promise<Record<string,any>>{
 if(!supabase)throw new Error('Inicia sesión para usar Gemini.');const account=useActiveProjectsStore.getState().cloudUserId;
 const {data,error}=await supabase.functions.invoke('toolkit-ai',{body:{...body,projectId,prompt:typeof body.prompt==='string'?body.prompt:'Preparar propuesta revisable'}});
 if(useActiveProjectsStore.getState().cloudUserId!==account)throw new Error('Cambiaste de cuenta. La respuesta no se aplicó.');
 if(error||data?.error){let detail=data;if(!detail&&error&&'context'in error){try{detail=await(error.context as Response).json();}catch{}}throw new Error(detail?.error||'Gemini no está disponible. Puedes seguir creando sin IA.');}
 if(data?.sourceRevision!==body.sourceRevision)throw new Error('La fuente cambió. Revisa su versión antes de usar la respuesta.');
 if(!data?.structured||typeof data.structured!=='object')throw new Error('La respuesta no es válida. Tu trabajo sigue intacto.');return data.structured;
}
