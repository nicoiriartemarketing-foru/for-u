import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyFocus, parseWorkspaceFocus, toggleToday, resumePath } from '../src/pages/dashboard/workspaceFocusModel.ts';
import { initialTasks } from '../src/pages/dashboard/areaModel.ts';

test('Today stores up to three references across projects without copying or changing tasks', () => {
  const source = initialTasks('restaurant');
  const before = structuredClone(source);
  const projects = [crypto.randomUUID(), crypto.randomUUID()];
  let focus = emptyFocus();
  const refs = source.tasks.slice(0, 4).map((task, i) => ({ projectId: projects[i % 2], taskId: task.id }));
  for (const ref of refs.slice(0, 3)) focus = toggleToday(focus, ref);
  assert.equal(focus.today.length, 3);
  assert.deepEqual(Object.keys(focus.today[0]).sort(), ['projectId', 'taskId']);
  assert.throws(() => toggleToday(focus, refs[3]), /hasta tres/);
  focus = toggleToday(focus, refs[0]);
  focus = toggleToday(focus, refs[3]);
  assert.equal(focus.today.length, 3);
  assert.deepEqual(source, before);
});
test('references with the same task id in different projects remain independent', () => {
  const taskId = crypto.randomUUID();
  const a = { projectId: crypto.randomUUID(), taskId };
  const b = { projectId: crypto.randomUUID(), taskId };
  assert.equal(toggleToday(toggleToday(emptyFocus(), a), b).today.length, 2);
});
test('invalid or unknown focus documents are rejected rather than reset', () => {
  const ref = { projectId: crypto.randomUUID(), taskId: crypto.randomUUID() };
  assert.throws(() => parseWorkspaceFocus({ version: 2, today: [] }));
  assert.throws(() => parseWorkspaceFocus({ version: 1, today: [ref, ref] }));
  assert.throws(() => parseWorkspaceFocus({ version: 1, today: [{ ...ref, projectId: 'legacy-project' }] }));
  assert.throws(() => parseWorkspaceFocus({ version: 1, today: [], lastWork: { projectId: ref.projectId, tool: 'https://external.example' } }));
  assert.throws(() => parseWorkspaceFocus({ version: 1, today: [], lastWork: { projectId: ref.projectId, area: 'unknown' } }));
  const saved = { version: 1, today: [ref], lastWork: { projectId: ref.projectId, area: 'marketing', taskId: ref.taskId } };
  assert.deepEqual(parseWorkspaceFocus(JSON.parse(JSON.stringify(saved))), saved);
});
test('resume retains the project and opens the task or correct rubric tool', () => {
  const projectId = crypto.randomUUID(), taskId = crypto.randomUUID();
  const path = resumePath({ projectId, area: 'finance', taskId }, 'hospitality');
  const url = new URL(path, 'http://localhost');
  assert.equal(url.searchParams.get('project'), projectId);
  assert.equal(url.searchParams.get('task'), taskId);
  assert.equal(url.searchParams.get('area'), 'finance');
  assert.equal(resumePath({ projectId, tool: 'editor' }, 'hospitality'), `/modules/hospitality/editor?project=${projectId}`);
  assert.equal(resumePath({ projectId, tool: 'studio' }, 'restaurant'), `/creator-studio?project=${projectId}`);
});
