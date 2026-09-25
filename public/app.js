(() => {
 const $ = s => document.querySelector(s);
 const readStore = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
 const save = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));} catch {}};
 const theme = $('#theme-toggle');
 function syncTheme() { const dark=document.documentElement.dataset.theme==='dark';theme.textContent=dark?'Light':'Dark';theme.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme'); }
 theme?.addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=value;try{localStorage.setItem('qrl-theme',value)}catch{}syncTheme()});syncTheme();
 const dialog=$('#search-dialog'),input=$('#search-input'),results=$('#search-results'),count=$('#search-count');
 function search(){
  const q=input.value.trim().toLocaleLowerCase();if(!window.researchRenderResults)results.replaceChildren();
  const items=(window.RESEARCH_SEARCH||[]).filter(x=>!q||(`${x.title} ${x.subtitle} ${x.text}`).toLocaleLowerCase().includes(q));
  count.textContent=q?`${items.length} results / ผลการค้นหา`:'เลือกบทเรียน หรือพิมพ์เพื่อค้นหา';
  if(window.researchRenderResults){window.researchRenderResults(items);return;}
  for(const x of items.slice(0,30)){const a=document.createElement('a');a.href=x.id+'.html';const strong=document.createElement('strong');strong.textContent=x.title;const sub=document.createElement('span');sub.textContent=x.subtitle+' · '+x.group;a.append(strong,sub);results.append(a)}
  if(!items.length){const p=document.createElement('p');p.textContent='ไม่พบหัวข้อ ลองใช้คำสั้นลง หรือค้นด้วยชื่อภาษาอังกฤษ';results.append(p)}
 }
 function openSearch(){dialog.showModal();search();input.focus()}
 $('#search-open')?.addEventListener('click',openSearch);$('#search-close')?.addEventListener('click',()=>dialog.close());input?.addEventListener('input',search);
 dialog?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close()}});
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(!dialog.open)openSearch()}});
 const completed=readStore('qrl-completed');
 document.querySelectorAll('[data-status]').forEach(el=>{if(completed[el.dataset.status]){el.textContent='Read';el.setAttribute('aria-label','อ่านแล้ว');el.classList.add('is-read')}});
 const mark=$('#mark-complete');
 function updateRead(){if(!mark)return;const done=!!completed[mark.dataset.id];mark.textContent=done?'Read · Mark unread':'Mark as read';mark.setAttribute('aria-pressed',String(done))}
 mark?.addEventListener('click',()=>{completed[mark.dataset.id]=!completed[mark.dataset.id];save('qrl-completed',completed);updateRead();window.dispatchEvent(new Event('research-progress'))});updateRead();
 const lesson=$('[data-lesson]');if(lesson)save('qrl-last',{id:lesson.dataset.lesson});
 const last=readStore('qrl-last'),continueLink=$('#continue-link');
 if(continueLink&&last.id&&(window.RESEARCH_SEARCH||[]).some(x=>x.id===last.id)){continueLink.href=last.id+'.html';continueLink.textContent='Continue reading ↗'}
 const progress=$('#progress-note');if(progress&&Object.values(completed).filter(Boolean).length)progress.textContent=`อ่านแล้ว ${Object.values(completed).filter(Boolean).length} จาก 53 บท · เลือกทบทวนได้ทุกเมื่อ`;
 $('#library-filter')?.addEventListener('input',e=>{const q=e.target.value.trim().toLocaleLowerCase();let n=0;document.querySelectorAll('.library-row').forEach(row=>{row.hidden=!row.dataset.search.toLocaleLowerCase().includes(q);if(!row.hidden)n++});$('#library-count').textContent=n?`${n} topics`:'ไม่พบหัวข้อ ลองใช้คำค้นอื่น'});
})();
