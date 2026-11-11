const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

// The deck card's print picker follows the same rule as the card picker:
// ← (top left) goes back to the deck card, × closes the picker and the deck card.
assert(html.includes('<dialog id="deckEntryVariantDialog" autofocus>'));
assert(html.includes('<form method="dialog" class="dialog-card deck-entry-variant-dialog" tabindex="-1">'));
assert(html.includes('<div class="dialog-nav"><button id="deckVariantBackToEntry" class="dialog-back" type="button" aria-label="カードに戻る">←</button><button id="closeDeckVariantAndEntry" class="dialog-close" type="button" aria-label="閉じる">×</button></div>'));
const picker = html.slice(html.indexOf('<dialog id="deckEntryVariantDialog"'), html.indexOf('</dialog>', html.indexOf('<dialog id="deckEntryVariantDialog"')));
assert(!picker.includes('value="cancel"'), 'the old × that only closed the picker is gone');
assert(code.includes('$("#deckVariantBackToEntry").addEventListener("click", () => els.deckEntryVariantDialog.close());'));
assert(code.includes('$("#closeDeckVariantAndEntry").addEventListener("click", () => { els.deckEntryVariantDialog.close(); els.deckEntryDialog.close(); });'));
// Opening it focuses the picker itself, so ← has no focus ring.
assert(code.includes('  els.deckEntryVariantDialog.showModal();\n  els.deckEntryVariantDialog.querySelector(".dialog-card")?.focus({ preventScroll: true });\n'));
assert(css.includes('#deckEntryVariantDialog:focus,#deckEntryVariantDialog .dialog-card:focus{outline:none}'));
assert(css.includes('#cardDialog .dialog-back,#cardVariantDialog .dialog-back,#deckEntryVariantDialog .dialog-back{width:44px;min-height:44px;'), '← is a 44px tap target');
// Closing the deck card still saves pending text and clears the editing entry.
assert(code.includes('els.deckEntryDialog.addEventListener("close", () => {\n  flushDeckTextSave();\n  state.editingDeckEntry = null;'));
// A late close event does not empty the reopened picker.
assert(code.includes('els.deckEntryVariantDialog.addEventListener("close", () => { if (els.deckEntryVariantDialog.open) return; ++deckVariantRequestId; els.deckEntryVariants.replaceChildren(); });'));
console.log('deck variant nav ok');
