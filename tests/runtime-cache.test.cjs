const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const code = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
let calls = 0;
const c = { URLSearchParams, cardTraderEnglishIdCache: new Map(), cardTraderMarketplaceCache: new Map(),
  fetch: async () => { calls++; return {ok:true, json:async()=>({id:'english-id', largePayload:'unused'})}; },
  cardTraderExpansionIdForSet: async set => set,
  fetchCardTrader: async path => ({path, listings:[1,2,3]}) };
vm.createContext(c);
for (const name of ['ensureCardTraderScryfallId','cardTraderMarketplaceForSet']) {
 const start=code.indexOf(`async function ${name}(`);
 vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);
}
(async()=>{
 const card = {language:'ja',set:'sos',collectorNumber:'1',scryfallId:'japanese-id'};
 assert.equal(await c.ensureCardTraderScryfallId({...card}), 'english-id');
 assert.equal(await c.ensureCardTraderScryfallId({...card}), 'english-id');
 assert.equal(calls, 1);
 assert.equal(await c.cardTraderEnglishIdCache.get('sos:1'), 'english-id');
 for(let i=2;i<160;i++) await c.ensureCardTraderScryfallId({...card,collectorNumber:String(i)});
 assert.equal(c.cardTraderEnglishIdCache.size,128);
 c.fetch=async()=>{throw Error('offline');};
 assert.equal(await c.ensureCardTraderScryfallId({...card,collectorNumber:'200'}),'japanese-id');
 const first=await c.cardTraderMarketplaceForSet('sos','ja',false);
 assert.equal(await c.cardTraderMarketplaceForSet('sos','en',true),first);
 for(let i=0;i<100;i++) await c.cardTraderMarketplaceForSet('set'+i,'en',false);
 assert.equal(c.cardTraderMarketplaceCache.size,1);
 assert.equal(first.listings.length,3);
 console.log('PASS: bounded caches, ID-only retention, cache reuse, failure fallback, existing response remains usable.');
})().catch(error=>{console.error(error);process.exitCode=1;});
