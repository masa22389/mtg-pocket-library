const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const c={formatYen:v=>`¥${v}`};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('// What was paid per card (yen)'),code.indexOf('function collectionPriceDisplayValue(')),c);
// Purchase price: 0 counts, a missing or bad value does not.
assert.equal(c.purchasePriceOf({purchasePriceYen:0}),0);
assert.equal(c.purchasePriceOf({}),null);
assert.equal(c.purchasePriceOf({purchasePriceYen:'x'}),null);
// Merged lots average by quantity; one missing price keeps the other.
assert.equal(c.mergedPurchasePrice(100,2,400,1),200);
assert.equal(c.mergedPurchasePrice(null,2,400,1),400);
assert.equal(c.mergedPurchasePrice(100,2,null,1),100);
assert.equal(c.mergedPurchasePrice(null,2,null,1),null);
// Gain only compares lots with both prices; unpriced lots stay in the paid total alone.
const lots=[{purchasePriceYen:100,quantity:2,v:500},{purchasePriceYen:1000,quantity:1,v:null},{quantity:4,v:9999},{purchasePriceYen:50,quantity:0,v:0}];
const totals=c.purchaseTotals(lots,card=>card.v);
assert.equal(totals.paid,1200);assert.equal(totals.quantity,3);
assert.equal(totals.comparedPaid,200);assert.equal(totals.comparedQuantity,2);assert.equal(totals.gain,300);
assert.equal(c.formatSignedYen(300),'+¥300');assert.equal(c.formatSignedYen(-300),'−¥300');assert.equal(c.formatSignedYen(0),'±¥0');
// Set progress: one number counts once across languages and finishes; set codes ignore case; zero-quantity lots don't count.
const owned=[{set:'MH3',collectorNumber:'62',quantity:4,v:100},{set:'mh3',collectorNumber:'62',quantity:1,v:50},{set:'MH3',collectorNumber:'400',quantity:1,v:null},{set:'MH3',collectorNumber:'1',quantity:0,v:7}];
const progress=c.setProgressBySet(owned,card=>card.v).get('mh3');
assert.equal(progress.numbers.size,2);assert.equal(progress.value,150);
// Percent: never over 100, and small non-zero shares aren't shown as 0%.
assert.equal(c.setCompletionPercent(2,4),50);assert.equal(c.setCompletionPercent(5,4),100);assert.equal(c.setCompletionPercent(1,0),null);
assert.equal(c.setCompletionLabel(50.9),'50%');assert.equal(c.setCompletionLabel(0.2),'1%未満');assert.equal(c.setCompletionLabel(0),'0%');assert.equal(c.setCompletionLabel(100),'100%');assert.equal(c.setCompletionLabel(null),'');
console.log('PASS: purchase totals and merges, set progress counts each printing once.');
