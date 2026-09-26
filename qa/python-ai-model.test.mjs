// Run with: node --test qa/python-ai-model.test.mjs
// Benchmarks are hand-calculated for a hypothetical investment with no cash flows or fees.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runLab} from '../src/lab-models.mjs';
import {labs,defaultParams,lessonLabs} from '../src/lab-registry.mjs';

const lab=lessonLabs('why-learn-python-with-ai').find(item=>item.kind==='compound-audit');
const run=(r1,r2)=>runLab('compound-audit',{r1,r2});
const metric=(output,label)=>output.metrics.find(([name])=>name===label)?.[1];
const near=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-10,`${actual} should equal ${expected}`);

function checkPaths(output,correct,wrong){
 assert.equal(output.charts.length,1);
 const [compound,additive]=output.charts[0].series;
 assert.match(compound.name,/วิธีถูก/);
 assert.match(additive.name,/วิธีผิด/);
 for(const [series,values] of [[compound,correct],[additive,wrong]]){
  assert.equal(series.points.length,3);
  series.points.forEach(([step,value],i)=>{assert.equal(step,i);near(value,values[i]);});
 }
 assert.deepEqual(output.table.rows.map(row=>row[0]),[0,1,2]);
 output.table.rows.forEach((row,i)=>{near(Number(row[2]),correct[i]);near(Number(row[3]),wrong[i]);});
}

test('new lab is appended without changing existing lab IDs and exposes both return controls',()=>{
 assert.ok(lab);
 assert.equal(labs.at(-1),lab);
 assert.equal(lab.id,'lab-55');
 assert.equal(labs.at(-2).id,'lab-54');
 assert.equal(labs.at(-2).lesson,'market-impact-model');
 assert.equal(lab.after,'โค้ดรันผ่าน');
 assert.deepEqual(defaultParams(lab),{r1:10,r2:-10});
 assert.deepEqual(lab.controls.map(({id,min,max,step,unit})=>({id,min,max,step,unit})),[
  {id:'r1',min:-50,max:50,step:1,unit:'%'},
  {id:'r2',min:-50,max:50,step:1,unit:'%'}
 ]);
});

test('+10% followed by −10% ends at 99, while the deliberately wrong method reports no loss',()=>{
 const output=runLab('compound-audit',defaultParams(lab));
 checkPaths(output,[100,110,99],[100,110,100]);
 assert.equal(metric(output,'มูลค่าปลายทาง'),'99.00 หน่วยเงิน');
 assert.equal(metric(output,'ผลตอบแทนสะสม'),'-1.00%');
 assert.equal(metric(output,'ค่าเฉลี่ยต่อช่วง'),'0.00%');
 assert.equal(metric(output,'ใช้ผลบวกเป็นผลสะสม (ผิด)'),'0.00%');
 assert.deepEqual(output.table.rows.map(row=>row[1]),['—','10.00','-10.00']);
 assert.match(output.note,/ไม่มีเงินฝากถอนหรือค่าธรรมเนียม/);
 assert.match(output.note,/จงใจแสดงวิธีผิด/);
});

test('zero returns leave both paths at the starting capital',()=>{
 const output=run(0,0);
 checkPaths(output,[100,100,100],[100,100,100]);
 assert.equal(metric(output,'ผลตอบแทนสะสม'),'0.00%');
 assert.equal(metric(output,'ค่าเฉลี่ยต่อช่วง'),'0.00%');
});

test('all slider endpoint combinations retain the correct wealth and cumulative return',()=>{
 const cases=[
  {r1:50,r2:-50,correct:[100,150,75],wrong:[100,150,100],cumulative:'-25.00%',average:'0.00%',sum:'0.00%'},
  {r1:-50,r2:50,correct:[100,50,75],wrong:[100,50,100],cumulative:'-25.00%',average:'0.00%',sum:'0.00%'},
  {r1:50,r2:50,correct:[100,150,225],wrong:[100,150,200],cumulative:'125.00%',average:'50.00%',sum:'100.00%'},
  {r1:-50,r2:-50,correct:[100,50,25],wrong:[100,50,0],cumulative:'-75.00%',average:'-50.00%',sum:'-100.00%'}
 ];
 for(const example of cases){
  const output=run(example.r1,example.r2);
  checkPaths(output,example.correct,example.wrong);
  assert.equal(metric(output,'ผลตอบแทนสะสม'),example.cumulative);
  assert.equal(metric(output,'ค่าเฉลี่ยต่อช่วง'),example.average);
  assert.equal(metric(output,'ใช้ผลบวกเป็นผลสะสม (ผิด)'),example.sum);
 }
});
