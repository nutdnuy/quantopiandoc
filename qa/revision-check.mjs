import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {labs,lessonLabs} from '../src/lab-registry.mjs';
const root=path.resolve(import.meta.dirname,'..');
const groups=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum.json'))),ids=groups.flatMap(g=>g.topics);
const outputs=JSON.parse(fs.readFileSync(path.join(root,'data/code-outputs.json')));
let codeCount=0,labCount=0;
for(const id of ids){
 const d=JSON.parse(fs.readFileSync(path.join(root,'content',id+'.json')));
 assert.ok(!/สัญญาณ|ต้นฉบับ/.test(JSON.stringify(d)),id+': rejected editorial terminology');
 const html=fs.readFileSync(path.join(root,'dist',id+'.html'),'utf8');
 assert.ok(!/id="sources"|href="#sources"|Read original lecture|อ่านต้นฉบับ/.test(html),id+': source promotion remains');
 assert.ok(lessonLabs(id).length>0,id+': no Active Viz');
 for(const lab of lessonLabs(id)){assert.ok(html.includes(`data-active-lab="${lab.id}"`),lab.id+': missing rendered lab');labCount++}
 const blocks=[...d.body.matchAll(/```python\n([\s\S]*?)```/g)];
 assert.equal((html.match(/data-code-output=/g)||[]).length,blocks.length,id+': missing rendered output');
 for(let i=0;i<blocks.length;i++){
  const o=outputs.lessons[id]?.outputs[i];assert.ok(o,id+': missing output');
  assert.equal(o.codeHash,crypto.createHash('sha256').update(blocks[i][1]).digest('hex'),id+': stale code output');
  assert.ok(o.text||o.images.length,id+': empty output');
  for(const img of o.images)assert.ok(fs.existsSync(path.join(root,'dist',img.src)),id+': missing figure');codeCount++;
 }
}
assert.equal(new Set(labs.map(l=>l.lesson)).size,53);
assert.equal(labCount,54);assert.equal(codeCount,37);
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'content/introduction-to-research.json'))).title,'Investment Research with Python');
const result={status:'pass',lessons:53,activeViz:labCount,executedPythonOutputs:codeCount,checks:['Requested title and Signal terminology','No lesson source callouts','Every lesson has a configured Active Viz','Every Python block has exact-code-hash output','Output figures exported locally']};
fs.writeFileSync(path.join(root,'qa/revision-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
