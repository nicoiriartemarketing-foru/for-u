import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
/** The stream is created only by Record. A failed upload keeps the local recording. */
export default function AudioCapture({disabled,onSave}:{disabled:boolean;onSave:(file:File)=>Promise<boolean>}){
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),limit=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),alive=useRef(true),chunks=useRef<Blob[]>([]);
 const [recording,setRecording]=useState(false),[file,setFile]=useState<File|null>(null),[url,setUrl]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(limit.current);recorder.current?.state==='recording'&&recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());};},[]);
 useEffect(()=>{if(!file){setUrl('');return;}const next=URL.createObjectURL(file);setUrl(next);return()=>URL.revokeObjectURL(next);},[file]);
 async function start(){if(disabled||recording||saving)return;setError('');try{
   if(!window.isSecureContext)throw new Error('El micrófono requiere HTTPS. En el iPhone puedes adjuntar una nota de voz mientras usas la vista previa local.');
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Este navegador no permite grabar aquí. Puedes adjuntar un audio o escribir.');
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw new Error('No encontramos un formato de grabación compatible. Adjunta un audio o escribe.');
   const next=await navigator.mediaDevices.getUserMedia({audio:true});if(!alive.current){next.getTracks().forEach(t=>t.stop());return;}stream.current=next;chunks.current=[];const rec=new MediaRecorder(next,{mimeType:mime});recorder.current=rec;
   rec.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data);};
   rec.onstop=()=>{clearTimeout(limit.current);next.getTracks().forEach(t=>t.stop());if(!alive.current)return;setRecording(false);const blob=new Blob(chunks.current,{type:mime.split(';')[0]});if(blob.size)setFile(new File([blob],`mi-oferta-${Date.now()}.${mime.includes('mp4')?'m4a':'webm'}`,{type:blob.type}));else setError('No se capturó audio. Vuelve a intentarlo.');};
   rec.onerror=()=>{setError('La grabación se interrumpió. Revisa el audio antes de guardarlo.');if(rec.state==='recording')rec.stop();};
   rec.start(1000);setRecording(true);limit.current=setTimeout(()=>{if(rec.state==='recording')rec.stop();},90_000);
 }catch(e){stream.current?.getTracks().forEach(t=>t.stop());setError((e as Error).name==='NotAllowedError'?'El micrófono no tiene permiso. Puedes escribir o adjuntar un audio.':(e as Error).message);}}
 return <section className="offer-audio" aria-label="Contar mi oferta por audio"><p>Cuéntalo a tu manera · hasta 90 segundos</p>{recording?<><p role="status">Grabando · se detendrá a los 90 segundos</p><ButtonPrimary onClick={()=>recorder.current?.stop()}>Detener y escuchar</ButtonPrimary></>:!file?<ButtonSecondary disabled={disabled||saving} onClick={()=>void start()}>◉ Grabar audio</ButtonSecondary>:<><audio controls src={url}/><div className="journey-actions"><ButtonPrimary disabled={disabled||saving} onClick={()=>{setSaving(true);void onSave(file).then(ok=>{if(ok)setFile(null);}).catch(e=>setError((e as Error).message)).finally(()=>setSaving(false));}}>{saving?'Guardando audio…':'Guardar este audio'}</ButtonPrimary><ButtonSecondary disabled={saving} onClick={()=>setFile(null)}>Descartar grabación</ButtonSecondary></div></>}{error&&<p role="alert">{error}</p>}</section>;
}
