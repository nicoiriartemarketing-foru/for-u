import { supabase } from './supabase';
import type { ModuleType, ModuleProject } from '../modules/moduleProjects';
import { projectModuleType } from '../modules/moduleProjects';
import { useActiveProjectsStore, type ForUActiveProject } from '../stores/useActiveProjectsStore';

export async function persistModuleProject(userId: string, project: ForUActiveProject) {
  const base = {
    id: project.id, user_id: userId, name: project.name,
    business_type: projectModuleType(project) ?? 'restaurant',
    tangible_goal: project.tangibleGoal ?? '', status: project.status, created_at: project.createdAt,
  };
  const attempts = [
    { ...base, description: '', industry_key: project.industryKey ?? null, strategy_profile: project.strategyProfile ?? {}, template_source: project.templateSource ?? null },
    { ...base, industry_key: project.industryKey ?? null, strategy_profile: project.strategyProfile ?? {}, template_source: project.templateSource ?? null },
  ];
  let lastError = '';
  for (const payload of attempts) {
    const { error } = await client().from('projects').upsert(payload);
    if (!error) {
      if (useActiveProjectsStore.getState().cloudUserId === userId) useActiveProjectsStore.setState(state => ({ projectsById: { ...state.projectsById, [project.id]: { ...(state.projectsById[project.id] ?? project), cloudPending: false } } }));
      return;
    }
    lastError = error.message;
  }
  throw new Error(`Tu proyecto se creó en este dispositivo, pero Supabase todavía no lo guardó: ${lastError}`);
}

function client() {
  if (!supabase) throw new Error('Conecta tu cuenta para abrir tus módulos.');
  return supabase;
}

export async function loadModuleProjects(userId: string): Promise<ModuleProject[]> {
  const { data, error } = await client().from('projects').select('id,name,industry_key,strategy_profile').eq('user_id', userId).order('created_at');
  if (error) throw new Error(`No se pudieron cargar tus proyectos: ${error.message}`);
  return (data ?? []).flatMap(row => {
    const record = row as { id: string; name: string; industry_key?: string | null; strategy_profile?: Record<string, unknown> | null };
    const type = projectModuleType({ industryKey: record.industry_key, strategyProfile: record.strategy_profile });
    return type ? [{ id: record.id, name: record.name, type }] : [];
  });
}

export type ModuleDocumentKind = ModuleType | 'content-creator' | 'dashboard-progress' | 'area-tasks' | 'world-state';

export async function loadModuleDocument(userId: string, projectId: string, type: ModuleDocumentKind) {
  const { data, error } = await client().from('toolkit_documents').select('payload,updated_at').eq('user_id', userId).eq('project_id', projectId).eq('kind', `module-${type}`).maybeSingle();
  if (error) throw new Error(`No se pudo cargar este módulo. Revisa la configuración de Supabase antes de editar. Detalle: ${error.message}`);
  return data ? { payload: data.payload as unknown, revision: data.updated_at as string } : null;
}

export async function saveModuleDocument(userId: string, projectId: string, type: ModuleDocumentKind, payload: unknown, revision: string | null): Promise<string> {
  const db = client();
  const updatedAt = new Date().toISOString();
  const values = { user_id: userId, project_id: projectId, kind: `module-${type}`, payload, updated_at: updatedAt };
  // Compare the revision to prevent silently overwriting another tab's inventory.
  const result = revision === null
    ? await db.from('toolkit_documents').insert(values).select('updated_at').single()
    : await db.from('toolkit_documents').update({ payload, updated_at: updatedAt }).eq('user_id', userId).eq('project_id', projectId).eq('kind', `module-${type}`).eq('updated_at', revision).select('updated_at').maybeSingle();
  if (result.error?.code === '23505' || (!result.error && !result.data)) throw new Error('Este proyecto cambió en otra ventana. Recarga antes de volver a guardar; tus cambios actuales siguen en pantalla.');
  if (result.error || !result.data) throw new Error('No se guardó. Conserva esta pantalla y vuelve a intentar.');
  return result.data.updated_at as string;
}
