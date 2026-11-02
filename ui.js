const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ST={todo:'To Do',doing:'In Progress',done:'Done'},K=Object.keys(ST),PR=['Low','Normal','High','Urgent'],p2=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
let S,A,M;
export const toast=m=>{const e=$('#toast');e.textContent=m;e.className='on';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',3500)};
const live=()=>S.tasks.filter(t=>!t.deleted&&!t.archived);
const root=t=>{while(t.parent&&M.get(t.parent))t=M.get(t.parent);return t.id};
const path=t=>{const o=[];while(t.parent&&M.get(t.parent)){t=M.get(t.parent);o.unshift(t.title)}return o.join(' › ')};
const late=t=>t.due&&t.status!=='done'&&new Date(t.due)<new Date();
const sc=t=>t.color?` style="border-left-color:${esc(t.color)}"`:'';
const empty='<p class="empty">No tasks here yet. Use “＋ Project” to add one.</p>';
function match(t){const x=S.f;if(S.focus&&(!(t.focus||t.prio===3)||t.status==='done'))return false;
if(x.q&&!(t.title+' '+t.desc+' '+t.labels.join(' ')).toLowerCase().includes(x.q.toLowerCase()))return false;
if(x.st&&t.status!==x.st)return false;if(x.pr!==''&&t.prio!==+x.pr)return false;if(x.lb&&!t.labels.includes(x.lb))return false;if(x.pj&&root(t)!==x.pj)return false;return true}
const cmp=()=>({manual:(a,b)=>a.created-b.created,date:(a,b)=>(a.due||'~').localeCompare(b.due||'~'),prio:(a,b)=>b.prio-a.prio,title:(a,b)=>a.title.localeCompare(b.title),status:(a,b)=>K.indexOf(a.status)-K.indexOf(b.status)})[S.f.sort];
const badges=t=>`${t.due?`<small class="${late(t)?'late':''}">📅 ${esc(t.due.replace('T',' '))}${t.repeat?' 🔁':''}${t.remind?' ⏰':''}</small>`:''}${t.labels.map(l=>`<i class="lb">${esc(l)}</i>`).join('')}${t.checklist.length?`<small>☑ ${t.checklist.filter(c=>c.d).length}/${t.checklist.length}</small>`:''}<small class="p${t.prio}">${PR[t.prio]}</small>`;
const row=(t,x='')=>`<div class="row ${t.status}${t.focus?' foc':''}" data-id="${t.id}"${sc(t)}>${x}<input type="checkbox" data-a="done"${t.status==='done'?' checked':''}><span class="ti" data-a="edit">${esc(t.title||'(untitled)')}</span>${badges(t)}<button data-a="sub" title="Add sub-task">＋</button></div>`;
function tree(){const k=new Map();live().forEach(t=>{const p=t.parent&&M.has(t.parent)?t.parent:'';(k.get(p)||k.set(p,[]).get(p)).push(t)});
const keep=t=>match(t)||(k.get(t.id)||[]).some(keep);
const go=p=>{const l=(k.get(p)||[]).filter(keep).sort(cmp());return l.length?`<ul>${l.map(t=>{const h=k.has(t.id),c=S.col.has(t.id);return`<li>${row(t,h?`<button data-a="fold">${c?'▸':'▾'}</button>`:'<span class="sp"></span>')}${h&&!c?go(t.id):''}</li>`}).join('')}</ul>`:''};
return go('')||empty}
const list=()=>live().filter(match).sort(cmp()).map(t=>row(t,`<small>${esc(path(t))}</small>`)).join('')||empty;
const board=()=>{const l=live().filter(match).sort(cmp());return`<div class="board">${K.map((s,i)=>`<section><h3>${ST[s]} <small>${l.filter(t=>t.status===s).length}</small></h3>${l.filter(t=>t.status===s).map(t=>`<div class="card${t.focus?' foc':''}" data-id="${t.id}"${sc(t)}><div data-a="edit" class="ti">${esc(t.title)}</div>${badges(t)}<div class="mv"><span>${i?`<button data-a="mv" data-s="${K[i-1]}">◀</button>`:''}</span><span>${i<2?`<button data-a="mv" data-s="${K[i+1]}">▶</button>`:''}</span></div></div>`).join('')}</section>`).join('')}</div>`};
function cal(){const c=S.cal,d=new Date(c.d+'T00:00'),today=iso(new Date());
const by=k=>live().filter(t=>match(t)&&t.due&&t.due.slice(0,10)===k).sort((a,b)=>a.due.localeCompare(b.due));
const chip=t=>`<div class="chip ${t.status}" data-id="${t.id}" data-a="edit"${sc(t)}>${esc(t.due.slice(11))} ${esc(t.title)}</div>`;
const mon=x=>{x=new Date(x);x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
const days=(s,n)=>Array.from({length:n},(_,i)=>{const x=new Date(s);x.setDate(x.getDate()+i);return x});
const cell=(x,dim)=>{const k=iso(x),l=by(k),m=c.m==='month';return`<div class="cell${dim?' dim':''}${k===today?' today':''}" data-a="day" data-d="${k}"><b>${x.getDate()}</b>${l.slice(0,m?3:99).map(chip).join('')}${m&&l.length>3?`<small>+${l.length-3} more</small>`:''}</div>`};
let t,b;
if(c.m==='month'){const s=mon(new Date(d.getFullYear(),d.getMonth(),1));t=d.toLocaleString(undefined,{month:'long',year:'numeric'});b=`<div class="grid m">${days(s,7).map(x=>`<div class="wd">${x.toLocaleDateString(undefined,{weekday:'short'})}</div>`).join('')}${days(s,42).map(x=>cell(x,x.getMonth()!==d.getMonth())).join('')}</div>`}
else if(c.m==='week'){const s=mon(d);t=iso(s)+' to '+iso(days(s,7)[6]);b=`<div class="grid w">${days(s,7).map(x=>`<div><div class="wd">${x.toLocaleDateString(undefined,{weekday:'short',day:'numeric'})}</div>${cell(x)}</div>`).join('')}</div>`}
else{t=d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});b=(by(c.d).map(x=>row(x)).join('')||'<p class="empty">Nothing planned for this day.</p>')+'<button data-a="addday">＋ Add task</button>'}
return`<div class="calbar"><button data-a="cn" data-n="-1">‹</button><button data-a="cn" data-n="0">Today</button><button data-a="cn" data-n="1">›</button><b>${esc(t)}</b>${['day','week','month'].map(m=>`<button data-a="cm" data-m="${m}" class="${c.m===m?'on':''}">${m}</button>`).join('')}</div>${b}`}
function arch(){const AM=new Map(S.tasks.map(t=>[t.id,t])),hid=t=>t&&(t.deleted||t.archived);
return S.tasks.filter(t=>hid(t)&&!hid(AM.get(t.parent))).map(t=>`<div class="row" data-id="${t.id}"><span class="ti">${t.deleted?'🗑':'📦'} ${esc(t.title)}</span><small>${t.deleted?'Deleted':'Archived'}</small><button data-a="restore">Restore</button><button data-a="purge">Delete forever</button></div>`).join('')||'<p class="empty">Archive and trash are empty.</p>'}
function bar(){const L=[...new Set(live().flatMap(t=>t.labels))].sort(),P=live().filter(t=>!t.parent);
const o=(a,s)=>a.map(([v,l])=>`<option value="${esc(v)}"${String(s)===String(v)?' selected':''}>${esc(l)}</option>`).join('');
$('#bar').hidden=S.view==='arch';
$('#bar').innerHTML=`<input id="q" placeholder="Search…" value="${esc(S.f.q)}"><select data-f="st">${o([['','Any status'],...Object.entries(ST)],S.f.st)}</select><select data-f="pr">${o([['','Any priority'],...PR.map((l,i)=>[i,l])],S.f.pr)}</select><select data-f="lb">${o([['','Any label'],...L.map(l=>[l,l])],S.f.lb)}</select><select data-f="pj">${o([['','All projects'],...P.map(t=>[t.id,t.title])],S.f.pj)}</select><select data-f="sort">${o([['manual','Oldest first'],['date','By due date'],['prio','By priority'],['title','By title'],['status','By status']],S.f.sort)}</select>`}
export function renderMain(){$('#main').innerHTML=({tree,list,board,cal,arch})[S.view]()}
export function render(s,a){S=s;A=a;M=new Map(live().map(t=>[t.id,t]));
$('#nav').innerHTML=[['tree','Tree'],['list','List'],['board','Board'],['cal','Calendar'],['arch','Archive']].map(([v,l])=>`<button data-v="${v}" class="${S.view===v?'on':''}">${l}</button>`).join('');
$('#acts').innerHTML=`<button data-a="addp">＋ Project</button><button data-a="focus" class="${S.focus?'on':''}">Focus</button><button data-a="export">Export</button><button data-a="import">Import</button><button data-a="logout">Log out</button>`;
bar();renderMain()}
export function edit(t,isNew){const d=$('#dlg'),bad=new Set([t.id]);let g=1;while(g){g=0;S.tasks.forEach(x=>{if(x.parent&&bad.has(x.parent)&&!bad.has(x.id)){bad.add(x.id);g=1}})}
const v=n=>d.querySelector(`[name=${n}]`),o=(a,s)=>a.map(([x,l])=>`<option value="${esc(x)}"${String(s)===String(x)?' selected':''}>${esc(l)}</option>`).join('');
const par=[['','Top level'],...[...M.values()].filter(x=>!bad.has(x.id)).map(x=>[x.id,(path(x)?path(x)+' › ':'')+x.title])];
d.innerHTML=`<h3>${isNew?'New task':'Edit task'}</h3><input name="title" placeholder="Title" value="${esc(t.title)}"><textarea name="desc" rows="3" placeholder="Description">${esc(t.desc)}</textarea><div class="g"><label>Status<select name="status">${o(Object.entries(ST),t.status)}</select></label><label>Priority<select name="prio">${o(PR.map((l,i)=>[i,l]),t.prio)}</select></label><label>Due<input type="datetime-local" name="due" value="${esc(t.due)}"></label><label>Repeat<select name="repeat">${o([['','Never'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly']],t.repeat)}</select></label><label>Labels (comma-separated)<input name="labels" value="${esc(t.labels.join(', '))}"></label><label>Parent<select name="parent">${o(par,t.parent||'')}</select></label></div><div class="g"><label><input type="checkbox" name="usec"${t.color?' checked':''}> Color <input type="color" name="color" value="${esc(t.color||'#0f766e')}"></label><label><input type="checkbox" name="remind"${t.remind?' checked':''}> Reminder</label><label><input type="checkbox" name="focus"${t.focus?' checked':''}> Focus</label></div><label>Checklist (one item per line, start with [x] when done)<textarea name="cl" rows="4">${esc(t.checklist.map(c=>(c.d?'[x] ':'')+c.t).join('\n'))}</textarea></label><div class="btns"><button data-k="s" class="pri">Save</button>${isNew?'':'<button data-k="a">Archive</button><button data-k="d">Delete</button>'}<button data-k="x">Cancel</button></div>`;
d.onclick=async e=>{const k=e.target.dataset.k;if(!k)return;
if(k==='s'){const old=t.due;Object.assign(t,{title:v('title').value.trim()||'Untitled',desc:v('desc').value,status:v('status').value,prio:+v('prio').value,due:v('due').value,repeat:v('repeat').value,color:v('usec').checked?v('color').value:'',labels:v('labels').value.split(',').map(s=>s.trim()).filter(Boolean),parent:v('parent').value||null,remind:v('remind').checked,focus:v('focus').checked,checklist:v('cl').value.split('\n').filter(l=>l.trim()).map(l=>/^\[x\] /i.test(l)?{t:l.slice(4),d:1}:{t:l,d:0})});
if(t.due!==old)t.notified=null;if(t.remind&&window.Notification&&Notification.permission==='default')Notification.requestPermission();await A.save(t)}
else if(k==='a')A.archive(t.id);else if(k==='d')A.trash(t.id);d.close()};
d.showModal()}
document.addEventListener('click',e=>{if(!S)return;const b=e.target.closest('[data-a],[data-v]');if(!b)return;const r=b.closest('[data-id]'),t=r&&S.tasks.find(x=>x.id===r.dataset.id),R=()=>render(S,A);
if(b.dataset.v){S.view=b.dataset.v;A.pref();return R()}
({done:()=>A.done(t,b.checked),edit:()=>edit(t),sub:()=>A.add(t.id),fold:()=>{S.col.has(t.id)?S.col.delete(t.id):S.col.add(t.id);A.pref();R()},addp:()=>A.add(null),addday:()=>A.add(null,S.cal.d+'T09:00'),focus:()=>{S.focus=!S.focus;R()},mv:()=>A.status(t,b.dataset.s),day:()=>{S.cal.d=b.dataset.d;S.cal.m='day';R()},cm:()=>{S.cal.m=b.dataset.m;R()},
cn:()=>{const n=+b.dataset.n,d=new Date(S.cal.d+'T00:00');if(!n)S.cal.d=iso(new Date());else{S.cal.m==='month'?d.setMonth(d.getMonth()+n,1):d.setDate(d.getDate()+(S.cal.m==='week'?7:1)*n);S.cal.d=iso(d)}R()},
restore:()=>A.restore(t.id),purge:()=>confirm('Delete permanently?')&&A.purge(t.id),export:()=>A.export(),import:()=>A.pick(),logout:()=>A.logout()})[b.dataset.a]?.()});
document.addEventListener('change',e=>{const f=e.target.dataset.f;if(f&&S){S.f[f]=e.target.value;renderMain()}});
document.addEventListener('input',e=>{if(e.target.id==='q'&&S){S.f.q=e.target.value;renderMain()}});
