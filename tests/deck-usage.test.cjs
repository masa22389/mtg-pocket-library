const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={deckEntryMatchesCard:(entry,card)=>entry.oracle===card.oracle};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('function deckLatestEntries('),code.indexOf('function renderCardDeckUsage(')),c);
const e=(section,quantity,oracle='a')=>({section,quantity,oracle});
const card={oracle:'a'};
// Sections are counted apart, and candidates don't count as used. A deck without the card is left out.
const [usage,...others]=c.deckUsageForCard(card,[{id:'1',entries:[e('main',3),e('side',1),e('maybe',2),e('main',4,'b')]},{id:'2',entries:[e('main',4,'b')]}]);
assert.equal(others.length,0);assert.equal(usage.deck.id,'1');
assert.equal(usage.counts.main,3);assert.equal(usage.counts.side,1);assert.equal(usage.counts.maybe,2);assert.equal(usage.used,4);
// A deck holding it only as a candidate is listed, with nothing used.
assert.equal(c.deckUsageForCard(card,[{id:'3',entries:[e('maybe',1)]}])[0].used,0);
// An unknown section counts as main, as sectionLabel shows it.
assert.equal(c.deckUsageForCard(card,[{id:'4',entries:[e(undefined,2)]}])[0].counts.main,2);
// An older version being viewed: the latest version's entries win, its draft over its saved list.
const old={activeVersion:1,entries:[e('main',1)],versions:[{number:1,entries:[e('main',1)]},{number:2,entries:[e('main',2)]}]};
assert.equal(c.deckUsageForCard(card,[old])[0].counts.main,2);
const draft={activeVersion:1,entries:[e('main',1)],versions:[{number:1,entries:[]},{number:2,entries:[e('main',2)],draft:{entries:[e('main',3)]}}]};
assert.equal(c.deckUsageForCard(card,[draft])[0].counts.main,3);
// On the latest version the deck's own entries are current; decks without versions use their entries.
assert.equal(c.deckUsageForCard(card,[{activeVersion:2,entries:[e('main',5)],versions:[{number:1,entries:[]},{number:2,entries:[]}]}])[0].counts.main,5);
assert.deepEqual(Array.from(c.deckUsageForCard(null,[{entries:[e('main',1)]}])),[]);
console.log('PASS: deck usage counts sections and reads the latest version.');
