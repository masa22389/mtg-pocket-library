const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);vm.runInContext(code.slice(code.indexOf('function cardFormLanguage('),code.indexOf('function renderSelectedVariant(')),c);
// Reviewed Japanese printings share the English print's ID, so the saved lot must not undo the choice.
assert.equal(c.cardFormLanguage({lang:'ja',_chosenLanguage:'ja'},{language:'en'}),'ja');
assert.equal(c.cardFormLanguage({lang:'en',_chosenLanguage:'en'},{language:'ja'}),'en');
assert.equal(c.cardFormLanguage({lang:'ja',_reviewedJpImage:'u'},{language:'en'}),'ja');
// Without a choice the saved lot decides, and a lot saved as Japanese on an English print stays Japanese.
assert.equal(c.cardFormLanguage({lang:'en'},{language:'ja'}),'ja');
assert.equal(c.cardFormLanguage({lang:'ja'},null),'ja');
assert.equal(c.cardFormLanguage({lang:'de'},null),'other');
console.log('PASS: the card form follows an explicit language choice, otherwise the saved lot.');
