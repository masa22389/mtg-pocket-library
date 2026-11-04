const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('function tokenPartsOf('),code.indexOf('const deckTokenPartsCache')),c);
// Tokens, emblems, dungeons and markers count; ordinary related cards and the card itself don't.
const names=card=>Array.from(c.tokenPartsOf(card)).map(p=>p.name);
assert.deepEqual(names({name:'Ragavan',all_parts:[{name:'Ragavan',component:'combo_piece',type_line:'Legendary Creature'},{name:'Treasure',component:'token',type_line:'Token Artifact — Treasure'},{name:'Kari Zev',component:'combo_piece',type_line:'Legendary Creature — Human Pirate'}]}),['Treasure']);
assert.deepEqual(names({name:'Elspeth',all_parts:[{name:'Elspeth Emblem',component:'combo_piece',type_line:'Emblem — Elspeth'},{name:'The Monarch',component:'combo_piece',type_line:'Card'},{name:'Lost Mine',component:'combo_piece',type_line:'Dungeon'}]}),['Elspeth Emblem','The Monarch','Lost Mine']);
assert.deepEqual(names({name:'Plain'}),[]);
// Lookup prefers the oracle id, so printings share one request; local ids aren't sent as Scryfall ids.
assert.equal(c.deckTokenLookup({oracleId:'o1',scryfallId:'x'}).key,'oracle:o1');
assert.equal(c.deckTokenLookup({oracle_id:'o2'}).key,'oracle:o2');
assert.equal(c.deckTokenLookup({scryfallId:'37108cd4-aaaa-4bbb-8ccc-000000000000',name:'A'}).key,'id:37108cd4-aaaa-4bbb-8ccc-000000000000');
assert.equal(c.deckTokenLookup({scryfallId:'sample-1',name:'A'}).key,'name:A');
assert.equal(c.deckTokenLookup({}),null);
// Different printings of a token merge by oracle id, tokens of the same name stay apart, and a missing detail still lists.
const details=new Map([['t1',{oracle_id:'tr',name:'Treasure',type_line:'Token Artifact',image_uris:{normal:'t.jpg'}}],['t2',{oracle_id:'tr',name:'Treasure',type_line:'Token Artifact'}],['s1',{oracle_id:'s1o',name:'Soldier',power:'1',toughness:'1',card_faces:[{image_uris:{normal:'s.jpg'}}]}],['s2',{oracle_id:'s2o',name:'Soldier',power:'2',toughness:'2'}]]);
const list=Array.from(c.buildDeckTokenList([{name:'A',parts:[{id:'t1',name:'Treasure'},{id:'s1',name:'Soldier'}]},{name:'B',parts:[{id:'t2',name:'Treasure'},{id:'s2',name:'Soldier'},{id:'none',name:'Monarch',type_line:'Card'}]},{name:'C',parts:[]}],details));
assert.equal(list.length,4);assert.equal(list[0].name,'Treasure');assert.deepEqual(Array.from(list[0].sources),['A','B']);assert.equal(list[0].image,'t.jpg');
assert.deepEqual(list.filter(t=>t.name==='Soldier').map(t=>t.power).sort(),['1','2']);
assert.equal(list.find(t=>t.power==='1').image,'s.jpg');
assert.equal(list.find(t=>t.name==='Monarch').image,'');
// Japanese images: other languages and imageless cards are skipped, and a sharper scan replaces a low-resolution one.
const ja=c.japaneseTokenImages([{lang:'ja',oracle_id:'a',image_status:'lowres',image_uris:{normal:'low.jpg'}},{lang:'ja',oracle_id:'a',image_status:'highres_scan',image_uris:{normal:'high.jpg'}},{lang:'ja',oracle_id:'a',image_status:'lowres',image_uris:{normal:'later.jpg'}},{lang:'en',oracle_id:'b',image_uris:{normal:'en.jpg'}},{lang:'ja',oracle_id:'c'},{lang:'ja',oracle_id:'d',card_faces:[{image_uris:{normal:'face.jpg'}}]}]);
assert.equal(ja.get('a').image,'high.jpg');assert.equal(ja.has('b'),false);assert.equal(ja.has('c'),false);assert.equal(ja.get('d').image,'face.jpg');
assert.equal(list[0].oracleId,'tr');
console.log('PASS: token parts, lookups and the merged list.');
