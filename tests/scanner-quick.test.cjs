const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2] || path.join(__dirname,'..');
let raw='[]',fail=false;
const db={transaction(){let tx={};const store={get(){const r={};queueMicrotask(()=>{r.result=raw;r.onsuccess();});return r;},put(value){queueMicrotask(()=>{if(fail){tx.error=Object.assign(new Error('full'),{name:'QuotaExceededError'});tx.onabort();}else{raw=value;tx.oncomplete();}});}};tx.objectStore=()=>store;tx.abort=()=>tx.onabort();return tx;}};
const c={window:{},crypto:require('node:crypto').webcrypto,sessionStorage:{setItem(){}},createMtgStorage:async()=>({close(){}}),indexedDB:{open(){const r={};queueMicrotask(()=>{r.result=db;r.onsuccess();});return r;}}};
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'scanner-trial/quick-store.js'),'utf8'),c);
const card={id:'x',oracle_id:'o',lang:'en',set:'tst',collector_number:'1',name:'Test',finishes:['nonfoil','foil'],image_uris:{normal:'test'}};
(async()=>{
const api=c.window.scannerCollection,opts={language:'en',finish:'normal',quantity:2};
await api.add(card,opts);await api.add(card,opts);assert.equal(JSON.parse(raw)[0].quantity,4);
await api.add(card,{...opts,finish:'foil',quantity:1});assert.equal(JSON.parse(raw).length,2);
for(const bad of [{quantity:0},{quantity:1.5},{language:'ja'},{finish:'etched'}])await assert.rejects(api.add(card,{...opts,...bad}));
const before=raw;fail=true;await assert.rejects(api.add(card,opts));assert.equal(raw,before);fail=false;
raw='invalid';await assert.rejects(api.add(card,opts));assert.equal(raw,'invalid');
console.log('PASS quick save: accumulation, finish separation, invalid/language/finish validation, quota failure and malformed-data preservation');
const nodes=new Map();function el(id){if(!nodes.has(id))nodes.set(id,{value:'',options:[],hidden:false,disabled:false,handlers:{},addEventListener(n,f){this.handlers[n]=f},replaceChildren(){this.options=[];this.value=''},add(o){this.options.push(o);if(!this.value)this.value=o.value},showModal(){},close(){},scrollIntoView(){},click(){}});return nodes.get(id)};
let saves=0,release;
const ui={document:{getElementById:el},window:{scannerCollection:{add:()=>{saves++;return new Promise(r=>release=r)}}},Option:function(label,value){this.value=value},AbortController,setTimeout,clearTimeout,fetch:async()=>({ok:false})};
vm.createContext(ui);vm.runInContext(fs.readFileSync(path.join(root,'scanner-trial/quick-add.js'),'utf8'),ui);
await ui.window.scannerQuickAdd.open(card);assert.equal(el('quickSave').disabled,false);
const first=el('quickSave').handlers.click();await el('quickSave').handlers.click();assert.equal(saves,1);release();await first;assert.equal(el('quickSave').disabled,true);assert.equal(el('quickNext').hidden,false);assert.equal(el('quickClose').disabled,false);
await ui.window.scannerQuickAdd.open(card);el('quickLanguage').value='ja';await el('quickLanguage').handlers.change();assert.equal(el('quickSave').disabled,true);assert.match(el('quickStatus').textContent,/取得できません/);
console.log('PASS quick UI: best candidate, double-click protection, completion/next, language fetch failure blocks save');
})().catch(e=>{console.error(e);process.exitCode=1});

