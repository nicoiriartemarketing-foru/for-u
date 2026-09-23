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
    <article className={"tk-landing-preview tk-template-" + draft.template}>
      <header>
        <strong>{draft.name}</strong>
        <span>Haz clic en un texto para editarlo</span>
      </header>
      <section className="tk-site-hero">
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
      </section>
      {draft.blocks.map((block) => (
        <section key={block.id} className="tk-site-block">
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
        </section>
      ))}
      <footer>{draft.name} · Creado con FOR U</footer>
    </article>
  );
}
