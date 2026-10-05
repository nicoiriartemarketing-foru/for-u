import { Input as DSInput, ButtonSecondary as DSButtonSecondary, InfoIcon } from '../ui/DesignSystem';
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
    <div className="ds-label">{isPrivateMedia(value) && <><span>{label} · Imagen de tu biblioteca</span><InfoIcon text="Esta imagen pertenece a la biblioteca del proyecto. Puedes reemplazarla sin borrar el archivo original." label={`Ayuda: ${label}`} /></>}</div>{!isPrivateMedia(value) && <DSInput label={label} info="Pega la URL de una imagen autorizada o elige una de la biblioteca del proyecto." type="url" value={value} placeholder="https://…" onChange={event => onChange(event.target.value)} />}
    {value && <div className="project-media-selected"><ProjectImage value={value} alt={label} /><DSButtonSecondary type="button" tooltip="Quita esta imagen del formulario; no borra el archivo de la biblioteca." onClick={() => onChange('')}>Quitar {label.toLowerCase()}</DSButtonSecondary></div>}
    {scope && <DSButtonSecondary type="button" tooltip="Abre las imágenes guardadas en este proyecto para elegir una." aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Cerrar biblioteca' : `Elegir ${label.toLowerCase()} de mi biblioteca`}</DSButtonSecondary>}
    {open && scope && <MediaGallery key={`${scope.userId}:${scope.projectId}`} {...scope} onSelect={image => { onChange(mediaReference(image.path)); setOpen(false); }} />}
  </div>;
}
