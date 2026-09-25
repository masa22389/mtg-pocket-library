// SPDX-License-Identifier: AGPL-3.0-only
// Compare the modified packed-vector Top 3 search to a full-sort reference.
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync(join(__dirname,'vendor/scanner.worker.mjs'),'utf8');
const start=source.indexOf('  search(query) {');
const end=source.indexOf('\n}\n',start);
assert(start>0 && end>start);
const lookup=Float32Array.from({length:1024},(_,i)=>(i-512)/512);
const context={FLOAT16_LOOKUP:lookup};
vm.createContext(context);
const Search=vm.runInContext(`(class {${source.slice(start,end)}\n})`,context);
for(const rows of [1,2,3,17,100]) {
  const runtime=new Search(),dims=8;
  runtime.manifest={catalog:{dims,rows}};
  runtime.embeddings=Uint16Array.from({length:rows*dims},(_,i)=>(i*137+43)%1024);
  runtime.cardIds=Array.from({length:rows},(_,i)=>`card-${i}`);
  const query=Float32Array.from({length:dims},(_,i)=>(i-4)/4);
  const expected=runtime.cardIds.map((cardId,row)=>({cardId,score:Array.from(query).reduce((sum,v,col)=>sum+v*lookup[runtime.embeddings[row*dims+col]],0)})).sort((a,b)=>b.score-a.score).slice(0,3);
  const actual=runtime.search(query);
  assert.deepEqual(JSON.parse(JSON.stringify(actual.candidates)),expected);
  assert.equal(actual.cardId,expected[0].cardId);
  assert.equal(actual.score,expected[0].score);
}
console.log('Top 3 search: full-sort reference matches for 1, 2, 3, 17, 100 rows.');
