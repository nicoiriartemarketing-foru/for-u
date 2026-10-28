import TextStylePicker from './TextStylePicker';
import CaptionArtwork from './CaptionArtwork';
import {readVisualBrand,defaultTextLook,type TextLook,type TextPreset} from './textStyles';
import VideoTimeline from './VideoTimeline';
import {splitTimeline,timelineClock} from './videoTimelineModel';
import {Link} from 'react-router-dom';
import {linkedPieceQuery} from '../studio/navigation';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {recordingFrames,type RecordingRatio} from './prompterFrame';
import {prepareCaptionAudio} from './captionAudio';
import {beginMagic,finishMagic} from '../experience/magicTransition';
import {readSrt,validCaptionTimes} from './videoEditing';
import VideoGuide from './VideoGuide';
import './videoEditorGuided.css';
import {getPiece} from '../social/model';
import {parseMaterials} from '../workspace/contracts';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import SavePieceFile from '../social/SavePieceFile';
import {useSearchParams} from 'react-router-dom';
import { ButtonSecondary as DSButtonSecondary, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { detectSilences, keptSegments, type Segment } from "./engine";
import { decodeAudio, exportVideo } from "./media";
import { downloadBlob,transcribe } from "./api";
import { useToolkit } from "./ToolkitContext";

export default function VideoEditor({
  initialFile,
  initialSubtitles = [],
}: {
  initialFile: File | null;
  initialSubtitles?: Segment[];
}) {
  const { track,userId,projectId,docs,save,loading,loadError } = useToolkit();
  const [look,setLook]=useState<TextLook>({...defaultTextLook}),[favorites,setFavorites]=useState<TextPreset[]>([]),[styleDirty,setStyleDirty]=useState(false),[styleSaving,setStyleSaving]=useState(false),[styleStatus,setStyleStatus]=useState(''),[styleInvalid,setStyleInvalid]=useState(false);
  const styleEdited=useRef(false);
  useEffect(()=>{if(styleEdited.current||loading||loadError)return;try{const value=readVisualBrand(docs['module-visual-brand'],projectId);setLook(value.look);setFavorites(value.favorites);setStyleInvalid(false);}catch(e){setStyleInvalid(true);setStyleStatus((e as Error).message);}},[docs['module-visual-brand'],projectId,loading,loadError]);
  function changeLook(value:TextLook){styleEdited.current=true;setLook(value);setDirty(true);setStyleDirty(true);setStyleStatus('Vista previa. Guarda para recordarlo en este proyecto.');}
  async function saveStyle(){if(styleSaving||styleInvalid||loading||loadError)return;setStyleSaving(true);setStyleStatus('');try{await save('module-visual-brand',{version:1,projectId,look,favorites});styleEdited.current=false;setStyleDirty(false);setStyleStatus('Estilo y favoritos guardados en este proyecto.');}catch(e){setStyleStatus((e as Error).message);}finally{setStyleSaving(false);}}
  const [params]=useSearchParams();
  const [step,setStep]=useState<'review'|'cuts'|'captions'|'export'>('captions'),[dirty,setDirty]=useState(false),[savedExport,setSavedExport]=useState(false),[captionIndex,setCaptionIndex]=useState(-1),[framing,setFraming]=useState<RecordingRatio|'original'>('original'),[focus,setFocus]=useState(.5),[originalSize,setOriginalSize]=useState({width:16,height:9});
  const previewCuts=useRef<Segment[]|null>(null),previewIndex=useRef(0);
  const [exported,setExported]=useState<File|null>(null),[exportedUrl,setExportedUrl]=useState('');
  useEffect(()=>{if(!exported){setExportedUrl('');return;}const url=URL.createObjectURL(exported);setExportedUrl(url);return()=>URL.revokeObjectURL(url);},[exported]);
  const [file, setFile] = useState<File | null>(initialFile);
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [silences, setSilences] = useState<Segment[]>([]);
  const [subtitles, setSubtitles] = useState<Segment[]>(initialSubtitles);
  const [captionProposal,setCaptionProposal]=useState<Segment[]|null>(null);
  const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;version.current++;};},[]);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [threshold, setThreshold] = useState(-38);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const abort = useRef<AbortController | null>(null);
  const version = useRef(0);
  const selection=useRef(0);
  const [clipIndex,setClipIndex]=useState(0),[playing,setPlaying]=useState(false);
  const [recoverAttempt,setRecoverAttempt]=useState(0),[recoverError,setRecoverError]=useState(''),[recovering,setRecovering]=useState(false);
  const pieceId=params.get('piece');
  useUnsavedNavigation(dirty||styleDirty||styleSaving||!!busy||!!exported&&!savedExport);
  useEffect(()=>{setExported(null);setSavedExport(false);},[segments,subtitles,framing,focus,look]);
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
    setCaptionProposal(null);
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
  async function createCaptions(){
    if(!file||busy||!duration)return;
    const token=version.current,magic=beginMagic('Tu voz se convierte en subtítulos…');
    setBusy('Preparando tu voz…');setNotice('');video.current?.pause();
    try{
      const audio=await prepareCaptionAudio(file);
      if(!alive.current||token!==version.current)return;
      setBusy('FOR U está escuchando tu toma…');
      const rows=await transcribe(audio,projectId);
      if(!alive.current||token!==version.current)return;
      if(!validCaptionTimes(rows,duration))throw new Error('Los tiempos necesitan otro intento. Tu video y tus subtítulos anteriores se conservan.');
      if(!rows.length){setNotice('No encontramos palabras claras en esta toma. Escucha el audio antes de reintentar.');return;}
      setCaptionProposal(rows);setCaptionIndex(0);setNotice('Tu voz ya tiene subtítulos. Reprodúcelos y decide si quieres usarlos.');
    }catch(error){if(alive.current&&token===version.current)setNotice((error as Error).message);}
    finally{finishMagic(magic);if(alive.current&&token===version.current)setBusy('');}
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
        look,
      );
      setExported(new File([output],`for-u-editado.${output.type.includes("mp4")?"mp4":"webm"}`,{type:output.type}));
      downloadBlob(
        output,
        `for-u-editado.${output.type.includes("mp4") ? "mp4" : "webm"}`,
      );
      setDirty(false);setSavedExport(true);
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
    setSubtitles([]);setDirty(false);setStep('captions');setFraming('original');setCaptionIndex(-1);setClipIndex(0);
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

  const proposed=keptSegments(duration,silences),captionRows=captionProposal??subtitles,selectedCaption=subtitles[captionIndex];
  const previewRatio=framing==='original'?originalSize:recordingFrames[framing];
  const previewFactor=framing==='original'?Math.min(1,1280/Math.max(originalSize.width,originalSize.height)):1;
  const artworkWidth=Math.round(previewRatio.width*previewFactor),artworkHeight=Math.round(previewRatio.height*previewFactor);
  function seek(next:number){previewCuts.current=null;video.current?.pause();if(video.current)video.current.currentTime=Math.max(0,Math.min(duration,next));setTime(next);}
  function togglePlay(){const element=video.current;if(!element)return;if(playing){element.pause();return;}let index=segments.findIndex(row=>element.currentTime>=row.start&&element.currentTime<row.end-.025);if(index<0){index=segments.findIndex(row=>row.start>element.currentTime);if(index<0)index=0;element.currentTime=segments[index]?.start??0;}previewCuts.current=segments;previewIndex.current=index;void element.play().catch(()=>setNotice('Toca reproducir para escuchar tu video.'));}
  const activeTool=step==='review'?'captions':step;
  return <section className="video-game video-workbench" aria-busy={!!busy}>
   <header className="video-game-heading"><div>{pieceId?<Link to={'/creator-studio'+linkedPieceQuery(projectId,pieceId,params)+'&tab=profile'}>← Mi contenido</Link>:<span>FOR U</span>}<strong>Editor de video</strong></div>{file&&<button className="workbench-download" type="button" disabled={!!busy||!duration||!!captionProposal} onClick={()=>void exportClip()}>{busy.startsWith('Exportando')?`${Math.round(progress*100)}%`:'↓ Descargar'}</button>}</header>
   {!file?<><h1>Trae tu video.</h1><div className="video-game-upload" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)loadFile(e.dataTransfer.files[0]);}}><span aria-hidden="true">▷</span><p>{recovering?'Abriendo tu toma…':'Elige una grabación. Tu original se conserva.'}</p><label className="video-game-file-button">Elegir video<input type="file" accept="video/*" disabled={!!busy||recovering} onChange={e=>loadFile(e.target.files?.[0])}/></label></div><TextStylePicker compact look={look} favorites={favorites} sample="Tu idea merece brillar" disabled={loading||loadError||styleInvalid} onChange={changeLook} onFavorites={value=>{styleEdited.current=true;setFavorites(value);setStyleDirty(true);}} onSave={()=>void saveStyle()} saving={styleSaving} status={styleStatus}/></>:<>
    <div className="workbench-preview-stage"><div className="video-game-preview" style={{aspectRatio:`${previewRatio.width}/${previewRatio.height}`,width:`min(100%,420px,${24*previewRatio.width/previewRatio.height}dvh)`}}><video aria-label="Vista previa de tu video" ref={video} src={url} playsInline style={{objectFit:framing==='original'?'contain':'cover',objectPosition:`${focus*100}% 50%`}} onLoadedMetadata={e=>metadata(e.currentTarget)} onDurationChange={e=>{if(!duration&&Number.isFinite(e.currentTarget.duration)){metadata(e.currentTarget);e.currentTarget.currentTime=0;}}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>playback(e.currentTarget)} onEnded={e=>{playback(e.currentTarget);setPlaying(false);}} onError={()=>setNotice('No pudimos reproducir esta toma. Prueba MP4 o WebM.')}/><CaptionArtwork rows={captionRows} time={time} width={artworkWidth} height={artworkHeight} look={look} playing={playing} clock={()=>video.current?.currentTime??time}/></div></div>
    <div className="workbench-playback"><button type="button" aria-label={playing?'Pausar video':'Reproducir montaje'} disabled={!!busy||!duration} onClick={togglePlay}>{playing?'Ⅱ':'▶'}</button><time>{timelineClock(time)} / {timelineClock(duration)}</time><VideoGuide step={activeTool} user={userId} project={projectId} disabled={!!busy||recovering}/></div>
    <nav className="workbench-tools" aria-label="Herramientas de edición">{([{id:'cuts',label:'✂ Recortar'},{id:'captions',label:'▤ Subtítulos'},{id:'export',label:'▣ Formato'}] as const).map(tool=><button key={tool.id} type="button" aria-pressed={activeTool===tool.id} disabled={!!busy} onClick={()=>{setStep(tool.id);setNotice('');}}>{tool.label}</button>)}</nav>
    {duration>0&&<VideoTimeline url={url} duration={duration} time={time} clips={segments} captions={captionRows} captionIndex={captionIndex} clipIndex={activeTool==='cuts'?clipIndex:-1} proposal={!!captionProposal} disabled={!!busy} onSeek={seek} onCaption={index=>{setStep('captions');setCaptionIndex(index);}} onClip={index=>{setStep('cuts');setClipIndex(index);}} onClips={editSegments} onCaptions={editSubtitles}/>}
    <section className="workbench-tool-panel">
    {activeTool==='captions'&&<div className="video-game-captions">{captionProposal?<div className="workbench-subtitle-proposal"><p>Reproduce los subtítulos en la línea de tiempo antes de usarlos.</p><div className="workbench-inline-actions"><DSButtonPrimary disabled={!!busy} onClick={()=>{editSubtitles(captionProposal);setCaptionProposal(null);setCaptionIndex(-1);seek(0);setNotice('Subtítulos listos. Toca cualquier bloque para corregirlo.');}}>Usar estos subtítulos</DSButtonPrimary><button className="workbench-text-button" onClick={()=>{setCaptionProposal(null);setCaptionIndex(-1);}}>Conservar mi versión</button></div></div>:<>{!subtitles.length?<div className="workbench-inline-actions"><DSButtonPrimary disabled={!!busy||!duration} onClick={()=>void createCaptions()}>{busy||'✦ Subtítulos automáticos'}</DSButtonPrimary><small>FOR U escucha el audio con Gemini. Tú revisas el resultado.</small></div>:selectedCaption?<div className="workbench-caption-input"><label htmlFor="timeline-caption-text">Editar subtítulo</label><textarea id="timeline-caption-text" rows={2} maxLength={120} value={selectedCaption.text} disabled={!!busy} onChange={e=>editSubtitles(subtitles.map((row,i)=>i===captionIndex?{...row,text:e.target.value}:row))}/><div><time>{timelineClock(selectedCaption.start)} — {timelineClock(selectedCaption.end)}</time><button type="button" disabled={!!busy} onClick={()=>{editSubtitles(subtitles.filter((_,i)=>i!==captionIndex));setCaptionIndex(-1);}}>Eliminar</button><button type="button" onClick={()=>setCaptionIndex(-1)}>Listo ✓</button></div></div>:<small>Toca un bloque de subtítulo para cambiar su texto.</small>}
    <details className="video-game-extra"><summary>Más opciones de subtítulos</summary><div className="workbench-inline-actions">{!!subtitles.length&&<DSButtonSecondary disabled={!!busy} onClick={()=>void createCaptions()}>✦ Volver a generar</DSButtonSecondary>}<DSButtonSecondary disabled={!!busy||duration<.1} onClick={()=>{const nextStart=Math.max(0,Math.min(time,duration-.1));if(subtitles.some(row=>nextStart<row.end&&nextStart+1>row.start)){setNotice('Mueve el cursor a un espacio libre antes de añadir un subtítulo.');return;}const row={start:nextStart,end:Math.min(duration,nextStart+1),text:'Tu texto'};const next=[...subtitles,row].sort((a,b)=>a.start-b.start);editSubtitles(next);setCaptionIndex(next.indexOf(row));}}>＋ Subtítulo</DSButtonSecondary><label className="video-game-file-button">Importar SRT<input type="file" accept=".srt,text/plain" disabled={!!busy} onChange={async e=>{const selected=e.target.files?.[0];if(!selected)return;try{if(selected.size>300000)throw new Error('Usa un archivo SRT de hasta 300 KB.');const rows=readSrt(await selected.text());if(!validCaptionTimes(rows,duration))throw new Error('Los tiempos superan la duración de tu toma.');editSubtitles(rows);setCaptionIndex(-1);}catch(error){setNotice((error as Error).message);}}}/></label></div></details></>}
    <TextStylePicker look={look} favorites={favorites} sample={selectedCaption?.text||captionRows[0]?.text||'Tu idea merece brillar'} disabled={!!busy||loading||loadError||styleInvalid} onChange={changeLook} onFavorites={value=>{styleEdited.current=true;setFavorites(value);setStyleDirty(true);setStyleStatus('Favoritos en vista previa. Guarda para recordarlos.');}} onSave={()=>void saveStyle()} saving={styleSaving} status={styleStatus}/>
    </div>}
    {activeTool==='cuts'&&<div className="video-game-cut-actions"><div className="workbench-inline-actions"><DSButtonSecondary disabled={!!busy||!duration} onClick={()=>{const next=splitTimeline(segments,time);if(next===segments)setNotice('Mueve el cursor dentro del video para dividirlo.');else{editSegments(next);setClipIndex(next.findIndex(row=>row.start===time));}}}>✂ Dividir aquí</DSButtonSecondary><DSButtonSecondary disabled={!!busy||segments.length<2||!segments[clipIndex]} onClick={()=>{editSegments(segments.filter((_,i)=>i!==clipIndex));setClipIndex(0);}}>Quitar clip</DSButtonSecondary><DSButtonPrimary disabled={!!busy||!duration} onClick={()=>void analyze()}>{busy||'✦ Detectar silencios'}</DSButtonPrimary></div>{silences.length>0&&<div className="workbench-subtitle-proposal"><p>{silences.length} pausas detectadas. Escucha antes de cortar.</p><div className="workbench-inline-actions"><DSButtonSecondary disabled={!!busy||!proposed.length} onClick={()=>playCuts(proposed)}>▶ Escuchar propuesta</DSButtonSecondary><DSButtonPrimary disabled={!!busy||!proposed.length} onClick={()=>{editSegments(proposed);setClipIndex(0);setSilences([]);setNotice('Cortes aplicados. Tu original se conserva.');}}>Aplicar cortes</DSButtonPrimary></div></div>}<details className="video-game-extra"><summary>Ajustes de recorte</summary><label>Sensibilidad<input aria-label="Sensibilidad del silencio" type="range" min="-55" max="-20" value={threshold} disabled={!!busy} onChange={e=>{setThreshold(Number(e.target.value));setSilences([]);}}/></label><DSButtonSecondary disabled={!!busy} onClick={()=>{editSegments([{start:0,end:duration}]);setSilences([]);setClipIndex(0);setNotice('Video completo restaurado.');}}>Restaurar video completo</DSButtonSecondary></details></div>}
    {activeTool==='export'&&<div className="video-game-export"><nav aria-label="Formato de exportación"><button type="button" disabled={!!busy} aria-pressed={framing==='original'} onClick={()=>{setFraming('original');setDirty(true);}}>Original</button>{(Object.keys(recordingFrames) as RecordingRatio[]).map(id=><button key={id} type="button" disabled={!!busy} aria-pressed={framing===id} onClick={()=>{setFraming(id);setFocus(.5);setDirty(true);}}>{recordingFrames[id].label}</button>)}</nav>{framing!=='original'&&<label className="video-game-focus">Encuadre<input aria-label="Encuadre de exportación" type="range" min="0" max="1" step=".01" value={focus} disabled={!!busy} onChange={e=>{setFocus(Number(e.target.value));setDirty(true);}}/></label>}<small>El marco muestra el recorte que se descargará.</small></div>}
    </section>
    {busy.startsWith('Exportando')&&<div className="workbench-inline-actions"><progress aria-label="Progreso de exportación" value={progress} max={1}/><button className="workbench-text-button" onClick={()=>abort.current?.abort()}>Cancelar descarga</button><small>Mantén la pestaña visible mientras se prepara.</small></div>}
    {exported&&<details className="workbench-cloud"><summary>✓ Descargado · guardar también en FOR U</summary><video className="video-game-result-preview" src={exportedUrl} controls playsInline/><p>Guardarlo aquí ocupa espacio en tu cuenta. Descargarlo a tu dispositivo no lo sube a FOR U.</p>{pieceId&&<SavePieceFile key={exported.name+exported.lastModified} file={exported} user={userId} project={projectId} piece={pieceId} kind="video" disabled={!!busy} label="Guardar en mi pieza" onSaved={()=>{setDirty(false);setSavedExport(true);}}/>}</details>}
    <details className="video-game-extra"><summary>Archivo original</summary><div className="workbench-inline-actions"><DSButtonSecondary onClick={()=>downloadBlob(file,file.name)}>Descargar original</DSButtonSecondary><label className="video-game-file-button">Cambiar toma<input type="file" accept="video/*" disabled={!!busy} onChange={e=>{if(dirty&&!window.confirm('¿Cambiar de toma y descartar estos ajustes? Tu original se conserva.'))return;loadFile(e.target.files?.[0]);}}/></label></div></details>
   </>}
   {styleInvalid&&<p role="alert">{styleStatus}</p>}
   {recoverError&&<div role="alert"><p>{recoverError}</p><DSButtonSecondary disabled={recovering} onClick={()=>setRecoverAttempt(value=>value+1)}>Reintentar video guardado</DSButtonSecondary></div>}{notice&&<p role="status" className="video-game-notice">{notice}</p>}
  </section>;
}
