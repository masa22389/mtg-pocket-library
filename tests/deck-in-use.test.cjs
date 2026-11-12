const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const c={};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('function visibleDeckList('),code.indexOf('function renderDecks(')),c);
const decks=[{id:'a',format:'モダン',inUse:true},{id:'b',format:'モダン'},{id:'c',format:'統率者戦',inUse:true},{id:'d',format:'統率者戦',inUse:false}];
const ids=list=>list.map(d=>d.id).join(',');
assert.equal(ids(c.visibleDeckList(decks,'',false)),'a,b,c,d','no filter shows every deck');
assert.equal(ids(c.visibleDeckList(decks,'',true)),'a,c','使用中のみ keeps only marked decks; old decks without the field are not in use');
assert.equal(ids(c.visibleDeckList(decks,'統率者戦',true)),'c','format and 使用中 combine');
// The controls exist, the tile shows a badge, a copy starts unmarked, and the mark does not touch 更新日.
assert.match(html,/<input id="deckInUseOnly" type="checkbox">/);
assert.match(html,/<input id="deckInUse" type="checkbox">/);
assert.match(code,/deck\.inUse === true \? '<span class="deck-in-use-badge">使用中<\/span>'/);
assert.match(code,/copy\.inUse = false;/);
const toggle=code.slice(code.indexOf('$("#deckInUse").addEventListener'),code.indexOf('els.deckFormatFilter.addEventListener("change"'));
assert.doesNotMatch(toggle,/updatedAt|autoSaveEditingDeck/);
console.log('PASS: decks can be marked 使用中, filtered by it, and copies start unmarked.');
