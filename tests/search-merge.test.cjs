const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
const a=code.indexOf('function mergeLanguageResults(');vm.runInContext(code.slice(a,code.indexOf('\n}',a)+2),c);
const en=n=>Array.from({length:n},(_,i)=>({id:'en'+i,oracle_id:'o'+i,lang:'en'}));
// Every card stays, however many there are.
assert.equal(c.mergeLanguageResults(en(77),[]).length,77);
// A fetched Japanese print sits right after its English card, and is not repeated.
const ja=[{id:'ja1',oracle_id:'o1',lang:'ja'},{id:'ja40',oracle_id:'o40',lang:'ja'}];
const merged=Array.from(c.mergeLanguageResults(en(60),ja)).map(x=>x.id);
assert.equal(merged.length,62);
assert.deepEqual(merged.slice(0,4),['en0','en1','ja1','en2']);
assert.equal(merged[merged.indexOf('en40')+1],'ja40');
assert.equal(new Set(merged).size,62);
// A counterpart with no matching card is still listed, at the end.
const extra=Array.from(c.mergeLanguageResults(en(2),[{id:'jaX',oracle_id:'oX',lang:'ja'}])).map(x=>x.id);
assert.deepEqual(extra,['en0','en1','jaX']);
console.log('PASS search merge keeps every card');
