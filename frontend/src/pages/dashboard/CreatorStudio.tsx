import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType, moduleLabels } from '../../modules/moduleProjects';
import { isSavedProject } from './areaModel';
import { ToolkitProvider, useToolkit } from '../../toolkit/ToolkitContext';
import { businessFromProject } from '../../toolkit/types';
import { studioJourney, validStudioDraft } from './studioJourney';
import UnifiedDashboard from './UnifiedDashboard';
import { supabase } from '../../lib/supabaseClient';
import './creatorStudio.css';

export default function CreatorStudio() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  useEffect(() => { if (user && store.cloudUserId !== user.id) void store.hydrateFromSupabase(user.id); }, [user?.id, store.cloudUserId]);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p)) : [];
  const requested = params.get('project');
  const project = requested ? projects.find(p => p.id === requested) : projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  if (!user || store.cloudUserId !== user.id) return <p role="status">Cargando tu espacio creativo…</p>;
  if (params.get('create') === '1' || params.get('view') === 'management') return <UnifiedDashboard />;
  if (!project) return <section className="cs-empty"><h1>{requested ? 'No encontramos este proyecto' : 'Tu próxima idea empieza aquí'}</h1><Link to={requested ? '/creator-studio' : '/dashboard?create=1'}>{requested ? 'Ver mis proyectos' : '＋ Crear mi proyecto'}</Link></section>;
  return <ToolkitProvider key={`${user.id}:${project.id}`} userId={user.id} projectId={project.id} business={businessFromProject(project)}><StudioHome type={projectModuleType(project)!} /></ToolkitProvider>;
}
function StudioHome({ type }: { type: NonNullable<ReturnType<typeof projectModuleType>> }) {
  const { business, docs, loading, loadError, reload, projectId, userId } = useToolkit();
  const [publication, setPublication] = useState<{ slug: string; published: boolean } | null>(null);
  const [publicationError, setPublicationError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setPublication(null); setPublicationError(false);
    if (!supabase) { setPublicationError(true); return; }
    void supabase.from('toolkit_sites').select('slug,published').eq('project_id', projectId).eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (live) { setPublication(data); setPublicationError(Boolean(error)); }
    });
    return () => { live = false; };
  }, [projectId, userId, attempt]);
  if (loading) return <div className="cs-loading" role="status" aria-label="Cargando tu creación"><div /><div /><div /></div>;
  if (loadError) return <section role="alert"><h1>No pudimos cargar tu creación</h1><button onClick={() => void reload()}>Reintentar</button></section>;
  const draft = validStudioDraft(docs.landing) ? docs.landing : null;

  const steps = studioJourney(type, docs.landing, Boolean(publication?.published), docs[`module-${type}`]);
  const next = steps.find(step => !step.ready) ?? steps[3];
  const query = `?project=${encodeURIComponent(projectId)}`;
  const editor = `/dashboard/tools/landing${query}`;
  const stepLink = (id: string) => id === "offer" ? `/modules/${type}/editor${query}` : `${editor}&step=${id}`;
  return <section className="cs-home">
    <header className="cs-heading"><span>CREATOR STUDIO · {moduleLabels[type]}</span><h1>Hagamos brillar {business.name}</h1><p>Una idea, un paso y algo muy tuyo.</p></header>
      <Link to={`/dashboard/tools/profile?project=${encodeURIComponent(projectId)}`}>📱 Mi perfil y publicaciones →</Link>
    <Link className="cs-primary magic-button-primary" to={`/dashboard/tools/proposal${query}`}>✨ Mi propuesta · de tu idea a tu página →</Link>
    <div className="cs-hero"><div><span className="cs-kicker">Tu próximo paso</span><h2>{next.title}</h2><p>{next.hint}</p><Link className="cs-primary magic-button-primary" to={stepLink(next.id)}>Continuar mi creación <span aria-hidden="true">→</span></Link></div><div className="cs-preview magic-card" aria-label="Resumen de tu página">{draft?.heroImage ? <img src={draft.heroImage} alt={draft.heroImageAlt || 'Portada de tu proyecto'} /> : <div className="cs-art" aria-hidden="true"><span>Tu idea<br />toma forma</span></div>}<strong>{draft?.headline || business.name}</strong><span>{publication?.published ? 'Página publicada' : draft ? 'Borrador guardado' : 'Tu página está por nacer'}</span></div></div>
    <ol className="cs-journey" aria-label="Tu ruta de creación">{steps.map((step, index) => <li key={step.id} data-step={step.id}><Link className="magic-card" to={stepLink(step.id)} aria-current={step.id === next.id ? 'step' : undefined}><div className="cs-step-top"><span className="cs-step-icon" aria-hidden="true">{step.icon}</span><span>{step.ready ? '✓ Listo' : step.started ? 'En proceso' : 'Pendiente'}</span></div><small>PASO {index + 1}</small><h2>{step.title}</h2><p>{step.hint}</p><span className="cs-step-action">{step.ready ? 'Volver a editar' : 'Explorar este paso'} →</span></Link></li>)}</ol>
    <aside className="cs-guide"><p><strong>A tu ritmo.</strong> Puedes volver a cualquier paso y seguir creando cuando quieras.</p></aside>
    <details className="cs-tools"><summary>Herramientas creativas</summary><nav aria-label="Herramientas creativas"><Link to={`/content-creator${query}`}>Creador visual</Link><Link to={`${editor}&page=templates`}>Plantillas</Link><Link to={`/dashboard/tools/content${query}`}>Propuestas con IA</Link><Link to={`/dashboard/tools/teleprompter${query}`}>Teleprompter</Link></nav></details>
    <footer className="cs-footer"><Link to={`/dashboard${query}`}>Mis tareas y mi negocio →</Link>{publication?.published && <a href={`/s/${encodeURIComponent(publication.slug)}`} target="_blank" rel="noreferrer">Ver mi página publicada ↗</a>}{publicationError && <p role="alert">No pudimos comprobar la publicación. <button onClick={() => setAttempt(value => value + 1)}>Reintentar</button></p>}</footer>
  </section>;
}
