const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
for(const name of ['normalizeSetCode','collectionMatchesCardFilters','collectionExpansionGroups']) {
 const start=code.indexOf(`function ${name}(`);const end=code.indexOf('\n}',start)+2;vm.runInContext(code.slice(start,end),c);
}
const cards=[
 {id:'red',set:'OLD',colors:['R'],colorIdentity:['R'],manaValue:1,typeLine:'Instant'},
 {id:'multi',set:'new',colors:['U','R'],manaValue:2,typeLine:'Instant'},
 {id:'blue',set:'NEW',colors:['U'],manaValue:2,typeLine:'Creature — Wizard'},
 {id:'land',set:'old',colors:[],colorIdentity:['U'],manaValue:0,typeLine:'Land'},
 {id:'big',set:'unknown',colors:['U'],manaValue:8,typeLine:'Instant'},
];
const select=filter=>cards.filter(card=>c.collectionMatchesCardFilters(card,filter)).map(card=>card.id);
assert.deepEqual(select({color:'R'}),['red','multi']);
assert.deepEqual(select({color:'U',type:'Instant'}),['multi','big']);
assert.deepEqual(select({color:'U',type:'Instant',mana:'2',set:'new'}),['multi']);
assert.deepEqual(select({color:'C'}),['land']);
assert.deepEqual(select({mana:'0'}),['land']);assert.deepEqual(select({mana:'7+'}),['big']);
assert.deepEqual(select({color:'M'}),['multi']);assert.deepEqual(select({color:'G'}),[]);
const snapshot=JSON.stringify(cards);
const groups=c.collectionExpansionGroups(cards,[{code:'old',released_at:'2020-01-01'},{code:'new',released_at:'2026-09-01'}]);
assert.equal(groups.map(g=>g.code).join(','),'new,old,unknown');assert.equal(groups[0].cards.length,2);
assert.equal(groups.flatMap(g=>g.cards).length,cards.length);assert.equal(JSON.stringify(cards),snapshot);
assert.equal(c.collectionExpansionGroups([],[]).length,0);
console.log('PASS: inclusive colors, AND filters, colorless vs identity, mana ranges, set normalization, newest-first groups and non-mutating behavior.');
