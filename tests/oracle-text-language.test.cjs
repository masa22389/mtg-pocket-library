const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const fields={};
const c={$:selector=>fields[selector]?{value:fields[selector]}:null,isJapanese:text=>/[぀-ヿ㐀-鿿]/.test(text)};
vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('function effectiveSearchLanguage('),code.indexOf('function buildCardSearchFilters(')),c);
const set=(prefix,language,text)=>{fields[`#${prefix}Language`]=language;fields[`#${prefix}OracleText`]=text;};
// Scryfall finds Japanese card text only in a lang:ja search, so Japanese words switch the search to Japanese prints.
set('search','en','打ち消す');assert.equal(c.effectiveSearchLanguage('search'),'ja');
set('search','','ダメージを与える');assert.equal(c.effectiveSearchLanguage('search'),'ja');
set('deckSearch','en','速攻');assert.equal(c.effectiveSearchLanguage('deckSearch'),'ja');
// English words, or no card text, keep the chosen language (or none).
set('search','en','counter target');assert.equal(c.effectiveSearchLanguage('search'),'en');
set('search','','haste');assert.equal(c.effectiveSearchLanguage('search'),'');
set('search','ja','');assert.equal(c.effectiveSearchLanguage('search'),'ja');
// The filters, the main search and the deck search all use it, and the example shows Japanese words too.
assert(code.includes('  const language = effectiveSearchLanguage(prefix);\n  const oracleText'));
assert(code.includes('  const selectedLanguage = effectiveSearchLanguage("search");'));
assert(code.includes('fetchSearchCandidates(query, filters, effectiveSearchLanguage("deckSearch") ||'));
assert(code.includes('<input id="searchOracleText" type="search" placeholder="例：打ち消す / 速攻 / draw a card">'));
console.log('PASS: Japanese words in カードテキスト検索 search Japanese card text whatever 言語 is set to.');
