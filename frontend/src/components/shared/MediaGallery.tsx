import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../services/supabase';
import { compressImage } from '../../toolkit/media';
import { resolveMediaPath } from './mediaStorage';
export type SelectedMedia = { path: string; url: string; name: string };
export default function MediaGallery({ userId, projectId, onSelect }: { userId: string; projectId: string; onSelect: (media: SelectedMedia) => void }) {
  const [images, setImages] = useState<SelectedMedia[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const uploading = useRef(false);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) { setNotice('Conecta tu cuenta para abrir la biblioteca.'); return; }
      const prefix = `${userId}/${projectId}`;
      const { data: files, error } = await supabase.storage.from('user-uploads').list(prefix, { limit: 40, offset: page * 40, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw new Error('No se pudo cargar la biblioteca. Reintenta.');
      const paths = (files ?? []).filter(file => file.id).map(file => ({ path: `${prefix}/${file.name}`, name: file.name }));
      const resolved = await Promise.all(paths.map(async file => ({ ...file, url: await resolveMediaPath(file.path) })));
      if (active) { setImages(resolved); setMore((files?.length ?? 0) === 40); setNotice(''); }
    })().catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [userId, projectId, page, revision]);
  async function upload(file: File | undefined) {
    if (!file || !supabase || uploading.current) return;
    uploading.current = true; setBusy(true); setNotice('Subiendo imagen…');
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${projectId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('user-uploads').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw new Error('No se pudo subir la imagen. Revisa la conexión y reintenta.');
      setPage(0); setRevision(value => value + 1);
    } catch (error) { setNotice((error as Error).message); }
    finally { uploading.current = false; setBusy(false); }
  }
  return <section className="creator-gallery"><h3>Imágenes de este proyecto</h3><p role="status">{notice}</p><label>Subir imagen<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label>
    <div className="creator-media-grid">{images.map(image => <button type="button" key={image.path} onClick={() => onSelect(image)}><img src={image.url} alt="Imagen de tu biblioteca" /><span>Usar imagen</span></button>)}</div>
    <div className="creator-actions"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Imágenes anteriores</button><button type="button" disabled={!more} onClick={() => setPage(value => value + 1)}>Más imágenes</button><button type="button" onClick={() => setRevision(value => value + 1)}>Actualizar biblioteca</button></div>
  </section>;
}
