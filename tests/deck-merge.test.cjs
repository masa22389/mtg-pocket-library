(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const c={structuredClone,Date};vm.createContext(c);
for(const name of ['canMergeDeckFormat','deckVersionContent','ensureDeckVersions','storeDeckVersion','buildDeckMerge','buildDeckMergeUndo','commitDeckMerge']){
 let start=code.indexOf(`function ${name}(`);if(code.slice(start-6,start)==="async ")start-=6;vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);
}
const a={id:'a',name:'Base',format:'Legacy',memo:'old',entries:[{cardId:'x',quantity:4,section:'main'}]};
const b={id:'b',name:'ver2',format:'Legacy',memo:'new',entries:[{cardId:'x',quantity:3,section:'main'},{cardId:'y',quantity:1,section:'side'}]};
const decks=[a,b,{...a,id:'c'}];const initial=JSON.stringify(decks);
assert.equal(c.canMergeDeckFormat(b,a),true);
assert.equal(c.canMergeDeckFormat({...b,format:'Modern'},a),false);
assert.equal(c.canMergeDeckFormat({format:''},{format:''}),false);
assert.throws(()=>c.buildDeckMerge([a,{...b,format:'Modern'}],a,'b'),/同じフォーマット/);
const result=c.buildDeckMerge(decks,a,'b');
assert.equal(result.decks.length,2);assert.equal(result.deck.versions.length,2);assert.equal(result.deck.versions[1].memo,'new');assert.equal(result.deck.versions[1].entries[1].section,'side');assert.equal(JSON.stringify(decks),initial);
const roundtrip=JSON.parse(JSON.stringify(result.decks));
assert.equal(JSON.stringify(c.buildDeckMergeUndo(roundtrip,'a').decks),initial);
assert.throws(()=>c.buildDeckMerge(decks,a,'a'));assert.throws(()=>c.buildDeckMerge(decks,a,'missing'));
c.ensureDeckVersions(b);b.memo='third';c.storeDeckVersion(b,true);b.memo='draft';
const withHistory=c.buildDeckMerge(decks,a,'b');assert.equal(withHistory.added,3);assert.equal(withHistory.deck.versions.at(-1).memo,'draft');
c.ensureDeckVersions(a);a.memo='target draft';const draft=c.buildDeckMerge(decks,a,'b');assert.equal(draft.deck.versions[0].memo,'old');assert.equal(draft.deck.versions[1].memo,'target draft');
const second=c.buildDeckMerge(result.decks,result.deck,'c');assert.equal(second.decks.length,1);const undoSecond=c.buildDeckMergeUndo(second.decks,'a');assert.equal(undoSecond.decks.length,2);assert.equal(undoSecond.deck.versions.length,2);assert.equal(undoSecond.deck.mergeUndo,undefined);
c.state={decks,editingDeck:a};c.KEYS={decks:'decks'};c.appStorage={setItem(){throw Error('quota');}};
await assert.rejects(c.commitDeckMerge(result),/quota/);assert.equal(c.state.decks,decks);assert.equal(c.state.editingDeck,a);
console.log('PASS: merge, all versions/drafts, no input mutation, restore after serialization, repeated merge, invalid selections, quota failure preserves state.');

})().catch(error=>{console.error(error);process.exitCode=1;});
