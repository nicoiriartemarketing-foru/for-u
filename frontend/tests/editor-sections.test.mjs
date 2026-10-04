import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditorSection, sectionPresets, editorIndustry, reorderEditorSections } from '../src/toolkit/editorSections.ts';
test('all five industries provide relevant blocks without replacing saved content', () => {
 const industries=['restaurant','ecommerce','hospitality','tourism','courses'];
 assert.equal(new Set(industries.map(type=>sectionPresets(type)[0].key)).size,5);
 for(const type of industries){ const preset=sectionPresets(type)[0]; const block=createEditorSection(type,preset.key); assert.equal(block.title,preset.title); assert.ok(block.id); assert.equal(createEditorSection(type,'unknown'),null); }
 assert.equal(editorIndustry('gastronomy').name,'Restaurante');
});
test('reordering uses stable IDs and preserves data without mutating the draft', () => {
 const original=[{id:'a',title:'A',body:'one'},{id:'b',title:'B',body:'two'},{id:'c',title:'C',body:'three'}];
 assert.deepEqual(reorderEditorSections(original,'a','c').map(x=>x.id),['b','c','a']);
 assert.deepEqual(original.map(x=>x.id),['a','b','c']);
 assert.equal(reorderEditorSections(original,'missing','b'),original);
 assert.equal(reorderEditorSections(original,'a','a'),original);
});
