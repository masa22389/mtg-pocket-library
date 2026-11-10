const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const c = {};
vm.createContext(c);
for (const name of ['cardIsFoilOnly', 'cardFinishKind', 'cardFinishBadge', 'cardFinishClass', 'cardFinishText']) {
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
// A print that only exists in foil is foil, the same as for prices.
assert.equal(c.cardFinishKind({ finish: 'normal', finishes: ['foil'] }), 'foil');
assert.equal(c.cardFinishKind({ foil: true, nonfoil: false }), 'foil');

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
