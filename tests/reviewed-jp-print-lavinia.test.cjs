const fs = require("node:fs"), assert = require("node:assert/strict"), path = require("node:path");
const root = path.join(__dirname, "..");
// Japanese Store Championship Lavinia (PRNA #189): Scryfall lists it in English only, so it is a reviewed print.
const overrides = JSON.parse(fs.readFileSync(path.join(root, 'scanner/data/japanese-image-overrides.json'), 'utf8'));
const images = JSON.parse(fs.readFileSync(path.join(root, 'scanner/data/japanese-images.json'), 'utf8'));
for (const record of [overrides['prna:189'], images['prna:189']]) {
  assert.equal(record.source, 'verified-print-image');
  assert.equal(record.oracleId, '81ba3a33-0e04-4f68-9a42-1dd717733b57');
  assert.equal(record.printedName, 'アゾリウスの造反者、ラヴィニア');
}
// An update fetches the app shell past the browser cache, so the image index above is never a stale copy.
assert(fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes('cache.addAll(SHELL.map(url => new Request(url, { cache: "reload" })))'));
console.log('PASS reviewed Lavinia');
