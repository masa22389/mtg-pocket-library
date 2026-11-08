const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const c = { window: {} };
vm.createContext(c);
for (const file of ['mtg-jp-card-index.js', 'mtgjson-jp-search-index.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c);
c.MTG_JP_CARD_INDEX = c.window.MTG_JP_CARD_INDEX;
c.JP_CARD_SEARCH_INDEX = [...c.MTG_JP_CARD_INDEX, ...c.window.MTGJSON_JP_SEARCH_INDEX];
for (const name of ['JP_INDEX_BY_SCRYFALL_ID', 'JP_INDEX_BY_ORACLE_ID', 'JP_INDEX_BY_EN_NAME', 'JP_STANDALONE_NAMES', 'JP_ALIAS_TARGETS_EXACT']) c[name] = new Map();
const take = name => {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  const lineEnd = code.indexOf('\n', start);
  const end = code.slice(start, lineEnd).trimEnd().endsWith('}') ? lineEnd : code.indexOf('\n}', start) + 2;
  vm.runInContext(code.slice(start, end), c);
};
['normalizeDisplayName', 'normalizeCardName', 'stripJapaneseReadings', 'normalizeAliasKey', 'isJapanese', 'pushUniqueTarget', 'buildJpSearchIndexes', 'betterJapaneseIndexItem', 'preferredIndexedJapaneseName', 'jpIndexCardTitles', 'jpIndexNames', 'jpIndexNormalizedNames', 'scoreJapaneseDisplayName', 'sortJapaneseDisplayNames', 'localizeJapaneseFaceNames', 'displayJaNamesForIndexItem', 'splitDisplayNamesForFaces', 'joinedDisplayNameForFaces',
  'deckExportUsesFullName', 'deckExportJapaneseName', 'deckExportName', 'deckExportLines', 'buildDeckExportText', 'deckExportFileName', 'parseDeckImportText'].forEach(take);
c.buildJpSearchIndexes();
vm.runInContext('function cardForDeckEntry(entry) { return entry.card || null; }', c);

const card = (name, extra = {}) => ({ name, ...extra });
const entry = (section, quantity, name, extra) => ({ section, quantity, card: card(name, extra) });
// The user's Mono-Green Landfall list (part), with a second print of one card.
const deck = { name: 'Mono-Green Landfall', format: 'スタンダード', entries: [
  entry('main', 4, 'Llanowar Elves'),
  entry('main', 1, "Meltstrider's Resolve"),
  entry('main', 7, 'Forest', { set: 'FDN' }),
  entry('main', 6, 'Forest', { set: 'TDM' }),
  entry('side', 2, 'Surrak, Elusive Hunter'),
  entry('side', 3, "Meltstrider's Resolve"),
  entry('maybe', 1, 'Torpor Orb'),
] };
const arena = c.buildDeckExportText(deck, 'arena');
assert.equal(arena, "Deck\n4 Llanowar Elves\n1 Meltstrider's Resolve\n13 Forest\n\nSideboard\n2 Surrak, Elusive Hunter\n3 Meltstrider's Resolve");
assert.equal(c.buildDeckExportText(deck, 'mtgo'), "4 Llanowar Elves\n1 Meltstrider's Resolve\n13 Forest\n\nSideboard\n2 Surrak, Elusive Hunter\n3 Meltstrider's Resolve");
assert.equal(c.buildDeckExportText(deck, 'arena-ja'), 'デッキ\n4 ラノワールのエルフ\n1 溶かし歩きの消散\n13 森\n\nサイドボード\n2 神出鬼没の狩人、スーラク\n3 溶かし歩きの消散');

// Two-faced cards: front face, except split cards and rooms, which MO writes with a slash.
const dfc = card('Delver of Secrets // Insectile Aberration', { typeLine: 'Creature — Human Wizard // Creature — Human Insect' });
const adventure = card('Bonecrusher Giant // Stomp', { typeLine: 'Creature — Giant // Instant — Adventure' });
const split = card('Fire // Ice', { typeLine: 'Instant // Instant' });
const room = card('Bottomless Pool // Locker Room', { typeLine: 'Enchantment — Room // Enchantment — Room' });
assert.equal(c.deckExportName(dfc, 'arena'), 'Delver of Secrets');
assert.equal(c.deckExportName(adventure, 'mtgo'), 'Bonecrusher Giant');
assert.equal(c.deckExportName(split, 'arena'), 'Fire // Ice');
assert.equal(c.deckExportName(split, 'mtgo'), 'Fire/Ice');
assert.equal(c.deckExportName(room, 'arena'), 'Bottomless Pool // Locker Room');
assert.equal(c.deckExportName(card('Commit // Memory', { layout: 'aftermath' }), 'mtgo'), 'Commit/Memory');
assert.equal(c.deckExportName(card('Brazen Borrower // Petty Theft', { layout: 'adventure', typeLine: 'Instant // Instant' }), 'arena'), 'Brazen Borrower');
// Without a Japanese name the English name is used.
assert.equal(c.deckExportName(card('Not A Real Card Name'), 'arena-ja'), 'Not A Real Card Name');

// Commander: its own heading on Arena, the sideboard on MO; candidates never appear.
const edh = { format: '統率者戦', entries: [entry('commander', 1, 'Surrak, Elusive Hunter'), entry('main', 1, 'Llanowar Elves'), entry('maybe', 1, 'Forest')] };
assert.equal(c.buildDeckExportText(edh, 'arena'), 'Commander\n1 Surrak, Elusive Hunter\n\nDeck\n1 Llanowar Elves');
assert.equal(c.buildDeckExportText(edh, 'arena-ja'), '統率者\n1 神出鬼没の狩人、スーラク\n\nデッキ\n1 ラノワールのエルフ');
assert.equal(c.buildDeckExportText(edh, 'mtgo'), '1 Llanowar Elves\n\nSideboard\n1 Surrak, Elusive Hunter');
assert.equal(c.buildDeckExportText({ entries: [entry('maybe', 1, 'Forest')] }, 'arena'), '');

assert.equal(c.deckExportFileName({ name: 'Mono-Green Landfall' }), 'Mono-Green Landfall.txt');
assert.equal(c.deckExportFileName({ name: 'a/b:c?' }), 'a b c.txt');
assert.equal(c.deckExportFileName({ name: '' }), 'deck.txt');

// What the export writes reads back into the same sections.
const sections = text => Array.from(c.parseDeckImportText(text).rows).map(row => `${row.section}:${row.quantity} ${row.name}`);
const expected = ['main:4 Llanowar Elves', "main:1 Meltstrider's Resolve", 'main:13 Forest', 'side:2 Surrak, Elusive Hunter', "side:3 Meltstrider's Resolve"];
assert.deepEqual(sections(arena), expected);
assert.deepEqual(sections(c.buildDeckExportText(deck, 'mtgo')), expected);
assert.equal(c.parseDeckImportText(arena).skipped.length, 0);
assert.deepEqual(sections(c.buildDeckExportText(edh, 'arena-ja')), ['commander:1 神出鬼没の狩人、スーラク', 'main:1 ラノワールのエルフ']);
assert.deepEqual(sections(c.buildDeckExportText(edh, 'mtgo')), ['main:1 Llanowar Elves', 'side:1 Surrak, Elusive Hunter']);
console.log('PASS deck export');
