const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={};vm.createContext(c);
const fn=name=>{const a=code.indexOf('function '+name+'(');return code.slice(a,code.indexOf('\n}',a)+2)+'\n';};
const block=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
vm.runInContext(block('const SET_JA_NAMES','\n};')+'\n};globalThis.names=SET_JA_NAMES;'+block('const SET_SEARCH_ALIASES','const FALLBACK_SETS')+fn('stripJapaneseReadings')+fn('normalizeCardName')+fn('normalizeAliasKey')+fn('setAliasCodesForQuery')+'globalThis.lookup=setAliasCodesForQuery;',c);
assert.equal(c.names.trk,'スター・トレック');assert.equal(c.names.trc,'スター・トレック 統率者');assert.equal(c.names.sds,'宇宙暦');
const codes=q=>Array.from(c.lookup(q));
for(const q of ['スター・トレック','スタートレック','Star Trek','star trek'])assert.deepEqual(codes(q),['trk','trc','sds'],q);
for(const q of ['スター・トレック 統率者','スタートレック統率者','Star Trek Commander','TRC'])assert.deepEqual(codes(q),['trc'],q);
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
console.log('PASS star trek set');
