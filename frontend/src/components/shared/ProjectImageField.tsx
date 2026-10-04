import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../ui/DesignSystem';
import { useContext, useState } from 'react';
import MediaGallery from './MediaGallery';
import ProjectImage from './ProjectImage';
import { MediaScope } from './mediaScope';
import { isPrivateMedia, mediaReference } from './mediaReference';
import './projectMedia.css';

export default function ProjectImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const scope = useContext(MediaScope);
  const [open, setOpen] = useState(false);
  return <div className="project-media-field">
    <label>{label}{isPrivateMedia(value) ? <span>Imagen de tu biblioteca</span> : <DSInput type="url" value={value} placeholder="https://…" onChange={event => onChange(event.target.value)} />}</label>
    {value && <div className="project-media-selected"><ProjectImage value={value} alt={label} /><DSButtonSecondary type="button" onClick={() => onChange('')}>Quitar {label.toLowerCase()}</DSButtonSecondary></div>}
    {scope && <DSButtonSecondary type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Cerrar biblioteca' : `Elegir ${label.toLowerCase()} de mi biblioteca`}</DSButtonSecondary>}
    {open && scope && <MediaGallery key={`${scope.userId}:${scope.projectId}`} {...scope} onSelect={image => { onChange(mediaReference(image.path)); setOpen(false); }} />}
  </div>;
}
