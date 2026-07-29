import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buttonIdFromReply,
  completedTaskButtons,
  executingTaskButtons,
  ideaCaptureButtons,
  ideaSavedButtons,
  mainMenuButtons,
  nextActionButtons,
  renderButtons,
  routeButtons,
  type WhatsAppButton,
} from './buttons';

export type WhatsAppState =
  | 'menu'
  | 'capturing_idea'
  | 'idea_saved'
  | 'viewing_projects'
  | 'viewing_project'
  | 'viewing_next_action'
  | 'executing_task'
  | 'organizing'
  | 'planning_route';

export type ProfileRow = {
  id: string;
  display_name: string | null;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean | null;
  coins: number | null;
};

export type WhatsAppSessionRow = {
  id: string;
  user_id: string;
  current_state: WhatsAppState;
  context_data: Record<string, unknown> | null;
};

type ProjectRow = {
  id: string;
  name: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  estimated_time: number | null;
  created_at?: string;
};

type FlowInput = {
  supabase: SupabaseClient;
  profile: ProfileRow;
  message: string;
};

type FlowResult = {
  response: string;
  state: WhatsAppState;
  intent: string;
};

export async function handleWhatsAppFlow({ supabase, profile, message }: FlowInput): Promise<FlowResult> {
  const session = await getOrCreateSession(supabase, profile.id);
  const cleanMessage = normalizeText(message);
  const commandIntent = detectCommand(cleanMessage);

  if (commandIntent === 'help') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('help', 'menu', helpMessage(profile));
  }

  if (commandIntent === 'menu' || cleanMessage === '0') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('menu', 'menu', mainMenu(profile));
  }

  if (commandIntent === 'direct_idea') {
    const content = message.replace(/^idea\s+/i, '').trim();
    return saveIdeaAndAskNext(supabase, profile, content || message);
  }

  if (commandIntent === 'next_action') {
    return showNextAction(supabase, profile);
  }

  if (commandIntent === 'complete_task') {
    return completeCurrentOrNextTask(supabase, profile, session);
  }

  if (commandIntent === 'projects') {
    return showProjects(supabase, profile);
  }

  if (commandIntent === 'organize') {
    return organizeIdeas(supabase, profile);
  }

  if (session.current_state === 'menu') {
    return handleMenuReply(supabase, profile, message);
  }

  if (session.current_state === 'capturing_idea' || session.current_state === 'idea_saved') {
    return handleIdeaCaptureReply(supabase, profile, message, session.current_state);
  }

  if (session.current_state === 'viewing_next_action') {
    return handleNextActionReply(supabase, profile, message, session);
  }

  if (session.current_state === 'executing_task') {
    return handleExecutingReply(supabase, profile, message, session);
  }

  if (session.current_state === 'viewing_projects' || session.current_state === 'viewing_project') {
    return handleProjectReply(supabase, profile, message);
  }

  if (session.current_state === 'organizing' || session.current_state === 'planning_route') {
    return handlePlanningReply(supabase, profile, message);
  }

  await updateSession(supabase, profile.id, 'menu', {});
  return response('menu', 'menu', mainMenu(profile));
}

export function detectCommand(cleanMessage: string) {
  if (/^(hola|menu|menú|inicio|volver|cancelar|0)$/.test(cleanMessage)) return 'menu';
  if (/^ayuda$/.test(cleanMessage)) return 'help';
  if (/^idea\s+/.test(cleanMessage)) return 'direct_idea';
  if (/(que tengo que hacer|proxima|siguiente accion|siguiente acción|accion actual|acción actual)/.test(cleanMessage)) return 'next_action';
  if (/(complete|complete|termine|listo|hecho|ya hice|ya llame|ya llame|completé|terminé)/.test(cleanMessage)) return 'complete_task';
  if (/(proyectos|mis proyectos|ver proyectos)/.test(cleanMessage)) return 'projects';
  if (/(organizar|organiza|ordenar ideas)/.test(cleanMessage)) return 'organize';
  return null;
}

