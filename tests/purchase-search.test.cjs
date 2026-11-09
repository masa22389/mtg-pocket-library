const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const c = {};
vm.createContext(c);
const start = code.indexOf('function purchaseSearchGroups(');
vm.runInContext(code.slice(start, code.indexOf('\n}', start) + 2), c);

// One result per card, preferring a print in the display language, in search order.
const groups = Array.from(c.purchaseSearchGroups([
  { id: 'a-en', oracle_id: 'a', lang: 'en' },
  { id: 'b-en', oracle_id: 'b', lang: 'en' },
  { id: 'a-ja', oracle_id: 'a', lang: 'ja' },
  { id: 'c', name: 'No Oracle', lang: 'en' },
  {},
], 'ja')).map(card => card.id);
assert.deepEqual(groups, ['a-ja', 'b-en', 'c']);

// The search sits at the top of the purchase tab, before the list.
const view = html.slice(html.indexOf('id="purchasesView"'), html.indexOf('id="purchaseList"'));
for (const id of ['closePurchaseSearchResults', 'purchaseSearchInput', 'purchaseSearchButton', 'purchaseSearchStatus', 'purchaseSearchResults', 'morePurchaseSearchResults']) assert(view.includes(`id="${id}"`), id);
assert(!view.includes('searchLanguage') && !view.includes('advanced'), 'no advanced search in the purchase tab');

// A result opens the card dialog in purchase mode, which hides everything except the print, language,
// condition, finish and purchase quantity.
assert(code.includes('if (card) openCardDialog(card, "purchase");'));
assert(code.includes('classList.toggle("card-purchase-mode", mode === "purchase")'));
const rule = css.slice(css.indexOf('.card-purchase-mode :is('));
for (const part of ['.owned-control', '.same-name-owned-summary', '.card-action-row', '#cardDeckUsage', '#manualPricePanel', '.card-owned-actions', '#favoriteGroupPanel', 'label:has(#cardLocation)']) assert(rule.slice(0, rule.indexOf('{')).includes(part), part);
assert(!rule.slice(0, rule.indexOf('{')).includes('purchase-add-panel'));
// Long results scroll inside their box, and can be closed so the purchase list comes back up.
assert(view.includes('id="closePurchaseSearchResults"'));
assert(/.purchase-search .search-results{max-height:[^}]*overflow:auto/.test(css));
assert(code.includes('$("#closePurchaseSearchResults").hidden = !purchaseSearchCards.length;'));
console.log('PASS purchase search');
