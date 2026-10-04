import { ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import type { LandingDraft } from "./types";
export function LandingPreview({
  draft,
  onCTA,
  children,
}: {
  draft: LandingDraft;
  onCTA?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`tk-landing-preview tk-template-${draft.template}`}
      style={
        {
          "--site-color": /^#[0-9a-f]{6}$/i.test(draft.color)
            ? draft.color
            : "#6B6B6B",
        } as React.CSSProperties
      }
    >
      <header>
        <strong>{draft.name}</strong>
        <span>Hecho con dedicación</span>
      </header>
      <section className="tk-site-hero">
        {draft.heroImage && (
          <img
            src={draft.heroImage}
            alt={draft.heroImageAlt ?? ""}
            className="tk-site-image"
          />
        )}
        <span className="tk-eyebrow">
          BIENVENIDA A {draft.name.toUpperCase()}
        </span>
        <h1>{draft.headline}</h1>
        <p>{draft.description}</p>
        <DSButtonSecondary onClick={onCTA}>{draft.cta}</DSButtonSecondary>
      </section>
      {draft.blocks.map((block) => (
        <section key={block.id} className="tk-site-block">
          <h2>{block.title}</h2>
          <p>{block.body}</p>
        </section>
      ))}
      <LandingExtras draft={draft} />
      {children}
      <footer>{draft.name} · Creado con FOR U</footer>
    </article>
  );
}

export function LandingExtras({ draft }: { draft: LandingDraft }) { return <>
      {!!draft.gallery?.length && <section className="tk-site-gallery">{draft.gallery.map(photo => <figure key={photo.role}><img src={photo.url} alt={photo.alt} loading="lazy" /><figcaption>{photo.role}</figcaption></figure>)}</section>}
      {!!draft.menuItems?.length && <section className="tk-site-block"><h2>Nuestros productos</h2><ul className="tk-site-products">{draft.menuItems.map(item => <li key={item.id}><strong>{item.name}</strong><span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.price)}</span></li>)}</ul></section>}

</>; }
