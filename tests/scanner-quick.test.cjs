const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2] || path.join(__dirname,'..');
let raw='[]',fail=false;
const db={transaction(){let tx={};const store={get(){const r={};queueMicrotask(()=>{r.result=raw;r.onsuccess();});return r;},put(value){queueMicrotask(()=>{if(fail){tx.error=Object.assign(new Error('full'),{name:'QuotaExceededError'});tx.onabort();}else{raw=value;tx.oncomplete();}});}};tx.objectStore=()=>store;tx.abort=()=>tx.onabort();return tx;}};
const c={window:{},crypto:require('node:crypto').webcrypto,sessionStorage:{setItem(){}},createMtgStorage:async()=>({close(){}}),indexedDB:{open(){const r={};queueMicrotask(()=>{r.result=db;r.onsuccess();});return r;}}};
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'scanner/collection-store.js'),'utf8'),c);
const card={id:'x',oracle_id:'o',lang:'en',set:'tst',collector_number:'1',name:'Test',finishes:['nonfoil','foil'],image_uris:{normal:'test'}};
(async()=>{
const api=c.window.scannerCollection,opts={language:'en',finish:'normal',quantity:2};
await api.add(card,opts);await api.add(card,opts);assert.equal(JSON.parse(raw)[0].quantity,4);
await api.add(card,{...opts,finish:'foil',quantity:1});assert.equal(JSON.parse(raw).length,2);
for(const bad of [{quantity:0},{quantity:1.5},{language:'ja'},{finish:'etched'}])await assert.rejects(api.add(card,{...opts,...bad}));
const before=raw;fail=true;await assert.rejects(api.add(card,opts));assert.equal(raw,before);fail=false;
raw='invalid';await assert.rejects(api.add(card,opts));assert.equal(raw,'invalid');
console.log('PASS quick save: accumulation, finish separation, invalid/language/finish validation, quota failure and malformed-data preservation');
})().catch(e=>{console.error(e);process.exitCode=1});

