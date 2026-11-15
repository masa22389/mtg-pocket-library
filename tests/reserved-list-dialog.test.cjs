const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const code=read('app.js'),html=read('index.html'),css=read('styles.css');
const lotus='lotus-oracle',city='city-oracle',bolt='bolt-oracle';
const c={window:{MTG_RESERVED_LIST:[[lotus,'Black Lotus'],[city,'City of Traitors']]},state:{fx:{usdJpy:150}},
  formatYen:v=>`¥${v.toLocaleString('en-US')}`};
vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('const RESERVED_LIST ='),code.indexOf('function renderReservedList(')),c);
const english=[
  {oracle_id:city,name:'City of Traitors',lang:'en',set:'exo',set_name:'Exodus',released_at:'1998-06-15',collector_number:'143',id:'city-en',image_uris:{normal:'city-en.jpg'},prices:{usd:'250.00'}},
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'lea',set_name:'Limited Edition Alpha',released_at:'1993-08-05',collector_number:'232',id:'lotus-en',image_uris:{normal:'lotus.jpg'},prices:{usd:null}},
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'lea',set_name:'Limited Edition Alpha',released_at:'1993-08-05',collector_number:'232',id:'dup'},
];
const japanese=[{oracle_id:city,lang:'ja',printed_name:'裏切り者の都',id:'city-ja',image_uris:{normal:'city-ja.jpg'}}];
// A Japanese record with only Scryfall's placeholder picture keeps the Japanese name but not that picture.
{const placeholder=[...c.reservedListRows(english,[{oracle_id:city,lang:'ja',printed_name:'裏切り者の都',id:'city-ja',image_status:'placeholder',image_uris:{normal:'stamp.jpg'}}])].find(row=>row.oracleId===city);assert.equal(placeholder.jaImage,'');assert.equal(placeholder.jaName,'裏切り者の都');assert.equal(placeholder.jaId,'city-ja');}
assert(code.includes('${row.jaId && !row.jaImage ? `data-japanese-image='),'the app looks up its Japanese picture instead');
const rows=[...c.reservedListRows(english,japanese)];
// One row per card: the Japanese first printing gives its picture and name, the English one the price.
assert.equal(rows.length,2);
const cityRow=rows.find(row=>row.oracleId===city);
assert.equal(cityRow.jaName,'裏切り者の都');assert.equal(cityRow.jaImage,'city-ja.jpg');assert.equal(cityRow.jaId,'city-ja');assert.equal(cityRow.usd,250);
const lotusRow=rows.find(row=>row.oracleId===lotus);
assert.equal(lotusRow.jaName,'');assert.equal(lotusRow.usd,null);
// A first printing without a price (Alpha Black Lotus) takes the cheapest priced English printing, with its set.
const others=[{oracle_id:lotus,set:'ced',set_type:'memorabilia',prices:{usd:'2000.00'}},{oracle_id:lotus,set:'30a',set_type:'memorabilia',prices:{usd:'900.00'}},{oracle_id:lotus,set:'wc97',border_color:'gold',prices:{usd:'50.00'}},{oracle_id:lotus,set:'2ed',prices:{usd:'30000.00'}},{oracle_id:lotus,set:'leb',prices:{usd:'45000.00'}},{oracle_id:lotus,set:'ced',prices:{usd:null}}];
const filled=[...c.reservedListRows(english,japanese,others)];
const lotusFilled=filled.find(row=>row.oracleId===lotus);
assert.equal(lotusFilled.usd,30000);assert.equal(lotusFilled.priceSet,'2ED');
assert.equal(c.reservedListPrice(lotusFilled),'¥4,500,000（2ED版）');
assert.equal(filled.find(row=>row.oracleId===city).priceSet,'','a priced first printing keeps its own price');
assert(code.includes('const chunk = unpriced.slice(index, index + 15);'),'oracle IDs go 15 per query, since Scryfall cuts long queries short');
// Expansions in release order: Alpha before Exodus.
assert.deepEqual([...c.reservedListGroups(rows)].map(group=>group.set),['lea','exo']);
// Price: the English first printing in yen at the app's rate, dollars without a rate, 価格なし without a price.
assert.equal(c.reservedListPrice(cityRow),'¥37,500');
assert.equal(c.reservedListPrice(lotusRow),'価格なし');
c.state.fx.usdJpy=0;assert.equal(c.reservedListPrice(cityRow),'$250.00');
// Owned copies in any printing, also old lots found by English name; other cards are not counted.
const owned=c.reservedOwnedCounts([{oracleId:city,quantity:3},{oracleId:city,quantity:1,language:'en'},{name:'Black Lotus',quantity:1},{oracleId:bolt,name:'Lightning Bolt',quantity:4}]);
assert.equal(owned.get(city),4);assert.equal(owned.get(lotus),1);assert.equal(owned.get(bolt),undefined);
// The search tab has the 再録禁止一覧 button (44px tall) and the dialog; the list is fetched by first printing.
assert(html.includes('<button id="openReservedList" class="ghost reserved-list-open" type="button">再録禁止一覧</button>'));
assert(html.includes('<dialog id="reservedListDialog" class="reserved-list-dialog">'));
assert(html.includes('<input id="reservedListQuery" type="search"'));
assert(/\.reserved-list-open\{min-height:44px/.test(css));
assert(/\.reserved-list-search input\{font-size:16px;min-height:44px\}/.test(css));
assert(code.includes('fetchAllScryfallSearch("is:reserved is:firstprint lang:en"'));
assert(code.includes('fetchAllScryfallSearch("is:reserved is:firstprint lang:ja"'));
assert(code.includes('$("#openReservedList").addEventListener("click", () => {')&&code.includes('  $("#reservedListDialog").showModal();\n  scroller.scrollTop = 0;'));
// Saved under its own key for a week; backups list their fields and do not include it.
assert(code.includes('const RESERVED_LIST_CACHE_KEY = "mtg-pocket.reservedListCache.v1";'));
assert(!code.slice(code.indexOf('function backupPayload('),code.indexOf('async function exportBackup(')).includes('reservedList'));
// Tapping a card opens that printing (Japanese for 裏切り者の都), not the search tab's 言語.
{
  const open=code.slice(code.indexOf('async function openReservedListCard('),code.indexOf('function cardFinishClass('));
  assert(open.includes('openCardDialog(card, "set", ownedCardForVariant(card)?.id || null);'));
}
// Each expansion folds (closed unless opened, or matched by a name search); the dialog opens at the top and has 上に戻る.
assert(code.includes('const open = Boolean(query) || reservedListView.openSets.has(group.set);'));
assert(code.includes('<details class="reserved-list-set" data-set="${esc(group.set)}"${open ? " open" : ""}><summary>'));
assert(code.includes('  scroller.scrollTop = 0;\n'));
assert(html.includes('<button id="reservedListTop" class="reserved-list-top" type="button" hidden>↑ 上に戻る</button>'));
assert(/\.reserved-list-top\{position:sticky;[^}]*min-height:44px/.test(css));
assert(/\.reserved-list-set>summary\{[^}]*min-height:48px/.test(css));
console.log('PASS: the 再録禁止一覧 dialog lists first printings by expansion with Japanese pictures, reference prices and owned counts.');
