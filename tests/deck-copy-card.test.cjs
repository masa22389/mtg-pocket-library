const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const c={structuredClone,Date,uid:()=> 'new-entry',cardForDeckEntry:e=>e.card};vm.createContext(c);
for(const name of ['deckVersionContent','ensureDeckVersions','selectLatestDeckVersion','storeDeckVersion','copyCardIntoDeck']){const start=code.indexOf(`function ${name}(`);vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);}
const card={scryfallId:'print1',image:'chosen.jpg',name:'A'};
const target={name:'Target',format:'Legacy',entries:[]};
const added=c.copyCardIntoDeck(target,card,2,'main');assert.equal(target.entries.length,0);assert.equal(added.entries[0].quantity,2);assert.equal(added.entries[0].card.image,'chosen.jpg');
const merged=c.copyCardIntoDeck(added,card,3,'main');assert.equal(merged.entries.length,1);assert.equal(merged.entries[0].quantity,5);
assert.equal(c.copyCardIntoDeck(merged,card,1,'side').entries.length,2);
assert.equal(c.copyCardIntoDeck(merged,{...card,scryfallId:'print2'},1,'main').entries.length,2);
for(const n of [0,-1,1.5,NaN])assert.throws(()=>c.copyCardIntoDeck(target,card,n,'main'));
assert.throws(()=>c.copyCardIntoDeck(target,card,1,'commander'));
added.entries[0].quantity=4;c.storeDeckVersion(added,true);Object.assign(added,c.deckVersionContent(added.versions[0]));added.activeVersion=1;
const latest=c.copyCardIntoDeck(added,card,1,'main');assert.equal(latest.activeVersion,2);assert.equal(latest.entries[0].quantity,5);assert.equal(latest.versions[0].entries[0].quantity,2);
console.log('PASS exact print, quantity, section, source isolation, validation and latest version preservation');
