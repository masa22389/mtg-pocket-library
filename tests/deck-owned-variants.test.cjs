const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const c = { normalizeCardName: name => String(name || '').toLowerCase() };
vm.createContext(c);
for (const name of ['isSameOwnedCardName', 'deckEntryOwnedAlternatives']) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  vm.runInContext(code.slice(start, code.indexOf('\n}', start) + 2), c);
}

// Other owned lots of the same card, in any language, art or finish; never the lot the entry already uses,
// another card, or a lot with no copies left.
const card = { oracleId: 'flooded', name: 'Flooded Strand' };
const collection = [
  { id: 'current', oracleId: 'flooded', quantity: 4, language: 'en' },
  { id: 'ja-art', oracleId: 'flooded', quantity: 2, language: 'ja' },
  { id: 'en-foil', oracleId: 'flooded', quantity: 1, language: 'en', finish: 'foil' },
  { id: 'none-left', oracleId: 'flooded', quantity: 0 },
  { id: 'other-card', oracleId: 'polluted', quantity: 4 },
];
assert.deepEqual(Array.from(c.deckEntryOwnedAlternatives({ cardId: 'current' }, card, collection)).map(lot => lot.id), ['ja-art', 'en-foil']);
// An entry added from search (not linked to a lot) can switch to any owned lot of the card.
assert.deepEqual(Array.from(c.deckEntryOwnedAlternatives({ cardId: 'scryfall-x' }, card, collection)).map(lot => lot.id), ['current', 'ja-art', 'en-foil']);
assert.deepEqual(Array.from(c.deckEntryOwnedAlternatives(null, card, collection)), []);

// The dialog shows the list, and a tap links the entry to the chosen lot itself.
assert(html.includes('<section id="deckEntryOwnedVariants" class="deck-entry-owned-variants" hidden>'));
assert(html.includes('<h3>所持している別イラストに変更</h3>'));
assert(code.includes('if (lot) replaceDeckEntryVariant(lot, lot.id);'));
assert(code.includes('function replaceDeckEntryVariant(card, newCardId = `scryfall-${card?.id}`) {'));
assert(code.includes('  renderDeckEntryOwnedVariants(entry, card);\n}'));
console.log('PASS deck owned variants');
