import { areaDefinitions, areaToolPath, isSavedProject, type AreaId } from './areaModel';
import type { ModuleType } from '../../modules/moduleProjects';

export const taskTools = [
  ['profile', 'Mi perfil y publicaciones'], ['proposal', 'Mi propuesta'], ['landing', 'Mi página'], ['editor', 'Editar oferta'], ['summary', 'Resumen del negocio'],
  ['creator', 'Creador visual'], ['content', 'Contenido con IA'], ['teleprompter', 'Teleprompter'],
  ['calendar', 'Calendario'], ['bookings', 'Reservas y pedidos'], ['automation', 'Contacto y respuestas'],
  ['images', 'Uploads'], ['analytics', 'Estadísticas'],
] as const;
export type TaskReference = { projectId: string; taskId: string };
export type LastWork = { projectId: string; area?: AreaId; taskId?: string; tool?: string };
type LegacyFocus = { version: 1; today: TaskReference[]; lastWork?: LastWork };
export type WorkspaceFocus = LegacyFocus | { version: 2; today: TaskReference[]; destinations: Record<string, LastWork> };
export const emptyFocus = (): WorkspaceFocus => ({ version: 1, today: [] });
export const sameTask = (a: TaskReference, b: TaskReference) => a.projectId === b.projectId && a.taskId === b.taskId;
export const knownTaskTool = (tool: unknown): tool is string => taskTools.some(([key]) => key === tool);

export function parseWorkspaceFocus(value: unknown): WorkspaceFocus {
  const doc = value as WorkspaceFocus;
  const validRef = (ref: TaskReference) => ref && isSavedProject(ref.projectId) && typeof ref.taskId === 'string' && ref.taskId.length > 0 && ref.taskId.length <= 200;
  const validWork = (work: LastWork) => work && isSavedProject(work.projectId)
    && (work.area === undefined || areaDefinitions.some(a => a.id === work.area))
    && (work.taskId === undefined || validRef({ projectId: work.projectId, taskId: work.taskId }))
    && (work.tool === undefined || work.tool === 'studio' || knownTaskTool(work.tool));
  if (!doc || ![1, 2].includes(doc.version) || !Array.isArray(doc.today) || doc.today.length > 3 || !doc.today.every(validRef)
    || doc.today.some((ref, i) => doc.today.slice(0, i).some(other => sameTask(ref, other)))
    || (doc.version === 1 && doc.lastWork !== undefined && !validWork(doc.lastWork))
    || (doc.version === 2 && (!doc.destinations || typeof doc.destinations !== 'object' || Array.isArray(doc.destinations)
      || !Object.entries(doc.destinations).every(([id, work]) => validWork(work) && id === work.projectId)))) {
    throw new Error('No pudimos interpretar tu enfoque. No se modificaron tus preferencias guardadas.');
  }
  return doc;
}
// Reading legacy preferences leaves their format intact. Only an explicit edit upgrades them.
function editableFocus(doc: WorkspaceFocus): Extract<WorkspaceFocus, { version: 2 }> {
  parseWorkspaceFocus(doc);
  return doc.version === 2 ? doc : { version: 2, today: doc.today, destinations: doc.lastWork ? { [doc.lastWork.projectId]: doc.lastWork } : {} };
}
export function projectDestination(doc: WorkspaceFocus, projectId: string): LastWork {
  return (doc.version === 2 ? doc.destinations[projectId] : doc.lastWork?.projectId === projectId ? doc.lastWork : undefined) ?? { projectId };
}
export function rememberDestination(doc: WorkspaceFocus, work: LastWork): WorkspaceFocus {
  const next = editableFocus(doc);
  return parseWorkspaceFocus({ ...next, destinations: { ...next.destinations, [work.projectId]: work } });
}
export function taskDestination(projectId: string, task: { id: string; area: AreaId; tool?: string }): LastWork {
  return { projectId, area: task.area, taskId: task.id, ...(knownTaskTool(task.tool) ? { tool: task.tool } : {}) };
}
export function toggleToday(doc: WorkspaceFocus, ref: TaskReference): WorkspaceFocus {
  doc = editableFocus(doc);
  if (doc.today.some(other => sameTask(ref, other))) return { ...doc, today: doc.today.filter(other => !sameTask(ref, other)) };
  if (doc.today.length >= 3) throw new Error('Elige hasta tres pasos para Hoy. Quita uno para añadir otro.');
  return parseWorkspaceFocus({ ...doc, today: [...doc.today, ref] });
}
export function resumePath(work: LastWork, type: ModuleType) {
  if (work.tool === 'studio') return `/creator-studio?project=${encodeURIComponent(work.projectId)}`;
  if (knownTaskTool(work.tool)) return areaToolPath(work.tool, type, work.projectId);
  const query = new URLSearchParams({ project: work.projectId });
  if (work.area) query.set('area', work.area);
  if (work.taskId) query.set('task', work.taskId);
  return `/dashboard?${query}`;
}
