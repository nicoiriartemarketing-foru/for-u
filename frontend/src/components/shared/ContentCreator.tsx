import { ButtonPrimary as DSButtonPrimary, ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loadModuleDocument, loadModuleProjects, saveModuleDocument } from '../../services/moduleDocuments';
import { moduleLabels, type ModuleProject } from '../../modules/moduleProjects';
import { downloadBlob } from '../../toolkit/api';
import ProjectSelector from './ProjectSelector';
import TemplateLibrary from './TemplateLibrary';
import MediaGallery from './MediaGallery';
import { resolveMediaPath } from './mediaStorage';
import { blankContent, contentFromTemplate, saveContentDraft, type ContentDocument, type ContentDraft } from './contentModel';
import { exportContentImage } from './contentExport';
import './contentCreator.css';

export type ContentCreatorProps = { currentProject?: ModuleProject; onProjectChange?: (projectId: string) => void };
export default function ContentCreator({ currentProject, onProjectChange }: ContentCreatorProps = {}) {
  const { user } = useAuth(); const userId = user?.id;
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<ModuleProject[]>([]);
  const [loadedFor, setLoadedFor] = useState('');
  const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadModuleProjects(userId).then(value => { if (active) { setProjects(value); setLoadedFor(userId); setError(''); } }).catch(reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [userId, attempt]);
  if (error) return <main className="content-creator"><p role="alert">{error}</p><DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar</DSButtonSecondary><Link to="/dashboard?view=projects">Mis proyectos</Link></main>;
  if (!userId || loadedFor !== userId) return <main className="content-creator"><p role="status">Cargando tus proyectos…</p></main>;
  const requested = currentProject?.id ?? params.get('project');
  const project = requested ? projects.find(item => item.id === requested) : projects[0];
  if (!project) return <main className="content-creator"><h1>Elige un proyecto para crear contenido</h1><p>{projects.length ? 'Este proyecto no está disponible en tu cuenta.' : 'Crea primero tu proyecto y selecciona su rubro.'}</p><Link to="/dashboard?view=projects">Ir a mis proyectos</Link></main>;
  function change(id: string) { if (onProjectChange) onProjectChange(id); if (!currentProject) { const next = new URLSearchParams(params); next.set('project', id); setParams(next); } }
  return <ContentSession key={`${userId}:${project.id}`} userId={userId} project={project} projects={projects} onProjectChange={change} />;
}

