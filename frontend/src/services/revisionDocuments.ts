import type { SupabaseClient } from '@supabase/supabase-js';

// Shared persistence boundary: errors never advance the caller's revision.
export async function writeRevisionDocument(db: SupabaseClient, userId: string, projectId: string, kind: string, payload: unknown, revision: string | null): Promise<string> {
  const updatedAt = new Date().toISOString();
  const values = { user_id: userId, project_id: projectId, kind: kind, payload, updated_at: updatedAt };
  // Compare the revision to prevent silently overwriting another tab's inventory.
  const result = revision === null
    ? await db.from('toolkit_documents').insert(values).select('updated_at').single()
    : await db.from('toolkit_documents').update({ payload, updated_at: updatedAt }).eq('user_id', userId).eq('project_id', projectId).eq('kind', kind).eq('updated_at', revision).select('updated_at').maybeSingle();
  if (result.error?.code === '23505' || (!result.error && !result.data)) throw new Error('Este proyecto cambió en otra ventana. Recarga antes de volver a guardar; tus cambios actuales siguen en pantalla.');
  if (result.error || !result.data) throw new Error('No se guardó. Conserva esta pantalla y vuelve a intentar.');
  return result.data.updated_at as string;
}
