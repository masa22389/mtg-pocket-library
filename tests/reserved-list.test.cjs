const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const code=read('app.js'),html=read('index.html'),sw=read('sw.js'),css=read('styles.css');
// The list is built from Scryfall is:reserved: [oracle ID, English name] for every Reserved List card.
const w={};vm.createContext({window:w});vm.runInContext(read('reserved-list.js'),vm.createContext({window:w}));
const list=[...w.MTG_RESERVED_LIST];
assert(list.length>=570,`${list.length} cards`);
assert(list.some(([,name])=>name==='Black Lotus'));
assert(list.every(([id])=>/^[0-9a-f-]{36}$/.test(id)));
const c={window:{MTG_RESERVED_LIST:list}};vm.createContext(c);
vm.runInContext(code.slice(code.indexOf('const RESERVED_LIST ='),code.indexOf('function cardFinishClass(')),c);
const lotus=list.find(([,name])=>name==='Black Lotus');
// Saved lots never stored the flag: the oracle ID decides, then the English name for lots without one.
assert.equal(c.isReservedCard({oracleId:lotus[0],name:'Black Lotus'}),true);
assert.equal(c.isReservedCard({oracle_id:lotus[0]}),true);
assert.equal(c.isReservedCard({name:'black lotus'}),true);
assert.equal(c.isReservedCard({reserved:true,oracleId:'x'}),true);
assert.equal(c.isReservedCard({oracleId:'4457ed35-7c10-48c8-9776-456485fdf070',name:'Lightning Bolt'}),false);
assert.equal(c.isReservedCard({name:'Lightning Bolt'}),false);
assert.equal(c.isReservedCard(null),false);
assert.equal(c.reservedBadge({name:'Black Lotus'}),'<span class="reserved-badge">再録禁止</span>');
assert.equal(c.reservedBadge({name:'Lightning Bolt'}),'');
// Collection images, the collection list and the card screen show it; the filter has 再録禁止のみ.
assert(code.includes('${cardFinishBadge(card)}${reservedBadge(card)}\n'));
assert(code.includes('<strong>${esc(nameOf(card))}${reservedBadge(card)}</strong>'));
assert(code.includes('${displayLanguageLabel(card)}</span>${reservedBadge(card)}<h2>'));
assert(html.includes('<input id="collectionReservedOnly" type="checkbox"><span>再録禁止のみ</span>'));
assert(code.includes('(!reservedOnly || isReservedCard(card))'));
assert(code.includes('if ($("#collectionReservedOnly").checked) chips.push("再録禁止のみ");'));
assert(code.includes('$("#collectionReservedOnly").addEventListener("change", showFilteredCollection);'));
assert(code.includes('$("#collectionReservedOnly").checked = false;'));
// The list loads before app.js and is cached with the other data files by content hash.
assert(/<script src="reserved-list\.js\?h=[0-9a-f]{12}" defer><\/script>/.test(html));
assert(html.indexOf('reserved-list.js')<html.indexOf('src="app.js'));
assert(/"\.\/reserved-list\.js\?h=[0-9a-f]{12}"/.test(sw));
assert(/\.collection-image-card \.reserved-badge\{[^}]*top:26px;left:4px[^}]*pointer-events:none/.test(css));
console.log('PASS: Reserved List cards are marked 再録禁止 in the collection and card screen, with a 再録禁止のみ filter.');
