import { Select as DSSelect } from '../components/ui/DesignSystem';
import { useUnsavedNavigation } from "../lib/useUnsavedNavigation";
import { Textarea, InfoIcon } from "../components/ui/DesignSystem";
import { createEditorSection, editorIndustry, reorderEditorSections, sectionPresets } from "./editorSections";
import "./professionalEditor.css";
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
  useUnsavedNavigation(!wizard && (dirty || busy));
  const drag = useRef(-1);
  const [selectedId, setSelectedId] = useState('hero');
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const industry = editorIndustry(business.moduleType || business.industry);
  const selectedBlock = draft.blocks.find(block => block.id === selectedId);
  const frame = useRef<HTMLIFrameElement>(null);
  const [channel] = useState(() => crypto.randomUUID());
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const draftRef = useRef(draft);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const pending = useRef<LandingDraft | null>(null);
  useEffect(() => {
    draftRef.current = draft;
    frame.current?.contentWindow?.postMessage(
      { type: "foru:render", channel, draft, selectedId },
      window.location.origin,
    );
  }, [draft, channel, selectedId]);
  useEffect(() => {
    if (selectedId !== 'hero' && !draft.blocks.some(block => block.id === selectedId)) {
      setSelectedId('hero');
    }
  }, [draft.blocks, selectedId]);
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
          { type: "foru:render", channel, draft: draftRef.current, selectedId: selectedRef.current },
          window.location.origin,
        );
        return;
      }
      if (busy) return;
      if (event.data.type === 'foru:select' && typeof event.data.id === 'string') {
        if (event.data.id === 'hero' || draftRef.current.blocks.some(block => block.id === event.data.id)) setSelectedId(event.data.id);
        return;
      }
      if (event.data.type === 'foru:move' && typeof event.data.from === 'string' && typeof event.data.to === 'string') {
        setDraft(current => ({ ...current, blocks: reorderEditorSections(current.blocks, event.data.from, event.data.to) })); setDirty(true); return;
      }
      if (event.data.type === 'foru:add' && typeof event.data.preset === 'string') {
        const block = createEditorSection(business.moduleType || business.industry, event.data.preset);
        if (block && draftRef.current.blocks.length < 8) { setDraft(current => ({ ...current, blocks: [...current.blocks, block] })); setSelectedId(block.id); setDirty(true); }
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
  }, [channel, busy, business.industry, business.moduleType, setDraft]);
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
    <div className={`foru-professional-editor pe-wide-editor tk-visual-editor ${sectionsOpen ? 'pe-sections-open' : ''}`} inert={busy} aria-busy={busy}>
      <header className="pe-topbar magic-card" style={{ padding: '1.5rem', border: '1px solid rgba(212, 212, 212, 0.76)', borderRadius: 'var(--border-radius-grande)', background: 'var(--color-superficie)', boxShadow: 'var(--sombra-suave)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><small>EDITOR VISUAL · {industry.name}</small>
        <h2>Tu página, a tu manera</h2>
        <p style={{ color: 'var(--color-texto-suave)' }}>Selecciona un texto para escribir. Arrastra secciones para cambiar su orden.</p></div>
        <span role="status" className="magic-badge">{autosaveStatus || (dirty ? 'Cambios pendientes' : 'Borrador cargado')}</span>
      </header>
      <div className="pe-commandbar magic-card" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', flexWrap: 'wrap', border: '1px solid rgba(212, 212, 212, 0.76)', borderRadius: 'var(--border-radius-grande)', background: 'var(--color-superficie)', boxShadow: 'var(--sombra-suave)', marginBottom: '1rem' }}>
        <DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" aria-expanded={sectionsOpen} aria-controls="page-sections" onClick={() => setSectionsOpen(value => !value)}>☰ Secciones</DSButtonSecondary>
        <div className="pe-preview-toolbar"><div><DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" aria-pressed={viewport === 'desktop'} tooltip="Revisa la página con un ancho de escritorio." onClick={() => setViewport('desktop')}>Escritorio</DSButtonSecondary><DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" aria-pressed={viewport === 'mobile'} tooltip="Revisa la página a 360 píxeles de ancho." onClick={() => setViewport('mobile')}>Móvil</DSButtonSecondary></div></div>        <div className="tk-toolbar" aria-label="Historial de edición">
          <DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" tooltip="Deshace el último cambio del borrador. No retira una publicación existente." disabled={busy || !history.past.length} onClick={() => { dispatchHistory({ type: 'undo' }); setDirty(true); }}>↶ Deshacer</DSButtonSecondary>
          <DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" tooltip="Recupera el cambio que acabas de deshacer." disabled={busy || !history.future.length} onClick={() => { dispatchHistory({ type: 'redo' }); setDirty(true); }}>↷ Rehacer</DSButtonSecondary>
        </div>
<DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" aria-expanded={propertiesOpen} aria-controls="page-selection" onClick={() => setPropertiesOpen(value => !value)}>Editar selección</DSButtonSecondary>
        <DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" aria-expanded={settingsOpen} aria-controls="page-settings" onClick={() => setSettingsOpen(value => !value)}>Configurar página</DSButtonSecondary>
        <DSButtonSecondary className="magic-button magic-button-soft" style={{ minHeight: '2.5rem', padding: '0 0.9rem', fontSize: '0.85rem' }} type="button" onClick={saveDraft} tooltip="Guarda el borrador sin cambiar la página pública.">Guardar</DSButtonSecondary>
        <DSButtonPrimary className="magic-button magic-button-primary" type="button" disabled={busy || demo} onClick={publish} tooltip="Publica los cambios para que los vean tus visitantes.">Publicar</DSButtonPrimary>
      </div>
      {propertiesOpen && <DSCard id="page-selection" className="pe-selection-panel">        {selectedBlock ? <div className="pe-properties"><h3>Sección seleccionada</h3><DSInput label="Título de sección" info="Este título se muestra en tu página pública al publicar los cambios." value={selectedBlock.title} maxLength={150} onChange={event => update({ blocks: draft.blocks.map(block => block.id === selectedBlock.id ? { ...block, title: event.target.value } : block) })} /><Textarea label="Texto de sección" info="Describe esta parte de tu oferta con información real de tu negocio." value={selectedBlock.body} maxLength={2000} onChange={event => update({ blocks: draft.blocks.map(block => block.id === selectedBlock.id ? { ...block, body: event.target.value } : block) })} /></div> : <div className="pe-properties"><h3>Portada</h3><DSInput label="Título principal" info="La primera frase que verán tus visitantes." value={draft.headline} maxLength={180} onChange={event => update({ headline: event.target.value })} /><Textarea label="Historia de tu negocio" info="Explica qué ofreces y qué hace especial a tu negocio." value={draft.description} maxLength={1000} onChange={event => update({ description: event.target.value })} /><DSInput label="Texto del botón" info="Describe la acción que quieres que realice tu visitante." value={draft.cta} maxLength={50} onChange={event => update({ cta: event.target.value })} /></div>}
</DSCard>}
      <DSCard id="page-sections" as="section" hidden={!sectionsOpen} className="tk-card tk-stack tk-editor-sections">
        <h2>Secciones <InfoIcon text="Arrastra una sección para reordenarla o usa Subir y Bajar. Selecciónala para editar sus propiedades." /></h2>
        <DSButtonSecondary type="button" aria-pressed={selectedId === 'hero'} tooltip="Edita el título, la historia y el botón principal." onClick={() => setSelectedId('hero')}>Portada</DSButtonSecondary>
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
            <DSButtonSecondary type="button" aria-pressed={selectedId === block.id} tooltip={`Editar la sección ${block.title}`} onClick={() => setSelectedId(block.id)}>{block.title}</DSButtonSecondary>
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
        <h3>Bloques para {industry.name.toLowerCase()}</h3>
        {sectionPresets(business.moduleType || business.industry).map(preset => <DSButtonSecondary key={preset.key} type="button" draggable={!busy && draft.blocks.length < 8} onDragStart={event => { event.dataTransfer.setData('application/foru-section', preset.key); event.dataTransfer.effectAllowed = 'copy'; }} disabled={busy || draft.blocks.length >= 8} tooltip={preset.description} onClick={() => { const block = createEditorSection(business.moduleType || business.industry, preset.key); if (block) { update({ blocks: [...draft.blocks, block] }); setSelectedId(block.id); } }}>＋ {preset.title}</DSButtonSecondary>)}
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
      <section className="tk-editor-preview tk-stack magic-card" style={{ padding: '1rem', border: '1px solid rgba(212, 212, 212, 0.76)', borderRadius: 'var(--border-radius-grande)', background: 'var(--color-superficie)', boxShadow: 'var(--sombra-magica)' }}>
        <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.9rem', textAlign: 'center' }}>Haz clic sobre cualquier título o párrafo para editarlo.</p>
        <div className={`pe-canvas pe-canvas-${viewport}`}><iframe
          ref={frame}
          title="Vista previa editable de tu página"
          src={"/site-preview?channel=" + channel}
          style={{ border: 'none', borderRadius: '8px' }}
        /></div>
        <p role="status">
          {autosaveStatus ||
            (dirty ? "Cambios pendientes" : "Borrador guardado")}
        </p>
      </section>
      <DSCard id="page-settings" as="section" hidden={!settingsOpen} className="tk-card tk-stack tk-editor-tools">
        <h2>Configuración de la página</h2>
        <h3>Datos de la página</h3>
        <DSSelect label="Plantilla" info="Cambia el estilo de la página sin reemplazar tus textos ni cambiar el rubro del proyecto."
            disabled={busy}
            value={draft.template}
            onChange={(e) => update({ template: e.target.value })}
          >
            <option value="restaurant">Restaurante</option>
            <option value="shop">Tienda</option>
            <option value="services">Servicios</option>
            <option value="event">Evento</option>
          </DSSelect>
        <DSInput label="Nombre" info="Nombre que identifica a tu negocio en la página pública."
            disabled={busy}
            value={draft.name}
            maxLength={100}
            onChange={(e) => update({ name: e.target.value })}
          />
        <DSInput label="Dirección de tu página" info="Usa un nombre breve con letras, números y guiones. Cambiarlo afecta la URL al publicar."
            disabled={busy}
            value={draft.slug}
            maxLength={60}
            onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
          />
        <DSInput label="Foto de portada" info="Sube una imagen JPG, PNG o WebP autorizada. El archivo se almacenará públicamente."
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
        <small>
          La imagen de portada será pública. Usa una foto autorizada de tu
          negocio.
        </small>
        {draft.heroImage && (
          <>
            <DSInput label="Descripción de la imagen" info="Describe la foto para quienes usan lectores de pantalla."
                disabled={busy}
                value={draft.heroImageAlt ?? ""}
                maxLength={160}
                onChange={(e) => update({ heroImageAlt: e.target.value })}
              />
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
          tooltip="Genera una propuesta de título y descripción. Revisa el resultado antes de publicar."
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
        <DSInput label="WhatsApp" info="Número con código de país y solo dígitos, por ejemplo 51999999999."
            disabled={busy}
            value={draft.whatsapp}
            maxLength={15}
            placeholder="51999999999"
            onChange={(e) => update({ whatsapp: e.target.value })}
          />
        <DSInput label="Calendly (opcional)" info="Enlace a tu página de reservas de Calendly. No activa una sincronización automática."
            disabled={busy}
            value={draft.calendly}
            maxLength={400}
            placeholder="https://calendly.com/tu-negocio/cita"
            onChange={(e) => update({ calendly: e.target.value })}
          />
        <DSButtonSecondary disabled={busy} tooltip="Guarda el borrador de este proyecto sin actualizar la página pública." onClick={saveDraft}>
          Guardar borrador
        </DSButtonSecondary>
        <DSButtonPrimary
          className="tk-primary"
          disabled={busy || demo}
          tooltip="Publica los cambios del borrador para que tus visitantes puedan verlos." onClick={publish}
        >
          {busy ? "Guardando…" : "Publicar página"}
        </DSButtonPrimary>
        {draft.published && (
          <DSButtonSecondary disabled={busy || demo} tooltip="Retira la página pública y conserva el borrador para seguir editándolo." onClick={unpublish}>
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
