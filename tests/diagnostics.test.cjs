const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
let saved, timerId=0;const timers=new Map(),nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'v284'});return nodes.get(id)};
const db={transaction(){const tx={objectStore:()=>({get(){const r={};queueMicrotask(()=>{r.result=saved;r.onsuccess()});return r},put(v){saved=structuredClone(v);queueMicrotask(()=>tx.oncomplete?.())}})};return tx}};
const c={document:{getElementById:node,querySelector:()=>null,addEventListener(){},getElementsByTagName:()=>[],images:[],visibilityState:'visible'},window:{addEventListener(){}},navigator:{onLine:true},performance:{now:()=>0},indexedDB:{open(){const r={};queueMicrotask(()=>{r.result=db;r.onsuccess()});return r}},setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),PerformanceObserver:class{observe(){}disconnect(){}},Date,ErrorEvent:class{},Blob,URL};
vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../diagnostics.js'),'utf8'),c);
const settle=async()=>{for(let i=0;i<15;i++)await Promise.resolve()};await settle();assert.equal(saved,undefined);
await node('diagnosticStart').onclick();await settle();assert.equal(saved.samples.length,1);assert.equal(timers.size,1);
await node('diagnosticStart').onclick();assert.equal(timers.size,1);
for(let i=0;i<725;i++){const [id,fn]=timers.entries().next().value;timers.delete(id);await fn();await settle()}
assert.equal(saved.samples.length,720);await node('diagnosticStop').onclick();assert.equal(timers.size,0);assert.equal(saved.enabled,false);
console.log('PASS diagnostics: off by default, single timer, 720 limit, persistent stop');
})();
