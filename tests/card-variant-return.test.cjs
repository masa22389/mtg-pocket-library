const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// After picking a print in "別イラスト・収録版を選ぶ", the card dialog's × goes back to the picker
// (same list, same scroll position) instead of closing everything.
assert(code.includes('let returnToVariantPicker = null;'));
assert(code.includes('returnToVariantPicker = { dialogScroll: picker.scrollTop, formScroll: picker.querySelector(".dialog-card")?.scrollTop || 0 };'));
const reopen = code.slice(code.indexOf('function reopenCardVariantPicker()'), code.indexOf('async function loadCardVariantLanguage()'));
assert(reopen.includes('dialog.showModal();'));
assert(reopen.includes('renderVariantGallery();'), 'reuses the loaded prints');
assert(reopen.includes('if (!state.cardVariants.length) { loadCardVariantLanguage(); return; }'));
assert(reopen.includes('form.scrollTop = saved.formScroll || 0;'));
// The × button and the back gesture (cancel) both go back; once.
assert(code.includes('els.cardDialog.querySelector(".dialog-close")?.addEventListener("click", event => {\n  if (!returnToVariantPicker) return;\n  event.preventDefault();\n  reopenCardVariantPicker();'));
assert(code.includes('els.cardDialog.addEventListener("cancel", event => {\n  if (!returnToVariantPicker || $("#cardVariantDialog").open) return;'));
assert(reopen.includes('returnToVariantPicker = null;'));
// Opening another card, or closing the card dialog, forgets the picker.
const open = code.slice(code.indexOf('async function openCardDialog('), code.indexOf('async function openCardDialog(') + 300);
assert(open.includes('returnToVariantPicker = null;'));
assert(code.includes('els.cardDialog.addEventListener("close", () => { returnToVariantPicker = null; });'));
// A late close event does not empty the reopened picker.
assert(code.includes('$("#cardVariantDialog").addEventListener("close", () => { if ($("#cardVariantDialog").open) return; ++variantPickerRequestId; els.cardVariants.replaceChildren(); });'));
console.log('card variant return ok');
