import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { areaDefinitions } from '../src/pages/dashboard/areaModel.ts';
const root = new URL('../src/', import.meta.url);
test('legacy global tokens remain available to existing editors', async () => {
 const css=await readFile(new URL('styles/global.css',root),'utf8');
 for(const token of ['--bg-primary','--text-primary','--border-light','--radius-lg']) assert.ok(css.includes(token));
});
// The four-area brief supersedes the earlier monochrome/no-purple rule.
test('business areas have stable distinct identities across dashboard and world',()=>{
 assert.deepEqual(areaDefinitions.map(a=>a.id),['marketing','finance','logistics','operations']);
 assert.equal(new Set(areaDefinitions.map(a=>a.color)).size,4);
 assert.equal(new Set(areaDefinitions.map(a=>a.pet)).size,4);
});
function luminance(hex){return hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);}
test('area card title colors meet normal text contrast',async()=>{
 const css=await readFile(new URL('pages/dashboard/workspace.css',root),'utf8');
 for(const area of areaDefinitions){
  const rule=css.match(new RegExp('\\.dashboard-home \\.dashboard-area-'+area.id+'\\{background:(#[0-9a-f]{6});color:(#[0-9a-f]{6})'));
  assert.ok(rule,area.id); const a=luminance(rule[1]), b=luminance(rule[2]); assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,area.id);
 }
});
