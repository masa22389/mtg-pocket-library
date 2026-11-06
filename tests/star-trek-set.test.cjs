const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
const fn=name=>{const a=code.indexOf('function '+name+'(');return code.slice(a,code.indexOf('\n}',a)+2)+'\n';};
const block=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
vm.runInContext(block('const SET_JA_NAMES','\n};')+'\n};globalThis.names=SET_JA_NAMES;'+block('const SET_SEARCH_ALIASES','const FALLBACK_SETS')+fn('stripJapaneseReadings')+fn('normalizeCardName')+fn('normalizeAliasKey')+fn('setAliasCodesForQuery')+'globalThis.lookup=setAliasCodesForQuery;',c);
assert.equal(c.names.trk,'スター・トレック');assert.equal(c.names.trc,'スター・トレック コマンダー');assert.equal(c.names.sds,'宇宙暦');
const codes=q=>Array.from(c.lookup(q));
for(const q of ['スター・トレック','スタートレック','Star Trek','star trek'])assert.deepEqual(codes(q),['trk','trc','sds'],q);
for(const q of ['スター・トレック コマンダー','スタートレックコマンダー','スター・トレック 統率者','スタートレック統率者','Star Trek Commander','TRC'])assert.deepEqual(codes(q),['trc'],q);
for(const q of ['宇宙暦','Stardates','SDS'])assert.deepEqual(codes(q),['sds'],q);
assert.deepEqual(codes('TRK'),['trk']);
// Existing sets keep their matches.
assert.deepEqual(codes('ホビット'),['hob','hoc']);assert.deepEqual(codes('スパイダーマン'),['spm','mar','spe']);
// The picker and search still know these sets when the Scryfall set list can't be fetched.
for(const set of ['trk','trc','sds'])assert.ok(code.includes('{ code: "'+set+'", name:'),set);
// The official gallery's main set: one exact print per number, with the Japanese name and official image.
const w={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../mtg-jp-card-index.js'),'utf8'),{window:w});
const trk=w.MTG_JP_CARD_INDEX.filter(x=>x.setCode==='TRK');
assert.equal(trk.length,311);assert.equal(new Set(trk.map(x=>x.collectorNumber)).size,311);assert.equal(new Set(trk.map(x=>x.oracleId)).size,311);
for(const x of trk){assert.ok(x.jaNames[0]&&x.enNames[0]&&x.scryfallId&&x.oracleId,x.collectorNumber);assert.match(x.images.normal,/^https:\/\/mtg-jp\.com\/\/img_sys\/cardImages\/TRK\/\d+\/cardimage\.png$/);}
const byNumber=n=>trk.find(x=>x.collectorNumber===n);
assert.equal(byNumber('7').enNames[0],'Captain Jean-Luc Picard');assert.equal(byNumber('7').jaNames[0],'ジャン＝リュック・ピカード艦長');
assert.equal(byNumber('311').jaNames[0],'森');
// The Commander gallery: only pages with a Japanese name, one exact print each.
const trc=w.MTG_JP_CARD_INDEX.filter(x=>x.setCode==='TRC');
assert.equal(trc.length,297);assert.equal(new Set(trc.map(x=>x.collectorNumber)).size,297);assert.equal(new Set(trc.map(x=>x.oracleId)).size,297);
for(const x of trc){assert.match(x.jaNames[0],/[ぁ-んァ-ヶ一-龠]/,x.enNames[0]);assert.ok(x.enNames[0]&&x.scryfallId&&x.oracleId,x.collectorNumber);assert.match(x.images.normal,/^https:\/\/mtg-jp\.com\/\/img_sys\/cardImages\/TRC\/\d+\/cardimage\.png$/);}
const trcNamed=name=>trc.find(x=>x.enNames[0]===name);
assert.equal(trcNamed('Starship Enterprise').jaNames[0],'宇宙艦エンタープライズ');
assert.equal(trcNamed('Talisman of Conviction').jaNames[0],'確信のタリスマン');
assert.equal(trcNamed('Talisman of Progress').jaNames[0],'発展のタリスマン');
// A set-name search asks for each set in full and merges without repeating a print.
const s={};vm.createContext(s);
for(const name of ['normalizeSetCode','setAliasSearchFilters','mergeSetAliasCards']){const a=code.indexOf('function '+name+'(');vm.runInContext(code.slice(a,code.indexOf('\n}',a)+2),s);}
assert.equal(s.setAliasSearchFilters('TRC',''),'set:trc');
assert.equal(s.setAliasSearchFilters('trc','lang:ja'),'set:trc lang:ja');
const merged=s.mergeSetAliasCards([{cards:[{id:'a',set:'trk',oracle_id:'1'},{id:'b',set:'trk',oracle_id:'2'},{id:'b2',set:'trk',oracle_id:'2'}]},{cards:[{id:'c',set:'trc',oracle_id:'2'},{}]},{}]);
assert.deepEqual(Array.from(merged).map(x=>x.id),['a','b','c']);
const official=s.mergeSetAliasCards([{cards:[{id:'en',set:'trc',oracle_id:'1',lang:'en'},{id:'en-jp-name',set:'trc',oracle_id:'1',lang:'en',_supplementalJpVariant:true},{id:'later',set:'trc',oracle_id:'1',lang:'en'}]}]);
assert.deepEqual(Array.from(official).map(x=>x.id),['en-jp-name']);
// The set-name route runs before the general search, which caps merged results at 24.
assert.ok(code.indexOf('const setAliasCodes = exactMatch || /\\bset:/i.test(filters)')<code.indexOf('const searchResult = await fetchSearchCandidates(query, filters, sourceLang'));
console.log('PASS star trek set');