async function handleMenuReply(supabase: SupabaseClient, profile: ProfileRow, message: string): Promise<FlowResult> {
  const selected = buttonIdFromReply(message, mainMenuButtons);

  if (selected === 'capture_ideas') {
    await updateSession(supabase, profile.id, 'capturing_idea', {});
    return response('capture_ideas', 'capturing_idea', [
      'Perfecto. Escribe tu idea, o varias, y yo la guardo en tu frasco.',
      'Cuando estés lista, escribe "organizar".',
      '',
      renderButtons(ideaCaptureButtons),
    ].join('\n'));
  }

  if (selected === 'next_action') return showNextAction(supabase, profile);
  if (selected === 'view_projects') return showProjects(supabase, profile);

  await updateSession(supabase, profile.id, 'menu', {});
  return response('menu', 'menu', mainMenu(profile));
}

async function handleIdeaCaptureReply(
  supabase: SupabaseClient,
  profile: ProfileRow,
  message: string,
  state: WhatsAppState,
): Promise<FlowResult> {
  const buttons = state === 'idea_saved' ? ideaSavedButtons : ideaCaptureButtons;
  const selected = buttonIdFromReply(message, buttons);

  if (selected === 'back_menu') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('menu', 'menu', mainMenu(profile));
  }

  if (selected === 'organize') {
    return organizeIdeas(supabase, profile);
  }

  if (selected === 'another_idea' || selected === 'write_idea') {
    await updateSession(supabase, profile.id, 'capturing_idea', {});
    return response('capture_ideas', 'capturing_idea', 'Te leo. Escribe la idea y la guardo en tu frasco ✨');
  }

  return saveIdeaAndAskNext(supabase, profile, message);
}

async function handleNextActionReply(
  supabase: SupabaseClient,
  profile: ProfileRow,
  message: string,
  session: WhatsAppSessionRow,
): Promise<FlowResult> {
  const selected = buttonIdFromReply(message, nextActionButtons);

  if (selected === 'back_menu') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('menu', 'menu', mainMenu(profile));
  }

  if (selected === 'start_task') {
    const projectId = String(session.context_data?.projectId ?? '');
    const taskId = String(session.context_data?.taskId ?? '');
    if (taskId) {
      await supabase.from('tasks').update({ status: 'doing' }).eq('id', taskId);
    }

    await updateSession(supabase, profile.id, 'executing_task', { projectId, taskId });
    return response('start_task', 'executing_task', [
      '¡Vamos! ⏱️ Avísame cuando termines escribiendo "listo" o tocando el número.',
      '',
      renderButtons(executingTaskButtons),
    ].join('\n'));
  }

  if (selected === 'complete_task') {
    return completeCurrentOrNextTask(supabase, profile, session);
  }

  return showNextAction(supabase, profile);
}

async function handleExecutingReply(
  supabase: SupabaseClient,
  profile: ProfileRow,
  message: string,
  session: WhatsAppSessionRow,
): Promise<FlowResult> {
  const selected = buttonIdFromReply(message, executingTaskButtons);

  if (selected === 'back_menu') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('menu', 'menu', mainMenu(profile));
  }

  if (selected === 'pause_task') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('pause_task', 'menu', 'Pausado sin culpa. Vuelves cuando quieras.\n\n' + mainMenu(profile));
  }

  if (selected === 'complete_task' || detectCommand(normalizeText(message)) === 'complete_task') {
    return completeCurrentOrNextTask(supabase, profile, session);
  }

  return response('executing_task', 'executing_task', [
    'Estoy contigo. Cuando termines, responde "listo" o elige:',
    '',
    renderButtons(executingTaskButtons),
  ].join('\n'));
}

