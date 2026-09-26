import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const groups=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum.json'))),ids=groups.flatMap(g=>g.topics);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/build-manifest.json')));
const sourceIds=JSON.parse(fs.readFileSync(path.join(root,'data/extracted-sources.json'))).map(s=>s.id);
const addedIds=JSON.parse(fs.readFileSync(path.join(root,'data/additional-lessons.json'))).map(s=>s.id);
assert.equal(sourceIds.length,53);assert.deepEqual([...ids].sort(),[...sourceIds,...addedIds].sort());assert.equal(new Set(ids).size,ids.length);assert.equal(manifest.notebooks,92);assert.equal(manifest.mathErrors.length,0);
const jsonFiles=fs.readdirSync(path.join(root,'content')).filter(f=>f.endsWith('.json'));assert.equal(jsonFiles.length,ids.length);
const pages=fs.readdirSync(out).filter(f=>f.endsWith('.html'));assert.equal(pages.length,ids.length+manifest.notebooks+3);
const errors=[];
for(const id of ids){const d=JSON.parse(fs.readFileSync(path.join(root,'content',id+'.json')));assert.equal(d.id,id);assert.ok(d.body.length>=(d.format==='essay'?1500:3500),`${id}: chapter too short`);assert.equal(d.objectives.length,3);assert.equal(d.takeaways.length,d.format==='essay'?0:3);assert.ok(d.exercise?.length>30);assert.ok((d.body.match(/^## /gm)||[]).length>=3,`${id}: no structure`)}
for(const page of pages){
 const html=fs.readFileSync(path.join(out,page),'utf8');
 if(!html.includes('lang="th"'))errors.push(`${page}: language missing`);
 if(/MATHTOKEN\d+END|CODETOKEN\d+END/.test(html))errors.push(`${page}: unresolved renderer token`);
 for(const m of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  const attr=m[1],url=m[2].replaceAll('&amp;','&');if(/^(data:|https?:|mailto:)/i.test(url)){if(attr==='src'&&/^https?:/.test(url))errors.push(`${page}: remote resource ${url}`);continue}
  const [file,hash]=url.split('#');if(!file&&!hash)continue;
  let local;try{local=decodeURIComponent(file)}catch{errors.push(`${page}: malformed url ${url}`);continue}
  const dest=path.join(out,local||page);
  if(!fs.existsSync(dest)){errors.push(`${page}: missing ${url}`);continue}
  if(hash&&!page.startsWith('source-')&&dest.endsWith('.html')){const target=fs.readFileSync(dest,'utf8');if(!target.includes(`id="${hash}"`))errors.push(`${page}: missing anchor ${url}`)}
 }
}
let sourceFiles=0;const sourceRoot=path.join(root,'sources');
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else{const a=fs.readFileSync(p),b=fs.readFileSync(path.join(out,path.relative(root,p)));assert.ok(a.equals(b),'Source export changed '+p);sourceFiles++}}}walk(sourceRoot);assert.equal(sourceFiles,183);
assert.deepEqual(errors,[]);
const result={status:'pass',topics:ids.length,notebooks:manifest.notebooks,pages:pages.length,sourceFiles,checks:['curriculum coverage','chapter schema and minimum substance','math rendering','local file links and lesson anchors','no remote resource URLs','byte-identical source export']};
fs.writeFileSync(path.join(root,'qa/structural-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
