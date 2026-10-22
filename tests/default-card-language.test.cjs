const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');
const fn = source.slice(source.indexOf('async function openCardDialog('), source.indexOf('\nfunction sameCardPrint('));
async function check({cardLang='en', preference='ja', explicit='', mode='collection', owned=null, expected}) {
  const calls=[];
  const element = {value:'', hidden:false, replaceChildren(){}, showModal(){}};
  const context={cardDialogRequestId:0, cardLanguageRequestId:0, state:{defaultCardLanguage:preference}, VARIANT_RENDER_LIMIT:20,
    $:id=>id==='#searchLanguage'||id==='#deckSearchLanguage'?{value:explicit}:element,
    els:{cardActionStatus:element,addCardToDeckButton:element,cardVariants:element,cardDialog:element},
    document:{querySelectorAll:()=>[]},hideInlineStatus(){},renderSelectedVariant(){},changeCardLanguage:async lang=>calls.push(lang)};
  vm.createContext(context); vm.runInContext(fn,context);
  await context.openCardDialog({lang:cardLang},mode,owned);
  assert.deepEqual(calls,expected);
}
(async()=>{
 await check({expected:['ja']});
 await check({cardLang:'ja',expected:[]});
 await check({cardLang:'ja',preference:'en',expected:['en']});
 await check({explicit:'en',expected:[]});
 await check({mode:'deck',expected:['ja']});
 await check({mode:'deck',explicit:'en',expected:[]});
 for(const mode of ['set','scanner']) await check({mode,expected:[]});
 await check({owned:'owned-1',expected:[]});
 console.log('PASS: default Japanese/English, explicit override, deck, owned/set/scanner preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