const contentStorage = { load: loadModuleDocument, save: saveModuleDocument };
export function ContentSession({ userId, project, projects, onProjectChange, storage = contentStorage }: { userId: string; project: ModuleProject; projects: ModuleProject[]; onProjectChange: (id: string) => void; storage?: typeof contentStorage }) {
  const navigate = useNavigate();
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(''); const [attempt, setAttempt] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [image, setImage] = useState({ path: '', url: '' });
  const saving = useRef(false);
  const imageUrl = draft && image.path === draft.imagePath ? image.url : '';
  useEffect(() => {
    let active = true;
    storage.load(userId, project.id, 'content-creator').then(result => {
      const data = result?.payload as ContentDocument | undefined;
      if (data && (data.version !== 1 || !Array.isArray(data.drafts) || data.drafts.some(item => item.projectId !== project.id))) throw new Error('El contenido guardado tiene un formato incompatible. No se ha sobrescrito.');
      if (active) { setDocument(data ?? { version: 1, drafts: [] }); setRevision(result?.revision ?? null); setNotice(''); }
    }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [userId, project.id, attempt, storage]);
  useEffect(() => {
    if (!draft?.imagePath) return;
    const path = draft.imagePath; let active = true;
    resolveMediaPath(path).then(url => { if (active) setImage({ path, url }); }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [draft?.imagePath]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  function mayDiscard() { return !dirty || window.confirm('Tienes contenido sin guardar. ¿Descartarlo y continuar?'); }
  function open(value: ContentDraft, changed: boolean) { if (!mayDiscard()) return; setDraft(value); setDirty(changed); setGallery(false); setNotice(''); }
  function update(patch: Partial<ContentDraft>) { if (draft) { setDraft({ ...draft, ...patch }); setDirty(true); } }
  async function save() {
    if (!document || !draft || saving.current) return;
    saving.current = true; setBusy(true);
    try {
      const next = saveContentDraft(document, draft, project.id);
      const nextRevision = await storage.save(userId, project.id, 'content-creator', next, revision);
      setDocument(next); setRevision(nextRevision); setDirty(false); setNotice('Contenido guardado en este proyecto.');
    } catch (error) { setNotice((error as Error).message); }
    finally { saving.current = false; setBusy(false); }
  }
  async function download() {
    if (!draft) return; setBusy(true);
    try { if (draft.imagePath && !imageUrl) throw new Error('Espera a que cargue la imagen antes de exportar.'); downloadBlob(await exportContentImage(draft, imageUrl), `${project.type}-${draft.format}.png`); setNotice('Imagen lista para descargar.'); }
    catch (error) { setNotice((error as Error).message); } finally { setBusy(false); }
  }
  if (!document) return <main className="content-creator"><p role="status">{notice || 'Cargando el contenido del proyecto…'}</p>{notice && <DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar carga</DSButtonSecondary>}</main>;
  return <main className="content-creator"><header><div><span>FOR U · {moduleLabels[project.type]}</span><h1>Creador de Contenido</h1></div><DSButtonSecondary disabled={busy} onClick={() => { if (mayDiscard()) navigate(`/modules/${project.type}?project=${encodeURIComponent(project.id)}`); }}>Volver a {project.name}</DSButtonSecondary></header>
    <p role="status">{notice}</p><ProjectSelector projects={projects} value={project.id} disabled={busy} onChange={id => { if (mayDiscard()) onProjectChange(id); }} />
    <fieldset className="creator-controls" disabled={busy}>
      {draft ? <>
        <div className="creator-section-heading"><h2>{draft.templateId ? 'Personaliza tu plantilla' : 'Tu diseño desde cero'}</h2><DSButtonSecondary onClick={() => { if (mayDiscard()) { setDraft(null); setDirty(false); } }}>Elegir otra plantilla</DSButtonSecondary></div>
        <div className="creator-editor"><section className="creator-fields">
          <label>Título<DSInput maxLength={160} value={draft.title} onChange={event => update({ title: event.target.value })} /></label><label>Subtítulo<DSInput maxLength={240} value={draft.subtitle} onChange={event => update({ subtitle: event.target.value })} /></label>
          <label>Texto de la publicación<DSTextarea value={draft.caption} onChange={event => update({ caption: event.target.value })} /></label>
          <label>Formato<select value={draft.format} onChange={event => update({ format: event.target.value as ContentDraft['format'] })}><option value="post">Publicación cuadrada · 1080 × 1080</option><option value="story">Historia · 1080 × 1920</option></select></label>
          <div className="creator-colors"><label>Fondo<DSInput type="color" value={draft.background} onChange={event => update({ background: event.target.value })} /></label><label>Texto<DSInput type="color" value={draft.foreground} onChange={event => update({ foreground: event.target.value })} /></label></div>
          <div className="creator-actions"><DSButtonSecondary onClick={() => setGallery(value => !value)}>{gallery ? 'Cerrar biblioteca' : 'Elegir imagen'}</DSButtonSecondary>{draft.imagePath && <DSButtonSecondary onClick={() => update({ imagePath: '' })}>Quitar imagen</DSButtonSecondary>}</div>
          <div className="creator-actions"><DSButtonPrimary tooltip="Guarda este diseño en tu proyecto. Guarda antes de salir para conservar los cambios." onClick={save} disabled={!dirty}>Guardar contenido</DSButtonPrimary><DSButtonSecondary tooltip="Descarga el diseño como imagen PNG para compartirlo." onClick={download}>Descargar imagen</DSButtonSecondary><DSButtonSecondary onClick={async () => { try { await navigator.clipboard.writeText(draft.caption); setNotice('Texto copiado.'); } catch { setNotice('No se pudo copiar. Selecciona y copia el texto desde el campo.'); } }}>Copiar texto</DSButtonSecondary></div>
        </section><section className={`creator-preview creator-preview-${draft.format}`} aria-label="Vista previa del contenido" style={{ background: draft.background, color: draft.foreground }}>{imageUrl && <img src={imageUrl} alt="Imagen seleccionada para el contenido" />}<div><h2>{draft.title || 'Tu título'}</h2><p>{draft.subtitle}</p></div></section></div>
        {gallery && <MediaGallery userId={userId} projectId={project.id} onSelect={media => { setImage({ path: media.path, url: media.url }); update({ imagePath: media.path }); setGallery(false); }} />}
      </> : <TemplateLibrary key={project.type} type={project.type} onSelect={template => open(contentFromTemplate(project, template), true)} onCreateFromScratch={() => open(blankContent(project.id), true)} />}
      {document.drafts.length > 0 && <section><h2>Contenido guardado</h2><div className="creator-saved-grid">{document.drafts.map(item => <DSButtonSecondary key={item.id} onClick={() => open({ ...item }, false)}><strong>{item.title || item.caption.slice(0, 60)}</strong><span>{item.format === 'post' ? 'Publicación' : 'Historia'}</span></DSButtonSecondary>)}</div></section>}
    </fieldset>
  </main>;
}
