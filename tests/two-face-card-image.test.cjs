const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

// A two-faced card shows both faces side by side; together they must fit the dialog width,
// otherwise the front is cut off on the left and the back on the right (phone width).
assert(code.includes('<div class="card-detail-images${backImage ? " two-faces" : ""}">'));
assert(css.includes('.card-detail-images.two-faces{width:100%;max-width:610px}'));
assert(css.includes('.card-detail-images.two-faces .card-detail-image{flex:1 1 0;min-width:0;width:auto;max-width:300px}'));
// The old fixed widths (72vw + 42vw) no longer apply to the back face.
assert(!css.includes('.card-detail-back{width:min(42vw,220px)}'));
console.log('two-face card image ok');
