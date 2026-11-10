const fs = require('node:fs'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const overrides = JSON.parse(fs.readFileSync(path.join(root, 'scanner/data/japanese-image-overrides.json'), 'utf8'));
const images = JSON.parse(fs.readFileSync(path.join(root, 'scanner/data/japanese-images.json'), 'utf8'));

// Coldsnap Theme Decks: Scryfall's Japanese images are placeholders. Hareruya's numbered Japanese products give
// each basic land its own picture (art checked against the English print of the same number).
const expected = {
  369: 'Plains_369', 370: 'Plains_370', 371: 'Plains_371', 372: 'Island_372', 373: 'Island_373', 374: 'Island_374',
  376: 'Swamp_376', 377: 'Swamp_377', 378: 'Mountain_378', 379: 'Mountain_379', 380: 'Mountain_380',
  382: 'Forest_382', 383: 'Forest_383', 120: 'Dark_Ritual', '12b': 'Reinforcements',
};
for (const [number, image] of Object.entries(expected)) {
  for (const record of [overrides['cst:' + number], images['cst:' + number]]) {
    assert(record, 'cst:' + number);
    assert.equal(record.source, 'verified-print-image');
    assert.equal(record.language, 'ja');
    assert.equal(record.images.normal, `https://files.hareruyamtg.com/img/goods/L/CSPTHEME/JP/${image}.webp`);
  }
}
// Every basic land of one name has a different picture.
const urls = Object.keys(expected).map(number => overrides['cst:' + number].images.normal);
assert.equal(new Set(urls).size, urls.length);
console.log('PASS reviewed CST');
