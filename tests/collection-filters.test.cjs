const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={normalizeSetCode:v=>String(v||'').toLowerCase()};vm.createContext(c);
for(const name of ['cardColorsFromApi','collectionCardColors','collectionMatchesColors','collectionMatchesCardFilters']){const a=code.indexOf('function '+name+'(');vm.runInContext(code.slice(a,code.indexOf('\n}',a)+2),c);}
const card=(name,colors,extra={})=>({name,colors,typeLine:'Creature',manaValue:2,...extra});
const white=card('W',['W']),blue=card('U',['U']),azorius=card('WU',['W','U']),orzhov=card('WB',['W','B']),rakdos=card('BR',['B','R']),red=card('R',['R']),artifact=card('A',[]);
const all=[white,blue,azorius,orzhov,rakdos,red,artifact];
const names=(colors,colorRange)=>all.filter(x=>c.collectionMatchesCardFilters(x,{colors,colorRange})).map(x=>x.name).join(' ');
// Includes multicolor: any selected color counts.
assert.equal(names([],'any'),'W U WU WB BR R A');
assert.equal(names(['W'],'any'),'W WU WB');
assert.equal(names(['W','U'],'any'),'W U WU WB');
// Single color only: multicolor cards drop out, and colorless needs choosing.
assert.equal(names(['W'],'mono'),'W');
assert.equal(names(['W','U'],'mono'),'W U');
assert.equal(names([],'mono'),'W U R');
assert.equal(names(['C'],'mono'),'A');
assert.equal(names(['W','C'],'mono'),'W A');
// Multicolor only.
assert.equal(names([],'multi'),'WU WB BR');
assert.equal(names(['W'],'multi'),'WU WB');
assert.equal(names(['C'],'multi'),'');
// Colorless.
assert.equal(names(['C'],'any'),'A');
// Mana and type accept several values; different items must all match.
const mv=(n,typeLine='Creature')=>card('x',['R'],{manaValue:n,typeLine});
const f=(x,o)=>c.collectionMatchesCardFilters(x,o);
assert.equal(f(mv(1),{manas:['1','2']}),true);assert.equal(f(mv(3),{manas:['1','2']}),false);
assert.equal(f(mv(9),{manas:['7+']}),true);assert.equal(f(mv(6),{manas:['7+']}),false);assert.equal(f(mv(0),{manas:['0']}),true);
assert.equal(f(mv(1,'Instant'),{types:['Creature','Instant']}),true);assert.equal(f(mv(1,'Land'),{types:['Creature','Instant']}),false);
assert.equal(f(mv(1,'Creature'),{colors:['R'],colorRange:'mono',manas:['1'],types:['Creature']}),true);
assert.equal(f(mv(2,'Creature'),{colors:['R'],colorRange:'mono',manas:['1'],types:['Creature']}),false);
// Double-faced: colors come from the faces; older saved cards fall back to color identity.
assert.deepEqual(Array.from(c.cardColorsFromApi({card_faces:[{colors:['U']},{colors:['U']}]})),['U']);
assert.deepEqual(Array.from(c.cardColorsFromApi({card_faces:[{colors:['B']},{colors:['B','R']}]})),['B','R']);
assert.deepEqual(Array.from(c.cardColorsFromApi({colors:['R','U'],card_faces:[{},{}]})),['R','U']);
assert.deepEqual(Array.from(c.cardColorsFromApi({})),[]);
const oldDfc=card('Delver',[],{typeLine:'Creature — Human // Creature — Insect',colorIdentity:['U']});
assert.deepEqual(Array.from(c.collectionCardColors(oldDfc)),['U']);
assert.equal(c.collectionMatchesColors(oldDfc,['U'],'mono'),true);assert.equal(c.collectionMatchesColors(oldDfc,['C'],'any'),false);
// A colorless single-faced card isn't given its color identity.
assert.deepEqual(Array.from(c.collectionCardColors(card('Land',[],{typeLine:'Land',colorIdentity:['G']}))),[]);
console.log('PASS collection filters');