async function handleProjectReply(supabase: SupabaseClient, profile: ProfileRow, message: string): Promise<FlowResult> {
  const projects = await getProjects(supabase, profile.id);
  const selectedIndex = Number.parseInt(message.trim(), 10) - 1;
  const selectedProject = Number.isFinite(selectedIndex) ? projects[selectedIndex] : null;

  if (!selectedProject) {
    return showProjects(supabase, profile);
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, estimated_time')
    .eq('project_id', selectedProject.id)
    .in('status', ['todo', 'doing'])
    .order('created_at', { ascending: true })
    .limit(5);

  await updateSession(supabase, profile.id, 'viewing_project', { projectId: selectedProject.id });

  const taskLines = (tasks as TaskRow[] | null)?.length
    ? (tasks as TaskRow[]).map((task, index) => `${index + 1}. ${task.title} (${task.estimated_time ?? 15} min)`).join('\n')
    : 'No veo tareas pendientes.';

  return response('viewing_project', 'viewing_project', [
    `Aquí está "${selectedProject.name}":`,
    taskLines,
    '',
    'Escribe "próxima" para tomar una acción o "0" para volver.',
  ].join('\n'));
}

async function handlePlanningReply(supabase: SupabaseClient, profile: ProfileRow, message: string): Promise<FlowResult> {
  const selected = buttonIdFromReply(message, routeButtons);
  if (selected === 'back_menu') {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('menu', 'menu', mainMenu(profile));
  }

  if (selected === 'create_route') {
    await updateSession(supabase, profile.id, 'planning_route', {});
    return response('create_route', 'planning_route', [
      '🗺️ Ruta Digital creada:',
      '1. Capturar lo importante',
      '2. Convertirlo en acciones pequeñas',
      '3. Ejecutar una tarea de 15 min',
      '4. Celebrar avance',
      '',
      renderButtons(completedTaskButtons),
    ].join('\n'));
  }

  return organizeIdeas(supabase, profile);
}

async function showNextAction(supabase: SupabaseClient, profile: ProfileRow): Promise<FlowResult> {
  const project = await getActiveProject(supabase, profile.id);
  if (!project) {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('next_action', 'menu', 'Todavía no tienes proyectos activos. Crea uno en la app y vuelvo contigo 🎯');
  }

  const task = await getNextTask(supabase, project.id);
  if (!task) {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('next_action', 'menu', `✨ En "${project.name}" no veo tareas pendientes. Puedes echar una idea nueva al frasco.\n\n${mainMenu(profile)}`);
  }

  await updateSession(supabase, profile.id, 'viewing_next_action', { projectId: project.id, taskId: task.id });

  return response('next_action', 'viewing_next_action', [
    `📋 Tu próxima acción en "${project.name}":`,
    '',
    `${task.title} (${task.estimated_time ?? 15} min)`,
    '',
    '¿Empezamos?',
    renderButtons(nextActionButtons),
  ].join('\n'));
}

async function completeCurrentOrNextTask(
  supabase: SupabaseClient,
  profile: ProfileRow,
  session: WhatsAppSessionRow,
): Promise<FlowResult> {
  let projectId = String(session.context_data?.projectId ?? '');
  let taskId = String(session.context_data?.taskId ?? '');

  if (!projectId || !taskId) {
    const project = await getActiveProject(supabase, profile.id);
    if (!project) return response('complete_task', 'menu', 'No encontré un proyecto activo para completar.');
    const task = await getNextTask(supabase, project.id);
    if (!task) return response('complete_task', 'menu', `No veo tareas pendientes en "${project.name}" ✨`);
    projectId = project.id;
    taskId = task.id;
  }

  await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('project_id', projectId);

  await supabase
    .from('profiles')
    .update({ coins: (profile.coins ?? 0) + 20 })
    .eq('id', profile.id);

  await updateSession(supabase, profile.id, 'menu', {});

  return response('complete_task', 'menu', [
    '¡Excelente, Nicole! +20 monedas 🪙.',
    '¿Qué sigue?',
    '',
    renderButtons(completedTaskButtons),
  ].join('\n'));
}

async function showProjects(supabase: SupabaseClient, profile: ProfileRow): Promise<FlowResult> {
  const projects = await getProjects(supabase, profile.id);
  if (projects.length === 0) {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('projects', 'menu', 'No tienes proyectos activos todavía. Cuando crees uno, aparece aquí ✨');
  }

  const projectLines = await Promise.all(projects.slice(0, 9).map(async (project, index) => {
    const progress = await getProjectProgress(supabase, project.id);
    return `${index + 1}. ${project.name} (${progress}% completado)`;
  }));

  const projectButtons: WhatsAppButton[] = projects.slice(0, 9).map((project, index) => ({
    id: project.id,
    number: String(index + 1),
    label: project.name,
  }));

  await updateSession(supabase, profile.id, 'viewing_projects', {});

  return response('projects', 'viewing_projects', [
    `Tienes ${projects.length} proyectos activos:`,
    '',
    projectLines.join('\n'),
    '',
    '¿Cuál quieres ver?',
    renderButtons([...projectButtons, { id: 'back_menu', number: '0', label: '🔙 Volver al menú' }]),
  ].join('\n'));
}

async function saveIdeaAndAskNext(supabase: SupabaseClient, profile: ProfileRow, content: string): Promise<FlowResult> {
  const project = await getActiveProject(supabase, profile.id);
  if (!project) {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('brain_dump', 'menu', 'Recibí tu idea, pero no encontré un proyecto activo donde guardarla. Crea uno en la app primero.');
  }

  await supabase.from('ideas').insert({
    project_id: project.id,
    content,
  });

  await updateSession(supabase, profile.id, 'idea_saved', { projectId: project.id });

  return response('brain_dump', 'idea_saved', [
    '✨ Idea guardada.',
    '¿Quieres agregar otra o volvemos al menú?',
    '',
    renderButtons(ideaSavedButtons),
  ].join('\n'));
}

async function organizeIdeas(supabase: SupabaseClient, profile: ProfileRow): Promise<FlowResult> {
  const project = await getActiveProject(supabase, profile.id);
  if (!project) {
    await updateSession(supabase, profile.id, 'menu', {});
    return response('organize', 'menu', 'No encontré un proyecto activo para organizar.');
  }

  const { data: ideas } = await supabase
    .from('ideas')
    .select('content')
    .eq('project_id', project.id);

  const counts = mockOrganizeCounts((ideas ?? []).map((idea: { content: string }) => idea.content));
  await updateSession(supabase, profile.id, 'organizing', { projectId: project.id, counts });

  return response('organize', 'organizing', [
    `Organicé tus ideas en "${project.name}":`,
    '',
    `💡 Ideas: ${counts.ideas}`,
    `✅ Acciones: ${counts.actions}`,
    `💰 Finanzas: ${counts.finances}`,
    `📱 Marketing: ${counts.marketing}`,
    '',
    '¿Quieres que cree tu Ruta Digital?',
    renderButtons(routeButtons),
  ].join('\n'));
}

async function getOrCreateSession(supabase: SupabaseClient, userId: string): Promise<WhatsAppSessionRow> {
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('id, user_id, current_state, context_data')
    .eq('user_id', userId)
    .maybeSingle<WhatsAppSessionRow>();

  if (data) return data;

  const { data: inserted } = await supabase
    .from('whatsapp_sessions')
    .insert({ user_id: userId, current_state: 'menu', context_data: {} })
    .select('id, user_id, current_state, context_data')
    .single<WhatsAppSessionRow>();

  return inserted!;
}

async function updateSession(
  supabase: SupabaseClient,
  userId: string,
  state: WhatsAppState,
  contextData: Record<string, unknown>,
) {
  await supabase
    .from('whatsapp_sessions')
    .upsert({
      user_id: userId,
      current_state: state,
      context_data: contextData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
}

async function getActiveProject(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<ProjectRow>();

  return data ?? null;
}

async function getProjects(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(9);

  return (data ?? []) as ProjectRow[];
}

async function getNextTask(supabase: SupabaseClient, projectId: string) {
  const { data } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, estimated_time, created_at')
    .eq('project_id', projectId)
    .in('status', ['todo', 'doing'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<TaskRow>();

  return data ?? null;
}

async function getProjectProgress(supabase: SupabaseClient, projectId: string) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId);

  const total = tasks?.length ?? 0;
  const done = tasks?.filter((task: { status: string }) => task.status === 'done').length ?? 0;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function mainMenu(profile: ProfileRow) {
  const name = profile.display_name?.trim() || 'Nicole';
  return [
    `¡Hola, ${name}! 👋 ¿Qué quieres hacer hoy?`,
    '',
    renderButtons(mainMenuButtons),
    '',
    'También puedes escribir: idea [texto], próxima, completé, proyectos o ayuda.',
  ].join('\n');
}

function helpMessage(profile: ProfileRow) {
  return [
    mainMenu(profile),
    '',
    'Comandos rápidos:',
    '• hola → menú principal',
    '• idea [texto] → guardar idea',
    '• próxima → ver siguiente acción',
    '• completé → cerrar tarea actual',
    '• proyectos → ver proyectos activos',
  ].join('\n');
}

function mockOrganizeCounts(ideas: string[]) {
  const text = ideas.join(' ').toLowerCase();
  return {
    ideas: Math.max(1, ideas.length),
    actions: /hacer|llamar|comprar|crear|enviar|publicar/.test(text) ? 2 : 1,
    finances: /precio|costo|presupuesto|dinero|venta|proveedor/.test(text) ? 1 : 0,
    marketing: /instagram|post|campaña|marketing|cliente|navidad/.test(text) ? 2 : 0,
  };
}

function response(intent: string, state: WhatsAppState, responseText: string): FlowResult {
  return { intent, state, response: responseText };
}

export function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
