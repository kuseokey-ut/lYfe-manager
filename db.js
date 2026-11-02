const N='tasks-db',S='tasks';let db;
const open=()=>db?Promise.resolve(db):new Promise((res,rej)=>{const r=indexedDB.open(N,1);r.onupgradeneeded=()=>r.result.createObjectStore(S,{keyPath:'id'});r.onsuccess=()=>res(db=r.result);r.onerror=()=>rej(r.error)});
const tx=async(m,f)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction(S,m),q=f(t.objectStore(S));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})};
export const all=()=>tx('readonly',o=>o.getAll());
export const put=x=>tx('readwrite',o=>o.put(x));
export const del=id=>tx('readwrite',o=>o.delete(id));
export const bulk=(a,replace)=>tx('readwrite',o=>{if(replace)o.clear();a.forEach(x=>o.put(x))});
export const get=(k,d)=>{try{return JSON.parse(localStorage.getItem('tl_'+k))??d}catch{return d}};
export const set=(k,v)=>{try{localStorage.setItem('tl_'+k,JSON.stringify(v))}catch{}};
