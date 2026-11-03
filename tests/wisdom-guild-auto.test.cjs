(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const DAY=86400000,now=Date.now();
const fn=code.slice(code.indexOf('// options.automatic: the weekly background refresh'),code.indexOf('\nfunction refreshWisdomGuildPrices()'));
function context(cards,cache,fetcher){
  const c={Date,Promise,setTimeout:(f)=>f(),navigator:{onLine:true},PRICE_AUTO_REFRESH_MS:7*DAY,WISDOM_GUILD_AUTO_BATCH:30,WISDOM_GUILD_PRICE_CACHE_VERSION:'v',DAY_MS:DAY,
    state:{collection:cards,wisdomGuild:{lastStats:'manual result'},priceCache:cache},
    wisdomGuildLanguageForCard:()=>'jp',priceCacheFinish:()=>'normal',priceCacheEntryNeedsRefresh:()=>true,
    priceCacheUpdatedAtForCard:card=>cache[card.id]?.updatedAt||0,priceCacheEntryForCard:card=>cache[card.id]||null,
    setPriceCacheEntry:(card,source,entry)=>{cache[card.id]=entry;},applyWisdomGuildPrice:(card,result)=>{cache[card.id]={valueJpy:result.price,updatedAt:Date.now()};},
    fetchWisdomGuildPriceForCard:fetcher,persist:async()=>{c.saves++;},saves:0,updateWisdomGuildSettingsUi(){},renderCollection(){},showToast(){c.toasts++;},toasts:0,
    nameOf:()=>'',normalizeCardCondition:()=>'',formatYen:()=>'',wisdomGuildConditionForCard:()=>'',wisdomGuildSetForCard:()=>'',wisdomGuildNoListingOutdated:()=>false};
  vm.createContext(c);vm.runInContext(fn,c);return c;
}
// 40 stale cards and 5 never priced: the batch takes 30, never-priced first, then oldest; no listing is remembered with a date.
const cards=Array.from({length:45},(_,i)=>({id:'c'+i})),cache={};
cards.forEach((card,i)=>{if(i>=5)cache[card.id]={valueJpy:100,updatedAt:now-(8+i)*DAY};});
cache.c44.updatedAt=now-DAY; // fresh: never chosen
const asked=[];
let c=context(cards,cache,async card=>{asked.push(card.id);return card.id==='c0'?null:{price:200};});
await c.hydrateWisdomGuildPrices({automatic:true,quiet:true});
assert.equal(asked.length,30);
assert.deepEqual(asked.slice(0,5),['c0','c1','c2','c3','c4']);
assert.equal(asked[5],'c43','oldest stale price next');
assert.ok(!asked.includes('c44'),'a price newer than a week is not refreshed');
assert.equal(cache.c0.noListing,true);assert.equal(cache.c0.valueJpy,null);assert.ok(cache.c0.updatedAt>=now);
assert.equal(c.state.wisdomGuild.lastStats,'manual result','quiet runs keep the manual run summary');
assert.equal(c.toasts,0);assert.ok(c.saves<=4,'saved in groups of 10, not after every card');
// The next session does not ask again for the card without a listing.
asked.length=0;c=context(cards,cache,async card=>{asked.push(card.id);return {price:300};});
await c.hydrateWisdomGuildPrices({automatic:true,quiet:true});
assert.ok(!asked.includes('c0'));
// Three failures in a row stop the background run.
const failing=Array.from({length:10},(_,i)=>({id:'f'+i}));let calls=0;
c=context(failing,{},async()=>{calls++;throw Error('relay down');});
await c.hydrateWisdomGuildPrices({automatic:true,quiet:true});
assert.equal(calls,3);
console.log('PASS: weekly batch of 30 (unpriced, then oldest), no-listing remembered, quiet summary, grouped saves, stop after 3 failures.');
})().catch(error=>{console.error(error);process.exitCode=1;});
