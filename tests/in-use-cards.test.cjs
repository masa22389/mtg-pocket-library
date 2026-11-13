const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pick=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const c={state:{collection:[]},nameOf:card=>card.printedName||card.name,normalizeCardName:v=>String(v||'').toLowerCase()};
vm.createContext(c);
vm.runInContext(pick('function cardForDeckEntry(','function ownedQuantityForEntry(')+pick('function deckLatestEntries(','function deckUsageForCard(')+
  pick('function isSameOwnedCardName(','function sameCardNameOwnedTotal(')+pick('function sameCardNameOwnedTotal(','\n}\n')+'\n}\n'+
  pick('function inUseCardGroups(','let deckTab'),c);
const fable={oracleId:'fable',name:'Fable of the Mirror-Breaker',printedName:'鏡割りの寓話'};
const bolt={oracleId:'bolt',name:'Lightning Bolt',printedName:'稲妻'};
c.state.collection=[{id:'f1',...fable,quantity:4,finish:'normal'},{id:'f2',...fable,quantity:1,finish:'foil'},{id:'b1',...bolt,quantity:2}];
const decks=[
  {id:'a',name:'ボロス',inUse:true,entries:[{cardId:'f1',section:'main',quantity:3},{cardId:'f2',section:'side',quantity:1},{cardId:'b1',section:'maybe',quantity:4}]},
  {id:'b',name:'赤単',inUse:true,entries:[{cardId:'scryfall-x',card:{...fable,scryfallId:'x'},section:'main',quantity:2},{cardId:'b1',quantity:2}]},
  {id:'c',name:'崩した',entries:[{cardId:'f1',section:'main',quantity:4}]},
  // A deck with versions counts its latest version, as opening it shows.
  {id:'d',name:'版あり',inUse:true,activeVersion:1,entries:[{cardId:'b1',section:'main',quantity:4}],versions:[{number:1,entries:[]},{number:2,entries:[{cardId:'b1',section:'main',quantity:1}]}]},
];
const groups=c.inUseCardGroups(decks,c.state.collection);
const view=groups.map(g=>`${c.nameOf(g.card)} 使用${g.used} 所持${g.owned} `+g.decks.map(d=>`${d.deck.name}(${Object.entries(d.counts).filter(([,n])=>n).map(([s,n])=>s+n).join(',')})`).join(' '));
assert.deepEqual([...view],[
  '稲妻 使用3 所持2 赤単(main2) 版あり(main1)',
  '鏡割りの寓話 使用6 所持5 ボロス(main3,side1) 赤単(main2)',
],'grouped by name across prints; 候補 and decks not in use are left out; no section counts as main');
assert.match(html,/data-deck-tab="inUse"/);assert.match(html,/<input id="inUseCardSearch" type="search"/);
assert(code.includes('<span class="in-use-deck-format">${esc(deck.format)}</span>'),'each deck row names its format');
console.log('PASS: the 使用中カード list groups in-use decks by card name, skips candidates, and compares with owned copies.');
