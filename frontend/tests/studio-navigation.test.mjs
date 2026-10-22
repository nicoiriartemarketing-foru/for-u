import test from 'node:test';
import assert from 'node:assert/strict';
import {landingOrigin,landingReturn} from '../src/studio/navigation.ts';
import {blankContent,saveContentDraft,validateCreativeContext} from '../src/components/shared/contentModel.ts';
const project='aa420f8a-2267-4fbf-b1bb-e756278fd352';
test('entry origin is explicit, survives save and reload, and cannot redirect to another site',()=>{
 assert.equal(landingOrigin(new URLSearchParams('section=history'),project),undefined);
 const origin=landingOrigin(new URLSearchParams('from=landing&section=history'),project);
 const draft={...blankContent(project),title:'Historia confirmada',creative:{intent:'awareness',sourceKey:'page:history',origin}};
 const saved=JSON.parse(JSON.stringify(saveContentDraft({version:1,drafts:[]},draft,project)));
 assert.equal(landingReturn(saved.drafts[0].creative.origin,project),`/dashboard/tools/landing?project=${project}&section=history&resume=1`);
 assert.equal(landingReturn(origin,'foreign-project'),undefined);
 assert.throws(()=>validateCreativeContext({...draft,creative:{...draft.creative,origin:{...origin,projectId:'foreign-project'}}},project),/origen/);
 assert.equal(landingReturn({...origin,sectionId:'bad\nsection'},project),undefined);
 const closed=landingReturn({...origin,sectionId:'https://evil.example/path?x=1'},project);
 assert.ok(closed.startsWith('/dashboard/tools/landing?'));
 assert.ok(closed.includes('section=https%3A%2F%2Fevil.example'));
});
test('landing return retains mobile preview and rejects invalid presentation modes',()=>{
 const origin=landingOrigin(new URLSearchParams('from=landing&section=faq&viewport=mobile'),project);
 assert.ok(landingReturn(origin,project).endsWith('&resume=1&viewport=mobile'));
 assert.equal(landingReturn({...origin,viewport:'external'},project),undefined);
});
test('workspace restoration is scoped and ignores removed sections and malformed cache',async()=>{
 const {parseLandingWorkspace,workspaceKey}=await import('../src/toolkit/landingWorkspace.ts');
 const blocks=[{id:'faq',title:'FAQ',body:''}];
 assert.deepEqual(parseLandingWorkspace(JSON.stringify({sectionId:'faq',viewport:'mobile'}),blocks),{sectionId:'faq',viewport:'mobile'});
 assert.deepEqual(parseLandingWorkspace(JSON.stringify({sectionId:'removed',viewport:'javascript:bad'}),blocks),{sectionId:'hero',viewport:'desktop'});
 assert.deepEqual(parseLandingWorkspace('{broken',blocks),{sectionId:'hero',viewport:'desktop'});
 assert.notEqual(workspaceKey('user',project),workspaceKey('user','other'));
 assert.notEqual(workspaceKey('user',project),workspaceKey('other',project));
});
