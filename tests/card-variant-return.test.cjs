const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

// After picking a print in "別イラスト・収録版を選ぶ", a ← button (top left) goes back to the picker
// (same list, same scroll position); × always closes the card.
assert(html.includes('<div class="dialog-nav"><button id="cardBackToVariants" class="dialog-back" type="button" aria-label="収録版の選択に戻る" hidden>←</button><button class="dialog-close" value="cancel" aria-label="閉じる">×</button></div>'));
assert(css.includes('.card-detail-dialog .dialog-back{width:44px;min-height:44px;'), '← is a 44px tap target');
assert(css.includes('.dialog-nav .dialog-close{position:static;margin-left:auto;width:44px;min-height:44px}'), '× stays top right');
assert(code.includes('let returnToVariantPicker = null;\nfunction setVariantPickerReturn(value) {\n  returnToVariantPicker = value;\n  const back = $("#cardBackToVariants");\n  if (back) back.hidden = !value;\n}'));
assert(code.includes('setVariantPickerReturn({ dialogScroll: picker.scrollTop, formScroll: picker.querySelector(".dialog-card")?.scrollTop || 0 });'));
assert(!/(?<!let )returnToVariantPicker = (?!value)/.test(code), 'the ← button is shown and hidden together with the return state');
const reopen = code.slice(code.indexOf('function reopenCardVariantPicker()'), code.indexOf('async function loadCardVariantLanguage()'));
assert(reopen.includes('dialog.showModal();'));
assert(reopen.includes('renderVariantGallery();'), 'reuses the loaded prints');
assert(reopen.includes('if (!state.cardVariants.length) { loadCardVariantLanguage(); return; }'));
assert(reopen.includes('form.scrollTop = saved.formScroll || 0;'));
assert(reopen.includes('setVariantPickerReturn(null);'));
assert(code.includes('$("#cardBackToVariants").addEventListener("click", () => { if (returnToVariantPicker) reopenCardVariantPicker(); });'));
// × is no longer intercepted: it closes the card dialog.
assert(!code.includes('els.cardDialog.querySelector(".dialog-close")?.addEventListener'));
// The phone's back gesture behaves like ←.
assert(code.includes('els.cardDialog.addEventListener("cancel", event => {\n  if (!returnToVariantPicker || $("#cardVariantDialog").open) return;'));
// Opening another card, or closing the card dialog, forgets the picker.
const open = code.slice(code.indexOf('async function openCardDialog('), code.indexOf('async function openCardDialog(') + 300);
assert(open.includes('setVariantPickerReturn(null);'));
assert(code.includes('els.cardDialog.addEventListener("close", () => { setVariantPickerReturn(null); });'));
// A late close event does not empty the reopened picker.
assert(code.includes('$("#cardVariantDialog").addEventListener("close", () => { if ($("#cardVariantDialog").open) return; ++variantPickerRequestId; els.cardVariants.replaceChildren(); });'));
console.log('card variant return ok');
