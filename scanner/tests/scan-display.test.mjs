import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {localizedScanName,unselectedJapaneseReference} from '../scan-display.mjs';
const identities=JSON.parse(fs.readFileSync(new URL('../data/identities.json',import.meta.url))),display=JSON.parse(fs.readFileSync(new URL('../data/print-display.json',import.meta.url)));
test('Japanese scan names include both reported cards without a printing choice',()=>{
 for(const [english,japanese]of [['Verdant Kraken','新緑のクラーケン'],["Sphinx's Approach",'スフィンクスの接近'],['Blossom-Blessed Angel // Seed Suture','花開く祝福の天使'],['Clarion Conqueror','鳴り渡る龍哮の征服者']])assert.equal(localizedScanName(identities.find(c=>c.name===english)),japanese);
});
test('Japanese reference is display-only and cannot replace a selected or English printing',()=>{
 const row={oracleId:'48b1ac27-430f-4fd9-a71b-6ad125c57fe3',printId:null},before=structuredClone(row),ref=unselectedJapaneseReference(row,display);assert.equal(ref.set,'fra');assert.equal(ref.number,'41');assert.ok(ref.image.includes('fbe3484f-5d55-4e73-95da-628b66c5de69'));assert.deepEqual(row,before);
 assert.equal(unselectedJapaneseReference({...row,language:'en'},display),null);assert.equal(unselectedJapaneseReference({...row,printId:'chosen'},display),null);assert.equal(unselectedJapaneseReference({...row,confirmed:{set:'fra',collectorNumber:'442'}},display),null);
});
