import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingNavigation} from '../src/lib/pendingNavigation.ts';
const a={pathname:'/content-creator',search:'?project=a&design=1'},b={pathname:'/creator-studio',search:'?project=a'},other={pathname:'/content-creator',search:'?project=b&design=2'};
test('pending work blocks browser and router transitions, including project changes, until all owners are clean',()=>{
 const state=pendingNavigation(),endDesign=state.register(Symbol()),endScript=state.register(Symbol());
 assert.equal(state.blocks(a,b),true);assert.equal(state.blocks(a,other),true);
 assert.equal(state.blocks(a,{...a}),false);
 endDesign();assert.equal(state.blocks(a,b),true);endScript();assert.equal(state.blocks(a,b),false);
});
test('a cancelled manual transition keeps protection; one approved navigation avoids a second prompt',()=>{
 const state=pendingNavigation();state.register(Symbol());let clear;
 assert.equal(state.confirm(()=>false,fn=>{clear=fn}),false);assert.equal(state.blocks(a,b),true);
 assert.equal(state.confirm(()=>true,fn=>{clear=fn}),true);assert.equal(state.blocks(a,b),false);assert.equal(state.blocks(a,b),true);
 state.confirm(()=>true,fn=>{clear=fn});clear();assert.equal(state.blocks(a,b),true);
});
