const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
// Pass a fake-indexeddb installation path when running outside an npm project.
const {indexedDB,IDBObjectStore}=require(process.argv[2] || 'fake-indexeddb');
const root=path.join(__dirname,'..');
const c={window:{},indexedDB,crypto:require('node:crypto').webcrypto,sessionStorage:{setItem(){}},createMtgStorage:async()=>new Promise((resolve,reject)=>{const r=indexedDB.open('mtg-pocket-data-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('values');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);})};
vm.createContext(c);
for(const f of ['quick-store.js','scanner-list.js'])vm.runInContext(fs.readFileSync(path.join(root,'scanner-trial',f),'utf8'),c);
const card={id:'x',oracle_id:'o',lang:'en',set:'tst',collector_number:'1',name:'Test',finishes:['nonfoil','foil']},opts={language:'en',finish:'normal',quantity:1};
(async()=>{
 const api=c.window.scannerDraft;
 await Promise.all([api.add(card,opts),api.add(card,opts)]);
 assert.equal((await api.read())[0].quantity,2);
 await api.add(card,{...opts,finish:'foil'});assert.equal((await api.read()).length,2);
 const db=await c.window.scannerCollection.database();
 const owned=()=>new Promise(r=>{const q=db.transaction('values').objectStore('values').get('mtg-pocket.collection.v1');q.onsuccess=()=>r(JSON.parse(q.result||'[]'));});
 assert.equal((await owned()).length,0);
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){if(key==='mtg-pocket.collection.v1')throw new Error('quota test');return put.call(this,value,key)};
 await assert.rejects(api.commit(),/quota/);assert.equal((await api.read()).length,2);assert.equal((await owned()).length,0);
 IDBObjectStore.prototype.put=put;
 await Promise.all([api.commit(),api.commit()]);
 assert.equal((await api.read()).length,0);assert.equal((await owned()).reduce((n,r)=>n+r.quantity,0),3);
 await api.add(card,opts);const row=(await api.read())[0];await api.remove(row.id);assert.equal((await api.read()).length,0);
 console.log('PASS draft persistence, concurrent additions, finish separation, rollback, duplicate commit and removal');db.close();
})().catch(e=>{console.error(e);process.exitCode=1});
