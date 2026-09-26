import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {lessonLabs,defaultParams} from '../src/lab-registry.mjs';
import {runLab} from '../src/lab-models.mjs';
import {marked} from '../vendor/marked.mjs';
import katex from '../public/assets/katex/katex.mjs';
const root=path.resolve(import.meta.dirname,'..'), out=path.join(root,'dist');
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum.json'),'utf8'));
const codeOutputs=JSON.parse(fs.readFileSync(path.join(root,'data/code-outputs.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(root,'data/extracted-sources.json'),'utf8'));
const ids=curriculum.flatMap(g=>g.topics);
const additional=JSON.parse(fs.readFileSync(path.join(root,'data/additional-lessons.json'),'utf8'));
const expectedIds=[...sources,...additional].map(s=>s.id);
if(new Set(expectedIds).size!==expectedIds.length||ids.length!==expectedIds.length||new Set(ids).size!==ids.length||expectedIds.some(id=>!ids.includes(id)))throw new Error('Curriculum coverage mismatch');
fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,'public'),out,{recursive:true});
fs.cpSync(path.join(root,'sources'),path.join(out,'sources'),{recursive:true});
fs.cpSync(path.join(root,'notices'),path.join(out,'notices'),{recursive:true});
fs.copyFileSync(path.join(root,'THIRD_PARTY_NOTICES.md'),path.join(out,'THIRD_PARTY_NOTICES.md'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>s.replace(/<[^>]+>/g,'').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const safeURL=s=>/^(?:www\.)?(?:quantopian\.com|github\.com)\//i.test(s)?'https://'+s:(/^(https?:|mailto:|#)/i.test(s)||!s.includes(':')?s:'#');
const renderer=new marked.Renderer();
renderer.html=({text})=>esc(text);
renderer.link=function({href,tokens}){return `<a href="${esc(safeURL(href))}"${/^https?:/.test(href)?' rel="noreferrer"':''}>${this.parser.parseInline(tokens)}</a>`};
renderer.image=({text})=>`<span class="source-image-note">[ภาพประกอบในต้นฉบับ: ${esc(text||'ดูใน Notebook')}]</span>`;
marked.use({renderer,gfm:true});
const mathErrors=[];
function md(input,strict=true){
 let chunks=[],code=[];
 let txt=input.replace(/^```[\s\S]*?^```/gm,m=>`CODETOKEN${code.push(m)-1}END`);
 txt=txt.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|(?<!\\)\$([^\n$]+?)\$/g,(all,a,b,c,d)=>{
  const display=a!==undefined||b!==undefined,tex=a??b??c??d;
  try{return `MATHTOKEN${chunks.push(katex.renderToString(tex.trim(),{displayMode:display,throwOnError:true,strict:'ignore',output:'htmlAndMathml'}))-1}END`}
  catch(e){if(strict)mathErrors.push({tex,error:e.message});return `MATHTOKEN${chunks.push(`<code class="math-fallback">${esc(all)}</code>`)-1}END`}
 });
 txt=txt.replace(/CODETOKEN(\d+)END/g,(_,n)=>code[+n]);
 let html=marked.parse(txt).replace(/MATHTOKEN(\d+)END/g,(_,n)=>chunks[+n]);
 html=html.replace(/<table>/g,'<div class="table-wrap" tabindex="0" role="region" aria-label="ตาราง"><table>').replace(/<\/table>/g,'</table></div>').replace(/<pre>/g,'<pre tabindex="0">');
 const seen=new Map();
 return html.replace(/<h([1-6])>(.*?)<\/h\1>/gs,(_,n,t)=>{const base=slug(t)||'section',v=(seen.get(base)||0)+1;seen.set(base,v);return `<h${n} id="${base}${v>1?'-'+v:''}">${t}</h${n}>`});
}
const lessons=ids.map(id=>{
 const file=path.join(root,'content',id+'.json');
 if(!fs.existsSync(file))throw new Error('Missing lesson '+id);
 const d=JSON.parse(fs.readFileSync(file));
 if(d.id!==id||!d.body||!d.title)throw new Error('Invalid lesson '+id);
 return {...d,group:curriculum.find(g=>g.topics.includes(id)),source:sources.find(s=>s.id===id),number:ids.indexOf(id)+1};
});
const lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));
const brand=`<a class="book-brand" href="index.html" aria-label="Research Lab — Welcome"><img class="brand-light" src="assets/quantara/quantcorner-mark-light.svg" alt="" width="40" height="40"><img class="brand-dark" src="assets/quantara/quantcorner-mark-dark.svg" alt="" width="40" height="40"><span>Research Lab<small>QuantCorner</small></span></a>`;
function shell({title,description,body,active='',lesson=false,lessonId='',toc='',pageLabel=''}){
 const selected=lessonById[lessonId];
 const contents=curriculum.map(g=>`<details class="book-part"${selected?.group.id===g.id?' open':''}><summary><span class="part-no">${g.number}</span><span>${esc(g.label)}</span><span class="disclosure-marker" aria-hidden="true">⌄</span></summary><ol class="book-chapters">${g.topics.map(id=>{const l=lessonById[id];return `<li><a href="${id}.html"${lessonId===id?' aria-current="page"':''}><span class="chapter-number">${l.number}</span><strong>${esc(l.title)}</strong></a></li>`}).join('')}</ol></details>`).join('');
 const pageToc=toc||(!lessonId&&active==='curriculum'?'<li><a href="#course-overview">เล่มนี้เรียนอะไร</a></li><li><a href="#reading-guide">เริ่มอ่านตรงไหน</a></li><li><a href="#curriculum">บทเรียนทั้ง 7 หมวด</a></li>':'');
 return `<!doctype html><html lang="th" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark"><title>${esc(title)} · QuantCorner Research Lab</title><link rel="icon" href="assets/quantara/quantcorner-mark-light.svg"><link rel="stylesheet" href="assets/katex/katex.min.css"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="quantara.css"><link rel="stylesheet" href="labs.css"><script src="theme.js"></script><script src="search-data.js" defer></script><script src="app.js" defer></script><script src="interactions.js" defer></script></head><body class="book-page${lesson?' lesson-page':''}"><a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><aside id="book-sidebar" class="book-sidebar" aria-label="สารบัญหนังสือ">${brand}<button class="text-button" id="contents-close" aria-label="ปิดสารบัญ">×</button><nav class="book-contents" aria-label="บทเรียนทั้งหมด"><p class="sidebar-label">Contents</p><a class="book-home" href="index.html"${active==='curriculum'?' aria-current="page"':''}>Welcome</a>${contents}</nav>${pageToc?`<nav class="book-toc" aria-label="ในหน้านี้"><p class="sidebar-label">On this page</p><ul>${pageToc}</ul></nav>`:''}<div class="sidebar-footer"><a href="about.html"${active==='about'?' aria-current="page"':''}>About this book</a><span>Quantara / A QuantCorner world</span></div></aside><button id="sidebar-backdrop" aria-label="ปิดสารบัญ" tabindex="-1" hidden></button><div id="book-frame" class="book-frame"><header class="book-toolbar"><button class="button outlined" id="contents-toggle" aria-controls="book-sidebar" aria-expanded="true">Hide contents</button><span class="toolbar-page">${esc(pageLabel||(selected?`Chapter ${selected.number}`:active==='library'?'Source library':active==='about'?'About':'Welcome'))}</span><div class="toolbar-actions"><button class="text-button" id="search-open" aria-haspopup="dialog">Search <kbd>/</kbd></button><button class="text-button" id="theme-toggle" aria-label="Switch to dark theme">Dark</button></div></header>${body}<footer class="book-footer"><span>Quantara <span aria-hidden="true">/</span> A QuantCorner world</span><a href="about.html">About & credits ↗</a></footer></div><dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">Search the curriculum</h2><button class="text-button" id="search-close">Close</button></div><label for="search-input">ค้นหาหัวข้อภาษาไทยหรือภาษาอังกฤษ</label><input id="search-input" type="search" placeholder="เช่น ความเสี่ยง, regression, Python" autocomplete="off"><p id="search-count" role="status" aria-live="polite"></p><div id="search-results"></div></dialog></body></html>`;
}
function write(file,html){fs.writeFileSync(path.join(out,file),html)}
const allCount=lessons.length;
const rows=curriculum.map(g=>`<section class="curriculum-group" id="${g.id}"><div class="group-number">${g.number}</div><div class="group-intro"><p class="eyebrow">${g.label}</p><h3>${g.title}</h3><p>${g.description}</p><span class="small">${g.topics.length} lessons</span></div><ol class="lesson-list">${g.topics.map(id=>{const l=lessonById[id];return `<li><a href="${id}.html"><span class="lesson-no">${String(l.number).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><small>${esc(l.subtitle)}</small></span><span class="read-state" data-status="${id}" aria-label="ยังไม่ทำเครื่องหมายว่าอ่านแล้ว">↗</span></a></li>`}).join('')}</ol></section>`).join('');
write('index.html',shell({title:'Investment Research with Python',description:'บทเรียนการวิจัยการลงทุนด้วย Python จาก Quantopian Lecture Series ครอบคลุมสถิติ แบบจำลอง ปัจจัยลงทุน กลยุทธ์ และความเสี่ยง',active:'curriculum',body:`<main id="main" class="welcome-page"><section class="quantara-hero" aria-labelledby="quantara-title"><div class="quantara-hero-copy"><p class="quantara-kicker">QUANTARA / RESEARCH LAB</p><h1 id="quantara-title">Investment Research<br>with Python</h1><p class="quantara-hero-thai">วิจัยการลงทุนด้วย Python ตั้งแต่เตรียมข้อมูล ทดสอบสมมติฐาน และวิเคราะห์Signal ไปจนถึงสร้างพอร์ตและประเมินความเสี่ยง</p><div class="quantara-hero-actions"><a href="why-learn-python-with-ai.html" id="continue-link">Start reading ↗</a><a href="#curriculum">Browse lessons ↓</a></div><p class="progress-note" id="progress-note">${allCount} บทเรียนภาษาไทย · 7 หมวด</p></div><img class="quantara-hero-art" src="assets/quantara/learning-atlas.png" alt="แผนที่โลกแฟนตาซี Quantara" width="1536" height="1024" fetchpriority="high"><span class="quantara-scene-label">QUANTARA</span></section><div class="course-source"><span>LEARN BY EXPERIMENTING</span><p>${allCount} บทเรียนภาษาไทย พร้อมตัวอย่าง Python และ Active Viz ให้ปรับค่าทดลอง</p></div>
<section id="course-overview" class="research-overview" aria-labelledby="overview-title"><figure class="research-portrait"><img src="assets/quantara/researcher.webp" alt="นักสำรวจถือหนังสือและหอก สวมผ้าคลุมสีเขียว ภาพประกอบในโลก Quantara" width="768" height="1152" loading="lazy"><figcaption>Quant Researcher / Quantara</figcaption></figure><div class="research-overview-copy"><h2 id="overview-title">เล่มนี้เรียนอะไร</h2><p>เริ่มจากใช้ Notebook, NumPy และ pandas จัดข้อมูลราคาและผลตอบแทน จากนั้นใช้สถิติและแบบจำลองตรวจสอบแนวคิดลงทุน เช่น การจัดอันดับหุ้นด้วยปัจจัย Value และการซื้อขายเป็นคู่</p><p>ช่วงหลังเป็นการวิเคราะห์พอร์ต การ Hedge และการวัดความเสี่ยง รวมถึงตรวจปัญหา overfitting และต้นทุนซื้อขายที่อาจทำให้ผลทดสอบต่างจากการใช้งานจริง</p><section id="reading-guide" aria-labelledby="reading-guide-title"><h2 id="reading-guide-title">เริ่มอ่านตรงไหน</h2><p>เริ่มจาก <a href="why-learn-python-with-ai.html">ทำไมเราต้องเรียน Python เมื่อ AI ก็ทำได้</a> เพื่อฝึกอ่านโค้ดและตรวจ Logic จากนั้น <a href="introduction-to-research.html">ลองใช้ Notebook</a> แล้วเรียนต่อเรื่อง Python การจัดตาราง และการสร้างกราฟ ถ้าใช้เครื่องมือเหล่านี้ได้แล้ว เริ่มที่ <a href="means.html">สถิติพื้นฐาน</a> หรือเลือกหัวข้อจากสารบัญได้เลย</p><p>แต่ละบทมี Active Viz ให้ปรับค่าทดลอง ตัวอย่างโค้ดแสดง output พร้อมข้อมูลที่ใช้ ท้ายบทมีประเด็นทบทวนและคำถามให้ลองทำต่อ</p><p class="source-note">ข้อมูลใน Active Viz และ output ของตัวอย่าง Python เป็นข้อมูลสมมติสำหรับอธิบายสูตรและวิธีคำนวณ</p></section></div></section>
<div id="path-explorer" class="path-explorer"></div><section class="curriculum" id="curriculum"><div class="section-heading"><h2>บทเรียนทั้ง 7 หมวด</h2><p>${allCount} lessons</p></div>${rows}</section></main>`}));

function labHTML(lab){
 const initial=runLab(lab.kind,defaultParams(lab));
 return `<div class="active-lab-mount" data-active-lab="${lab.id}" id="${lab.id}"><section class="active-lab"><p class="lab-eyebrow">ACTIVE VIZ</p><h3>${esc(lab.title)}</h3><p>${esc(lab.prompt)}</p><dl class="lab-metrics">${initial.metrics.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p class="lab-assumptions">${esc(initial.note)}</p><noscript>เปิด JavaScript เพื่อปรับค่าทดลอง ตัวเลขด้านบนเป็นค่าตั้งต้นของตัวอย่าง</noscript></section></div>`;
}
function lessonBody(l){
 let body=md(l.body),block=0;const saved=codeOutputs.lessons[l.id];
 const python=[...l.body.matchAll(/```python\n([\s\S]*?)```/g)].map(x=>x[1]);
 body=body.replace(/<pre tabindex="0"><code class="language-python">[\s\S]*?<\/code><\/pre>/g,html=>{
  const index=block++,output=saved?.outputs[index];
  if(!output||crypto.createHash('sha256').update(python[index]).digest('hex')!==output.codeHash)throw Error('Stale or missing Python output: '+l.id+' #'+index);
  const setup=index===0&&saved.setup?`<details class="output-setup"><summary>ข้อมูลสมมติที่ใช้ในตัวอย่างนี้</summary><p>รันส่วนนี้ก่อนตัวอย่างด้านล่าง เพื่อกำหนดตัวแปรและข้อมูลให้ครบ</p><pre tabindex="0"><code class="language-python">${esc(saved.setup)}</code></pre></details>`:'';
  return setup+html+`<div class="code-output" data-code-output="${index+1}"><p><strong>Output</strong> · ${esc(output.caption)}</p>${output.probe?`<details><summary>คำสั่งแสดงค่าที่คำนวณได้</summary><pre tabindex="0"><code>${esc(output.probe)}</code></pre></details>`:''}${output.text?`<pre tabindex="0"><samp>${esc(output.text)}</samp></pre>`:''}${output.images.map(img=>`<figure${img.wide?' class="wide-code-figure" tabindex="0" role="region" aria-label="Python chart output"':''}><img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy"><figcaption>${img.wide?'ผลกราฟจากโค้ดด้านบน · เลื่อนแนวนอนเพื่อดูทั้ง 3 กราฟ':'ผลกราฟจากการรันโค้ดด้านบน'}</figcaption></figure>`).join('')}</div>`;
 });
 if(block!==python.length)throw Error('Python block rendering mismatch: '+l.id);
 const configs=lessonLabs(l.id),heads=[...body.matchAll(/<h2 id="[^"]+">([\s\S]*?)<\/h2>/g)];
 const inserts=[];
 for(const lab of configs){
  let index=heads.findIndex(h=>h[1].replace(/<[^>]+>/g,'').toLowerCase().includes(lab.after.toLowerCase()));
  if(index<0)index=heads.findIndex((h,i)=>body.slice(h.index,heads[i+1]?.index??body.length).toLowerCase().includes(lab.after.toLowerCase()));
  if(index<0)index=0;
  inserts.push({at:heads[index+1]?.index??body.length,html:labHTML(lab)});
 }
 for(const ins of inserts.sort((a,b)=>b.at-a.at))body=body.slice(0,ins.at)+ins.html+body.slice(ins.at);
 return body;
}
for(const l of lessons){
 const idx=ids.indexOf(l.id),prev=lessonById[ids[idx-1]],next=lessonById[ids[idx+1]];
 let body=lessonBody(l);
 const toc=[...body.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/gs)].map(m=>`<li><a href="#${m[1]}">${m[2]}</a></li>`).join('');

 const text=`<main id="main" class="reading-layout"><article class="lesson-content" data-lesson="${l.id}"><header class="lesson-header"><div class="lesson-opening"><div class="lesson-heading-copy"><p class="eyebrow">PART ${l.group.number} / LESSON ${String(l.number).padStart(2,'0')}</p><p class="english-title">${esc(l.subtitle)}</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.intro)}</p></div><figure class="lesson-scene"><img src="assets/quantara/deltaris-workshop-v2.png" alt="โรงงานและหุ่นกลทองเหลืองแห่ง Deltaris" width="1536" height="1024"><figcaption>DELTARIS / RESEARCH NOTEBOOK</figcaption></figure></div><div class="learning-objectives"><p class="eyebrow">WHAT YOU WILL LEARN</p><ul>${l.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div></header><div class="prose">${body}<section class="takeaways" id="takeaways"><h2>ทบทวน</h2><ul>${l.takeaways.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></section><section id="practice"><h2>แบบฝึกหัด</h2>${md(l.exercise)}</section></div><div class="completion-row"><button class="button outlined" id="mark-complete" data-id="${l.id}" aria-pressed="false">Mark as read</button><span class="small">บันทึกการอ่านในเบราว์เซอร์นี้</span><span id="read-count"></span></div><nav class="lesson-pagination" aria-label="บทก่อนหน้าและถัดไป">${prev?`<a href="${prev.id}.html"><small>PREVIOUS LESSON</small><strong>${esc(prev.title)}</strong></a>`:'<span></span>'}${next?`<a href="${next.id}.html"><small>NEXT LESSON →</small><strong>${esc(next.title)}</strong></a>`:'<a href="index.html#curriculum"><small>BACK TO CURRICULUM</small><strong>กลับไปทบทวนเส้นทางการเรียน</strong></a>'}</nav></article></main>`;
 write(l.id+'.html',shell({title:l.title,description:l.intro,body:text,lesson:true,lessonId:l.id,toc:toc+lessonLabs(l.id).map(lab=>`<li><a href="#${lab.id}">Active Viz · ${esc(lab.title)}</a></li>`).join('')+'<li><a href="#takeaways">ทบทวน</a></li><li><a href="#practice">แบบฝึกหัด</a></li>'}));
 for(const n of l.source?.notebooks||[]){
  const notebook=JSON.parse(fs.readFileSync(path.join(root,'sources/quantopian',n.path),'utf8'));
  const cells=notebook.cells.map((c,i)=>{
   const source=Array.isArray(c.source)?c.source.join(''):c.source||'';
   if(c.cell_type==='markdown')return `<div class="source-cell">${md(source,false).replace(/<(\/?)(h[1-6])/g,'<$1$2')}</div>`;
   if(c.cell_type==='code'){
    const outputs=(c.outputs||[]).map(o=>{
     const d=o.data||{};
     if(d['image/png'])return `<img class="notebook-output" alt="ผลภาพที่บันทึกไว้ใน Notebook ต้นฉบับ เซลล์ ${i+1}" loading="lazy" src="data:image/png;base64,${Array.isArray(d['image/png'])?d['image/png'].join(''):d['image/png']}">`;
     const txt=d['text/plain']||o.text||(o.ename?`${o.ename}: ${o.evalue}`:'');
     return txt?`<pre class="notebook-result" tabindex="0">${esc(Array.isArray(txt)?txt.join(''):txt)}</pre>`:'';
    }).join('');
    return `<div class="source-cell"><p class="cell-label">CODE CELL ${i+1} · ORIGINAL</p><pre tabindex="0"><code>${esc(source)}</code></pre>${outputs}</div>`;
   }
   return `<pre>${esc(source)}</pre>`;
  }).join('');
  const role={lecture:'Original lecture',questions:'Practice questions',answers:'Answer notebook'}[n.role];
  const sourceBody=`<main id="main" class="source-reading"><a class="back-link" href="${l.id}.html">← กลับไปบทภาษาไทย</a><header class="lesson-header"><p class="eyebrow">SOURCE NOTEBOOK / ${esc(role)}</p><h1>${esc(l.subtitle)}</h1><p class="source-note">แสดงคำอธิบายและโค้ดจากไฟล์ต้นฉบับ พร้อมภาพและข้อความผลลัพธ์ที่บันทึกไว้ การจัดรูปแบบ HTML และสื่อภายนอกบางชนิดอยู่ในไฟล์ดาวน์โหลด ไม่ได้โหลดจากอินเทอร์เน็ต</p><a class="button outlined" download href="sources/quantopian/${encodeURI(n.path)}">Download original .ipynb</a>${fs.existsSync(path.join(root,'sources/quantopian',n.path.replace('notebook.ipynb','preview.html')))?`<a class="button plain" download href="sources/quantopian/${encodeURI(n.path.replace('notebook.ipynb','preview.html'))}">Download original HTML</a>`:''}</header><article class="prose original-prose" lang="en">${cells}</article></main>`;
  write(`source-${l.id}-${n.role}.html`,shell({title:`${l.subtitle} · ${role}`,description:role,body:sourceBody,lessonId:l.id,pageLabel:role}));
 }
}
write('library.html',shell({title:'Source library',description:'ต้นฉบับ Quantopian Lecture Series ทุกหัวข้อและแบบฝึกหัด',active:'library',body:`<main id="main" class="library-main"><header class="library-header"><p class="eyebrow">THE SOURCE COLLECTION</p><h1>Source library</h1><p class="lead">กลับไปอ่านแนวคิด โค้ด และแบบฝึกหัดในต้นฉบับ<br>ครบ 53 หัวข้อ พร้อม Notebook เดิม 92 ไฟล์</p><label for="library-filter">Filter by topic / ค้นหาหัวข้อ</label><input id="library-filter" type="search" placeholder="Python, factor, ความเสี่ยง…"><p role="status" id="library-count">53 topics</p></header><div class="library-list">${lessons.filter(l=>l.source).map(l=>`<section class="library-row" data-search="${esc(l.title+' '+l.subtitle)}"><div><span class="eyebrow">${l.group.label}</span><h2><a href="${l.id}.html">${esc(l.title)}</a></h2><p>${esc(l.subtitle)}</p></div><div class="library-links">${l.source.notebooks.map(n=>`<a class="button outlined" href="source-${l.id}-${n.role}.html">${{lecture:'Lecture',questions:'Questions',answers:'Answers'}[n.role]}</a>`).join('')}</div></section>`).join('')}</div></main>`}));
write('about.html',shell({title:'About & source notes',description:'ที่มาและขอบเขตของ QuantCorner Research Lab',active:'about',body:`<main id="main" class="source-reading"><p class="eyebrow">ABOUT THIS PROJECT</p><h1>About this book</h1><div class="prose"><p>QuantCorner Research Lab เรียบเรียงเนื้อหา Quantopian Lecture Series เป็นภาษาไทย จัดลำดับใหม่ตามกระบวนการวิจัย ตั้งแต่ตั้งคำถาม จัดข้อมูล ใช้สถิติ พัฒนาSignal ไปจนถึงตรวจสอบความเสี่ยงและข้อจำกัดในการนำไปใช้</p><h2>เนื้อหาที่นำมาใช้</h2><p>ใช้เฉพาะสำเนา quantopiandoc ที่มีอยู่ในเครื่องจากการสนทนาก่อนหน้า ณ commit <code>b1faf19ba390d6aa74429e759c3acc1ab8779932</code> ไม่มีการค้นหาแหล่งความรู้เพิ่มเติมในการสร้างฉบับนี้ ต้นฉบับมี 53 โฟลเดอร์หัวข้อ บทเรียนหลัก 52 Notebook แบบฝึกหัด 20 Notebook และเฉลย 20 Notebook โดย Comparing ETFs มีแบบฝึกหัดกับเฉลยเป็นแหล่งหลัก</p><p>บทนำ “ทำไมเราต้องเรียน Python เมื่อ AI ก็ทำได้” เพิ่มจากข้อความประกอบที่เจ้าของโครงการส่งมา โดยใช้ตัวอย่างผลตอบแทนสมมติอธิบายการตรวจ Logic และการทำงานร่วมกับ AI Agent</p><h2>วิธีอ่าน</h2><p>อ่านคำอธิบายแล้วลองปรับค่าใน Active Viz หรือตรวจ output ใต้ตัวอย่าง Python ผู้ที่มีพื้นฐานแล้วเลือกข้ามบทได้ ความคืบหน้าบันทึกไว้เฉพาะเบราว์เซอร์ที่ใช้อ่าน</p><h2>สิ่งที่ปรับและสิ่งที่เก็บไว้</h2><p>บทภาษาไทยเป็นการเรียบเรียงใหม่ ไม่ใช่คำแปลทุกบรรทัด เราปรับคำอธิบายที่อาจทำให้สับสน เช่น ความสัมพันธ์กับเหตุและผล ความผันผวนกับความแปรปรวน และSignalลงทุนกับความเสี่ยงจากปัจจัย โดยยังเก็บไฟล์ต้นฉบับทุกไฟล์ไว้เทียบอ่าน รวมถึงชื่อผู้เขียนและข้อความระบุที่มาเดิม</p><h2>สถานะของโค้ดและข้อมูล</h2><p>Notebook เดิมบางส่วนใช้ Python 2 และบริการ Quantopian โครงการนี้ยังไม่ได้ย้ายทั้งชุดให้รันบน Python รุ่นใหม่ หรือดึงข้อมูลตลาดทดแทน ผลลัพธ์ในหน้าต้นฉบับคือผลที่บันทึกมากับไฟล์ ตัวอย่างสมมติในบทเรียนใช้เพื่ออธิบายแนวคิด ไม่ใช่ข้อมูลตลาดที่เก็บใหม่</p><h2>Design & accessibility</h2><p>ออกแบบในโลก Quantara ตามหน้า Robo Trade Notes ของ QuantCorner หน้าแรกใช้แผนที่และภาพนักสำรวจ Quant Researcher จากชุดภาพเดิม จัดหน้าเป็นหนังสือพื้นขาว มีสารบัญด้านซ้าย สีม่วงสำหรับลิงก์ และธีมมืดให้เลือก ฟอนต์ Roboto, Noto Sans Thai และ Roboto Mono โหลดจากไฟล์ในโปรเจกต์ รองรับคีย์บอร์ดและหน้าจอมือถือ ไม่มี analytics หรือการโหลดฟอนต์จากบริการภายนอก</p><h2>Attribution</h2><p>เครดิตผู้เขียนแต่ละบทอยู่ในหน้าต้นฉบับและ Notebook ที่เก็บไว้ ชื่อ Quantopian ใช้เพื่อบอกแหล่งที่มาของเนื้อหา เว็บไซต์นี้ไม่ได้ระบุว่าเป็นผลิตภัณฑ์ทางการของ Quantopian สำเนาที่ได้รับไม่มี LICENSE ระดับ repository จึงเก็บประกาศเดิมในไฟล์และบันทึกสถานะสิทธิ์ไว้ในเอกสารโครงการ</p><p><a href="library.html">เปิด Source library →</a> · <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a></p></div></main>`}));
const search=lessons.map(l=>({id:l.id,title:l.title,subtitle:l.subtitle,group:l.group.label,text:(l.intro+' '+l.body).replace(/[#*$`]/g,'').slice(0,18000)}));
write('search-data.js','window.RESEARCH_SEARCH='+JSON.stringify(search)+';');
const manifest={sourceCommit:'b1faf19ba390d6aa74429e759c3acc1ab8779932',topics:lessons.length,sourceTopics:sources.length,notebooks:92,lessons:lessons.map(l=>({id:l.id,title:l.title,group:l.group.id,characters:l.body.length,sourcePaths:(l.source?.notebooks||[]).map(n=>n.path)})),mathErrors};
fs.writeFileSync(path.join(root,'data/build-manifest.json'),JSON.stringify(manifest,null,2));
if(mathErrors.length)throw new Error(`${mathErrors.length} Thai lesson math rendering errors; see build-manifest.json`);
console.log(`Built ${lessons.length} Thai lessons, ${sources.reduce((n,s)=>n+s.notebooks.length,0)} original notebook views, and 3 index pages. All ${sources.length} source topics and ${additional.length} additional lessons covered.`);
