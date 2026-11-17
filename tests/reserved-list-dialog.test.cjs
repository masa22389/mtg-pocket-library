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
// v408: Alpha, Beta, Unlimited and Revised come from their own query, one row per card and printing, with that
// printing's price and no borrowed price; the first-printing list leaves those sets out.
const bazaar='bazaar-oracle';
vm.runInContext("RESERVED_ORACLE_IDS.add('bazaar-oracle')",c);
english.push({oracle_id:bazaar,name:'Bazaar of Baghdad',lang:'en',set:'arn',set_name:'Arabian Nights',released_at:'1993-12-17',collector_number:'70',id:'bazaar-en',prices:{usd:null}});
const early=[
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'lea',set_name:'Limited Edition Alpha',released_at:'1993-08-05',collector_number:'232',id:'lotus-lea',prices:{usd:null}},
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'leb',set_name:'Limited Edition Beta',released_at:'1993-10-04',collector_number:'233',id:'lotus-leb',prices:{usd:'45000.00'}},
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'2ed',set_name:'Unlimited Edition',released_at:'1993-12-01',collector_number:'233',id:'lotus-2ed',prices:{usd:'30000.00'}},
  {oracle_id:lotus,name:'Black Lotus',lang:'en',set:'2ed',id:'lotus-2ed-dup'},
];
const rows=[...c.reservedListRows(english,japanese,[],early)];
assert.equal(rows.length,5,'City, Bazaar, and Lotus in Alpha, Beta and Unlimited');
const cityRow=rows.find(row=>row.oracleId===city);
assert.equal(cityRow.jaName,'裏切り者の都');assert.equal(cityRow.jaImage,'city-ja.jpg');assert.equal(cityRow.jaId,'city-ja');assert.equal(cityRow.usd,250);assert.equal(cityRow.perSet,false);
const lotusRows=rows.filter(row=>row.oracleId===lotus);
assert.deepEqual(lotusRows.map(row=>[row.set,row.id,row.usd,row.priceSet,row.perSet]),[['lea','lotus-lea',null,'',true],['leb','lotus-leb',45000,'',true],['2ed','lotus-2ed',30000,'',true]]);
const lotusRow=lotusRows[0];
// Other first printings without a price take the cheapest priced English printing, with its set.
const others=[{oracle_id:bazaar,set:'ced',set_type:'memorabilia',prices:{usd:'2000.00'}},{oracle_id:bazaar,set:'wc97',border_color:'gold',prices:{usd:'50.00'}},{oracle_id:bazaar,set:'chr',prices:{usd:'3000.00'}},{oracle_id:bazaar,set:'xyz',prices:{usd:'4000.00'}}];
const filled=[...c.reservedListRows(english,japanese,others,early)];
const bazaarFilled=filled.find(row=>row.oracleId===bazaar);
assert.equal(bazaarFilled.usd,3000);assert.equal(bazaarFilled.priceSet,'CHR');
assert.equal(c.reservedListPrice(bazaarFilled),'¥450,000（CHR版）');
assert.equal(filled.find(row=>row.oracleId===city).priceSet,'','a priced first printing keeps its own price');
assert.equal(filled.find(row=>row.set==='lea').usd,null,'Alpha keeps its own (missing) price');
assert(code.includes('const chunk = unpriced.slice(index, index + 15);'),'oracle IDs go 15 per query, since Scryfall cuts long queries short');
assert(code.includes('fetchAllScryfallSearch("is:reserved (set:lea or set:leb or set:2ed or set:3ed) lang:en"'));
// Expansions in release order: Alpha, Beta, Unlimited, Arabian Nights, then Exodus.
assert.deepEqual([...c.reservedListGroups(rows)].map(group=>group.set),['lea','leb','2ed','arn','exo']);
// Price: the English first printing in yen at the app's rate, dollars without a rate, 価格なし without a price.
assert.equal(c.reservedListPrice(cityRow),'¥37,500');
assert.equal(c.reservedListPrice(lotusRow),'価格なし');
c.state.fx.usdJpy=0;assert.equal(c.reservedListPrice(cityRow),'$250.00');
// Owned copies in any printing, also old lots found by English name; other cards are not counted. The Alpha to
// Revised groups count the copies of their own expansion.
const owned=c.reservedOwnedCounts([{oracleId:city,quantity:3},{oracleId:city,quantity:1,language:'en'},{name:'Black Lotus',set:'2ED',quantity:1},{oracleId:lotus,set:'leb',quantity:2},{oracleId:bolt,name:'Lightning Bolt',quantity:4}]);
assert.equal(owned.get(city),4);assert.equal(owned.get(lotus),3);assert.equal(owned.get(bolt),undefined);
vm.runInContext(code.slice(code.indexOf('function reservedRowOwned('),code.indexOf('function renderReservedList(')),c);
assert.deepEqual(lotusRows.map(row=>c.reservedRowOwned(row,owned)),[0,2,1]);
assert.equal(c.reservedRowOwned(cityRow,owned),4);
// One expansion open at a time; a name search keeps every hit open.
{
  const toggle=code.slice(code.indexOf('$("#reservedListSets").addEventListener("toggle"'),code.indexOf('$("#closeReservedList")'));
  assert(toggle.includes('if (!set || $("#reservedListQuery").value.trim()) return;'));
  assert(toggle.includes('reservedListView.openSets = new Set([set]);')&&toggle.includes('other.open = false;'));
}
assert(code.includes('const RESERVED_LIST_CACHE_KEY = "mtg-pocket.reservedListCache.v2";'),'old saved lists without the new groups are fetched again');
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
