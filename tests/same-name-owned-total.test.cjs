const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
for(const name of ['stripJapaneseReadings','normalizeCardName','isSameOwnedCardName','sameCardNameOwnedTotal']) {
 const start=code.indexOf(`function ${name}(`);vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);
}
const selected={oracle_id:'counter',name:'Counterspell'};
const cards=[{oracleId:'counter',name:'Counterspell',quantity:6,language:'ja',set:'MMQ'},
 {oracleId:'counter',name:'Counterspell',quantity:4,language:'en',set:'7ED',finish:'foil'},
 {name:'Counterspell',quantity:2}, {oracleId:'different',name:'Counterspell',quantity:9},
 {name:'Other // Counterspell',quantity:5},{name:'Counterspell',quantity:'bad'}];
assert.equal(c.sameCardNameOwnedTotal(selected,cards),12);
assert.equal(c.sameCardNameOwnedTotal(null,cards),0);
assert.equal(c.sameCardNameOwnedTotal(selected,[]),0);
assert.equal(c.sameCardNameOwnedTotal({name:'Ancestral Recall'},[{name:'Emeritus of Ideation // Ancestral Recall',quantity:4}]),0);
cards[0].quantity=8;assert.equal(c.sameCardNameOwnedTotal(selected,cards),14);
assert.equal(c.sameCardNameOwnedTotal({oracleId:'counter',name:'Other title'},[cards[0]]),8);
console.log('PASS: variants/languages/finishes, missing-ID fallback, separate Oracle IDs, prepared spells, empty collections and saved count changes.');

assert.equal(cards.filter(item=>c.isSameOwnedCardName(selected,item)).length,4);
assert.equal(c.isSameOwnedCardName({name:"Bolt"},{name:"Other // Bolt"}),false);
