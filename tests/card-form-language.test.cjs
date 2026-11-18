const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);vm.runInContext(code.slice(code.indexOf('const CARD_LANGUAGES ='),code.indexOf('// Sets the card form'))+code.slice(code.indexOf('function cardFormLanguage('),code.indexOf('function renderSelectedVariant(')),c);
// Reviewed Japanese printings share the English print's ID, so the saved lot must not undo the choice.
assert.equal(c.cardFormLanguage({lang:'ja',_chosenLanguage:'ja'},{language:'en'}),'ja');
assert.equal(c.cardFormLanguage({lang:'en',_chosenLanguage:'en'},{language:'ja'}),'en');
assert.equal(c.cardFormLanguage({lang:'ja',_reviewedJpImage:'u'},{language:'en'}),'ja');
assert.equal(c.cardFormLanguage({lang:'ja',_supplementalJpVariant:true},{language:'en'}),'ja','the Japanese result of an English-only print (BRO #163) opens in Japanese even with an English copy saved');
// Without a choice the saved lot decides, and a lot saved as Japanese on an English print stays Japanese.
assert.equal(c.cardFormLanguage({lang:'en'},{language:'ja'}),'ja');
assert.equal(c.cardFormLanguage({lang:'ja'},null),'ja');
// Since v413 every language MTG prints in is its own choice; only languages outside the list fall back to その他.
assert.equal(c.cardFormLanguage({lang:'de'},null),'de');
assert.equal(c.cardFormLanguage({lang:'zhs'},null),'zhs');
assert.equal(c.cardFormLanguage({lang:'en',_chosenLanguage:'fr'},{language:'en'}),'fr','a language chosen without its own printing is kept');
assert.equal(c.cardFormLanguage({lang:'en'},{language:'other'}),'other','a lot saved as その他 before v413 keeps it');
assert.equal(c.cardFormLanguage({lang:'he'},null),'other');
assert.equal(c.cardLanguageLabel('ko'),'韓国語');assert.equal(c.cardLanguageLabel('other'),'その他');assert.equal(c.cardLanguageMark('ru'),'露');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const select=html.slice(html.indexOf("<select id=\"cardLanguage\">"),html.indexOf("</select>",html.indexOf("<select id=\"cardLanguage\">")));const options=[...select.matchAll(/value="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(options,['ja','en','de','fr','it','es','pt','ru','ko','zhs','zht','ph'],'その他 is no longer offered');
console.log('PASS: the card form follows an explicit language choice, otherwise the saved lot.');
// Wisdom Guild looks each language up under its own code; Phyrexian and unknown languages fall back to English.
const wg={isJapanese:text=>/[぀-ヿ]/.test(text)};vm.createContext(wg);
vm.runInContext(code.slice(code.indexOf('const WISDOM_GUILD_LANGUAGES'),code.indexOf('// Wisdom Guild files some printings')),wg);
assert.deepEqual(['ja','en','de','fr','it','es','pt','ru','ko','zhs','zht','ph','other'].map(language=>wg.wisdomGuildLanguageForCard({language})),
  ['JPN','ENG','GER','FRA','ITA','SPA','POR','RUS','KOR','ZHO','CHI','ENG','ENG']);
console.log('PASS: every printed language has its own choice and Wisdom Guild code.');
