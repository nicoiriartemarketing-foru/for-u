import {Link} from 'react-router-dom';
import {linkedPieceQuery} from '../studio/navigation';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {recordingFrames,type RecordingRatio} from './prompterFrame';
import {readSrt,validCaptionTimes} from './videoEditing';
import VideoGuide from './VideoGuide';
import './videoEditorGuided.css';
import {getPiece} from '../social/model';
import {parseMaterials} from '../workspace/contracts';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import SavePieceFile from '../social/SavePieceFile';
import {useSearchParams} from 'react-router-dom';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { detectSilences, keptSegments, moveItem, type Segment } from "./engine";
import { decodeAudio, exportVideo } from "./media";
import { downloadBlob } from "./api";
import { useToolkit } from "./ToolkitContext";

export default function VideoEditor({
  initialFile,
  initialSubtitles = [],
}: {
  initialFile: File | null;
  initialSubtitles?: Segment[];
}) {
  const { track,userId,projectId,docs } = useToolkit();
  const [params]=useSearchParams();
  const [step,setStep]=useState<'review'|'cuts'|'captions'|'export'>('review'),[dirty,setDirty]=useState(false),[savedExport,setSavedExport]=useState(false),[captionIndex,setCaptionIndex]=useState(0),[framing,setFraming]=useState<RecordingRatio|'original'>('original'),[focus,setFocus]=useState(.5),[originalSize,setOriginalSize]=useState({width:16,height:9});
  const previewCuts=useRef<Segment[]|null>(null),previewIndex=useRef(0);
  const [exported,setExported]=useState<File|null>(null),[exportedUrl,setExportedUrl]=useState('');
  useEffect(()=>{if(!exported){setExportedUrl('');return;}const url=URL.createObjectURL(exported);setExportedUrl(url);return()=>URL.revokeObjectURL(url);},[exported]);
  const [file, setFile] = useState<File | null>(initialFile);
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [silences, setSilences] = useState<Segment[]>([]);
  const [subtitles, setSubtitles] = useState<Segment[]>(initialSubtitles);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [threshold, setThreshold] = useState(-38);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const abort = useRef<AbortController | null>(null);
  const version = useRef(0);
  const drag = useRef(-1),selection=useRef(0);
  const [recoverAttempt,setRecoverAttempt]=useState(0),[recoverError,setRecoverError]=useState(''),[recovering,setRecovering]=useState(false);
  const pieceId=params.get('piece');
  useUnsavedNavigation(dirty||!!busy||!!exported&&!savedExport);
  useEffect(()=>{setExported(null);setSavedExport(false);},[segments,subtitles,framing,focus]);
  useEffect(()=>{previewCuts.current=null;video.current?.pause();},[step]);
  const editSegments=(value:Segment[])=>{previewCuts.current=null;setSegments(value);setDirty(true);};
  const editSubtitles=(value:Segment[])=>{setSubtitles(value);setDirty(true);};
  function playCuts(value:Segment[]){if(!video.current||!value.length)return;previewCuts.current=value;previewIndex.current=0;video.current.currentTime=value[0].start;void video.current.play().catch(()=>setNotice('Pulsa reproducir sobre el video para escuchar la propuesta.'));}
  function playback(element:HTMLVideoElement){setTime(element.currentTime);const rows=previewCuts.current;if(!rows)return;const row=rows[previewIndex.current];if(!row){element.pause();previewCuts.current=null;return;}if(element.currentTime<row.start-.05){element.currentTime=row.start;return;}if(element.currentTime>=row.end-.025){previewIndex.current++;const next=rows[previewIndex.current];if(!next){element.pause();previewCuts.current=null;}else{element.currentTime=next.start;if(element.paused)void element.play().catch(()=>{});}}}

  useEffect(()=>{
    if(initialFile||!pieceId)return;
    let active=true;const controller=new AbortController();const token=selection.current;
    async function recover(){setRecoverError('');setRecovering(true);try{
      const {piece}=getPiece(docs['module-social-profile'],projectId,pieceId!,userId);
      if(!piece.videoId)return;
      const manifest=parseMaterials(docs['module-materials'],projectId,userId);
      const material=manifest.materials.find(row=>row.id===piece.videoId&&row.kind==='video');
      if(!material)throw new Error('El video de esta pieza necesita recuperar su archivo original.');
      const url=await resolveMediaPath(material.path);const response=await fetch(url,{signal:controller.signal});
      if(!response.ok)throw new Error('No se pudo abrir el video guardado. Reintenta.');
      const blob=await response.blob();if(!blob.size||blob.size>20*1024*1024)throw new Error('Este archivo no se puede recuperar en el editor. Conservamos su referencia en la pieza.');
      if(active&&selection.current===token)setFile(new File([blob],material.name,{type:material.mime}));
    }catch(error){if(active&&!controller.signal.aborted)setRecoverError((error as Error).message);}finally{if(active)setRecovering(false);}}
    void recover();return()=>{active=false;controller.abort();};
  },[pieceId,initialFile,projectId,userId,recoverAttempt]);
  // A new external media resource invalidates its duration, cuts, and captions together.
  useEffect(() => {
    version.current++;
    // Synchronize the view with its external data or media resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExported(null);
    setDuration(0);
    setSegments([]);
    setSilences([]);
    setTime(0);
    if (!file) return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      abort.current?.abort();
    };
  }, [file]);
  async function analyze() {
    if (!file) return;
    setBusy("Analizando audio…");
    setNotice("");
    const token = version.current;
    try {
      const audio = await decodeAudio(file);
      if (token !== version.current) return;
      const found = detectSilences(
        Array.from({ length: audio.numberOfChannels }, (_, i) =>
          audio.getChannelData(i),
        ),
        audio.sampleRate,
        threshold,
      );
      setSilences(found);
      setNotice(
        `${found.length} ${found.length===1?'pausa detectada':'pausas detectadas'}. Revisa antes de aplicar los cortes.`,
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function exportClip() {
    if (!file) return;
    setBusy("Exportando en tiempo real…");
    setNotice('');
    if(!validCaptionTimes(subtitles,duration)){setNotice('Revisa los tiempos y completa el texto de tus subtítulos antes de exportar.');setBusy('');return;}
    setProgress(0);
    abort.current = new AbortController();
    try {
      const output = await exportVideo(
        file,
        segments,
        subtitles,
        setProgress,
        abort.current.signal,
        framing==='original'?undefined:{ratio:framing,focus},
      );
      setExported(new File([output],`for-u-editado.${output.type.includes("mp4")?"mp4":"webm"}`,{type:output.type}));
      downloadBlob(
        output,
        `for-u-editado.${output.type.includes("mp4") ? "mp4" : "webm"}`,
      );
      if(!pieceId){setDirty(false);setSavedExport(true);}
      track("video-edit", true, duration);
      setNotice("Video exportado con tus cortes y subtítulos.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function loadFile(next?: File) {
    if (!next) return;
    if (!next.type.startsWith("video/")) {
      setNotice("Elige un archivo de video.");
      return;
    }
    if (next.size > 200 * 1024 * 1024) {
      setNotice("Usa un video de hasta 200 MB.");
      return;
    }
    selection.current++;
    setSubtitles([]);setDirty(false);setStep('review');setFraming('original');setCaptionIndex(0);
    setFile(next);
    setNotice("");
  }
  function metadata(element: HTMLVideoElement) {
    setOriginalSize({width:element.videoWidth||16,height:element.videoHeight||9});
    if (Number.isFinite(element.duration)) {
      setDuration(element.duration);
      setSegments([{ start: 0, end: element.duration }]);
    } else {
      element.currentTime = 1e10;
    }
  }

  const phases=['review','cuts','captions','export'] as const,stepIndex=phases.indexOf(step),headings={review:'Mira tu toma.',cuts:'Quédate con lo que importa.',captions:'Tu voz, también por escrito.',export:'Tu video, listo para compartir.'};
  const proposed=keptSegments(duration,silences),selectedCaption=subtitles[captionIndex];
  const previewRatio=framing==='original'?originalSize:recordingFrames[framing];
  return <section className="video-game" aria-busy={!!busy}>
  <header className="video-game-heading"><div>{stepIndex>0?<button type="button" disabled={!!busy} onClick={()=>setStep(phases[stepIndex-1])}>← Atrás</button>:pieceId?<Link to={'/creator-studio'+linkedPieceQuery(projectId,pieceId,params)+'&tab=profile'}>← Mi contenido</Link>:<span>Tu video</span>}<small>{stepIndex+1} · {['TU TOMA','LIMPIA LAS PAUSAS','SUBTÍTULOS','EXPORTA'][stepIndex]}</small></div>{file&&<span className="video-game-file">{file.name}</span>}</header>
  {file&&<VideoGuide step={step} user={userId} project={projectId} disabled={!!busy||recovering}/>}
  <h1>{file?headings[step]:'Trae tu video.'}</h1>
  {!file?<div className="video-game-upload" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(!busy)loadFile(event.dataTransfer.files[0]);}}><span aria-hidden="true">▷</span><p>{recovering?'Abriendo la toma guardada de esta pieza…':'Elige una grabación para empezar. Tu original se conserva.'}</p><label className="video-game-file-button">Elegir video<input type="file" accept="video/*" disabled={!!busy||recovering} onChange={event=>loadFile(event.target.files?.[0])}/></label></div>:<>
  <div className="video-game-preview" style={{aspectRatio:`${previewRatio.width}/${previewRatio.height}`,width:`min(100%,420px,${42*previewRatio.width/previewRatio.height}dvh)`}}><video ref={video} src={url} controls playsInline style={{objectFit:framing==='original'?'contain':'cover',objectPosition:`${focus*100}% 50%`}} onLoadedMetadata={event=>metadata(event.currentTarget)} onDurationChange={event=>{if(!duration&&Number.isFinite(event.currentTarget.duration)){metadata(event.currentTarget);event.currentTarget.currentTime=0;}}} onPlay={event=>{if(step==='review'||previewCuts.current||!segments.length)return;previewCuts.current=segments;const index=segments.findIndex(row=>event.currentTarget.currentTime>=row.start-.05&&event.currentTarget.currentTime<row.end-.025);previewIndex.current=index<0?0:index;if(index<0)event.currentTarget.currentTime=segments[0].start;}} onTimeUpdate={event=>playback(event.currentTarget)} onEnded={event=>playback(event.currentTarget)} onError={()=>setNotice('Este navegador no puede reproducir el archivo. Prueba MP4 o WebM.')}/><div className="video-game-caption-preview">{subtitles.filter(row=>time>=row.start&&time<row.end).map(row=>row.text).join(' ')}</div></div>
  {step==='review'&&<><p className="video-game-lead">Reproduce tu original. En los siguientes pasos podrás limpiar pausas y revisar subtítulos.</p><footer className="video-game-next"><DSButtonPrimary disabled={!!busy||!duration} onClick={()=>setStep('cuts')}>Revisar silencios →</DSButtonPrimary></footer><details className="video-game-extra"><summary>Usar otra toma o descargar el original</summary><DSButtonSecondary onClick={()=>downloadBlob(file,file.name)}>Descargar original</DSButtonSecondary><label className="video-game-file-button">Elegir otra toma<input type="file" accept="video/*" disabled={!!busy} onChange={event=>{if(dirty&&!window.confirm('¿Cambiar de toma y descartar estos ajustes? El original se conserva.'))return;loadFile(event.target.files?.[0]);}}/></label></details></>}
  {step==='cuts'&&<section className="video-game-cut-actions"><p>Primero escucha la propuesta. Nada se recorta hasta que decidas aplicarlo.</p><DSButtonPrimary disabled={!!busy||!duration} onClick={()=>void analyze()}>{busy||'Detectar silencios'}</DSButtonPrimary>{silences.length>0&&<div className="video-game-proposal"><strong>{silences.length} {silences.length===1?'pausa para revisar':'pausas para revisar'}</strong><p>Original: {duration.toFixed(1)} s · Propuesta: {proposed.reduce((sum,row)=>sum+row.end-row.start,0).toFixed(1)} s</p><DSButtonSecondary disabled={!!busy||!proposed.length} onClick={()=>playCuts(proposed)}>▷ Escuchar propuesta</DSButtonSecondary><DSButtonPrimary disabled={!!busy||!proposed.length} onClick={()=>{editSegments(proposed);setNotice('Cortes aplicados a tu versión editable. Tu archivo original sigue intacto.');}}>Aplicar estos cortes</DSButtonPrimary></div>}<details className="video-game-extra"><summary>Ajustar detección y fragmentos</summary><label>Sensibilidad del silencio<input aria-label="Sensibilidad del silencio" type="range" min="-55" max="-20" value={threshold} disabled={!!busy} onChange={event=>{setThreshold(Number(event.target.value));setSilences([]);}}/></label><small>Conservamos 120 ms junto a cada borde para proteger las palabras.</small>{segments.map((segment,index)=><article className="video-game-segment" key={index}><strong>Fragmento {index+1}</strong><label>Inicio<input type="number" min="0" max={segment.end-.05} step=".1" value={Number(segment.start.toFixed(2))} disabled={!!busy} onChange={event=>editSegments(segments.map((row,i)=>i===index?{...row,start:Math.max(0,Math.min(row.end-.05,Number(event.target.value)))}:row))}/></label><label>Fin<input type="number" min={segment.start+.05} max={duration} step=".1" value={Number(segment.end.toFixed(2))} disabled={!!busy} onChange={event=>editSegments(segments.map((row,i)=>i===index?{...row,end:Math.min(duration,Math.max(row.start+.05,Number(event.target.value)))}:row))}/></label><div><DSButtonSecondary aria-label={`Subir fragmento ${index+1}`} disabled={!!busy||index===0} onClick={()=>editSegments(moveItem(segments,index,index-1))}>↑</DSButtonSecondary><DSButtonSecondary aria-label={`Bajar fragmento ${index+1}`} disabled={!!busy||index===segments.length-1} onClick={()=>editSegments(moveItem(segments,index,index+1))}>↓</DSButtonSecondary><DSButtonSecondary disabled={!!busy||segments.length<2} onClick={()=>editSegments(segments.filter((_,i)=>i!==index))}>Quitar</DSButtonSecondary></div></article>)}<DSButtonSecondary disabled={!!busy} onClick={()=>{editSegments([{start:0,end:duration}]);setSilences([]);setNotice('Restauramos el video completo.');}}>Restaurar original</DSButtonSecondary></details><footer className="video-game-next"><button className="video-game-quiet" disabled={!!busy} onClick={()=>setStep('captions')}>Seguir sin más cortes</button><DSButtonPrimary disabled={!!busy||!segments.length} onClick={()=>setStep('captions')}>Revisar subtítulos →</DSButtonPrimary></footer></section>}
  {step==='captions'&&<section className="video-game-captions"><p>{subtitles.length?'Una frase a la vez. Revisa cómo se ve sobre tu video.':'Puedes escribir frases o importar subtítulos que ya tengas.'}</p>{selectedCaption&&<article className="video-game-caption-edit"><div className="video-game-caption-nav"><DSButtonSecondary aria-label="Subtítulo anterior" disabled={!!busy||captionIndex===0} onClick={()=>setCaptionIndex(captionIndex-1)}>←</DSButtonSecondary><span>Frase {captionIndex+1} de {subtitles.length}</span><DSButtonSecondary aria-label="Subtítulo siguiente" disabled={!!busy||captionIndex===subtitles.length-1} onClick={()=>setCaptionIndex(captionIndex+1)}>→</DSButtonSecondary></div><DSTextarea label="Lo que se lee en pantalla" maxLength={1000} value={selectedCaption.text} disabled={!!busy} onChange={event=>editSubtitles(subtitles.map((row,index)=>index===captionIndex?{...row,text:event.target.value}:row))}/><DSButtonSecondary disabled={!!busy} onClick={()=>{if(video.current){previewCuts.current=null;video.current.currentTime=selectedCaption.start;void video.current.play();}}}>▷ Escuchar esta frase</DSButtonSecondary><details className="video-game-extra"><summary>Ajustar tiempo de esta frase</summary><label>Desde<input type="number" min="0" max={selectedCaption.end-.01} step=".1" value={selectedCaption.start} onChange={event=>editSubtitles(subtitles.map((row,i)=>i===captionIndex?{...row,start:Math.max(0,Math.min(row.end-.01,Number(event.target.value)))}:row))}/></label><label>Hasta<input type="number" min={selectedCaption.start+.01} max={duration} step=".1" value={selectedCaption.end} onChange={event=>editSubtitles(subtitles.map((row,i)=>i===captionIndex?{...row,end:Math.min(duration,Math.max(row.start+.01,Number(event.target.value)))}:row))}/></label><DSButtonSecondary onClick={()=>{editSubtitles(subtitles.filter((_,i)=>i!==captionIndex));setCaptionIndex(Math.max(0,captionIndex-1));}}>Quitar esta frase</DSButtonSecondary></details></article>}<div className="video-game-caption-add"><DSButtonSecondary disabled={!!busy||duration<.1} onClick={()=>{editSubtitles([...subtitles,{start:Math.max(0,Math.min(time,duration-.1)),end:Math.min(duration,Math.max(.1,time+3)),text:''}]);setCaptionIndex(subtitles.length);}}>＋ Agregar una frase</DSButtonSecondary><label className="video-game-file-button">Importar SRT<input type="file" accept=".srt,text/plain" disabled={!!busy} onChange={async event=>{const selected=event.target.files?.[0];if(!selected)return;try{if(selected.size>300000)throw new Error('Usa un archivo SRT de hasta 300 KB.');const rows=readSrt(await selected.text());if(!validCaptionTimes(rows,duration))throw new Error('Los subtítulos superan la duración del video. Revisa sus tiempos antes de importar.');editSubtitles(rows);setCaptionIndex(0);setNotice('Subtítulos importados. Revisa las frases.');}catch(error){setNotice((error as Error).message);}}}/></label></div><details className="video-game-extra"><summary>Sobre la transcripción automática</summary><p>La conexión de transcripción IA todavía necesita verificarse para esta cuenta. Puedes usar subtítulos grabados con el navegador, escribirlos o importar SRT.</p></details><footer className="video-game-next"><DSButtonPrimary disabled={!!busy} onClick={()=>setStep('export')}>{subtitles.length?'Revisar exportación →':'Continuar sin subtítulos →'}</DSButtonPrimary></footer></section>}
  {step==='export'&&<section className="video-game-export"><p>Duración editada: {segments.reduce((sum,row)=>sum+row.end-row.start,0).toFixed(1)} s · {subtitles.length} frases.</p><nav aria-label="Formato de exportación">{(Object.entries(recordingFrames) as [RecordingRatio,typeof recordingFrames[RecordingRatio]][]).map(([id,row])=><button key={id} type="button" disabled={!!busy} aria-pressed={framing===id} onClick={()=>{setFraming(id);setFocus(.5);setDirty(true);}}>{row.label}</button>)}</nav><small>{framing==='original'?'Conservando el encuadre original.':'Este marco muestra el recorte que se exportará. Revisa tu cara y el texto.'}</small>{framing!=='original'&&<label className="video-game-focus">Ajustar encuadre<input aria-label="Encuadre de exportación" type="range" min="0" max="1" step=".01" value={focus} disabled={!!busy} onChange={event=>{setFocus(Number(event.target.value));setDirty(true);}}/></label>}<div className="video-game-export-actions"><DSButtonSecondary disabled={!!busy} onClick={()=>playCuts(segments)}>▷ Revisar montaje</DSButtonSecondary><DSButtonPrimary disabled={!!busy||!segments.length} onClick={()=>void exportClip()}>{busy||'Exportar y descargar video'}</DSButtonPrimary></div>{busy.startsWith('Exportando')&&<><progress aria-label="Progreso de exportación" value={progress} max={1}/><DSButtonSecondary onClick={()=>abort.current?.abort()}>Cancelar exportación</DSButtonSecondary></>}<small>La exportación se hace en tiempo real. Mantén esta pestaña visible.</small>{exported&&<section className="video-game-result"><h2>Tu versión exportada.</h2><video className="video-game-result-preview" src={exportedUrl} controls playsInline/><p>Revisa este archivo antes de compartirlo.</p></section>}{exported&&pieceId&&<SavePieceFile key={exported.name+exported.lastModified} file={exported} user={userId} project={projectId} piece={pieceId} kind="video" disabled={!!busy} label="Guardar versión editada en mi pieza" onSaved={()=>{setDirty(false);setSavedExport(true);}}/>}<details className="video-game-extra"><summary>Conservar mi formato o descargar el original</summary><DSButtonSecondary disabled={!!busy} onClick={()=>{setFraming('original');setDirty(true);}}>Usar encuadre original</DSButtonSecondary><DSButtonSecondary onClick={()=>downloadBlob(file,file.name)}>Descargar archivo original</DSButtonSecondary></details></section>}
  </>}
  {recoverError&&<div role="alert"><p>{recoverError}</p><DSButtonSecondary disabled={recovering} onClick={()=>setRecoverAttempt(value=>value+1)}>Reintentar video guardado</DSButtonSecondary></div>}{notice&&<p role="status" className="video-game-notice">{notice}</p>}
  </section>;
}
