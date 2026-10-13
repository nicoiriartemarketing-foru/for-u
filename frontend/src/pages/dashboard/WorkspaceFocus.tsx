import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { loadWorkspaceFocus } from '../../services/workspaceFocus';
import { saveModuleDocument } from '../../services/moduleDocuments';
import { isSavedProject } from './areaModel';
import { emptyFocus, parseWorkspaceFocus, toggleToday, type LastWork, type TaskReference, type WorkspaceFocus } from './workspaceFocusModel';

type State = { data: WorkspaceFocus; anchor: string | null; revision: string | null; loaded: boolean; busy: boolean; dirty: boolean; error: string };
const initial = (): State => ({ data: emptyFocus(), anchor: null, revision: null, loaded: false, busy: false, dirty: false, error: '' });
const Context = createContext<{
  state: State; reload: () => Promise<void>; save: () => Promise<void>;
  toggle: (ref: TaskReference) => void; remember: (work: LastWork) => void;
} | null>(null);

export function WorkspaceFocusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Keyed below so responses from a prior account can never populate the new one.
  return <AccountFocus key={user?.id ?? 'guest'} userId={user?.id}>{children}</AccountFocus>;
}
function AccountFocus({ userId, children }: { userId?: string; children: ReactNode }) {
  const store = useActiveProjectsStore();
  const [state, setState] = useState<State>(initial);
  const current = useRef(state); current.current = state;
  const lock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const patch = (update: Partial<State>) => {
    if (!alive.current) return;
    current.current = { ...current.current, ...update }; setState(current.current);
  };
  async function reload() {
    if (!userId || lock.current) return;
    lock.current = true; patch({ busy: true, loaded: false, error: '' });
    try {
      const saved = await loadWorkspaceFocus(userId);
      patch({ data: saved?.payload ?? emptyFocus(), anchor: saved?.projectId ?? null, revision: saved?.revision ?? null, loaded: true, dirty: false });
    } catch (error) { patch({ error: (error as Error).message }); }
    finally { lock.current = false; patch({ busy: false }); }
  }
  useEffect(() => { if (userId) void reload(); }, [userId]);
  useEffect(() => {
    if (!state.dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [state.dirty]);
  async function save() {
    const snapshot = current.current;
    if (!userId || !snapshot.loaded || lock.current) return;
    const owned = store.cloudUserId === userId ? Object.values(store.projectsById).filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p)) : [];
    const anchor = snapshot.anchor ?? owned.map(p => p.id).sort()[0];
    if (!anchor || !owned.some(p => p.id === anchor)) { patch({ error: 'No se guardó Hoy. Abre o recupera el proyecto asociado a tu enfoque.' }); return; }
    lock.current = true; patch({ busy: true, error: '' });
    let saved = false;
    try {
      const revision = await saveModuleDocument(userId, anchor, 'workspace-focus', parseWorkspaceFocus(snapshot.data), snapshot.revision);
      patch({ anchor, revision, dirty: current.current.data !== snapshot.data });
      saved = true;
    } catch (error) { patch({ error: (error as Error).message }); }
    finally {
      lock.current = false; patch({ busy: false });
      // A second navigation during a write keeps its own destination and saves
      // after the first revision returns. Failed writes never loop automatically.
      if (alive.current && saved && current.current.data !== snapshot.data) void save();
    }
  }
  function toggle(ref: TaskReference) {
    if (!current.current.loaded || lock.current) return;
    try { patch({ data: toggleToday(current.current.data, ref), dirty: true, error: '' }); }
    catch (error) { patch({ error: (error as Error).message }); }
  }
  function remember(work: LastWork) {
    if (!current.current.loaded) return;
    patch({ data: parseWorkspaceFocus({ ...current.current.data, lastWork: work }), dirty: true });
    void save();
  }
  return <Context.Provider value={{ state, reload, save, toggle, remember }}>{children}</Context.Provider>;
}
export function useWorkspaceFocus() {
  const context = useContext(Context);
  if (!context) throw new Error('Falta el contexto de enfoque.');
  return context;
}
