const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const pick=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const field=v=>({value:v});
const els={cardQuantity:field('3'),cardCondition:field('NM'),cardFinish:field('normal'),cardLanguage:field('en'),cardLocation:field(''),cardActionStatus:{},deckDialog:{open:false}};
const c={els,state:{selectedCard:{id:'p1'},selectedOwnedId:'a',selectedOwnedFormEmpty:false,cardDialogMode:'collection',
  collection:[{id:'a',scryfallId:'p1',quantity:3,finish:'normal',condition:'NM',language:'en',location:'',purchasePriceYen:100}]}};
c.n=0;Object.assign(c,{cardScryfallId:card=>card?.scryfallId||card?.id||'',normalizeCardCondition:v=>v||'NM',initialCardOwnedQuantity:(m,q)=>q,
  updateCardOwnedActions(){},renderCollection(){},renderDeckEditor(){},showInlineStatus(){},showToast(){},nameOf:()=>'x',persist:async()=>{},
  compactCard:card=>({id:'new'+(++c.n),scryfallId:card.id,quantity:1,finish:els.cardFinish.value,condition:els.cardCondition.value,language:els.cardLanguage.value,location:els.cardLocation.value.trim()}),
  structuredClone});
vm.createContext(c);
vm.runInContext(pick('function selectedOwnedCard(','function isSameOwnedCardName(')+pick('function ownedCardForVariant(','function selectedOwnedQuantity(')+
  'function selectedOwnedQuantity(){return Number(selectedOwnedCard()?.quantity||0);}'+
  pick('function ownedLotMatchesForm(','function selectVariant(')+pick('async function saveSelectedCardQuantity(','function collectionCardMatchesText('),c);
(async()=>{
  // Switching 仕様 to Foil shows the (not yet owned) Foil lot, not the 3 normal copies.
  els.cardFinish.value='foil';c.followFormOwnedLot();
  assert.equal(els.cardQuantity.value,0);assert.equal(c.selectedOwnedCard(),null);
  els.cardQuantity.value='1';await c.saveSelectedCardQuantity();
  const lots=c.state.collection.map(l=>`${l.finish}x${l.quantity}`).sort();
  assert.deepEqual(lots,['foilx1','normalx3'],'the normal lot survives and a Foil lot is added');
  assert.equal(c.state.collection.find(l=>l.id==='a').purchasePriceYen,100);
  // Switching back shows the normal lot again; saving there changes only it.
  els.cardFinish.value='normal';c.followFormOwnedLot();
  assert.equal(els.cardQuantity.value,3);els.cardQuantity.value='2';await c.saveSelectedCardQuantity();
  assert.deepEqual(c.state.collection.map(l=>`${l.finish}x${l.quantity}`).sort(),['foilx1','normalx2']);
  // Condition and location work the same way.
  els.cardCondition.value='LP';els.cardLocation.value=' Box ';c.followFormOwnedLot();assert.equal(els.cardQuantity.value,0);
  els.cardQuantity.value='4';await c.saveSelectedCardQuantity();assert.equal(c.state.collection.length,3);
  // Setting a lot to 0 removes only that lot and keeps the form on it (0 copies).
  els.cardQuantity.value='0';await c.saveSelectedCardQuantity();
  assert.deepEqual(c.state.collection.map(l=>`${l.finish}x${l.quantity}`).sort(),['foilx1','normalx2']);
  assert.equal(c.selectedOwnedQuantity(),0);
  // A lot saved without a language still counts as the current language.
  c.state.collection.push({id:'old',scryfallId:'p1',quantity:5,finish:'etched',condition:'NM',location:''});
  els.cardCondition.value='NM';els.cardLocation.value='';els.cardFinish.value='etched';c.followFormOwnedLot();assert.equal(els.cardQuantity.value,5);
  console.log('PASS: changing 仕様/状態/保管場所 picks its own lot, and saving never rewrites a different lot.');
})().catch(e=>{console.error(e);process.exit(1);});
