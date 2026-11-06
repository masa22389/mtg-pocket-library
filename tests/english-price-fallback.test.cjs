(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const take=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const fn=[
  take('function cardColorsFromApi(','\n// Double-faced cards saved before'),
  take('function applyCardMetadata(','\nasync function hydrateEnglishPriceFallbacks'),
  take('async function hydrateEnglishPriceFallbacks(','\n// Startup and every return online'),
].join('\n');
const DAY=86400000;
function context(collection,order,english){
  const calls=[];
  const c={Date,Promise,Map,Set,setTimeout:f=>f(),navigator:{onLine:true},DAY_MS:DAY,state:{collection,useScryfallPrices:true},
    priceSourceOrder:()=>order,cardTraderPriceFresh:card=>card.cardTraderFresh===true,cardIllustrationKey:()=>'',
    persist:async fields=>{calls.push(fields);},renderCollection(){},
    fetchScryfallCollection:async identifiers=>{calls.push(identifiers.length);return {ok:true,json:async()=>({data:identifiers.map(i=>english[`${i.set}:${i.collector_number}`]).filter(Boolean)})};}};
  vm.createContext(c);vm.runInContext(fn,c);return {c,calls};
}
const ja=(id,set,cn,extra={})=>({id,language:'ja',set,collectorNumber:cn,priceUsd:null,priceUsdFoil:null,...extra});
const english={'znr:94':{set:'znr',collector_number:'94',prices:{usd:'0.19',usd_foil:'0.30'}},'mh3:103':{set:'mh3',collector_number:'103',prices:{usd:'10.30'}}};
// 1) Japanese cards get the English printing's dollar price, fetched in one batch and saved.
let cards=[ja('a','ZNR','94'),ja('b','MH3','103'),ja('c','ZNR','94',{condition:'SP'}),{id:'e',language:'en',set:'ZNR',collectorNumber:'94',priceUsd:'0.19',priceUsdSource:'scryfall'}];
let {c,calls}=context(cards,['manual','wisdom-guild','cardtrader'],english);
await c.hydrateEnglishPriceFallbacks();
assert.equal(calls[0],2,'one request for both printings (duplicates merged)');
assert.equal(JSON.stringify(calls[1]),'["collection"]','saved after the batch');
assert.equal(cards[0].priceUsd,'0.19');assert.equal(cards[0].priceUsdFromEnglish,true);assert.equal(cards[0].priceUsdSource,'scryfall');
assert.equal(cards[2].priceUsd,'0.19','every lot of the same printing');
assert.equal(cards[1].priceUsd,'10.30');assert.ok(cards[1].englishPriceUpdatedAt>0);
// 2) The daily metadata refresh from the Japanese printing (no dollar price) keeps the English price.
c.applyCardMetadata(cards[0],{prices:{usd:null,usd_foil:null},legalities:{}});
assert.equal(cards[0].priceUsd,'0.19');assert.ok(cards[0].englishPriceUpdatedAt>0,'not reset, so it is not fetched again every day');
// ...but a real price on the Japanese printing still wins.
c.applyCardMetadata(cards[0],{prices:{usd:'0.50'}});assert.equal(cards[0].priceUsd,'0.50');assert.equal(cards[0].priceUsdFromEnglish,false);
// 3) Scryfall comes before CardTrader: a dollar price CardTrader wrote into the same fields is replaced.
const ctCards=[ja('t','ZNR','94',{priceUsd:'0.25',priceUsdSource:'cardtrader'})];({c}=context(ctCards,['manual','wisdom-guild','scryfall','cardtrader'],english));await c.hydrateEnglishPriceFallbacks();
assert.equal(ctCards[0].priceUsd,'0.19');assert.equal(ctCards[0].priceUsdSource,'scryfall');
// 4) Within a day nothing is fetched again.
calls.length=0;({c,calls}=context(cards,['manual','wisdom-guild','cardtrader'],english));await c.hydrateEnglishPriceFallbacks();
assert.equal(calls.length,0);
console.log('PASS: English dollar prices in one batch per 75, saved per batch, kept through daily refresh, Scryfall ahead of CardTrader.');
})().catch(error=>{console.error(error);process.exitCode=1;});
