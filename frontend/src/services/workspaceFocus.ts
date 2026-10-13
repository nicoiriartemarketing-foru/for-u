import { supabase } from './supabase';
import { parseWorkspaceFocus } from '../pages/dashboard/workspaceFocusModel';

// One private document per account, anchored to an owned project. No schema changes.
// Never merge duplicate/unknown formats or replace them with defaults.
export async function loadWorkspaceFocus(userId: string) {
  if (!supabase) throw new Error('Supabase no está configurado. Tu enfoque no se ha guardado.');
  const { data, error } = await supabase.from('toolkit_documents').select('project_id,payload,updated_at')
    .eq('user_id', userId).eq('kind', 'module-workspace-focus');
  if (error) throw new Error(`No se pudo cargar Hoy: ${error.message}`);
  if ((data?.length ?? 0) > 1) throw new Error('Hay varios documentos de enfoque. Se conservan sin sobrescribir; requiere recuperación.');
  const row = data?.[0];
  return row ? { projectId: row.project_id as string, revision: row.updated_at as string, payload: parseWorkspaceFocus(row.payload) } : null;
}
