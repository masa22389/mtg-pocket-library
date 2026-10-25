const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),c={};vm.createContext(c);
for(const name of ['stripJapaneseReadings','normalizeCardName','isSameOwnedCardName','compareDeckContents']){const start=code.indexOf(`function ${name}(`);vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);}
const e=(name,n,section='main',oracleId=name)=>({section,quantity:n,card:{name,oracleId}}),resolve=e=>e.card;
const a={entries:[e('Bolt',2),e('Bolt',2),e('Island',10),e('Counterspell',2,'side'),e('Commander',1,'commander'),e('Maybe',3,'maybe')]};
const b={entries:[e('Bolt',3),e('Island',10),e('Other',2),e('Counterspell',1,'main'),e('Counterspell',1,'side')]};
const before=JSON.stringify([a,b]),r=c.compareDeckContents(a,b,resolve);
assert.deepEqual(JSON.parse(JSON.stringify(r.map(s=>[s.section,s.rows.map(x=>[x.card.name,x.current,x.other,x.difference])]))),[['main',[['Bolt',4,3,1],['Other',0,2,-2],['Counterspell',0,1,-1]]],['side',[['Counterspell',2,1,1]]]]);
assert.equal(JSON.stringify([a,b]),before,'comparison does not mutate decks');
assert.ok(c.compareDeckContents(a,a,resolve).every(s=>s.rows.length===0));
assert.equal(c.compareDeckContents({entries:[e('Old printing',4,'main','same')]},{entries:[e('New printing',4,'main','same')]},resolve)[0].rows.length,0,'printing differences ignored');
assert.equal(c.compareDeckContents({entries:[e('Same name',4,'main','one')]},{entries:[e('Same name',4,'main','two')]},resolve)[0].rows.length,2,'different Oracle IDs kept separate');
assert.equal(c.compareDeckContents({entries:[e('Fire // Ice',1)]},{entries:[e('Ice',1)]},resolve)[0].rows.length,2,'split host not conflated with standalone card');
assert.ok(c.compareDeckContents({entries:[]},{entries:[]},resolve).every(s=>s.rows.length===0));
console.log('PASS deck comparison: section differences, quantity aggregation, printing identity, exclusions, equal/empty decks, no mutation');
