import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loadModuleDocument, saveModuleDocument } from '../../services/moduleDocuments';
import { initialTasks, parseAreaTasks, parseWorldState, type AreaTasks, type WorldState } from './areaModel';
import type { ModuleType } from '../../modules/moduleProjects';

type Entry = { tasks: AreaTasks; world: WorldState; taskRevision: string | null; worldRevision: string | null; loaded: boolean; dirty: boolean; busy: boolean; error: string; historical: boolean };
type Cache = Record<string, Entry>;
const Context = createContext<{ cache: Cache; patch: (key: string, update: Partial<Entry>) => void } | null>(null);
export function AreaDocumentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cache, setCache] = useState<Cache>({});
  useEffect(() => { setCache({}); }, [user?.id]);
  useEffect(() => {
    if (!Object.values(cache).some(entry => entry.dirty)) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [cache]);
  return <Context.Provider value={{ cache, patch: (key, update) => setCache(old => ({ ...old, [key]: { ...old[key], ...update } })) }}>{children}</Context.Provider>;
}
export function useAreaDocuments(projectId: string, type: ModuleType) {
  const context = useContext(Context)!;
  const { user } = useAuth();
  const key = `${user?.id}:${projectId}`;
  const entry = context.cache[key];
  const requested = useRef('');
  const lock = useRef(false);
  async function load() {
    if (!user || entry?.busy) return;
    context.patch(key, { busy: true, error: '' });
    try {
      const [tasks, world, history] = await Promise.all([loadModuleDocument(user.id, projectId, 'area-tasks'), loadModuleDocument(user.id, projectId, 'world-state'), loadModuleDocument(user.id, projectId, 'dashboard-progress')]);
      const taskPayload = tasks ? parseAreaTasks(tasks.payload) : initialTasks(type);
      const worldPayload = world ? parseWorldState(world.payload) : { version: 1 as const, areas: {} };
      context.patch(key, { tasks: taskPayload, world: worldPayload, taskRevision: tasks?.revision ?? null, worldRevision: world?.revision ?? null, loaded: true, dirty: false, busy: false, error: '', historical: Boolean(history) });
    } catch (error) { context.patch(key, { busy: false, error: (error as Error).message }); }
  }
  useEffect(() => {
    if (entry?.loaded || entry?.busy || requested.current === key || !user) return;
    requested.current = key;
    void load();
  }, [key, user?.id, entry?.loaded, entry?.busy]);
  async function save() {
    if (!user || !entry?.loaded || entry.busy || lock.current) return;
    lock.current = true;
    context.patch(key, { busy: true, error: '' });
    try {
      const taskRevision = await saveModuleDocument(user.id, projectId, 'area-tasks', entry.tasks, entry.taskRevision);
      context.patch(key, { taskRevision });
      const worldRevision = await saveModuleDocument(user.id, projectId, 'world-state', entry.world, entry.worldRevision);
      context.patch(key, { worldRevision, dirty: false });
    } catch (error) { context.patch(key, { error: (error as Error).message }); }
    finally { lock.current = false; context.patch(key, { busy: false }); }
  }
  return { entry, save, reload: load, change: (update: Partial<Pick<Entry, 'tasks' | 'world'>>) => { if (!entry?.busy) context.patch(key, { ...update, dirty: true }); } };
}
