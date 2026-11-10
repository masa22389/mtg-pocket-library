const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

// "Decks with this card" and "Price" are accordions in the card dialog, with a one-line summary in the header.
assert(html.includes('<details id="cardDeckUsage" class="card-deck-usage card-accordion" hidden>'));
assert(html.includes('<summary><span>入っているデッキ</span><small id="cardDeckUsageSummary"></small></summary>'));
assert(html.includes('<details id="manualPricePanel" class="manual-price-panel card-accordion" hidden>'));
assert(html.includes('<summary><span>価格</span><small id="cardPriceShort"></small></summary>'));
// The price controls stay inside the price accordion.
const price = html.slice(html.indexOf('id="manualPricePanel"'), html.indexOf('</details>', html.indexOf('id="manualPricePanel"')));
for (const id of ['cardPriceSummary', 'refreshCardPriceButton', 'manualPriceInput', 'saveManualPriceButton', 'purchasePriceInput', 'cardPurchaseSummary']) assert(price.includes(`id="${id}"`), id);
// Neither starts open: both are closed whenever a card opens.
assert(!/id="(cardDeckUsage|manualPricePanel)"[^>]*\sopen/.test(html));
assert(code.includes('if (els.cardDeckUsage) els.cardDeckUsage.open = false;'));
assert(code.includes('if (els.manualPricePanel) els.manualPricePanel.open = false;'));
assert(code.includes('`${usage.length}デッキ・使用${used}枚`'));
// The header is a tap target of at least 44px.
assert(/\.card-accordion summary\{[^}]*min-height:44px/.test(css));
console.log('PASS card accordions');
