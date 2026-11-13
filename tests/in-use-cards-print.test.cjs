const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pick=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const c={state:{collection:[]},nameOf:card=>card.printedName||card.name,cardIsFoilOnly:()=>false,cardScryfallId:card=>card?.scryfallId||card?.id||''};
vm.createContext(c);
vm.runInContext(pick('function cardFinishKind(','function cardFinishBadge(')+pick('function cardForDeckEntry(','function ownedQuantityForEntry(')+
  pick('function deckLatestEntries(','function deckUsageForCard(')+pick('function deckEntryDisplayParts(','function renderDeckSection(')+
  pick('function inUseCardPrintGroups(','function inUseCardGroups('),c);
const fable={oracleId:'fable',name:'Fable of the Mirror-Breaker',printedName:'鏡割りの寓話',set:'NEO',collectorNumber:'141'};
const lot=(id,finish,quantity,language='ja',scryfallId='neo141')=>({id,...fable,scryfallId,finish,quantity,language});
c.state.collection=[lot('f','foil',1),lot('n','normal',4),lot('en','normal',2,'en')];
const decks=[
  {id:'a',name:'ボロス',format:'モダン',inUse:true,entries:[{cardId:'f',section:'main',quantity:4},{cardId:'n',section:'maybe',quantity:3}]},
  {id:'b',name:'赤単',format:'レガシー',inUse:true,entries:[{cardId:'n',section:'main',quantity:4},{cardId:'en',section:'side',quantity:3}]},
  {id:'c',name:'崩した',format:'モダン',entries:[{cardId:'n',section:'main',quantity:4}]},
];
const groups=c.inUseCardPrintGroups(decks,c.state.collection);
const view=[...groups.map(g=>`${c.inUsePrintLabel(g)} 使用${g.used} 所持${g.owned} `+g.decks.map(d=>`${d.deck.name}(${Object.entries(d.counts).filter(([,n])=>n).map(([s,n])=>s+n).join(',')})`).join(' '))];
assert.deepEqual(view,[
  'NEO #141・英語 使用2 所持2 赤単(side2)',
  'NEO #141・日本語 使用7 所持4 ボロス(main3) 赤単(main4)',
  'NEO #141・Foil・日本語 使用2 所持1 ボロス(main1) 赤単(side1)',
],'each deck deals its copies out of the lots like the deck screen (赤単 side: English 2, then the unused Foil); rows are print + Foil + language; candidates and decks not in use are left out');
assert.equal(groups[1].used-groups[1].owned,3,'two decks wanting the same normal Japanese copies show as a shortage');
assert.match(html,/<select id="inUseCardGrouping"><option value="print">収録版・Foil・言語ごと<\/option><option value="name">カード名でまとめる<\/option><\/select>/);
assert.match(code,/inUseCardGrouping: appStorage\.getItem\(KEYS\.inUseCardGrouping\) === "name" \? "name" : "print"/,'print rows are the default');
console.log('PASS: the 使用中カード list can split rows by print, Foil and language, counting owned copies of exactly that look.');
