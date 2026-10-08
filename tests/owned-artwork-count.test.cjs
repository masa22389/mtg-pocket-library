const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),c={};vm.createContext(c);
for(const n of ['cardIllustrationKey','ownedArtworkKey','ownedArtworkTotals']){let i=source.indexOf(`function ${n}(`);vm.runInContext(source.slice(i,source.indexOf('\n}',i)+2),c);}
const a={name:'Card',oracleId:'oracle',illustrationId:'art',language:'ja',quantity:2};
let totals=c.ownedArtworkTotals([a,{...a,set:'other',finish:'foil',quantity:2},{...a,language:'en',quantity:1},{...a,illustrationId:'other',quantity:3}]);
assert.equal(totals.get(c.ownedArtworkKey(a)),4);assert.equal(totals.get(c.ownedArtworkKey({...a,language:'en'})),1);assert.equal(totals.get(c.ownedArtworkKey({...a,illustrationId:'other'})),3);
assert.equal(c.ownedArtworkTotals([a,{...a,illustrationId:''}]).has(c.ownedArtworkKey(a)),false);
console.log('PASS: same artwork across sets/finishes, separate language/artwork, incomplete metadata excluded');
