import { areaDefinitions, areaToolPath, isSavedProject, type AreaId } from './areaModel';
import type { ModuleType } from '../../modules/moduleProjects';

export const taskTools = [
  ['landing', 'Mi página'], ['editor', 'Editar oferta'], ['summary', 'Resumen del negocio'],
  ['creator', 'Creador visual'], ['content', 'Contenido con IA'], ['teleprompter', 'Teleprompter'],
  ['calendar', 'Calendario'], ['bookings', 'Reservas y pedidos'], ['automation', 'Contacto y respuestas'],
  ['images', 'Uploads'], ['analytics', 'Estadísticas'],
] as const;
export type TaskReference = { projectId: string; taskId: string };
export type LastWork = { projectId: string; area?: AreaId; taskId?: string; tool?: string };
export type WorkspaceFocus = { version: 1; today: TaskReference[]; lastWork?: LastWork };
export const emptyFocus = (): WorkspaceFocus => ({ version: 1, today: [] });
export const sameTask = (a: TaskReference, b: TaskReference) => a.projectId === b.projectId && a.taskId === b.taskId;
export const knownTaskTool = (tool: unknown): tool is string => taskTools.some(([key]) => key === tool);

export function parseWorkspaceFocus(value: unknown): WorkspaceFocus {
  const doc = value as WorkspaceFocus;
  const validRef = (ref: TaskReference) => ref && isSavedProject(ref.projectId) && typeof ref.taskId === 'string' && ref.taskId.length > 0 && ref.taskId.length <= 200;
  if (!doc || doc.version !== 1 || !Array.isArray(doc.today) || doc.today.length > 3 || !doc.today.every(validRef)
    || doc.today.some((ref, i) => doc.today.slice(0, i).some(other => sameTask(ref, other)))
    || (doc.lastWork && (!isSavedProject(doc.lastWork.projectId)
      || (doc.lastWork.area !== undefined && !areaDefinitions.some(a => a.id === doc.lastWork?.area))
      || (doc.lastWork.taskId !== undefined && !validRef({ projectId: doc.lastWork.projectId, taskId: doc.lastWork.taskId }))
      || (doc.lastWork.tool !== undefined && doc.lastWork.tool !== 'studio' && !knownTaskTool(doc.lastWork.tool))))) {
    throw new Error('No pudimos interpretar tu enfoque. No se modificaron tus preferencias guardadas.');
  }
  return doc;
}
export function toggleToday(doc: WorkspaceFocus, ref: TaskReference): WorkspaceFocus {
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
