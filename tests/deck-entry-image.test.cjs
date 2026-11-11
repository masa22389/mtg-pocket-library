const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// The deck card screen's picture: redrawing it (changing a count, reopening the same card) must not put the
// English placeholder back, because the Japanese image swap only runs when data-japanese-image changes.
const start = code.indexOf('function setDeckEntryImage(card) {');
assert(start >= 0);
const source = code.slice(start, code.indexOf('\n}\n', start) + 3);
const attrs = {}, image = {
  dataset: {}, style: {}, src: '',
  setAttribute(name, value) { attrs[name] = value; }, removeAttribute(name) { delete attrs[name]; },
};
const c = {
  els: { deckEntryImage: image },
  prefersJapaneseDisplay: card => card.language === 'ja',
  localizedImageAttrs: card => `data-japanese-image="${card.set}:${card.collectorNumber}"`,
  document: { createElement: () => { const holder = { set innerHTML(html) { const value = /data-japanese-image="([^"]*)"/.exec(html)?.[1]; holder.firstElementChild = { getAttribute: () => value }; } }; return holder; } },
};
vm.createContext(c);
vm.runInContext(source, c);

const predict = { set: 'ODY', collectorNumber: '94', language: 'ja', image: 'https://cards.scryfall.io/placeholder.jpg' };
c.setDeckEntryImage(predict);
assert.equal(image.src, predict.image);
assert.equal(attrs['data-japanese-image'], 'ODY:94');
image.src = 'https://shop.example/predict-ja.jpg'; // the swap put the Japanese picture in
c.setDeckEntryImage(predict); // e.g. after メイン ＋
assert.equal(image.src, 'https://shop.example/predict-ja.jpg', 'a redraw keeps the Japanese picture');
// Another card, then back: both are set again, so the swap runs again for each.
const other = { set: 'M19', collectorNumber: '314', language: 'en', image: 'https://cards.scryfall.io/elves.jpg' };
c.setDeckEntryImage(other);
assert.equal(image.src, other.image);
assert.equal(attrs['data-japanese-image'], undefined);
c.setDeckEntryImage(predict);
assert.equal(image.src, predict.image);
assert.equal(attrs['data-japanese-image'], 'ODY:94');
// renderDeckEntryEditor uses it instead of setting src itself.
const render = code.slice(code.indexOf('function renderDeckEntryEditor() {'), code.indexOf('function renderDeckEntryEditor() {') + 2500);
assert(render.includes('  setDeckEntryImage(card);\n'));
assert(!render.includes('els.deckEntryImage.src ='));
console.log('deck entry image ok');
