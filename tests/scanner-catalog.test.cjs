const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2] || path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'scanner-trial/vendor/scanner.worker.mjs'),'utf8');
const begin=src.indexOf('    // Small local supplement'),end=src.indexOf('\n  async loadCatalogV2',begin);
assert(begin>0 && end>begin);
const method=src.slice(begin,end).replace('import.meta.url',JSON.stringify('https://example.test/scanner-trial/vendor/scanner.worker.mjs')).replace(/\n  }\s*$/,'');
async function run(bad=false){
 const runtime={manifest:{catalogSupplement:{version:'test',rows:1,dims:2,card_ids:'ids',oracle_ids:'oracles',embeddings:'vectors'}},embeddings:new Uint16Array([1,2]),cardIds:['old'],secondaryIds:['old-oracle'],catalogRows:1,catalogTotalRows:1};
 const context={URL,Uint16Array,dims:2,onStage:()=>{},fetchJsonCached:async u=>u.endsWith('/ids')?['new']:['new-oracle'],fetchBufferCached:async()=>new Uint16Array(bad?[3]:[3,4]).buffer,wrapFloat16Buffer:b=>new Uint16Array(b),runtime};
 vm.createContext(context);
 await vm.runInContext(`(async function(){${method}}).call(runtime)`,context);
 assert.deepEqual(Array.from(runtime.embeddings),[1,2,3,4]);assert.equal(runtime.catalogRows,2);assert.equal(runtime.cardIds[1],'new');assert.equal(runtime.secondaryIds[1],'new-oracle');
}
(async()=>{
 await run();await assert.rejects(()=>run(true),/追加認識/);
 const m=JSON.parse(fs.readFileSync(path.join(root,'scanner-trial/vendor/manifest.json'))).catalogSupplement;
 const ids=JSON.parse(fs.readFileSync(path.join(root,'scanner-trial',m.card_ids)));
 const oracles=JSON.parse(fs.readFileSync(path.join(root,'scanner-trial',m.oracle_ids)));
 assert.equal(ids.length,m.rows);assert.equal(new Set(ids).size,m.rows);assert.equal(oracles.length,m.rows);
 assert.equal(fs.statSync(path.join(root,'scanner-trial',m.embeddings)).size,m.rows*m.dims*2);
 console.log('PASS FRA supplement loading, row alignment, corrupt size rejection and asset dimensions');
})();
