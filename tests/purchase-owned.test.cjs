const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
const pick=name=>{const start=code.indexOf(`function ${name}(`);assert(start>=0,name);let depth=0,i=code.indexOf(') {',start)+2;for(;i<code.length;i++){if(code[i]==='{')depth++;else if(code[i]==='}'&&--depth===0)break;}return code.slice(start,i+1);};
const c={URLSearchParams,state:{collection:[]},normalizeCardName:s=>String(s||'').trim().toLowerCase()};vm.createContext(c);
vm.runInContext(['isSameOwnedCardName','sameCardNameOwnedTotal','purchaseOwnedCounts','purchaseOwnedLabel'].map(pick).join('\n'),c);
const bolt='4457ed35-7c10-48c8-9776-456485fdf070';
c.state.collection=[
 {oracleId:bolt,name:'Lightning Bolt',set:'M11',collectorNumber:'149',language:'ja',finish:'nonfoil',quantity:2},
 {oracleId:bolt,name:'Lightning Bolt',set:'m11',collectorNumber:'149',language:'en',finish:'foil',quantity:1},
 {oracleId:bolt,name:'Lightning Bolt',set:'2X2',collectorNumber:'117',quantity:3},
 {oracleId:'other',name:'Shock',set:'M11',collectorNumber:'149',quantity:5},
];
const planned={oracleId:bolt,name:'Lightning Bolt',set:'M11',collectorNumber:'149',language:'en',finish:'foil'};
// The same printing counts every language and finish; the total counts every printing of the card, never other cards.
assert.deepEqual({...c.purchaseOwnedCounts(planned,c.state.collection)},{samePrint:3,sameName:6});
assert.equal(c.purchaseOwnedLabel(planned),'所持 3枚（同名6）');
assert.equal(c.purchaseOwnedLabel({...planned,set:'LEA',collectorNumber:'161'}),'所持 0枚（同名6）');
assert.equal(c.purchaseOwnedLabel({oracleId:'none',name:'Black Lotus',set:'LEA',collectorNumber:'232'}),'未所持');
// When every owned copy is this printing, the label gives one number.
const saved=c.state.collection;c.state.collection=saved.slice(0,2);
assert.equal(c.purchaseOwnedLabel(planned),'所持 3枚');
c.state.collection=saved;
// The card shows the owned label; Wisdom Guild, other artworks and delete live in the … menu.
assert.match(pick('renderPurchases'),/purchase-owned[\s\S]*purchaseOwnedLabel\(card\)/);
assert.match(pick('renderPurchases'),/<details class="purchase-menu">[\s\S]*purchaseWisdomGuildUrl\(card\)[\s\S]*data-purchase-action="artworks"[\s\S]*data-purchase-action="delete"/);
// Other owned artworks: same card, another illustration (or another printing when artwork is unknown).
vm.runInContext(['cardIllustrationKey','purchaseOtherArtworks','purchaseWisdomGuildUrl','wisdomGuildPriceUrl','wisdomGuildSharedPriceParams','wisdomGuildCardPath','wisdomGuildLanguageForCard','wisdomGuildSetForCard','wisdomGuildPriceNames','purchasePriceLine','purchasePriceSummary'].map(pick).join(';')+';const WISDOM_GUILD_PRICE_BASE="https://wonder.wisdom-guild.net/price";const WISDOM_GUILD_SET_CODES={};',c);
c.state.collection=[
 {oracleId:bolt,name:'Lightning Bolt',set:'M11',collectorNumber:'149',illustrationId:'artA',quantity:2},
 {oracleId:bolt,name:'Lightning Bolt',set:'M10',collectorNumber:'146',illustrationId:'artA',quantity:1},
 {oracleId:bolt,name:'Lightning Bolt',set:'2X2',collectorNumber:'117',illustrationId:'artB',quantity:3},
 {oracleId:bolt,name:'Lightning Bolt',set:'STA',collectorNumber:'42',illustrationId:'artC',quantity:0},
 {oracleId:bolt,name:'Lightning Bolt',set:'LEA',collectorNumber:'161',quantity:1},
 {oracleId:'other',name:'Shock',set:'M11',collectorNumber:'150',illustrationId:'artZ',quantity:4},
];
const groups=c.purchaseOtherArtworks({...planned,illustrationId:'artA'},c.state.collection);
assert.deepEqual([...groups.map(g=>g.map(l=>l.set).join())],['2X2','LEA']);
// Without artwork data on the plan, only other printings count.
assert.deepEqual([...c.purchaseOtherArtworks(planned,c.state.collection).map(g=>g[0].set)],['M10','2X2','LEA']);
// Wisdom Guild link: the card's price page narrowed to its set and language, cheapest first.
c.isJapanese=s=>/[ぁ-んァ-ン一-龯]/.test(s||'');c.nameOf=card=>card.printedName||card.name;
const url=new URL(c.purchaseWisdomGuildUrl({...planned,printedName:'稲妻',language:'ja'}));
assert.equal(url.origin+url.pathname,'https://wonder.wisdom-guild.net/price/Lightning+Bolt/');
assert.deepEqual([url.searchParams.get('lang[]'),url.searchParams.get('set[]'),url.searchParams.get('sort')],['JPN','M11','price']);
// Reference prices use the app's price order; unpriced cards are left out of the total and counted.
c.yenValueOf=card=>card.yen==null?null:card.yen*card.quantity;c.cardPriceLabel=card=>'Scryfall参考 ¥'+card.yen+' / 枚';c.formatYen=v=>'¥'+v;
// Each card shows the price of one copy only (v406), whatever the planned quantity.
c.unitYenValueOf=card=>card.yen;
assert.equal(c.purchasePriceLine({yen:100,quantity:3}),'参考 ¥100');
assert.equal(c.purchasePriceLine({yen:null,quantity:2}),'価格なし');
assert.equal(c.purchasePriceSummary([{yen:100,quantity:3},{yen:null,quantity:1}]),'参考合計 ¥300（価格なし1種を除く）');
// The setting is saved, restored from backups, and hides both the line and the total.
assert.ok(code.includes('purchasePriceDisplay: appStorage.getItem(KEYS.purchasePriceDisplay) === "hidden" ? "hidden" : "shown"'));
assert.match(code,/settings: \{[^}]*purchasePriceDisplay: state.purchasePriceDisplay/);
assert.ok(pick('renderPurchases').includes('state.purchasePriceDisplay === "shown" ? `<span class="purchase-price"'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(html.includes('<select id="purchasePriceDisplay"><option value="shown">表示する</option><option value="hidden">表示しない</option>'));
assert.match(html,/id="purchaseArtworksDialog"/);
console.log('purchase owned counts ok');
