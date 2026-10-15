import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { persistModuleProject } from '../services/moduleDocuments';
import { moduleLabels, type ModuleType } from '../modules/moduleProjects';
import { ButtonPrimary, ButtonSecondary, Input } from './ui/DesignSystem';
import EmotionalCompass from '../pages/dashboard/EmotionalCompass';
export default function DopamineOnboarding({ onComplete }: {
    onComplete: (project: string) => void;
}) {
    const { user } = useAuth();
    const store = useActiveProjectsStore();
    const navigate = useNavigate();
    const [name, setName] = useState(''), [type, setType] = useState<ModuleType>('restaurant'), [project, setProject] = useState<string | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const retry = useRef<string | null>(null), lock = useRef(false);
    async function create(e: FormEvent) { e.preventDefault(); if (!user || lock.current || !name.trim())
        return; lock.current = true; setBusy(true); setError(''); try {
        const id = retry.current ?? store.openProject({ name: name.trim(), industryKey: (type === 'restaurant' ? 'gastronomy' : type) as never, strategyProfile: { moduleType: type } });
        retry.current = id;
        const value = useActiveProjectsStore.getState().getProjectById(id);
        if (!value)
            throw new Error('No se pudo preparar tu proyecto.');
        await persistModuleProject(user.id, value);
        store.switchProject(id);
        setProject(id);
        retry.current = null;
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
        lock.current = false;
    } }
    return <main className="world-onboarding magic-card"><small>Bienvenida a FOR U</small><h1>Un lugar para tu proyecto</h1><p>No necesitas una página para empezar. Puedes ordenar tus ideas o descansar en tu isla.</p>{project ? <EmotionalCompass projectId={project} onDone={() => { onComplete(project); navigate(`/dashboard?project=${project}`); }}/> : <form onSubmit={create}><Input label="Nombre del proyecto" required maxLength={120} value={name} disabled={busy || Boolean(retry.current)} onChange={e => setName(e.target.value)} placeholder="Ej: Studio4U"/><fieldset disabled={busy || Boolean(retry.current)}><legend>Rubro inicial · orienta, no limita tus ofertas</legend>{(Object.keys(moduleLabels) as ModuleType[]).map(value => <label key={value}><input type="radio" name="industry" checked={type === value} onChange={() => setType(value)}/>{moduleLabels[value]}</label>)}</fieldset>{error && <p role="alert">{error}</p>}<ButtonPrimary disabled={busy || !name.trim()}>{busy ? 'Guardando…' : retry.current ? 'Reintentar el mismo proyecto' : 'Crear mi proyecto'}</ButtonPrimary><ButtonSecondary type="button" onClick={() => navigate('/dashboard?create=1')}>Volver a mis proyectos</ButtonSecondary></form>}</main>;
}
