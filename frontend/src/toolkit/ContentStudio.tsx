import { useState } from "react";
import { askAI, downloadBlob, templateContent } from "./api";
import { useToolkit } from "./ToolkitContext";
import type { ContentDraft } from "./types";
export default function ContentStudio({
  onScript,
}: {
  onScript: (text: string) => void;
}) {
  const { business, docs, save, demo, track } = useToolkit();
  const previous = docs.content as ContentDraft | undefined;
  const [topic, setTopic] = useState(previous?.topic ?? "");
  const [tone, setTone] = useState(previous?.tone ?? "Cercano");
  const [format, setFormat] = useState(previous?.format ?? "caption");
  const [text, setText] = useState(previous?.text ?? "");
  const [source, setSource] = useState(previous?.source ?? "template");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function generate() {
    setBusy(true);
    setNotice("");
    const started = Date.now();
    try {
      const response = await askAI(
        format as "caption" | "script" | "hashtags",
        `Tema: ${topic}. Tono: ${tone}.`,
        business,
      );
      setText(response);
      setSource("ai");
      track(format, true, (Date.now() - started) / 1000);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveDraft() {
    try {
      await save("content", { topic, tone, format, text, source });
      setNotice("Borrador guardado.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <div className="tk-two-columns">
      <section className="tk-card tk-stack">
        <div className="tk-eyebrow">DE UNA IDEA A UNA PUBLICACIÓN</div>
        <h2>Algo que vale la pena contar</h2>
        <p>
          Contenido para {business.name}, pensado en {business.audience}.
        </p>
        <label>
          ¿Qué quieres contar?
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`Por qué elegir ${business.offer}`}
            rows={4}
            maxLength={2000}
          />
        </label>
        <label>
          Formato
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="caption">Caption para Instagram</option>
            <option value="script">Guion de 30 segundos</option>
            <option value="hashtags">Hashtags</option>
          </select>
        </label>
        <label>
          Tono
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Cercano</option>
            <option>Profesional</option>
            <option>Divertido</option>
            <option>Inspirador</option>
          </select>
        </label>
        <button
          className="tk-primary"
          disabled={busy || !topic.trim() || demo}
          onClick={generate}
        >
          {busy ? "Escribiendo contigo…" : "Generar con IA"}
        </button>
        <button
          disabled={busy}
          onClick={() => {
            setText(templateContent(business, topic, format));
            setSource("template");
          }}
        >
          Empezar con una plantilla
        </button>
        {demo && (
          <small>
            La IA se activa con tu cuenta. Las plantillas están listas para
            probar.
          </small>
        )}
        <div className="tk-tip">
          Sugerencia para empezar:{" "}
          {business.industry === "gastronomy"
            ? "un reel mostrando la preparación de tu producto."
            : "un carrusel que responda tres dudas de tus clientes."}{" "}
          Ajustaremos las recomendaciones cuando tengas resultados.
        </div>
      </section>
      <section className="tk-card tk-stack">
        <div className="tk-toolbar">
          <h3>Tu borrador</h3>
          <span className="tk-badge">
            {source === "ai" ? "Generado con IA" : "Plantilla editable"}
          </span>
        </div>
        <textarea
          aria-label="Contenido generado"
          className="tk-content-output"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tu próximo contenido empieza aquí…"
          rows={15}
        />
        <small>
          {text.trim().split(/\s+/).filter(Boolean).length} palabras · revisa
          los datos de tu negocio antes de publicar.
        </small>
        <div className="tk-toolbar">
          <button disabled={!text || busy} onClick={saveDraft}>
            Guardar borrador
          </button>
          <button
            disabled={!text}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setNotice("Texto copiado.");
              } catch {
                setNotice("Selecciona el texto para copiarlo.");
              }
            }}
          >
            Copiar
          </button>
          <button
            disabled={!text}
            onClick={() =>
              downloadBlob(
                new Blob([text], { type: "text/plain;charset=utf-8" }),
                "contenido-for-u.txt",
              )
            }
          >
            Descargar
          </button>
          <button
            className="tk-secondary"
            disabled={!text}
            onClick={() => onScript(text)}
          >
            Practicar en teleprompter →
          </button>
        </div>
        {notice && (
          <p role="status" className="tk-notice">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}
