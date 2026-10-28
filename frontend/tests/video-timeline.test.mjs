import test from 'node:test';import assert from 'node:assert/strict';
import {adjustTimeline,splitTimeline,timelineClock} from '../src/toolkit/videoTimelineModel.ts';
const rows=[{start:0,end:1,text:'Hola'},{start:2,end:4,text:'Mi negocio'}];
test('timeline trims and moves remain in bounds without overlapping neighboring captions',()=>{
 assert.equal(adjustTimeline(rows,0,'end',10,5)[0].end,2);
 assert.equal(adjustTimeline(rows,1,'start',-10,5)[1].start,1);
 const moved=adjustTimeline(rows,1,'move',20,5);assert.deepEqual(moved[1],{start:3,end:5,text:'Mi negocio'});
 assert.equal(adjustTimeline(rows,0,'start',10,5)[0].start,.95);
 assert.deepEqual(rows,[{start:0,end:1,text:'Hola'},{start:2,end:4,text:'Mi negocio'}]);
 assert.equal(adjustTimeline(rows,0,'move',NaN,5),rows);
});
test('splitting preserves original source times and leaves caption synchronization unchanged',()=>{
 const split=splitTimeline([{start:2,end:6}],4);assert.deepEqual(split,[{start:2,end:4},{start:4,end:6}]);
 assert.equal(split.reduce((sum,row)=>sum+row.end-row.start,0),4);
 assert.equal(splitTimeline(rows,1.5),rows);assert.equal(splitTimeline(rows,.02),rows);
});
test('timeline labels show minutes and tenths and handle invalid media duration',()=>{assert.equal(timelineClock(65.3),'1:05.3');assert.equal(timelineClock(NaN),'0:00.0');});
