(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const fn=name=>{let start=code.indexOf(`function ${name}(`);if(code.slice(start-6,start)==='async ')start-=6;return code.slice(start,code.indexOf('\n}\n',start)+3);};
const pages={'p2':{data:[{id:'c3'},{id:'c4'}],has_more:true,next_page:'p3'},'p3':{data:[{id:'c5'}],has_more:false}};
const c={setTimeout,aliasTargetsForQuery:()=>[],cachedSearchPage:()=>true,
  fetchScryfallSearch:async()=>({ok:true,data:{data:[{id:'c1'},{id:'c2'}],has_more:true,next_page:'p2'}}),
  fetchSearchPage:async url=>{if(url==='bad')throw new TypeError('Failed to fetch');return {ok:true,data:pages[url]};}};
vm.createContext(c);
vm.runInContext(fn('buildSearchCandidates')+fn('fetchAllScryfallSearch'),c);
// A text-only search sends one query, not three near-copies of it.
assert.deepEqual([...c.buildSearchCandidates('','lang:ja o:"速攻"','ja',false)],['lang:ja o:"速攻"']);
assert.deepEqual([...c.buildSearchCandidates('','lang:en o:"counter target"','en',false)],['lang:en o:"counter target"']);
assert.deepEqual([...c.buildSearchCandidates('','o:"haste" t:creature','en',false)],['lang:en o:"haste" t:creature','o:"haste" t:creature']);
// A card name keeps the name variants as before.
assert(c.buildSearchCandidates('稲妻','lang:ja','ja',false).length>1);
// Every page but the last is reported as it arrives, so the first cards show while the rest load.
const seen=[];
const all=await c.fetchAllScryfallSearch('q',{onPage:cards=>seen.push(cards.map(card=>card.id).join(','))});
assert.deepEqual(seen,['c1,c2','c1,c2,c3,c4']);
assert.equal(all.data.data.length,5);
// A page that cannot be fetched gives a message instead of "Failed to fetch".
c.fetchScryfallSearch=async()=>({ok:true,data:{data:[{id:'c1'}],has_more:true,next_page:'bad'}});
const failed=await c.fetchAllScryfallSearch('q');
assert.equal(failed.ok,false);assert.match(failed.error.details,/通信に失敗/);
// English counterparts are not looked up with Japanese card text, which can never match an English print.
let lookups=0;
c.stripLanguageFilter=f=>f.replace(/\blang:\w+\s*/g,'').trim();
c.fetchScryfallSearch=async()=>{lookups++;return {ok:true,data:{data:[{id:'en'}]}};};
vm.runInContext(fn('fetchCounterparts'),c);
assert.equal((await c.fetchCounterparts([{oracle_id:'o',name:'Act of Treason'}],'en','lang:ja o:"速攻"')).length,0);
assert.equal(lookups,0);
assert.equal((await c.fetchCounterparts([{oracle_id:'o',name:'Act of Treason'}],'ja','lang:en o:"haste"')).length,1);
// The candidate loop shows partial results through onProgress during an advanced search.
assert(code.includes('const result = await runSearch(q, { unique: "cards", onPage });'));
// Only the first page redraws the list; later pages just update the loaded count, so big searches don't slow down.
assert(code.includes('if (pagesSeen++ === 0) options.onProgress('));
assert(code.includes('else options.onLoading?.(cards.length + pageCards.length);'));
assert(code.includes('件読み込み済み）'));
console.log('PASS: a text-only search sends one query and shows each page as it arrives.');
})().catch(error=>{console.error(error);process.exitCode=1;});
