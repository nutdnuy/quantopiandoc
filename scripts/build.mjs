import fs from 'node:fs';
import path from 'node:path';
import {marked} from '../vendor/marked.mjs';
import katex from '../public/assets/katex/katex.mjs';
const root=path.resolve(import.meta.dirname,'..'), out=path.join(root,'dist');
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(root,'data/extracted-sources.json'),'utf8'));
const ids=curriculum.flatMap(g=>g.topics);
if(ids.length!==53||new Set(ids).size!==53||sources.some(s=>!ids.includes(s.id)))throw new Error('Curriculum coverage mismatch');
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
const brand=`<a class="identity" href="index.html"><span class="identity-name">QuantCorner</span><span class="identity-separator">/</span><span>Research Lab</span></a>`;
function shell({title,description,body,active='',lesson=false}){
return `<!doctype html><html lang="th" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="dark light"><title>${esc(title)} · QuantCorner Research Lab</title><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/katex/katex.min.css"><link rel="stylesheet" href="style.css"><script src="theme.js"></script><script src="search-data.js" defer></script><script src="app.js" defer></script><script src="interactions.js" defer></script></head><body${lesson?' class="lesson-page"':''}><a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="site-header">${brand}<nav class="top-nav" aria-label="เมนูหลัก"><a href="index.html#curriculum" ${active==='curriculum'?'aria-current="page"':''}>Curriculum</a><a href="library.html" ${active==='library'?'aria-current="page"':''}>Source library</a><button class="text-button" id="search-open" aria-haspopup="dialog"><svg class="system-icon" aria-hidden="true" focusable="false"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
  <path d="M21 21l-6 -6" />
</svg>
<span>Search</span> <kbd>/</kbd></button><button class="text-button" id="theme-toggle" aria-label="Switch to light theme">Light</button></nav></header>${body}<footer class="site-footer"><div><strong>QuantCorner Research Lab</strong><p>From investment ideas to evidence.</p></div><p>เรียบเรียงจาก Quantopian Lecture Series<br><a href="about.html">About & source notes</a> · <span class="design-credit">Design system <img class="brand-dark" src="assets/brand/quantsera-horizontal-transparent-offwhite.svg" alt="Quantsera" width="110"><img class="brand-light" src="assets/brand/quantsera-horizontal-transparent-black.svg" alt="Quantsera" width="110"></span></p></footer><dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">Search the curriculum</h2><button class="text-button" id="search-close">Close</button></div><label for="search-input">ค้นหาหัวข้อภาษาไทยหรือภาษาอังกฤษ</label><input id="search-input" type="search" placeholder="เช่น ความเสี่ยง, regression, Python" autocomplete="off"><p id="search-count" role="status" aria-live="polite"></p><div id="search-results"></div></dialog></body></html>`;
}
function write(file,html){fs.writeFileSync(path.join(out,file),html)}
const allCount=lessons.length;
const rows=curriculum.map(g=>`<section class="curriculum-group" id="${g.id}"><div class="group-number">${g.number}</div><div class="group-intro"><p class="eyebrow">${g.label}</p><h3>${g.title}</h3><p>${g.description}</p><span class="small">${g.topics.length} lessons</span></div><ol class="lesson-list">${g.topics.map(id=>{const l=lessonById[id];return `<li><a href="${id}.html"><span class="lesson-no">${String(l.number).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><small>${esc(l.subtitle)}</small></span><span class="read-state" data-status="${id}" aria-label="ยังไม่ทำเครื่องหมายว่าอ่านแล้ว">↗</span></a></li>`}).join('')}</ol></section>`).join('');
write('index.html',shell({title:'Quantitative Investment Research with Python',description:'เรียนรู้การวิจัยกลยุทธ์ลงทุนด้วย Python ตั้งแต่คำถามแรกจนถึงการประเมินความเสี่ยง',active:'curriculum',body:`<main id="main"><section class="hero"><div class="hero-copy"><p class="eyebrow">A QUANTITATIVE RESEARCH CURRICULUM</p><h1>จากไอเดียลงทุน<br>สู่<span class="emphasis">หลักฐาน</span>ที่ตรวจสอบได้</h1><p class="hero-description">เรียนรู้การวิจัยกลยุทธ์ลงทุนเชิงปริมาณด้วย Python<br>ค่อย ๆ เชื่อมข้อมูล สถิติ สัญญาณ และความเสี่ยง<br>ให้กลายเป็นกระบวนการคิดที่นำไปใช้ต่อได้</p><div class="hero-actions"><a class="button primary" href="introduction-to-research.html" id="continue-link">Start learning <span aria-hidden="true">↗</span></a><a class="button plain" href="#curriculum">Explore curriculum</a></div><p class="progress-note" id="progress-note">เริ่มจากคำถามที่ดี ก่อนมองหาผลตอบแทนที่ดี</p></div><aside class="hero-aside"><div class="issue-tag">THE RESEARCH NOTEBOOK / 01</div><p class="editorial-question">เรารู้อะไร<br>จากข้อมูล<br>ชุดนี้<span class="teal">?</span></p><div class="research-note"><p>คำถามที่อยู่เบื้องหลังทุกบท</p><span>ผลที่เห็นมาจากสัญญาณ<br>หรือเป็นเพียงความบังเอิญ</span></div><div class="hero-stat"><strong>53</strong><span>topics<br>one learning path</span></div></aside></section><section class="intro-strip"><p class="eyebrow">LEARN TO ASK. LEARN TO TEST.</p><p>เริ่มจากการจัดข้อมูลและสถิติพื้นฐาน แล้วค่อยพัฒนาไปสู่การทดสอบปัจจัย กลยุทธ์ และพอร์ตลงทุน แต่ละบทมีคำอธิบายภาษาไทย พร้อมต้นฉบับและ Notebook ให้กลับไปสำรวจรายละเอียดได้</p></section><div id="path-explorer" class="path-explorer"></div><section class="curriculum" id="curriculum"><div class="section-heading"><div><p class="eyebrow">THE LEARNING PATH</p><h2>เจ็ดช่วงของการทำวิจัย</h2></div><p>53 topics · 92 original notebooks</p></div>${rows}</section></main>`}));
for(const l of lessons){
 const idx=ids.indexOf(l.id),prev=lessonById[ids[idx-1]],next=lessonById[ids[idx+1]];
 let body=md(l.body);
 const toc=[...body.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/gs)].map(m=>`<li><a href="#${m[1]}">${m[2]}</a></li>`).join('');
 const resources=l.source.notebooks.map(n=>`<a class="resource-link" href="source-${l.id}-${n.role}.html"><span>${n.role==='lecture'?'Read original lecture':n.role==='questions'?'Practice questions':'Answer notebook'}</span><span aria-hidden="true">↗</span></a>`).join('');
 const text=`<main id="main" class="reading-layout"><aside class="reading-nav"><a class="back-link" href="index.html#${l.group.id}">← ${esc(l.group.label)}</a><details class="chapter-menu"><summary>Lessons in this part</summary><ol>${l.group.topics.map(id=>`<li><a href="${id}.html"${id===l.id?' aria-current="page"':''}>${esc(lessonById[id].title)}</a></li>`).join('')}</ol></details><div class="on-this-page"><p class="eyebrow">ON THIS PAGE</p><ol>${toc}<li><a href="#takeaways">ประเด็นที่อยากให้จำ</a></li><li><a href="#practice">ลองคิดต่อ</a></li><li><a href="#sources">อ่านต้นฉบับ</a></li></ol></div></aside><article class="lesson-content" data-lesson="${l.id}"><header class="lesson-header"><p class="eyebrow">PART ${l.group.number} / LESSON ${String(l.number).padStart(2,'0')}</p><p class="english-title">${esc(l.subtitle)}</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.intro)}</p><div class="learning-objectives"><p class="eyebrow">WHAT YOU WILL LEARN</p><ul>${l.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div></header><div class="prose">${body}<section class="takeaways" id="takeaways"><h2>ประเด็นที่อยากให้จำ</h2><ul>${l.takeaways.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></section><section id="practice"><h2>ลองคิดต่อ</h2>${md(l.exercise)}</section><section id="sources"><h2>อ่านต้นฉบับและลงมือสำรวจ</h2><p>เนื้อหาบทนี้เรียบเรียงจาก <span lang="en">${esc(l.source.topic.replaceAll('_',' '))}</span> ใน Quantopian Lecture Series ต้นฉบับเก็บทั้งคำอธิบาย โค้ด และผลลัพธ์เดิมไว้ให้เทียบอ่านได้</p><div class="resources">${resources}</div><p class="source-note">Notebook ต้นฉบับบางส่วนใช้ Python 2 และ API ของ Quantopian ผลลัพธ์ที่แสดงเป็นผลที่บันทึกมากับไฟล์ ไม่ใช่ผลจากการรันใหม่</p></section></div><div class="completion-row"><button class="button outlined" id="mark-complete" data-id="${l.id}" aria-pressed="false">Mark as read</button><span class="small">บันทึกการอ่านในเบราว์เซอร์นี้</span><span id="read-count"></span></div><nav class="lesson-pagination" aria-label="บทก่อนหน้าและถัดไป">${prev?`<a href="${prev.id}.html"><small>PREVIOUS LESSON</small><strong>${esc(prev.title)}</strong></a>`:'<span></span>'}${next?`<a href="${next.id}.html"><small>NEXT LESSON →</small><strong>${esc(next.title)}</strong></a>`:'<a href="index.html#curriculum"><small>BACK TO CURRICULUM</small><strong>กลับไปทบทวนเส้นทางการเรียน</strong></a>'}</nav></article></main>`;
 write(l.id+'.html',shell({title:l.title,description:l.intro,body:text,lesson:true}));
 for(const n of l.source.notebooks){
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
  write(`source-${l.id}-${n.role}.html`,shell({title:`${l.subtitle} · ${role}`,description:role,body:sourceBody}));
 }
}
write('library.html',shell({title:'Source library',description:'ต้นฉบับ Quantopian Lecture Series ทุกหัวข้อและแบบฝึกหัด',active:'library',body:`<main id="main" class="library-main"><header class="library-header"><p class="eyebrow">THE SOURCE COLLECTION</p><h1>Source library</h1><p class="lead">กลับไปอ่านแนวคิด โค้ด และแบบฝึกหัดในต้นฉบับ<br>ครบ 53 หัวข้อ พร้อม Notebook เดิม 92 ไฟล์</p><label for="library-filter">Filter by topic / ค้นหาหัวข้อ</label><input id="library-filter" type="search" placeholder="Python, factor, ความเสี่ยง…"><p role="status" id="library-count">53 topics</p></header><div class="library-list">${lessons.map(l=>`<section class="library-row" data-search="${esc(l.title+' '+l.subtitle)}"><div><span class="eyebrow">${l.group.label}</span><h2><a href="${l.id}.html">${esc(l.title)}</a></h2><p>${esc(l.subtitle)}</p></div><div class="library-links">${l.source.notebooks.map(n=>`<a class="button outlined" href="source-${l.id}-${n.role}.html">${{lecture:'Lecture',questions:'Questions',answers:'Answers'}[n.role]}</a>`).join('')}</div></section>`).join('')}</div></main>`}));
write('about.html',shell({title:'About & source notes',description:'ที่มาและขอบเขตของ QuantCorner Research Lab',body:`<main id="main" class="source-reading"><p class="eyebrow">ABOUT THIS PROJECT</p><h1>จากคลังบทเรียน สู่เส้นทางการเรียนรู้</h1><div class="prose"><p>QuantCorner Research Lab เรียบเรียงเนื้อหา Quantopian Lecture Series เป็นภาษาไทย จัดลำดับใหม่ตามกระบวนการวิจัย ตั้งแต่ตั้งคำถาม จัดข้อมูล ใช้สถิติ พัฒนาสัญญาณ ไปจนถึงตรวจสอบความเสี่ยงและข้อจำกัดในการนำไปใช้</p><h2>เนื้อหาที่นำมาใช้</h2><p>ใช้เฉพาะสำเนา quantopiandoc ที่มีอยู่ในเครื่องจากการสนทนาก่อนหน้า ณ commit <code>b1faf19ba390d6aa74429e759c3acc1ab8779932</code> ไม่มีการค้นหาแหล่งความรู้เพิ่มเติมในการสร้างฉบับนี้ ต้นฉบับมี 53 โฟลเดอร์หัวข้อ บทเรียนหลัก 52 Notebook แบบฝึกหัด 20 Notebook และเฉลย 20 Notebook โดย Comparing ETFs มีแบบฝึกหัดกับเฉลยเป็นแหล่งหลัก</p><h2>วิธีอ่าน</h2><p>อ่านบทภาษาไทยเพื่อทำความเข้าใจลำดับเหตุผล แล้วเปิดต้นฉบับในท้ายบทเมื่อต้องการตรวจรายละเอียด ผู้ที่มีพื้นฐานแล้วเลือกข้ามบทได้ ความคืบหน้าบันทึกไว้เฉพาะเบราว์เซอร์ที่ใช้อ่าน</p><h2>สิ่งที่ปรับและสิ่งที่เก็บไว้</h2><p>บทภาษาไทยเป็นการเรียบเรียงใหม่ ไม่ใช่คำแปลทุกบรรทัด เราปรับคำอธิบายที่อาจทำให้สับสน เช่น ความสัมพันธ์กับเหตุและผล ความผันผวนกับความแปรปรวน และสัญญาณลงทุนกับความเสี่ยงจากปัจจัย โดยยังเก็บไฟล์ต้นฉบับทุกไฟล์ไว้เทียบอ่าน รวมถึงชื่อผู้เขียนและข้อความระบุที่มาเดิม</p><h2>สถานะของโค้ดและข้อมูล</h2><p>Notebook เดิมบางส่วนใช้ Python 2 และบริการ Quantopian โครงการนี้ยังไม่ได้ย้ายทั้งชุดให้รันบน Python รุ่นใหม่ หรือดึงข้อมูลตลาดทดแทน ผลลัพธ์ในหน้าต้นฉบับคือผลที่บันทึกมากับไฟล์ ตัวอย่างสมมติในบทเรียนใช้เพื่ออธิบายแนวคิด ไม่ใช่ข้อมูลตลาดที่เก็บใหม่</p><h2>Design & accessibility</h2><p>ใช้ Quantsera Design System: พื้นผิวสีเข้มแบบ Material 2, สีม่วงสำหรับส่วนโต้ตอบ สี teal สำหรับการเน้นรอง พร้อมธีมสว่าง ฟอนต์ Roboto, Noto Sans Thai และ Roboto Mono โหลดจากไฟล์ในโปรเจกต์ รองรับคีย์บอร์ดและหน้าจอมือถือ ไม่มี analytics หรือการโหลดฟอนต์จากบริการภายนอก</p><h2>Attribution</h2><p>เครดิตผู้เขียนแต่ละบทอยู่ในหน้าต้นฉบับและ Notebook ที่เก็บไว้ ชื่อ Quantopian ใช้เพื่อบอกแหล่งที่มาของเนื้อหา เว็บไซต์นี้ไม่ได้ระบุว่าเป็นผลิตภัณฑ์ทางการของ Quantopian สำเนาที่ได้รับไม่มี LICENSE ระดับ repository จึงเก็บประกาศเดิมในไฟล์และบันทึกสถานะสิทธิ์ไว้ในเอกสารโครงการ</p><p><a href="library.html">เปิด Source library →</a> · <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a></p></div></main>`}));
const search=lessons.map(l=>({id:l.id,title:l.title,subtitle:l.subtitle,group:l.group.label,text:(l.intro+' '+l.body).replace(/[#*$`]/g,'').slice(0,18000)}));
write('search-data.js','window.RESEARCH_SEARCH='+JSON.stringify(search)+';');
const manifest={sourceCommit:'b1faf19ba390d6aa74429e759c3acc1ab8779932',topics:53,notebooks:92,lessons:lessons.map(l=>({id:l.id,title:l.title,group:l.group.id,characters:l.body.length,sourcePaths:l.source.notebooks.map(n=>n.path)})),mathErrors};
fs.writeFileSync(path.join(root,'data/build-manifest.json'),JSON.stringify(manifest,null,2));
if(mathErrors.length)throw new Error(`${mathErrors.length} Thai lesson math rendering errors; see build-manifest.json`);
console.log(`Built ${lessons.length} Thai lessons, ${sources.reduce((n,s)=>n+s.notebooks.length,0)} original notebook views, and 3 index pages. All 53 topics covered.`);
