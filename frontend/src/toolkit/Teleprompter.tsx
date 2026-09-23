import { useEffect, useRef, useState } from "react";
import { useToolkit } from "./ToolkitContext";
import { downloadBlob } from "./api";
import { recordingMime } from "./media";
import { hasLiveSpeech, startLiveCaptions } from "./speech";
import { scriptLines } from "./reading";
import type { Segment } from "./engine";

export default function Teleprompter({
  initialScript,
  onEdit,
}: {
  initialScript: string;
  onEdit: (file: File, captions: Segment[]) => void;
}) {
  const { docs, save, track } = useToolkit();
  const [script, setScript] = useState(
    initialScript ||
      String(
        docs.script ??
          "Mira a la cámara.\n\nCuenta qué hace especial a tu negocio.\n\nInvita a tu comunidad a dar el siguiente paso.",
      ),
  );
  const [speed, setSpeed] = useState(Number(docs.readingSpeed ?? 28));
  const [fontSize, setFontSize] = useState(32);
  const [activeLine, setActiveLine] = useState(0);
  const lines = scriptLines(script);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [clip, setClip] = useState<Blob | null>(null);
  const [clipUrl, setClipUrl] = useState("");
  const [autoPause, setAutoPause] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState(false);
  const captions = useRef<Segment[]>([]);
  const stopSpeech = useRef<(() => void) | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const started = useRef(0);
  const active = useRef(true);
  const levelContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      stopSpeech.current?.();
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      void levelContext.current?.close();
    };
  }, []);
  // Keep the preview URL tied to the lifetime of the recorded media resource.
  useEffect(() => {
    if (!clip) return;
    const url = URL.createObjectURL(clip);
    // Synchronize the view with its external data or media resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClipUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [clip]);
  useEffect(() => {
    if (!playing || (autoPause && quiet)) return;
    let frame = 0;
    let previous = 0;
    let offset = text.current?.scrollTop ?? 0;
    const tick = (now: number) => {
      if (previous && text.current) {
        offset += speed * Math.min(0.05, (now - previous) / 1000);
        text.current.scrollTop = offset;
        if (offset >= text.current.scrollHeight - text.current.clientHeight) {
          setPlaying(false);
          return;
        }
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, quiet, autoPause]);
  useEffect(() => {
    if (!ready || !autoPause || !stream.current) {
      setQuiet(false);
      return;
    }
    const audio = new AudioContext();
    levelContext.current = audio;
    const source = audio.createMediaStreamSource(stream.current);
    const analyser = audio.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    let lastVoice = Date.now();
    void audio.resume();
    const interval = window.setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      const rms = Math.sqrt(
        samples.reduce((sum, value) => sum + value * value, 0) / samples.length,
      );
      if (rms > 0.025) lastVoice = Date.now();
      setQuiet(Date.now() - lastVoice > 1600);
    }, 150);
    return () => {
      clearInterval(interval);
      source.disconnect();
      void audio.close();
      levelContext.current = null;
    };
  }, [autoPause, ready]);
  async function enableCamera() {
    setBusy(true);
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "La cámara requiere HTTPS o localhost y un navegador compatible.",
        );
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: true,
      });
      if (!active.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      setReady(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Permite el acceso a cámara y micrófono para grabar.",
      );
    } finally {
      setBusy(false);
    }
  }
  function start() {
    setError("");
    try {
      if (!stream.current) return;
      const mimeType = recordingMime();
      const next = new MediaRecorder(
        stream.current,
        mimeType ? { mimeType } : undefined,
      );
      const chunks: Blob[] = [];
      next.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      next.onstop = () => {
        stopSpeech.current?.();
        stopSpeech.current = null;
        if (!active.current) return;
        setClip(new Blob(chunks, { type: next.mimeType }));
        setRecording(false);
        setPlaying(false);
        track("video", true, (Date.now() - started.current) / 1000, 60);
      };
      next.onerror = () => {
        setError("La grabación se interrumpió. Inténtalo de nuevo.");
        setRecording(false);
        setPlaying(false);
      };
      recorder.current = next;
      started.current = Date.now();
      captions.current = [];
      next.start(500);
      setRecording(true);
      setPlaying(true);
      if (liveCaptions) {
        try {
          stopSpeech.current = startLiveCaptions(
            (segment) => captions.current.push(segment),
            setError,
          );
        } catch (e) {
          setError((e as Error).message);
        }
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function saveSettings() {
    try {
      await save("script", script);
      await save("readingSpeed", speed);
      setError("Guion y velocidad guardados.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="tk-two-columns">
      <section className="tk-card tk-stack">
        <div className="tk-eyebrow">TU VOZ, TU NEGOCIO</div>
        <h2>Habla con confianza</h2>
        <label>
          Tu guion
          <textarea
            rows={10}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={recording}
          />
        </label>
        <label>
          Velocidad · {speed} píxeles/s
          <input
            type="range"
            min="8"
            max="70"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <small>
          {docs.readingSpeed
            ? "Comienza con la velocidad que guardaste en tu última sesión."
            : "Empieza despacio y encuentra tu ritmo."}
        </small>
        <label>
          Tamaño · {fontSize}px
          <input
            type="range"
            min="20"
            max="60"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </label>
        <label className="tk-check">
          <input
            type="checkbox"
            checked={autoPause}
            onChange={(e) => setAutoPause(e.target.checked)}
          />{" "}
          Pausar el texto cuando dejo de hablar
        </label>
        <small>
          La pausa sigue el volumen del micrófono. El ruido de fondo puede
          afectar la detección.
        </small>
        <label className="tk-check">
          <input
            type="checkbox"
            checked={liveCaptions}
            disabled={recording || !hasLiveSpeech()}
            onChange={(e) => setLiveCaptions(e.target.checked)}
          />{" "}
          Crear subtítulos mientras hablo
        </label>
        <small>
          {hasLiveSpeech()
            ? "Opcional: el servicio de voz de tu navegador procesa el audio. Los tiempos son aproximados y puedes editarlos después."
            : "Este navegador no admite reconocimiento de voz en vivo. Puedes transcribir el archivo desde el editor."}
        </small>
        <button onClick={saveSettings}>Guardar guion y ritmo</button>
      </section>
      <section className="tk-card tk-stack">
        <div className="tk-camera">
          <video ref={video} muted playsInline className="tk-camera-feed" />
          {!ready && (
            <div className="tk-camera-placeholder">
              Tu cámara aparecerá aquí
            </div>
          )}
          <div className="tk-eye-line">
            <span>Mira aquí</span>
          </div>
          <div
            ref={text}
            className="tk-prompter-text"
            style={{ fontSize }}
            onScroll={(e) => {
              const container = e.currentTarget;
              const top = container.getBoundingClientRect().top;
              const elements = Array.from(
                container.querySelectorAll<HTMLElement>("[data-reading-line]"),
              );
              let nearest = 0;
              let distance = Infinity;
              elements.forEach((line, index) => {
                const next = Math.abs(line.getBoundingClientRect().top - top);
                if (next < distance) {
                  distance = next;
                  nearest = index;
                }
              });
              setActiveLine(nearest);
            }}
          >
            {lines.map((line, index) => (
              <div
                key={index}
                data-reading-line
                className={index === activeLine ? "is-active" : ""}
              >
                {line || "\u00a0"}
              </div>
            ))}
            <div aria-hidden="true" style={{ height: 350 }} />
          </div>
          {recording && <span className="tk-rec">● Grabando</span>}
        </div>
        <div className="tk-toolbar">
          {!ready ? (
            <button
              className="tk-primary"
              onClick={enableCamera}
              disabled={busy}
            >
              {busy ? "Abriendo cámara…" : "Activar cámara"}
            </button>
          ) : (
            <button
              className={recording ? "tk-danger" : "tk-primary"}
              onClick={() => (recording ? recorder.current?.stop() : start())}
            >
              {recording ? "Terminar grabación" : "Grabar video"}
            </button>
          )}
          <button onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pausar texto" : "Reproducir texto"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setActiveLine(0);
              if (text.current) text.current.scrollTop = 0;
            }}
          >
            Reiniciar texto
          </button>
          {ready && !recording && (
            <button
              onClick={() => {
                stream.current?.getTracks().forEach((t) => t.stop());
                stream.current = null;
                setReady(false);
                setPlaying(false);
              }}
            >
              Apagar cámara
            </button>
          )}
        </div>
        {autoPause && quiet && playing && (
          <p role="status">Texto en pausa. Continúa hablando para avanzar.</p>
        )}
        <small>
          La vista previa funciona como espejo. El archivo conserva la
          orientación natural de la cámara.
        </small>
        {clip && (
          <>
            <h3>Tu grabación</h3>
            <video
              src={clipUrl}
              controls
              playsInline
              className="tk-video-preview"
            />
            <div className="tk-toolbar">
              <button
                onClick={() =>
                  downloadBlob(
                    clip,
                    `for-u.${clip.type.includes("mp4") ? "mp4" : "webm"}`,
                  )
                }
              >
                Descargar video
              </button>
              <button
                className="tk-primary"
                onClick={() =>
                  onEdit(
                    new File(
                      [clip],
                      `grabacion.${clip.type.includes("mp4") ? "mp4" : "webm"}`,
                      { type: clip.type },
                    ),
                    captions.current,
                  )
                }
              >
                Abrir en el editor
              </button>
            </div>
          </>
        )}
        {error && (
          <p role="status" className="tk-notice">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
