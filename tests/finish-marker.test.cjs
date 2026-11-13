const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const c = {};
vm.createContext(c);
for (const name of ['cardIsFoilOnly', 'cardFinishKind', 'defaultCardFinish', 'cardFinishBadge', 'cardFinishClass', 'cardFinishText']) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  vm.runInContext(code.slice(start, code.indexOf('\n}', start) + 2), c);
}

// Foil and Etched lots are marked; normal lots and cards without a finish are not.
assert.equal(c.cardFinishKind({ finish: 'foil' }), 'foil');
assert.equal(c.cardFinishKind({ finish: 'etched' }), 'etched');
assert.equal(c.cardFinishKind({ finish: 'normal', finishes: ['nonfoil', 'foil'] }), '');
assert.equal(c.cardFinishKind({ name: 'Added from search' }), '');
assert.equal(c.cardFinishKind(null), '');
// A saved lot shows its own 仕様, even on a print Scryfall lists as Foil-only (the Japanese PW23 #8 紅蓮破 is
// listed as Foil-only but the owned copy is normal). Only a card with no 仕様 falls back to the print's finishes.
assert.equal(c.cardFinishKind({ finish: 'normal', finishes: ['foil'] }), '');
assert.equal(c.cardFinishKind({ finish: 'normal', foil: true, nonfoil: false }), '');
assert.equal(c.cardFinishKind({ finishes: ['foil'] }), 'foil');
assert.equal(c.cardFinishKind({ foil: true, nonfoil: false }), 'foil');
// A new lot of a Foil-only print starts as Foil in the card screen (and when added from a deck); others start normal.
assert.equal(c.defaultCardFinish({ finishes: ['foil'] }), 'foil');
assert.equal(c.defaultCardFinish({ foil: true, nonfoil: false }), 'foil');
assert.equal(c.defaultCardFinish({ finishes: ['etched'] }), 'etched');
assert.equal(c.defaultCardFinish({ finishes: ['nonfoil', 'foil'] }), 'normal');
assert.equal(c.defaultCardFinish({ finishes: ['nonfoil'] }), 'normal');
assert.equal(c.defaultCardFinish(null), 'normal');
assert(code.includes('els.cardFinish.value = owned?.finish || defaultCardFinish(card);'));
assert(code.includes('    finish: defaultCardFinish(card),'));

assert.equal(c.cardFinishBadge({ finish: 'foil' }), '<span class="finish-badge finish-foil">Foil</span>');
assert.equal(c.cardFinishBadge({ finish: 'etched' }), '<span class="finish-badge finish-etched">Etched</span>');
assert.equal(c.cardFinishBadge({ finish: 'normal' }), '');
assert.equal(c.cardFinishClass({ finish: 'foil' }), 'finish-card finish-card-foil');
assert.equal(c.cardFinishClass({ finish: 'normal' }), '');
assert.equal(c.cardFinishText({ finish: 'normal' }), '通常');
assert.equal(c.cardFinishText({ finish: 'foil' }), '<b class="finish-text finish-foil">Foil</b>');

// All three places draw the marker: collection images, collection list thumbnails and the deck editor.
assert(code.includes('class="collection-image-card ${cardFinishClass(card)}"'));
assert(code.includes('<span class="collection-thumb-wrap ${cardFinishClass(card)}">'));
assert(code.includes('const classes = ["deck-content-card", cardFinishClass(card),'));
assert.equal(code.split('${cardFinishBadge(card)}').length - 1, 3);
// The deck's owned-card picker spells the finish out, since lots of one print differ only by it.
assert(code.includes('${cardFinishKind(card) ? ` · ${cardFinishText(card)}` : ""}'));
// The sheen uses ::before, since a missing deck card already uses ::after, and never blocks taps.
assert(/\.finish-card::before\{[^}]*pointer-events:none/.test(css));
assert(/\.finish-badge\{[^}]*top:5px;right:5px/.test(css));
console.log('PASS finish marker');

// The collection filter has "Foil only", which uses the same check as the marker and is cleared with the others.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dialog = html.slice(html.indexOf('id="collectionFilterDialog"'), html.indexOf('</dialog>', html.indexOf('id="collectionFilterDialog"')));
assert(dialog.includes('<input id="collectionFoilOnly" type="checkbox"><span>Foilのみ</span>'));
assert(code.includes('return (!foilOnly || cardFinishKind(card)) && (!underFour'));
assert(code.includes('if ($("#collectionFoilOnly").checked) chips.push("Foilのみ");'));
assert(code.includes('$("#collectionFoilOnly").addEventListener("change", showFilteredCollection);'));
assert(code.includes('$("#collectionFoilOnly").checked = false;'));
console.log('PASS foil-only filter');
