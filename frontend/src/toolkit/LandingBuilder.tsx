import { editorHistory, type EditorHistory } from "./editorHistory";
import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import LandingWizard from "../components/LandingWizard";
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
import { compressImage } from "./media";
import { askAI } from "./api";
import { moveItem, safeHttps } from "./engine";
import { defaultLanding, type LandingDraft } from "./types";
export { LandingPreview } from "./LandingPreview";
export default function LandingBuilder({ wizard = false }: { wizard?: boolean }) {
  const { business, docs, save, userId, projectId, demo, track } = useToolkit();
  const [history, dispatchHistory] = useReducer(editorHistory<LandingDraft>, { past: [], present: (docs.landing as LandingDraft) ?? defaultLanding(business), future: [] } as EditorHistory<LandingDraft>);
  const draft = history.present;
  const setDraft = useCallback((value: LandingDraft | ((current: LandingDraft) => LandingDraft)) => dispatchHistory({ type: 'edit', value }), []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [dirty, setDirty] = useState(false);
  const drag = useRef(-1);
  const frame = useRef<HTMLIFrameElement>(null);
  const [channel] = useState(() => crypto.randomUUID());
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const draftRef = useRef(draft);
  const pending = useRef<LandingDraft | null>(null);
  useEffect(() => {
    draftRef.current = draft;
    frame.current?.contentWindow?.postMessage(
      { type: "foru:render", channel, draft },
      window.location.origin,
    );
  }, [draft, channel]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      if (event.data.type === "foru:ready") {
        frame.current?.contentWindow?.postMessage(
          { type: "foru:render", channel, draft: draftRef.current },
          window.location.origin,
        );
        return;
      }
      if (
        busy ||
        event.data.type !== "foru:edit" ||
        typeof event.data.value !== "string"
      )
        return;
      const { field, value, blockId } = event.data;
      setDraft((current) => {
        let next = current;
        if (["headline", "description", "cta"].includes(field))
          next = {
            ...current,
            [field]: value.slice(
              0,
              field === "description" ? 1000 : field === "headline" ? 180 : 50,
            ),
          };
        else if (
          ["title", "body"].includes(field) &&
          typeof blockId === "string"
        )
          next = {
            ...current,
            blocks: current.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    [field]: value.slice(0, field === "title" ? 150 : 2000),
                  }
                : block,
            ),
          };
        return next;
      });
      setDirty(true);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [channel, busy]);
  useEffect(() => {
    if (!dirty || busy || wizard) return;
    const snapshot = draft;
    pending.current = snapshot;
    const timer = window.setTimeout(() => {
      setAutosaveStatus("Guardando borrador…");
      void save("landing", snapshot).then(
        () => {
          if (pending.current === snapshot) {
            pending.current = null;
            setDirty(false);
            setAutosaveStatus("Borrador guardado");
          }
        },
        () => {
          setAutosaveStatus(
            "No se guardó el último cambio. Usa Guardar borrador para reintentar.",
          );
        },
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, dirty, busy, save, wizard]);
  useEffect(
    () => () => {
      if (pending.current)
        void save("landing", pending.current).catch(() => {});
    },
    [save],
  );
  const update = (patch: Partial<LandingDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      return next;
    });
    setDirty(true);
  };
  async function saveDraft() {
    setBusy(true);
    try {
      await save("landing", draft);
      pending.current = null;
      setDirty(false);
      setNotice(
        "Borrador guardado. Publica para actualizar la página visible a tus clientes.",
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!supabase || demo) return;
    setBusy(true);
    setNotice("");
    try {
      if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(draft.slug))
        throw new Error(
          "Usa una dirección de 3 a 60 letras minúsculas, números o guiones.",
        );
      if (!draft.headline.trim())
        throw new Error("Agrega un título a tu página.");
      if (draft.whatsapp && !/^\d{8,15}$/.test(draft.whatsapp))
        throw new Error(
          "WhatsApp necesita el código de país y número, sin espacios.",
        );
      if (draft.calendly && !safeHttps(draft.calendly, "calendly.com"))
        throw new Error("Usa un enlace HTTPS de calendly.com.");
      if (draft.menuItems?.some(item => !item.name.trim() || !Number.isFinite(item.price) || item.price < 0 || item.price > 1000000)) throw new Error("Revisa los nombres y precios de tus productos.");
      const snapshot = { ...draft, published: true };
      await save("landing", draft);
      const { error } = await supabase.from("toolkit_sites").upsert(
        {
          user_id: userId,
          project_id: projectId,
          slug: draft.slug,
          content: snapshot,
          published: true,
        },
        { onConflict: "user_id,project_id" },
      );
      if (error)
        throw new Error(
          error.code === "23505"
            ? "Esa dirección ya está ocupada. Elige otra."
            : "No se pudo publicar. Tu borrador está guardado.",
        );
      setDraft(snapshot);
      pending.current = null;
      setDirty(false);
      setPublishedUrl(`${window.location.origin}/s/${draft.slug}`);
      track("landing", true);
      setNotice("Tu página está publicada. Puedes compartir el enlace.");
      try { await save("landing", snapshot); }
      catch { setNotice("La página está publicada, pero no pudimos actualizar el estado del borrador. Guarda el borrador para reintentar."); setDirty(true); }
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    if (!supabase || demo) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("toolkit_sites")
        .update({ published: false })
        .eq("user_id", userId)
        .eq("project_id", projectId);
      if (error) throw error;
      const next = { ...draft, published: false };
      setDraft(next);
      setPublishedUrl("");
      await save("landing", next);
      pending.current = null;
      setDirty(false);
      setNotice("La página dejó de estar disponible al público.");
    } catch {
      setNotice(
        "No pudimos completar la actualización. Revisa el estado antes de compartir.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function uploadCover(file: File, role = "Portada") {
    if (!supabase || demo) return;
    setBusy(true);
    setNotice("");
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${projectId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw new Error("No se pudo subir la imagen. Puedes reintentar.");
      const url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
      const alt = file.name.replace(/\.[^.]+$/, "");
      if (role === "Portada") update({ heroImage: url, heroImageAlt: alt });
      else update({ gallery: [...(draft.gallery || []).filter(photo => photo.role !== role), { role, url, alt }] });
      setNotice("Foto subida. Guarda el borrador para conservar la portada.");
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  async function suggestStory() {
    setBusy(true);
    setNotice("");
    try {
      const result = await askAI("landing", `Ayuda a escribir la historia de este negocio sin inventar datos. Texto actual: ${draft.description}`, business);
      update({ description: result.slice(0, 1000) });
      setNotice("Sugerencia preparada. Revísala antes de publicar.");
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  if (wizard) return <LandingWizard draft={draft} update={update} busy={busy} dirty={dirty} demo={demo} notice={notice} publishedUrl={publishedUrl} onSave={saveDraft} onPublish={publish} onUpload={uploadCover} onSuggest={suggestStory} />;
  return (
    <div className="tk-visual-editor" inert={busy} aria-busy={busy}>
      <DSCard as="section" className="tk-card tk-stack tk-editor-sections">
        <h2>Secciones</h2>
        <div className="tk-toolbar" aria-label="Historial de edición">
          <DSButtonSecondary type="button" tooltip="Deshace el último cambio del borrador. No retira una publicación existente." disabled={busy || !history.past.length} onClick={() => { dispatchHistory({ type: 'undo' }); setDirty(true); }}>↶ Deshacer</DSButtonSecondary>
          <DSButtonSecondary type="button" tooltip="Recupera el cambio que acabas de deshacer." disabled={busy || !history.future.length} onClick={() => { dispatchHistory({ type: 'redo' }); setDirty(true); }}>↷ Rehacer</DSButtonSecondary>
        </div>
        <p>Arrastra para ordenar o usa las flechas.</p>
        {draft.blocks.map((block, i) => (
          <article
            className="tk-block-editor"
            key={block.id}
            draggable={!busy}
            onDragStart={() => {
              drag.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag.current >= 0)
                update({ blocks: moveItem(draft.blocks, drag.current, i) });
              drag.current = -1;
            }}
          >
            <strong>{block.title}</strong>
            <div className="tk-toolbar">
              <DSButtonSecondary
                aria-label={"Subir " + block.title}
                disabled={i === 0 || busy}
                onClick={() =>
                  update({ blocks: moveItem(draft.blocks, i, i - 1) })
                }
              >
                ↑
              </DSButtonSecondary>
              <DSButtonSecondary
                aria-label={"Bajar " + block.title}
                disabled={i === draft.blocks.length - 1 || busy}
                onClick={() =>
                  update({ blocks: moveItem(draft.blocks, i, i + 1) })
                }
              >
                ↓
              </DSButtonSecondary>
              <DSButtonSecondary
                disabled={busy}
                onClick={() =>
                  update({
                    blocks: draft.blocks.filter((b) => b.id !== block.id),
                  })
                }
              >
                Quitar
              </DSButtonSecondary>
            </div>
          </article>
        ))}
        <DSButtonSecondary
          disabled={busy || draft.blocks.length >= 8}
          onClick={() =>
            update({
              blocks: [
                ...draft.blocks,
                {
                  id: crypto.randomUUID(),
                  title: "Nueva sección",
                  body: "Escribe aquí lo que quieres compartir.",
                },
              ],
            })
          }
        >
          Agregar sección
        </DSButtonSecondary>
      </DSCard>
      <section className="tk-editor-preview tk-stack">
        <h2>Vista previa</h2>
        <p>Haz clic sobre cualquier título o párrafo para editarlo.</p>
        <iframe
          ref={frame}
          title="Vista previa editable de tu página"
          src={"/site-preview?channel=" + channel}
        />
        <p role="status">
          {autosaveStatus ||
            (dirty ? "Cambios pendientes" : "Borrador guardado")}
        </p>
      </section>
      <DSCard as="section" className="tk-card tk-stack tk-editor-tools">
        <h2>Herramientas</h2>
        <label>
          Plantilla
          <select
            disabled={busy}
            value={draft.template}
            onChange={(e) => update({ template: e.target.value })}
          >
            <option value="restaurant">Restaurante</option>
            <option value="shop">Tienda</option>
            <option value="services">Servicios</option>
            <option value="event">Evento</option>
          </select>
        </label>
        <label>
          Nombre
          <DSInput
            disabled={busy}
            value={draft.name}
            maxLength={100}
            onChange={(e) => update({ name: e.target.value })}
          />
        </label>
        <label>
          Dirección de tu página
          <DSInput
            disabled={busy}
            value={draft.slug}
            maxLength={60}
            onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
          />
        </label>
        <label>
          Foto de portada
          <DSInput
            disabled={busy || demo}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !supabase) return;
              setBusy(true);
              try {
                const blob = await compressImage(file);
                const path =
                  userId + "/" + projectId + "/" + crypto.randomUUID() + ".jpg";
                const { error } = await supabase.storage
                  .from("site-assets")
                  .upload(path, blob, {
                    contentType: "image/jpeg",
                    upsert: false,
                  });
                if (error) throw new Error("No se pudo subir la imagen.");
                const { data } = supabase.storage
                  .from("site-assets")
                  .getPublicUrl(path);
                update({
                  heroImage: data.publicUrl,
                  heroImageAlt: file.name.replace(/\.[^.]+$/, ""),
                });
                setNotice(
                  "Imagen subida. Publica para mostrarla en tu página.",
                );
              } catch (error) {
                setNotice((error as Error).message);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <small>
          La imagen de portada será pública. Usa una foto autorizada de tu
          negocio.
        </small>
        {draft.heroImage && (
          <>
            <label>
              Descripción de la imagen
              <DSInput
                disabled={busy}
                value={draft.heroImageAlt ?? ""}
                maxLength={160}
                onChange={(e) => update({ heroImageAlt: e.target.value })}
              />
            </label>
            <DSButtonSecondary
              disabled={busy}
              onClick={() =>
                update({ heroImage: undefined, heroImageAlt: undefined })
              }
            >
              Quitar portada
            </DSButtonSecondary>
          </>
        )}
        <DSButtonSecondary
          disabled={busy || demo}
          onClick={async () => {
            setBusy(true);
            try {
              const result = await askAI(
                "landing",
                "Propón título y descripción separados por un salto de línea.",
                business,
              );
              const [headline, ...rest] = result.split("\n").filter(Boolean);
              update({
                headline: headline.slice(0, 180),
                description: rest.join("\n").slice(0, 1000),
              });
            } catch (error) {
              setNotice((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Sugerir texto con IA
        </DSButtonSecondary>
        <label>
          WhatsApp
          <DSInput
            disabled={busy}
            value={draft.whatsapp}
            maxLength={15}
            placeholder="51999999999"
            onChange={(e) => update({ whatsapp: e.target.value })}
          />
        </label>
        <label>
          Calendly (opcional)
          <DSInput
            disabled={busy}
            value={draft.calendly}
            maxLength={400}
            placeholder="https://calendly.com/tu-negocio/cita"
            onChange={(e) => update({ calendly: e.target.value })}
          />
        </label>
        <DSButtonSecondary disabled={busy} onClick={saveDraft}>
          Guardar borrador
        </DSButtonSecondary>
        <DSButtonPrimary
          className="tk-primary"
          disabled={busy || demo}
          onClick={publish}
        >
          {busy ? "Guardando…" : "Publicar página"}
        </DSButtonPrimary>
        {draft.published && (
          <DSButtonSecondary disabled={busy || demo} onClick={unpublish}>
            Retirar publicación
          </DSButtonSecondary>
        )}
        {demo && (
          <small>
            El borrador de prueba dura esta sesión. Inicia sesión para subir
            imágenes y publicar.
          </small>
        )}
        {publishedUrl && (
          <a href={publishedUrl} target="_blank" rel="noreferrer">
            Ver página publicada ↗
          </a>
        )}
        {notice && (
          <p className="tk-notice" role="status">
            {notice}
          </p>
        )}
      </DSCard>
    </div>
  );
}
