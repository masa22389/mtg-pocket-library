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
console.log('PASS star trek set');
