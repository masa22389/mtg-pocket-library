import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const json=n=>JSON.parse(readFileSync(new URL('../'+n,import.meta.url)));
const japanese=s=>/[ぁ-んァ-ン一-龯]/u.test(s||'');

test('Star Trek sets are complete in every scanner catalogue',()=>{
 const coverage=json('coverage.json'),supplement=coverage.supplements.find(s=>s.sets.includes('trk'));
 assert.deepEqual(supplement.sets,['trk','trc','sds','ttrk','ttrc']);
 const prints=json('data/prints.json').filter(p=>supplement.sets.includes(p.set));
 const count={};for(const p of prints)count[p.set]=(count[p.set]||0)+1;
 // Scryfall paper prints on 2026-11-16 (TRK includes the 105 variants and 10 Klingon-language prints).
 assert.deepEqual(count,{trk:586,trc:556,sds:30,ttrk:27,ttrc:14});
 assert.equal(prints.length,supplement.prints);
 const milo=new Set(json('data/milo-cards.json').map(c=>c.id)),fingerprinted=new Set(json('data/cards.json').map(c=>c.oracleId));
 const identities=new Map(json('data/identities.json').map(c=>[c.oracleId,c]));
 for(const p of prints){assert.ok(milo.has(p.id),p.set+' '+p.number);assert.ok(fingerprinted.has(p.oracleId),p.set+' '+p.number);assert.ok(identities.has(p.oracleId),p.set+' '+p.number);}
 // Cards printed in Japanese show their Japanese name in the scanner list.
 const kirk=prints.find(p=>p.set==='trk'&&p.number==='1');assert.ok(identities.get(kirk.oracleId).aliases.some(japanese));
});

test('Star Trek Japanese printings are known for the default printing choice',()=>{
 const display=json('data/print-display.json'),manifest=json('data/japanese-image-manifest.json');
 assert.ok(display.japanesePrintings.trk.length>=470);assert.ok(display.japanesePrintings.trc.length>=514);assert.equal(display.japanesePrintings.sds.length,30);
 assert.equal(display.sets.ttrc,'Star Trek Commander Tokens');
 for(const set of ['trk','trc','sds']){const bucket=json('data/'+manifest.sets[set].path.replace('./',''));assert.equal(Object.keys(bucket).length,manifest.sets[set].records);for(const row of Object.values(bucket)){assert.equal(row.language,'ja');assert.ok(row.images.normal.startsWith('https://cards.scryfall.io/'));}}
});
