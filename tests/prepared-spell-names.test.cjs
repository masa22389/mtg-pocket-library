const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const c = { window: {} };
vm.createContext(c);
for (const file of ['mtg-jp-card-index.js', 'mtgjson-jp-search-index.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c);
c.MTG_JP_CARD_INDEX = c.window.MTG_JP_CARD_INDEX;
c.JP_CARD_SEARCH_INDEX = [...c.MTG_JP_CARD_INDEX, ...c.window.MTGJSON_JP_SEARCH_INDEX];
for (const name of ['JP_INDEX_BY_SCRYFALL_ID', 'JP_INDEX_BY_ORACLE_ID', 'JP_INDEX_BY_EN_NAME', 'JP_STANDALONE_NAMES', 'JP_ALIAS_TARGETS_EXACT']) c[name] = new Map();
for (const name of ['normalizeDisplayName', 'normalizeCardName', 'stripJapaneseReadings', 'normalizeAliasKey', 'isJapanese', 'pushUniqueTarget', 'buildJpSearchIndexes', 'scoreJapaneseDisplayName', 'sortJapaneseDisplayNames', 'localizeJapaneseFaceNames', 'displayJaNamesForIndexItem', 'splitDisplayNamesForFaces', 'joinedDisplayNameForFaces', 'cardSearchNames', 'jpIndexForCard', 'jpIndexMatchesCard', 'jpIndexImageMatchesCard', 'applyJpIndexToCard', 'cardLanguage', 'isJapaneseCard', 'isEnglishCard', 'shouldLocalizeDisplay', 'prefersJapaneseDisplay', 'nameOf']) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  const lineEnd = code.indexOf('\n', start);
  const end = code.slice(start, lineEnd).trimEnd().endsWith('}') ? lineEnd : code.indexOf('\n}', start) + 2;
  vm.runInContext(code.slice(start, end), c);
}
c.buildJpSearchIndexes();
for (const [english, japanese] of [['Conflict', '対立の名誉教授 // 稲妻'], ['Abundance', '豊穣の名誉教授 // 新たな芽吹き'], ['Truce', '休戦の名誉教授 // 剣を鍬に'], ['Woe', '悲哀の名誉教授 // 悪魔の教示者']]) {
  const item = c.JP_CARD_SEARCH_INDEX.find(x => (x.enNames || []).includes(`Emeritus of ${english}`));
  const name = item.enNames.find(x => x.includes('//'));
  for (const language of [{ lang: 'ja' }, { lang: 'en', _preferJpDisplay: true }]) {
    const card = c.applyJpIndexToCard({ name, ...language, card_faces: name.split(' // ').map(name => ({ name })) });
    assert.equal(c.nameOf(card), japanese);
    assert.equal(card.card_faces[1].printed_name, japanese.split(' // ')[1]);
  }
  assert.equal(c.nameOf(c.applyJpIndexToCard({ name, lang: 'en' })), name);
  assert.equal(c.nameOf({ jpName: item.jaNames[0], lang: 'ja' }), japanese, 'previously cached mixed title');
}
assert.equal(c.localizeJapaneseFaceNames('観念の名誉教授 // Ancestral Recall'), '観念の名誉教授 // Ancestral Recall');
assert.equal(c.localizeJapaneseFaceNames('対立の名誉教授 // 未知の呪文'), '対立の名誉教授 // 未知の呪文');
assert.equal(c.localizeJapaneseFaceNames('English // Lightning Bolt'), 'English // Lightning Bolt');
assert.equal(c.localizeJapaneseFaceNames('稲妻'), '稲妻');
console.log('PASS: prepared spell names, both display language paths, face names, cached names, English preference and unknown-name fallback.');
