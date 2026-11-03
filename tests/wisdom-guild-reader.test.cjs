(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const take=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const fn=[take('const WISDOM_GUILD_PRICE_BASE','function wisdomGuildStatusText('),take('async function fetchWisdomGuildHtml(','\nfunction textFromMarkdownCell(')].join('\n');
const calls=[];
const c={AbortController,setTimeout,clearTimeout,encodeURIComponent,
  fetch:async(url,options)=>{calls.push({url,headers:options.headers});return {ok:true,text:async()=>'Markdown Content:\n| a |'};}};
vm.createContext(c);vm.runInContext(fn,c);
// Price pages ask the reader for the price table, so a short table is not dropped for the sidebar.
await c.fetchWisdomGuildHtml(`https://wonder.wisdom-guild.net/price/Urza's+Tower/?set%5B%5D=CHR&stock_gt=1`);
assert.equal(calls[0].headers['x-target-selector'],'.wg-wonder-price-table');
// Search pages are read as before.
await c.fetchWisdomGuildHtml("https://wonder.wisdom-guild.net/search.php?card=x");
assert.equal(calls[1].headers,undefined);
console.log('PASS: the reader is asked for the price table on price pages only.');
})().catch(error=>{console.error(error);process.exitCode=1;});
