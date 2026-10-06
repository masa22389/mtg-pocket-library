(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const context={normalizeCardCondition:x=>x||'NM',uid:()=> 'new-owned',state:{},KEYS:{collection:'collection',purchases:'purchases'}};
vm.createContext(context);
vm.runInContext(code.slice(code.indexOf('function buildPurchaseTransfer('),code.indexOf("$('#purchaseTransferCancel')")),context);
const card={id:'wish',scryfallId:'print1',name:'Card',quantity:3,language:'ja',finish:'foil',condition:'NM',location:'',image:'image'};
let next=context.buildPurchaseTransfer([card],[],'wish',2);
assert.equal(next.collection[0].quantity,2);assert.equal(next.collection[0].id,'new-owned');assert.equal(next.purchases[0].quantity,1);assert.equal(card.quantity,3);
const owned={...card,id:'owned',quantity:4,favorite:true,favoriteGroupIds:['favorite'],manualPrice:123};
next=context.buildPurchaseTransfer([card],[owned],'wish',3);
assert.equal(next.collection[0].quantity,7);assert.equal(next.collection[0].id,'owned');assert.equal(next.collection[0].manualPrice,123);assert.equal(next.collection[0].favorite,true);assert.equal(next.purchases.length,0);assert.equal(owned.quantity,4);
for(const change of [{language:'en'},{finish:'normal'},{condition:'SP'},{location:'binder'},{scryfallId:'print2'}]) {
 const result=context.buildPurchaseTransfer([card],[{...owned,...change}],'wish',1);assert.equal(result.collection.length,2);
}
for(const quantity of [0,-1,4,1.5,NaN]) assert.throws(()=>context.buildPurchaseTransfer([card],[],'wish',quantity));
assert.throws(()=>context.buildPurchaseTransfer([],[],'wish',1));
const memory=new Map([['collection','original collection'],['purchases','original purchases']]);
context.state={collection:[owned],purchases:[card]};
context.appStorage={writeBatch:async()=>{throw Error('quota');}};
await assert.rejects(context.savePurchaseTransfer(next));
assert.equal(memory.get('collection'),'original collection');assert.equal(context.state.collection[0].quantity,4);
context.appStorage.writeBatch=async entries=>{for(const [key,value] of entries)memory.set(key,value);};
await context.savePurchaseTransfer(next);assert.equal(context.state.collection[0].quantity,7);assert.equal(context.state.purchases.length,0);
console.log('PASS: partial/full transfer, matching lots, metadata preservation, invalid/repeated submissions, quota rollback and successful persistence.');

})().catch(error=>{console.error(error);process.exitCode=1;});
