import { Card as DSCard, Select as DSSelect, StepIndicator } from '../components/ui/DesignSystem';
import { Textarea as DSTextarea, ButtonPrimary as DSButtonPrimary, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
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
  const [step, setStep] = useState(previous?.text ? 2 : 1);
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
      setStep(2);
      setSource("ai");
      track(format, true, (Date.now() - started) / 1000);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveDraft() {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await save("content", { topic, tone, format, text, source });
      setNotice("Borrador guardado.");
      setStep(3);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="tk-stack magic-card">
      <style>{`
        .tk-stack.magic-card {
           border: 1px solid rgba(212, 212, 212, 0.76);
           border-radius: var(--border-radius-grande);
           background: var(--color-superficie);
           box-shadow: var(--sombra-magica);
           padding: 1rem;
        }
        .tk-stack .tk-card {
           box-shadow: var(--sombra-suave);
           border-radius: var(--border-radius-grande);
        }
        .tk-stack textarea, .tk-stack input, .tk-stack select {
           border: 1px solid rgba(212, 212, 212, 0.16);
           border-radius: 16px;
           background: rgba(250, 250, 250, 0.86);
        }
        .tk-stack .tk-eyebrow, .tk-stack .tk-toolbar {
           background: var(--gradient-fondo);
           border-bottom: 1px solid rgba(212, 212, 212, 0.76);
           padding: 1rem;
           margin-bottom: 1rem;
           border-radius: var(--border-radius-grande) var(--border-radius-grande) 0 0;
           margin: -1rem -1rem 1rem -1rem;
        }
        .tk-stack .magic-button-primary {
           background: var(--gradient-boton); color: var(--color-texto); border-radius: 999px; padding: 0.75rem 1.1rem; font-weight: 900; box-shadow: var(--sombra-media);
        }
      `}</style>
      <StepIndicator currentStep={step} totalSteps={3} labels={['Define tu idea', 'Revisa el borrador', 'Guarda y úsalo']} /><div className="tk-two-columns">
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-eyebrow">DE UNA IDEA A UNA PUBLICACIÓN</div>
        <h2>Algo que vale la pena contar</h2>
        <p>
          Contenido para {business.name}, pensado en {business.audience}.
        </p>
        <DSTextarea disabled={busy} label="¿Qué quieres contar?" info="Indica el tema, a quién quieres llegar y los detalles reales de tu oferta."
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setStep(1); setNotice(""); }}
            placeholder={`Por qué elegir ${business.offer}`}
            rows={4}
            maxLength={2000}
          />
        <DSSelect disabled={busy} label="Formato" info="Elige texto para una publicación, un guion breve o una lista de hashtags." value={format} onChange={(e) => { setFormat(e.target.value); setStep(1); setNotice(""); }}>
            <option value="caption">Caption para Instagram</option>
            <option value="script">Guion de 30 segundos</option>
            <option value="hashtags">Hashtags</option>
          </DSSelect>
        <DSSelect disabled={busy} label="Tono" info="Define cómo quieres que suene el texto. Siempre podrás editarlo antes de usarlo." value={tone} onChange={(e) => { setTone(e.target.value); setStep(1); setNotice(""); }}>
            <option>Cercano</option>
            <option>Profesional</option>
            <option>Divertido</option>
            <option>Inspirador</option>
          </DSSelect>
        <DSButtonPrimary
          className="tk-primary magic-button magic-button-primary"
          disabled={busy || !topic.trim() || demo}
          tooltip="Genera una propuesta con IA usando tu idea y el contexto del negocio. No publica el resultado." onClick={generate}
        >
          {busy ? "Escribiendo contigo…" : "Generar con IA"}
        </DSButtonPrimary>
        <DSButtonSecondary
          disabled={busy}
          tooltip="Crea un borrador editable con una plantilla, sin solicitar IA."
          onClick={() => {
            setText(templateContent(business, topic, format));
            setSource("template");
            setStep(2);
            setNotice("");
          }}
        >
          Empezar con una plantilla
        </DSButtonSecondary>
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
      </DSCard>
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-toolbar">
          <h3>Tu borrador</h3>
          <span className="tk-badge">
            {source === "ai" ? "Generado con IA" : "Plantilla editable"}
          </span>
        </div>
        <DSTextarea
          disabled={busy} label="Contenido generado" info="Revisa y ajusta este texto. Guardarlo no lo publica en redes sociales."
          className="tk-content-output"
          value={text}
          onChange={(e) => { setText(e.target.value); setStep(2); setNotice(""); }}
          placeholder="Tu próximo contenido empieza aquí…"
          rows={15}
        />
        <small>
          {text.trim().split(/\s+/).filter(Boolean).length} palabras · revisa
          los datos de tu negocio antes de publicar.
        </small>
        <div className="tk-toolbar" style={{ margin: '1rem -1rem -1rem -1rem', borderRadius: '0 0 var(--border-radius-grande) var(--border-radius-grande)', borderTop: '1px solid rgba(212, 212, 212, 0.76)', borderBottom: 'none' }}>
          <DSButtonSecondary className="magic-button magic-button-primary" disabled={!text || busy} tooltip="Guarda el texto en este proyecto sin publicarlo en redes." onClick={saveDraft}>
            Guardar borrador
          </DSButtonSecondary>
          <DSButtonSecondary
            className="magic-button magic-button-primary"
            disabled={!text}
            tooltip="Copia el texto completo al portapapeles para pegarlo donde quieras."
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
          </DSButtonSecondary>
          <DSButtonSecondary
            disabled={!text}
            tooltip="Descarga tu borrador como un archivo de texto (.txt)."
            onClick={() =>
              downloadBlob(
                new Blob([text], { type: "text/plain;charset=utf-8" }),
                "contenido-for-u.txt",
              )
            }
          >
            Descargar
          </DSButtonSecondary>
          <DSButtonSecondary
            tooltip="Lleva este texto al teleprompter para practicarlo o grabarlo." className="tk-secondary magic-button magic-button-primary"
            disabled={!text}
            onClick={() => onScript(text)}
          >
            Practicar en teleprompter →
          </DSButtonSecondary>
        </div>
        {notice && (
          <p role="status" className="tk-notice">
            {notice}
          </p>
        )}
      </DSCard>
    </div></div>
  );
}
