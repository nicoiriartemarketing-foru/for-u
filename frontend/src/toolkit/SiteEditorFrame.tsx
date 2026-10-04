import { LandingExtras } from "./LandingPreview";
import { ButtonGhost, Card } from "../components/ui/DesignSystem";
import "./professionalEditor.css";
import { useEffect, useRef, useState } from "react";
import type { LandingDraft } from "./types";
import { parseSiteData } from "./publicData";
import "./toolkit.css";
function Editable({
  value,
  field,
  blockId,
  onEdit,
  tag = "div",
}: {
  value: string;
  field: string;
  blockId?: string;
  onEdit: (field: string, value: string, blockId?: string) => void;
  tag?: "div" | "h1" | "h2" | "p";
}) {
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    if (element.current && element.current.textContent !== value)
      element.current.textContent = value;
  }, [value]);
  const Tag = tag;
  return (
    <Tag
      ref={element as React.Ref<HTMLHeadingElement>}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={
        field === "body"
          ? "Texto de sección"
          : field === "title"
            ? "Título de sección"
            : field === "headline"
              ? "Título principal"
              : field === "description"
                ? "Descripción"
                : "Texto del botón"
      }
      onInput={(e) => onEdit(field, e.currentTarget.textContent ?? "", blockId)}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        onEdit(field, e.currentTarget.textContent ?? "", blockId);
      }}
    />
  );
}
export default function SiteEditorFrame() {
  const drag = useRef<string | null>(null);
  const [selected, setSelected] = useState("hero");
  const [draft, setDraft] = useState<LandingDraft | null>(null);
  const channel = new URLSearchParams(window.location.search).get("channel");
  const send = (type: string, payload: object = {}) => {
    if (window.parent !== window)
      window.parent.postMessage(
        { type, channel, ...payload },
        window.location.origin,
      );
  };
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.channel !== channel ||
        event.data.type !== "foru:render"
      )
        return;
      const next = parseSiteData(event.data.draft);
      if (next) setDraft(next);
    };
    window.addEventListener("message", receive);
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "foru:ready", channel },
        window.location.origin,
      );
    return () => window.removeEventListener("message", receive);
  }, [channel]);
  if (!draft) return <p>Preparando vista previa…</p>;
  const edit = (field: string, value: string, blockId?: string) =>
    send("foru:edit", { field, value, blockId });
  return (
    <article className={"pe-editable-page tk-landing-preview tk-template-" + draft.template} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const preset = event.dataTransfer.getData('application/foru-section'); if (preset) send('foru:add', { preset }); }}>
      <header>
        <strong>{draft.name}</strong>
        <span>Haz clic en un texto para editarlo</span>
      </header>
      <Card as="section" className={`tk-site-hero pe-editable-section ${selected === 'hero' ? 'pe-selected' : ''}`} onClick={() => { setSelected('hero'); send('foru:select', { id: 'hero' }); }} onFocus={() => { setSelected('hero'); send('foru:select', { id: 'hero' }); }}>
        {draft.heroImage && (
          <img
            src={draft.heroImage}
            alt={draft.heroImageAlt ?? ""}
            className="tk-site-image"
          />
        )}
        <Editable
          value={draft.headline}
          field="headline"
          tag="h1"
          onEdit={edit}
        />
        <Editable
          value={draft.description}
          field="description"
          tag="p"
          onEdit={edit}
        />
        <Editable value={draft.cta} field="cta" onEdit={edit} />
      </Card>
      {draft.blocks.map((block, index) => (
        <Card as="section" key={block.id} data-block-id={block.id} className={`tk-site-block pe-editable-section ${selected === block.id ? 'pe-selected' : ''}`} onClick={() => { setSelected(block.id); send('foru:select', { id: block.id }); }} onFocus={() => { setSelected(block.id); send('foru:select', { id: block.id }); }} onDragOver={event => event.preventDefault()} onDrop={event => { if (!drag.current) return; event.preventDefault(); event.stopPropagation(); send('foru:move', { from: drag.current, to: block.id }); drag.current = null; }}>
          <div className="pe-block-controls" contentEditable={false}>
            <ButtonGhost type="button" draggable aria-label={`Arrastrar ${block.title}`} tooltip="Arrastra para mover esta sección. También puedes usar los botones Subir y Bajar." onDragStart={event => { drag.current = block.id; event.dataTransfer.setData('text/plain', block.id); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { drag.current = null; }}>⠿</ButtonGhost>
            <ButtonGhost type="button" aria-label={`Subir ${block.title}`} disabled={index === 0} onClick={() => send('foru:move', { from: block.id, to: draft.blocks[index - 1].id })}>↑</ButtonGhost>
            <ButtonGhost type="button" aria-label={`Bajar ${block.title}`} disabled={index === draft.blocks.length - 1} onClick={() => send('foru:move', { from: block.id, to: draft.blocks[index + 1].id })}>↓</ButtonGhost>
          </div>
          <Editable
            value={block.title}
            field="title"
            blockId={block.id}
            tag="h2"
            onEdit={edit}
          />
          <Editable
            value={block.body}
            field="body"
            blockId={block.id}
            tag="p"
            onEdit={edit}
          />
        </Card>
      ))}
      <LandingExtras draft={draft} />
      <footer>{draft.name} · Creado con FOR U</footer>
    </article>
  );
}
