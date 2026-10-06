const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
let saved, message, fail=false;
const c={structuredClone, state:{collection:[],selectedCard:{id:'scan-id',name:'Scanned'},selectedOwnedId:null},els:{cardQuantity:{value:1},cardActionStatus:{}},cardScryfallId:card=>card.id,
 selectedOwnedCard:()=>c.state.collection.find(x=>x.id===c.state.selectedOwnedId),compactCard:()=>({id:'lot',scryfallId:'scan-id',condition:'NM',finish:'normal',language:'en',location:'',quantity:1}),normalizeCardCondition:x=>x,
 persist:fields=>{assert.deepEqual(Array.from(fields),['collection']);if(fail)throw Object.assign(Error(),{name:'QuotaExceededError'});saved=JSON.stringify(c.state.collection);},renderCollection(){},updateCardOwnedActions(){},selectedOwnedQuantity:()=>c.state.collection[0]?.quantity||0,nameOf:x=>x.name,showInlineStatus:(_,text)=>message=text,showToast(){}};
vm.createContext(c);
for(const name of ['initialCardOwnedQuantity','saveSelectedCardQuantity']){const start=code.indexOf(`function ${name}(`);vm.runInContext(code.slice(start,code.indexOf('\n}',start)+2),c);}
assert.equal(c.initialCardOwnedQuantity('scanner',0),1);assert.equal(c.initialCardOwnedQuantity('scanner',4),4);assert.equal(c.initialCardOwnedQuantity('collection',0),0);
c.saveSelectedCardQuantity();assert.equal(JSON.parse(saved)[0].quantity,1);
c.els.cardQuantity.value=3;c.saveSelectedCardQuantity();assert.equal(JSON.parse(saved)[0].quantity,3);assert.equal(c.state.collection.length,1);
fail=true;c.els.cardQuantity.value=5;c.saveSelectedCardQuantity();assert.equal(c.state.collection[0].quantity,3);assert.equal(JSON.parse(saved)[0].quantity,3);assert.match(message,/保存できません/);
fail=false;c.state.collection=[];c.state.selectedOwnedId=null;c.els.cardQuantity.value=0;c.saveSelectedCardQuantity();assert.equal(c.state.collection.length,0);assert.match(message,/0枚/);
c.els.cardQuantity.value='abc';c.saveSelectedCardQuantity();assert.match(message,/整数/);
console.log('PASS: scanner default, existing quantities, save/update, persistence failure rollback and explicit invalid/zero feedback.');
