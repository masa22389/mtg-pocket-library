const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');const c={};vm.createContext(c);
for(const name of ['collectionMatchesCardFilters','setCardMatchesFilters']){const start=code.indexOf(`function ${name}(`);vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);}
const card={colors:['U','R'],cmc:2,type_line:'Instant',rarity:'rare'};
assert.equal(c.setCardMatchesFilters(card,{color:'U',mana:'2',type:'Instant',rarity:'rare'}),true);
for(const filters of [{color:'G'},{mana:'0'},{type:'Creature'},{rarity:'common'}])assert.equal(c.setCardMatchesFilters(card,filters),false);
assert.equal(c.setCardMatchesFilters({cmc:8,card_faces:[{colors:['U'],type_line:'Creature'},{colors:['R'],type_line:'Sorcery'}]},{color:'R',mana:'7+',type:'Sorcery'}),true);
assert.equal(c.setCardMatchesFilters({colors:[],cmc:0,type_line:'Land'},{color:'C',mana:'0',type:'Land'}),true);
console.log('PASS set filters: combined criteria, mismatches, faces, colorless and zero mana');
