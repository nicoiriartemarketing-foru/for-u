import ImageCropper from './ImageCropper';
import {resolveMediaPath} from './mediaStorage';
import {privateMediaPath,externalImageUrl} from './mediaReference';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary, InfoIcon } from '../ui/DesignSystem';
import { useContext, useState } from 'react';
import MediaGallery from './MediaGallery';
import ProjectImage from './ProjectImage';
import { MediaScope } from './mediaScope';
import { isPrivateMedia, mediaReference } from './mediaReference';
import './projectMedia.css';

export default function ProjectImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const scope = useContext(MediaScope);
  const [open, setOpen] = useState(false);const [crop,setCrop]=useState(''),[error,setError]=useState('');async function openCrop(){if(!scope)return;try{const path=privateMediaPath(value,scope.userId,scope.projectId);const url=path?await resolveMediaPath(path):externalImageUrl(value);if(!url)throw new Error('Elige una imagen de este proyecto.');setCrop(url);setError('');}catch(e){setError((e as Error).message);}}
  return <div className="project-media-field">
    <div className="ds-label"><span>{label}</span><InfoIcon text="Sube una foto o elige una de la biblioteca del proyecto. El enlace es una opción avanzada." label={`Ayuda: ${label}`} /></div>

    {value && <div className="project-media-selected"><ProjectImage value={value} alt={label} /><DSButtonSecondary type="button" tooltip="Quita esta imagen del formulario; no borra el archivo de la biblioteca." onClick={() => onChange('')}>Quitar {label.toLowerCase()}</DSButtonSecondary></div>}
    {scope && <DSButtonSecondary type="button" tooltip="Abre las imágenes guardadas en este proyecto para elegir una." aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Cerrar biblioteca' : `Subir o elegir ${label.toLowerCase()}`}</DSButtonSecondary>}
    {value&&scope&&<DSButtonSecondary type="button" onClick={()=>void openCrop()}>Encuadrar foto</DSButtonSecondary>}{crop&&scope&&<ImageCropper key={crop} {...scope} url={crop} onClose={()=>setCrop('')} onApply={next=>{onChange(next);setCrop('');}}/>}{error&&<p role="alert">{error}</p>}
    <details><summary>Usar un enlace de imagen · avanzado</summary><DSInput label={`Enlace de ${label.toLowerCase()}`} type="url" value={isPrivateMedia(value)?'':value} placeholder="https://…" onChange={event => onChange(event.target.value)} /></details>
    {open && scope && <MediaGallery key={`${scope.userId}:${scope.projectId}`} {...scope} onSelect={image => { onChange(mediaReference(image.path)); setOpen(false); }} />}
  </div>;
}
