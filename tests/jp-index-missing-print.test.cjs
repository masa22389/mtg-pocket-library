const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
const source=fs.readFileSync(path.join(root,'mtg-jp-card-index.js'),'utf8');
const items=JSON.parse(source.slice(source.indexOf('['),source.lastIndexOf(']')+1));
// Scryfall has BRO #163 ファイレクシアのドラゴン・エンジン (a meld half) in English only, so the index carries its Japanese name.
const engine=items.find(item=>item.setCode==='BRO'&&item.collectorNumber==='163');
assert(engine,'BRO #163 is in the Japanese index');
assert.deepEqual(engine.jaNames,['ファイレクシアのドラゴン・エンジン']);
assert.equal(engine.scryfallId,'e2b826be-4256-4fd6-ad4d-6c80933ee940');
assert.equal(engine.oracleId,'022b42a6-ee0f-4080-b973-c1b68938c3be');
assert.equal(engine.noScryfallJapanese,true);
const c={};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('function jpIndexAddsJapanesePrint('),code.indexOf('// Prepared Ancestral Recall')),c);
// It stands in for a Japanese print like an official gallery record; other manual entries only add names and pictures.
assert.equal(c.jpIndexAddsJapanesePrint(engine),true);
assert.equal(c.jpIndexAddsJapanesePrint({source:'mtg-jp-card-gallery'}),true);
assert.equal(c.jpIndexAddsJapanesePrint({source:'manual補完'}),false);
assert.equal(c.jpIndexAddsJapanesePrint(null),false);
assert.equal(c.jpIndexImageMatchesCard(engine,{id:engine.scryfallId}),true);
// The language switch, the print picker and set searches all use it.
assert.equal(code.split('jpIndexAddsJapanesePrint(').length-1,5);
assert(!code.includes('source === "mtg-jp-card-gallery" && indexed.images'));
console.log('PASS: BRO #163 ファイレクシアのドラゴン・エンジン can be picked in Japanese though Scryfall lists it in English only.');
