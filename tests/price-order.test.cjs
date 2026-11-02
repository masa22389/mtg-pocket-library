const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const fn=code.slice(code.indexOf('// The order is fixed:'),code.indexOf('function unitYenValueOf('));
let token='';
const c={state:{fx:{usdJpy:150},priceCache:{}},cardTraderToken:()=>token,
  priceCacheEntryForCard:(card,source)=>card.cache?.[source]||null,priceCacheFinish:card=>card.foilOnly?'foil':(card.finish||'normal')};
vm.createContext(c);vm.runInContext(fn,c);
const card=(extra)=>({quantity:1,finish:'normal',cache:{},...extra});
const shown=x=>({source:c.selectedPriceSource(x),yen:c.yenValueOf(x)});
// The order never changes: manual, Wisdom Guild, Scryfall, then CardTrader.
assert.deepEqual(JSON.parse(JSON.stringify(c.priceSourceOrder())),['manual','wisdom-guild','scryfall']);
const all=card({priceUsd:'2.00',priceUsdSource:'scryfall',cache:{manual:{valueJpy:999},'wisdom-guild':{valueJpy:500},cardtrader:{valueJpy:700}}});
token='t';
assert.deepEqual(shown(all),{source:'manual',yen:999});
delete all.cache.manual;assert.deepEqual(shown(all),{source:'wisdom-guild',yen:500});
delete all.cache['wisdom-guild'];assert.deepEqual(shown(all),{source:'scryfall',yen:300},'Scryfall ($2 x 150) before CardTrader');
all.priceUsd=null;assert.deepEqual(shown(all),{source:'cardtrader',yen:700});
// CardTrader is used only while its token is set.
token='';assert.deepEqual(shown(all),{source:'',yen:null});
// A dollar price CardTrader wrote into the card fields is not taken for Scryfall's.
const ctField=card({priceUsd:'5.00',priceUsdSource:'cardtrader'});
token='';assert.equal(c.yenValueOf(ctField),null);
token='t';assert.deepEqual(shown(ctField),{source:'cardtrader',yen:750});
// Foil-only printings stored as "normal" use the foil dollar price.
token='';const foilOnly=card({foilOnly:true,priceUsdFoil:'4.00',priceUsdFoilSource:'scryfall',priceUsdFoilFromEnglish:true});
assert.deepEqual(shown(foilOnly),{source:'scryfall',yen:600});assert.equal(c.selectedPriceUsesEnglish(foilOnly),true);
console.log('PASS: fixed order manual > Wisdom Guild > Scryfall > CardTrader (token only), CardTrader dollar fields not taken as Scryfall, foil-only uses foil price.');
