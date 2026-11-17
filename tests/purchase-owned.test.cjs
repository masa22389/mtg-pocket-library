const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
const pick=name=>{const start=code.indexOf(`function ${name}(`);assert(start>=0,name);let depth=0,i=code.indexOf('{',start);for(;i<code.length;i++){if(code[i]==='{')depth++;else if(code[i]==='}'&&--depth===0)break;}return code.slice(start,i+1);};
const c={state:{collection:[]},normalizeCardName:s=>String(s||'').trim().toLowerCase()};vm.createContext(c);
vm.runInContext(['isSameOwnedCardName','sameCardNameOwnedTotal','purchaseOwnedCounts','purchaseOwnedLabel'].map(pick).join('\n'),c);
const bolt='4457ed35-7c10-48c8-9776-456485fdf070';
c.state.collection=[
 {oracleId:bolt,name:'Lightning Bolt',set:'M11',collectorNumber:'149',language:'ja',finish:'nonfoil',quantity:2},
 {oracleId:bolt,name:'Lightning Bolt',set:'m11',collectorNumber:'149',language:'en',finish:'foil',quantity:1},
 {oracleId:bolt,name:'Lightning Bolt',set:'2X2',collectorNumber:'117',quantity:3},
 {oracleId:'other',name:'Shock',set:'M11',collectorNumber:'149',quantity:5},
];
const planned={oracleId:bolt,name:'Lightning Bolt',set:'M11',collectorNumber:'149',language:'en',finish:'foil'};
// The same printing counts every language and finish; the total counts every printing of the card, never other cards.
assert.deepEqual({...c.purchaseOwnedCounts(planned,c.state.collection)},{samePrint:3,sameName:6});
assert.equal(c.purchaseOwnedLabel(planned),'所持：この版 3枚・同名合計 6枚');
assert.equal(c.purchaseOwnedLabel({...planned,set:'LEA',collectorNumber:'161'}),'所持：この版 0枚・同名合計 6枚');
assert.equal(c.purchaseOwnedLabel({oracleId:'none',name:'Black Lotus',set:'LEA',collectorNumber:'232'}),'所持：なし');
// The purchase list shows the line under each item.
assert.match(pick('renderPurchases'),/purchase-owned[\s\S]*purchaseOwnedLabel\(card\)/);
console.log('purchase owned counts ok');
