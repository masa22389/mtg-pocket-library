const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const c = { window: {} };
vm.createContext(c);
for (const file of ['mtg-jp-card-index.js', 'mtgjson-jp-search-index.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c);
c.MTG_JP_CARD_INDEX = c.window.MTG_JP_CARD_INDEX;
c.JP_CARD_SEARCH_INDEX = [...c.MTG_JP_CARD_INDEX, ...c.window.MTGJSON_JP_SEARCH_INDEX];
for (const name of ['JP_INDEX_BY_SCRYFALL_ID', 'JP_INDEX_BY_ORACLE_ID', 'JP_INDEX_BY_EN_NAME', 'JP_STANDALONE_NAMES', 'JP_ALIAS_TARGETS_EXACT']) c[name] = new Map();
for (const name of ['normalizeDisplayName', 'normalizeCardName', 'stripJapaneseReadings', 'normalizeAliasKey', 'isJapanese', 'pushUniqueTarget', 'buildJpSearchIndexes', 'betterJapaneseIndexItem', 'preferredIndexedJapaneseName', 'jpIndexCardTitles', 'jpIndexNames', 'jpIndexNormalizedNames', 'jpIndexMatchesQuery', 'scryfallNameQuery', 'buildLocalIndexScryfallQuery', 'buildLocalIndexScryfallQueryChunks', 'scoreJapaneseDisplayName', 'sortJapaneseDisplayNames', 'localizeJapaneseFaceNames', 'displayJaNamesForIndexItem', 'splitDisplayNamesForFaces', 'joinedDisplayNameForFaces', 'cardSearchNames', 'jpIndexForCard', 'jpIndexMatchesCard', 'jpIndexImageMatchesCard', 'applyJpIndexToCard', 'cardLanguage', 'isJapaneseCard', 'isEnglishCard', 'shouldLocalizeDisplay', 'prefersJapaneseDisplay', 'nameOf']) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  const lineEnd = code.indexOf('\n', start);
  const end = code.slice(start, lineEnd).trimEnd().endsWith('}') ? lineEnd : code.indexOf('\n}', start) + 2;
  vm.runInContext(code.slice(start, end), c);
}
c.buildJpSearchIndexes();

const start=code.indexOf('function collectionCardMatchesText(');vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);
const borrower={id:'owned-lot',scryfallId:'25d309d6-9e56-441e-bd29-5c903d5221bf',oracleId:'c7b044c3-3cfa-407e-bf20-2875e8e04b7b',name:'Brazen Borrower // Petty Theft',printedName:'Brazen Borrower // Petty Theft',typeLine:'Creature — Faerie Rogue',setName:'Throne of Eldraine',location:'バインダーA'};
assert.equal([borrower.name,borrower.printedName].join(' ').toLowerCase().includes('厚かましい借り手'),false,'old stored-only search misses the Japanese name');
for(const query of ['厚かましい借り手','借り手','些細な盗み','Brazen Borrower','Petty Theft','ｂｒａｚｅｎ ｂｏｒｒｏｗｅｒ','Faerie','バインダーA','Eldraine',''])assert.equal(c.collectionCardMatchesText(borrower,query),true,query);
for(const name of ['Brazen Borrower','Brazen Borrower // Petty Theft'])assert.ok(c.collectionCardMatchesText({name},'厚かましい借り手'),'legacy name-only fallback');
assert.ok(c.collectionCardMatchesText({printedName:'厚（あつ）かましい借（か）り手（て） // 些（さ）細（さい）な盗（ぬす）み'},'厚かましい借り手'));
assert.ok(c.collectionCardMatchesText({name:'Fire // Ice'},'氷'));
assert.ok(c.collectionCardMatchesText({name:'Delver of Secrets // Insectile Aberration'},'昆虫の逸脱者'));
assert.ok(c.collectionCardMatchesText({card_faces:[{printed_name:'表のカード'},{printed_name:'裏のカード'}]},'裏のカード'));
assert.equal(c.collectionCardMatchesText(borrower,'思考を築く者、ジェイス'),false);assert.equal(c.collectionCardMatchesText({name:'Lightning Bolt'},'厚かましい借り手'),false);
const before=JSON.stringify(borrower);c.collectionCardMatchesText(borrower,'厚かましい借り手');assert.equal(JSON.stringify(borrower),before);
console.log('PASS owned search: English-only adventure, Japanese aliases/readings, split/transform faces, legacy names, metadata, nonmatching cards, no stored-data mutation');

// Exercise the deck-specific pipeline, including grouping and its other filters.
const deckStart = code.indexOf('function groupedOwnedDeckCards(');
vm.runInContext(code.slice(deckStart, code.indexOf('\n}', deckStart) + 2), c);
c.state = {collection: [{...borrower, quantity: 2, colors: ['U'], manaValue: 3}, {...borrower, id:'second-lot', quantity: 1, colors: ['U'], manaValue: 3}, {id:'bolt',name:'Lightning Bolt',quantity:1,colors:['R'],manaValue:1}]};
c.els = {deckOwnedColor:{value:''},deckOwnedMana:{value:''},deckOwnedType:{value:''},deckOwnedFavoriteGroup:{value:''}};
c.favoriteGroupMatch = () => true;
for (const query of ['厚かましい借り手','些細な盗み','Brazen Borrower']) {
 const result = c.groupedOwnedDeckCards(query);
 assert.equal(result.length,1,query);
 assert.equal(result[0].card.id,borrower.id);
 assert.equal(result[0].quantity,3,'owned lots remain grouped');
}
c.els.deckOwnedColor.value='R';assert.equal(c.groupedOwnedDeckCards('厚かましい借り手').length,0);
c.els.deckOwnedColor.value='U';assert.equal(c.groupedOwnedDeckCards('厚かましい借り手').length,1);
c.els.deckOwnedMana.value='2';assert.equal(c.groupedOwnedDeckCards('厚かましい借り手').length,0);
c.els.deckOwnedMana.value='';c.favoriteGroupMatch=()=>false;assert.equal(c.groupedOwnedDeckCards('厚かましい借り手').length,0);
console.log('PASS deck-owned search: Japanese adventure aliases, grouped quantities, color/mana/favorite filters');
