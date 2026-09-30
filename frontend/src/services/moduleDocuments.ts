import { supabase } from './supabase';
import type { ModuleType, ModuleProject } from '../modules/moduleProjects';
import { projectModuleType } from '../modules/moduleProjects';
import type { ForUActiveProject } from '../stores/useActiveProjectsStore';

export async function persistModuleProject(userId: string, project: ForUActiveProject) {
  const { error } = await client().from('projects').upsert({
    id: project.id, user_id: userId, name: project.name, description: '',
    tangible_goal: project.tangibleGoal ?? '', industry_key: project.industryKey ?? null,
    strategy_profile: project.strategyProfile ?? {}, template_source: project.templateSource ?? null,
    status: project.status, created_at: project.createdAt,
  });
  if (error) throw new Error('El proyecto está en este dispositivo, pero todavía no se guardó en tu cuenta. Reintenta la sincronización antes de abrirlo.');
}

function client() {
  if (!supabase) throw new Error('Conecta tu cuenta para abrir tus módulos.');
  return supabase;
}

export async function loadModuleProjects(userId: string): Promise<ModuleProject[]> {
  const { data, error } = await client().from('projects').select('id,name,industry_key,strategy_profile').eq('user_id', userId).order('created_at');
  if (error) throw new Error('No se pudieron cargar tus proyectos. Vuelve a intentar.');
  return (data ?? []).flatMap(row => {
    const type = projectModuleType({ industryKey: row.industry_key, strategyProfile: row.strategy_profile });
    return type ? [{ id: row.id, name: row.name, type }] : [];
  });
}

export type ModuleDocumentKind = ModuleType | 'content-creator' | 'dashboard-progress';

export async function loadModuleDocument(userId: string, projectId: string, type: ModuleDocumentKind) {
  const { data, error } = await client().from('toolkit_documents').select('payload,updated_at').eq('user_id', userId).eq('project_id', projectId).eq('kind', `module-${type}`).maybeSingle();
  if (error) throw new Error('No se pudo cargar este módulo. Reintenta antes de editar.');
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
