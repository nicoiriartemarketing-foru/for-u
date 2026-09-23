import { useEffect, useRef, useState } from "react";
import { detectSilences, keptSegments, moveItem, type Segment } from "./engine";
import { decodeAudio, exportVideo } from "./media";
import { downloadBlob, transcribe } from "./api";
import { useToolkit } from "./ToolkitContext";

export default function VideoEditor({
  initialFile,
  initialSubtitles = [],
}: {
  initialFile: File | null;
  initialSubtitles?: Segment[];
}) {
  const { track, demo } = useToolkit();
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
  const drag = useRef(-1);
  // A new external media resource invalidates its duration, cuts, and captions together.
  useEffect(() => {
    version.current++;
    // Synchronize the view with its external data or media resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        `${found.length} pausas detectadas. Revisa antes de aplicar los cortes.`,
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function captions() {
    if (!file) return;
    setBusy("Transcribiendo…");
    setNotice("");
    const token = version.current;
    try {
      const result = await transcribe(file);
      if (token === version.current) {
        setSubtitles(result);
        setNotice("Subtítulos listos. Revisa los nombres y la puntuación.");
      }
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function exportClip() {
    if (!file) return;
    setBusy("Exportando en tiempo real…");
    setNotice("");
    setProgress(0);
    abort.current = new AbortController();
    try {
      const output = await exportVideo(
        file,
        segments,
        subtitles,
        setProgress,
        abort.current.signal,
      );
      downloadBlob(
        output,
        `for-u-editado.${output.type.includes("mp4") ? "mp4" : "webm"}`,
      );
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
    setSubtitles([]);
    setFile(next);
    setNotice("");
  }
  function metadata(element: HTMLVideoElement) {
    if (Number.isFinite(element.duration)) {
      setDuration(element.duration);
      setSegments([{ start: 0, end: element.duration }]);
    } else {
      element.currentTime = 1e10;
    }
  }
  return (
    <div className="tk-stack">
      <section
        className="tk-card tk-stack"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) loadFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="tk-toolbar">
          <h2>Tu video, con lo esencial</h2>
          <label className="tk-file-button">
            Elegir video
            <input
              type="file"
              accept="video/*"
              disabled={!!busy}
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </label>
        </div>
        {!file ? (
          <div className="tk-drop">
            Arrastra tu video aquí o elige una grabación.
          </div>
        ) : (
          <>
            <div className="tk-editor-preview">
              <video
                ref={video}
                src={url}
                controls
                playsInline
                className="tk-video-preview"
                onLoadedMetadata={(e) => metadata(e.currentTarget)}
                onDurationChange={(e) => {
                  if (!duration && Number.isFinite(e.currentTarget.duration)) {
                    metadata(e.currentTarget);
                    e.currentTarget.currentTime = 0;
                  }
                }}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onError={() =>
                  setNotice(
                    "Este navegador no puede reproducir el formato. Prueba MP4 o WebM.",
                  )
                }
              />
              <div className="tk-caption-preview">
                {subtitles
                  .filter((s) => time >= s.start && time < s.end)
                  .map((s) => s.text)
                  .join(" ")}
              </div>
            </div>
            <small>
              Vista previa del original con subtítulos. Los cortes y el orden se
              aplican al exportar.
            </small>
            <div className="tk-toolbar">
              <label>
                Umbral de silencio · {threshold} dB
                <input
                  type="range"
                  min="-55"
                  max="-20"
                  value={threshold}
                  disabled={!!busy}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
              </label>
              <button disabled={!!busy || !duration} onClick={analyze}>
                Detectar silencios
              </button>
              <button
                disabled={!!busy || !silences.length}
                onClick={() => setSegments(keptSegments(duration, silences))}
              >
                Aplicar {silences.length} cortes suaves
              </button>
              <button
                disabled={!!busy || !duration}
                onClick={() => {
                  setSegments([{ start: 0, end: duration }]);
                  setSilences([]);
                }}
              >
                Restaurar original
              </button>
            </div>
            <small>
              Conservamos 120 ms junto a cada borde para respetar el inicio y el
              final de las palabras.
            </small>
          </>
        )}
      </section>
      {!!duration && (
        <div className="tk-two-columns">
          <section className="tk-card tk-stack">
            <h3>Orden de los fragmentos</h3>
            <p>Arrastra para cambiar el orden o usa las flechas.</p>
            {segments.map((segment, i) => (
              <div
                key={`${i}-${segment.start}`}
                className="tk-segment"
                draggable={!busy}
                onDragStart={() => {
                  drag.current = i;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setSegments((previous) =>
                    moveItem(previous, drag.current, i),
                  );
                  drag.current = -1;
                }}
              >
                <span>⋮⋮ {i + 1}</span>
                <label>
                  Inicio
                  <input
                    type="number"
                    min="0"
                    max={segment.end - 0.05}
                    step=".1"
                    value={Number(segment.start.toFixed(2))}
                    disabled={!!busy}
                    onChange={(e) =>
                      setSegments((current) =>
                        current.map((s, j) =>
                          j === i
                            ? {
                                ...s,
                                start: Math.max(
                                  0,
                                  Math.min(
                                    s.end - 0.05,
                                    Number(e.target.value),
                                  ),
                                ),
                              }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Fin
                  <input
                    type="number"
                    min={segment.start + 0.05}
                    max={duration}
                    step=".1"
                    value={Number(segment.end.toFixed(2))}
                    disabled={!!busy}
                    onChange={(e) =>
                      setSegments((current) =>
                        current.map((s, j) =>
                          j === i
                            ? {
                                ...s,
                                end: Math.min(
                                  duration,
                                  Math.max(
                                    s.start + 0.05,
                                    Number(e.target.value),
                                  ),
                                ),
                              }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  aria-label={`Subir fragmento ${i + 1}`}
                  disabled={!!busy || i === 0}
                  onClick={() => setSegments(moveItem(segments, i, i - 1))}
                >
                  ↑
                </button>
                <button
                  aria-label={`Bajar fragmento ${i + 1}`}
                  disabled={!!busy || i === segments.length - 1}
                  onClick={() => setSegments(moveItem(segments, i, i + 1))}
                >
                  ↓
                </button>
                <button
                  disabled={!!busy}
                  aria-label={`Quitar fragmento ${i + 1}`}
                  onClick={() =>
                    setSegments(segments.filter((_, j) => i !== j))
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <button
              disabled={!!busy || time <= 0 || time >= duration}
              onClick={() => {
                const i = segments.findIndex(
                  (s) => time > s.start + 0.05 && time < s.end - 0.05,
                );
                if (i >= 0)
                  setSegments(
                    segments.flatMap((s, j) =>
                      j === i
                        ? [
                            { start: s.start, end: time },
                            { start: time, end: s.end },
                          ]
                        : [s],
                    ),
                  );
              }}
            >
              Dividir en {time.toFixed(1)} s
            </button>
            <strong>
              Duración final:{" "}
              {segments.reduce((sum, s) => sum + s.end - s.start, 0).toFixed(1)}{" "}
              s
            </strong>
          </section>
          <section className="tk-card tk-stack">
            <h3>Subtítulos</h3>
            <div className="tk-toolbar">
              <button disabled={!!busy || demo} onClick={captions}>
                Transcribir con IA
              </button>
              <button
                disabled={!!busy}
                onClick={() =>
                  setSubtitles([
                    ...subtitles,
                    {
                      start: Math.min(time, duration - 0.1),
                      end: Math.min(duration, time + 3),
                      text: "",
                    },
                  ])
                }
              >
                Agregar subtítulo
              </button>
            </div>
            {demo && (
              <small>
                La transcripción automática requiere una cuenta conectada.
                Puedes probar los subtítulos manuales.
              </small>
            )}
            {subtitles.map((s, i) => (
              <div key={i} className="tk-subtitle-row">
                <div className="tk-toolbar">
                  <label>
                    Desde
                    <input
                      aria-label={`Inicio de subtítulo ${i + 1}`}
                      type="number"
                      min="0"
                      max={s.end - 0.01}
                      step=".1"
                      value={s.start}
                      disabled={!!busy}
                      onChange={(e) =>
                        setSubtitles(
                          subtitles.map((item, j) =>
                            j === i
                              ? {
                                  ...item,
                                  start: Math.max(
                                    0,
                                    Math.min(
                                      item.end - 0.01,
                                      Number(e.target.value),
                                    ),
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Hasta
                    <input
                      aria-label={`Fin de subtítulo ${i + 1}`}
                      type="number"
                      min={s.start + 0.01}
                      max={duration}
                      step=".1"
                      value={s.end}
                      disabled={!!busy}
                      onChange={(e) =>
                        setSubtitles(
                          subtitles.map((item, j) =>
                            j === i
                              ? {
                                  ...item,
                                  end: Math.min(
                                    duration,
                                    Math.max(
                                      item.start + 0.01,
                                      Number(e.target.value),
                                    ),
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    aria-label={`Eliminar subtítulo ${i + 1}`}
                    disabled={!!busy}
                    onClick={() =>
                      setSubtitles(subtitles.filter((_, j) => j !== i))
                    }
                  >
                    ×
                  </button>
                </div>
                <textarea
                  aria-label={`Texto de subtítulo ${i + 1}`}
                  value={s.text}
                  disabled={!!busy}
                  onChange={(e) =>
                    setSubtitles(
                      subtitles.map((item, j) =>
                        j === i ? { ...item, text: e.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </section>
        </div>
      )}
      {file && (
        <section className="tk-card tk-toolbar">
          <button
            className="tk-primary"
            disabled={!!busy || !segments.length}
            onClick={exportClip}
          >
            Exportar con subtítulos
          </button>
          {busy && <span role="status">{busy}</span>}
          {busy.startsWith("Exportando") && (
            <>
              <progress value={progress} max={1} />
              <button onClick={() => abort.current?.abort()}>Cancelar</button>
            </>
          )}
          <small>Deja esta pestaña visible durante la exportación.</small>
        </section>
      )}
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </div>
  );
}
