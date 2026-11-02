import*as D from './db.js';import*as Au from './auth.js';import{render,edit,toast}from './ui.js';
const $=s=>document.querySelector(s),p2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),fmt=d=>ymd(d)+'T'+p2(d.getHours())+':'+p2(d.getMinutes());
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const norm=t=>({title:'',desc:'',status:'todo',prio:1,color:'',labels:[],due:'',repeat:'',remind:false,focus:false,checklist:[],deleted:0,archived:0,created:Date.now(),parent:null,...t});
const S={tasks:[],view:D.get('view','tree'),f:{q:'',st:'',pr:'',lb:'',pj:'',sort:'manual'},focus:false,cal:{m:'month',d:ymd(new Date())},col:new Set(D.get('col',[]))};
const sub=id=>{const o=[id];S.tasks.filter(t=>t.parent===id).forEach(k=>o.push(...sub(k.id)));return o};
const anc=t=>{const o=[];while(t&&t.parent){t=S.tasks.find(x=>x.id===t.parent);t&&o.push(t.id)}return o};
const many=async(ids,p)=>{const l=S.tasks.filter(t=>ids.includes(t.id));l.forEach(t=>Object.assign(t,p,{updated:Date.now()}));await D.bulk(l);render(S,A)};
const A={
pref(){D.set('view',S.view);D.set('col',[...S.col])},
async save(t){t.updated=Date.now();await D.put(t);const i=S.tasks.findIndex(x=>x.id===t.id);i<0?S.tasks.push(t):S.tasks[i]=t;render(S,A)},
add(parent=null,due=''){edit(norm({id:uid(),parent,due,notified:null}),true)},
done(t,on){if(on&&t.repeat&&t.due){const d=new Date(t.due);t.repeat==='daily'?d.setDate(d.getDate()+1):t.repeat==='weekly'?d.setDate(d.getDate()+7):d.setMonth(d.getMonth()+1);t.due=fmt(d);t.status='todo';t.notified=null;t.checklist.forEach(c=>c.d=0);toast('Repeats: next due '+t.due.replace('T',' '))}else t.status=on?'done':'todo';return A.save(t)},
status(t,s){if(s==='done')return A.done(t,true);t.status=s;return A.save(t)},
trash:id=>many(sub(id),{deleted:1}),archive:id=>many(sub(id),{archived:1}),
restore(id){return many([...sub(id),...anc(S.tasks.find(x=>x.id===id))],{deleted:0,archived:0})},
async purge(id){const ids=sub(id);for(const i of ids)await D.del(i);S.tasks=S.tasks.filter(t=>!ids.includes(t.id));render(S,A)},
export(){const b=new Blob([JSON.stringify({v:1,exported:new Date().toISOString(),tasks:S.tasks},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='tasks-'+ymd(new Date())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e4)},
pick(){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>i.files[0]&&A.import(i.files[0]);i.click()},
async import(f){try{const a=JSON.parse(await f.text()).tasks;if(!Array.isArray(a)||a.some(t=>!t||!t.id))throw 0;
const rep=confirm(`Import ${a.length} tasks.\n\nOK = REPLACE all current data\nCancel = MERGE (newest edit wins)`);
if(rep)await D.bulk(a.map(norm),true);else{const m=new Map(S.tasks.map(t=>[t.id,t]));await D.bulk(a.filter(t=>!m.has(t.id)||(t.updated||0)>(m.get(t.id).updated||0)).map(norm))}
S.tasks=(await D.all()).map(norm);render(S,A);toast(`Imported ${a.length} tasks (${rep?'replaced':'merged'})`)}catch{toast('Not a valid backup file')}},
logout(){Au.logout();location.reload()}};
function notify(t){toast('⏰ '+(t.title||'Task due'));if(window.Notification&&Notification.permission==='granted')navigator.serviceWorker?.ready.then(r=>r.showNotification(t.title||'Task due',{body:t.due.replace('T',' '),icon:'icons/icon-192.png',tag:t.id}))}
async function remind(){const now=Date.now();for(const t of S.tasks)if(t.remind&&t.due&&t.status!=='done'&&!t.deleted&&!t.archived&&t.notified!==t.due&&new Date(t.due)<=now){t.notified=t.due;await D.put(t);notify(t)}}
async function boot(){$('#app').hidden=false;S.tasks=(await D.all()).map(norm);render(S,A);remind();setInterval(remind,30000);document.addEventListener('visibilitychange',remind)}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
if(Au.ok())boot();else{const f=$('#login');f.hidden=false;f.onsubmit=e=>{e.preventDefault();if(Au.login($('#nick').value.trim(),$('#pass').value)){f.hidden=true;boot()}else $('#err').textContent='Wrong nickname or password.'}}
