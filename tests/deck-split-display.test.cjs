const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const pick=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const c={state:{deckDisplayMode:'split',collection:[]},cardIsFoilOnly:()=>false};
vm.createContext(c);
vm.runInContext(pick('function cardFinishKind(','function cardFinishBadge(')+pick('function cardForDeckEntry(','function ownedQuantityForEntry(')+pick('function deckEntryDisplayParts(','function renderDeckSection('),c);
const lot=(id,finish,quantity,language='ja',scryfallId='fable')=>({id,scryfallId,finish,quantity,language});
const show=(parts,entry)=>[...parts.get(`${entry.section}\n${entry.cardId}`).map(p=>`${c.cardFinishKind(p.card)||'normal'}/${p.card.language}x${p.quantity}${p.missing?` missing${p.missing}`:''}`)];
const foil=lot('f','foil',1),normal=lot('n','normal',4);
c.state.collection=[foil,normal];
// The deck card points at the Foil lot: Foil 1 + normal 3 (the user's 鏡割りの寓話 case).
let e={cardId:'f',section:'main',quantity:4};
assert.deepEqual(show(c.deckEntryDisplayParts([e]),e),['foil/jax1','normal/jax3']);
// Pointing at the normal lot: the 4 normal copies cover it.
e={cardId:'n',section:'main',quantity:4};
assert.deepEqual(show(c.deckEntryDisplayParts([e]),e),['normal/jax4']);
// Merged: one tile, non-Foil look even when the deck card points at the Foil lot.
e={cardId:'f',section:'main',quantity:4};
assert.deepEqual(show(c.deckEntryDisplayParts([e],'merged'),e),['normal/jax4']);
// Main and side share the owned copies; what nobody owns is missing on the first tile.
const main={cardId:'n',section:'main',quantity:4},side={cardId:'n',section:'side',quantity:2};
let parts=c.deckEntryDisplayParts([side,main]);
assert.deepEqual(show(parts,main),['normal/jax4']);
assert.deepEqual(show(parts,side),['foil/jax2 missing1']);
// Japanese and English lots of the same print are separate tiles; same look lots share one tile.
c.state.collection=[lot('j','normal',2,'ja'),lot('en','normal',1,'en'),lot('j2','normal',1,'ja')];
e={cardId:'j',section:'main',quantity:4};
assert.deepEqual(show(c.deckEntryDisplayParts([e]),e),['normal/jax3','normal/enx1']);
// Candidates never take owned copies, and a card nobody owns stays as one tile.
const maybe={cardId:'j',section:'maybe',quantity:3};
assert.deepEqual(show(c.deckEntryDisplayParts([maybe]),maybe),['normal/jax3']);
const none={cardId:'scryfall-x',card:{scryfallId:'x',finish:'normal',language:'en'},section:'main',quantity:2};
assert.deepEqual(show(c.deckEntryDisplayParts([none]),none),['normal/enx2']);
console.log('PASS: the deck screen splits copies by Foil and language, or merges them in the non-Foil look.');
