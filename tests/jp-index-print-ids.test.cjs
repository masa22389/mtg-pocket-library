const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../mtg-jp-card-index.js'),'utf8');
const items=JSON.parse(source.slice(source.indexOf('['),source.lastIndexOf(']')+1));
const prints=JSON.parse(fs.readFileSync(path.join(__dirname,'../scanner/data/prints.json'),'utf8'));
const byId=new Map(prints.map(p=>[p.id,p]));
// An entry's Scryfall ID must be its own printing: MH3 retro-frame and borderless entries once carried the regular
// card's ID and picture, so #400 showed #62's frame.
const wrong=items.filter(item=>{const p=byId.get(item.scryfallId);return p&&(p.set.toLowerCase()!==String(item.setCode).toLowerCase()||String(p.number)!==String(item.collectorNumber));});
assert.deepEqual(wrong.map(item=>`${item.setCode}:${item.collectorNumber}`),[]);
const index=JSON.parse(fs.readFileSync(path.join(__dirname,'../scanner/data/japanese-images.json'),'utf8'));
assert.equal(index['mh3:400'],undefined,'MH3 #400 uses its exact Japanese picture from the set data');
console.log('PASS: Japanese index entries carry their own printing ID; MH3 #400 has no borrowed picture.');
