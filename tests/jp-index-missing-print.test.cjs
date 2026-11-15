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
assert.equal(engine.imageIsEnglish,true,'its picture is the English print, so the label says 英語版画像');
assert(code.includes('&& !item.imageIsEnglish;'));
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
// With 言語=日本語 the lang:ja name search finds nothing on Scryfall, so the index looks up the English print instead.
(async()=>{
  const fn=name=>{let start=code.indexOf(`function ${name}(`);if(code.slice(start-6,start)==='async ')start-=6;return code.slice(start,code.indexOf('\n}\n',start)+3);};
  const queries=[];const english={id:engine.scryfallId,oracle_id:engine.oracleId,name:'Phyrexian Dragon Engine',lang:'en',set:'bro',collector_number:'163'};
  const s={setTimeout,localSearchIndexMatches:()=>[engine],buildLocalIndexScryfallQueryChunks:(items,f)=>[`oracleid:${engine.oracleId} ${f}`],
    jpIndexCardTitles:()=>['ファイレクシアのドラゴン・エンジン'],normalizeAliasKey:x=>x,normalizeCardName:x=>x,cardSearchNames:card=>[card.name],isJapanese:()=>true,
    applyJpIndexToCard:x=>x,stripLanguageFilter:f=>f.replace(/\blang:\w+\s*/g,'').trim(),
    supplementalJpVariantForCard:card=>({...card,lang:'ja',id:`${card.id}-jp-name`,_supplementalJpVariant:true}),
    fetchAllScryfallSearch:async q=>{queries.push(q);return {ok:false,error:{status:404}};},
    fetchScryfallSearch:async q=>{queries.push(q);return /lang:en/.test(q)?{ok:true,data:{data:[english]}}:{ok:false,error:{status:404}};}};
  vm.createContext(s);vm.runInContext(fn('fetchLocalSearchCandidates'),s);
  const found=await s.fetchLocalSearchCandidates('ファイレクシアのドラゴン・エンジン','lang:ja c:b',false,30);
  assert.deepEqual([...found.cards].map(card=>`${card.lang}:${card.collector_number}`),['ja:163']);
  assert.equal(queries.at(-1),`(oracleid:${engine.oracleId}) c:b lang:en`,'the other conditions still apply');
  queries.length=0;
  const english2=await s.fetchLocalSearchCandidates('ファイレクシアのドラゴン・エンジン','lang:en',false,30);
  assert.equal(english2.cards.length,0);assert(!queries.some(q=>q.startsWith('(oracleid')),'only a Japanese search adds it');
  console.log('PASS: with 言語=日本語 the name search still finds BRO #163.');
})().catch(error=>{console.error(error);process.exitCode=1;});
console.log('PASS: BRO #163 ファイレクシアのドラゴン・エンジン can be picked in Japanese though Scryfall lists it in English only.');
