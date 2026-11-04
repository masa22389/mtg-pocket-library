(async()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
const name=code.match(/const CACHE = "([^"]+)"/)[1];
const url='https://x.test/scanner/data/japanese-images.json';
const store=entries=>({match:async request=>entries[request.url]});
const stores={'mtg-pocket-hybrid-scanner-stage-1':store({[url]:'old index from the scanner pack'}),[name]:store({[url]:'new index'}),'mtg-pocket-data':store({'https://x.test/data.js?h=1':'hashed data'})};
const listeners={};
const c={URL,Request:class{},Response:{error:()=>'error'},console,setTimeout,importScripts(){},handleCardImageRequest:()=>false,fetch:async()=>{c.network++;return {ok:true,clone(){return this;}};},network:0,
  caches:{open:async key=>stores[key]||store({}),match:async request=>{for(const s of Object.values(stores)){const hit=await s.match(request);if(hit)return hit;}}},
  self:{addEventListener:(type,fn)=>{listeners[type]=fn;},location:new URL('https://x.test/sw.js'),registration:{scope:'https://x.test/'}}};
vm.createContext(c);vm.runInContext(code,c);
const fetched=async requestUrl=>{let answer;listeners.fetch({request:{url:requestUrl,method:'GET',mode:'cors'},respondWith:value=>{answer=value;}});return answer;};
// The app's own cache answers, never the scanner's older staged copy.
assert.equal(await fetched(url),'new index');
assert.equal(await fetched('https://x.test/data.js?h=1'),'hashed data');
assert.equal(c.network,0);
console.log('PASS: the service worker reads only its own caches, not the scanner pack.');
})().catch(error=>{console.error(error);process.exitCode=1;});
