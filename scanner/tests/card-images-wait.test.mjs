import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {createCardImages}=createRequire(import.meta.url)('../card-images.js');
function caches(){const all=new Map();return {open:async name=>{if(!all.has(name))all.set(name,new Map());const m=all.get(name);return {match:async k=>m.get(k)?.clone(),put:async(k,r)=>m.set(k,r.clone()),keys:async()=>[...m.keys()],delete:async k=>m.delete(k)};}};}
// A fake <img>: setting src to a new picture fires load (or error) on the next tick.
function fakeImage(src,{fail=false}={}){const listeners=new Map();const image={hidden:false,style:{},isConnected:true,onerror:null,_src:src,
  get src(){return this._src;},set src(v){this._src=v;setTimeout(()=>{if(fail&&v!==this.fallback){this.onerror?.();}else{for(const f of listeners.get('load')||[])f();listeners.delete('load');}},5);},
  addEventListener(name,f){listeners.set(name,[...(listeners.get(name)||[]),f]);}};return image;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const english='https://cards.scryfall.io/normal/front/1/1/placeholder.jpg?1783035128';
const japanese='https://cdn.shopify.com/s/files/1/0672/8302/6038/files/predict.jpg';
const request={set:'ody',number:'94',oracleId:'o',language:'ja',fallbackUrl:english};
const local=url=>createCardImages({indexUrl:'index',cacheStorage:caches(),fetcher:async u=>{if(u==='index')return Response.json({'ody:94':{set:'ody',number:'94',language:'ja',oracleId:'o',source:'serra-catalog-exact',images:{normal:url}}});throw Error('no api');}});

test('the English placeholder is never shown while the Japanese picture loads',async()=>{
  const image=fakeImage(english),seen=[];
  local(japanese).bind(image,request,()=>{});
  assert.equal(image.style.visibility,'hidden','hidden as soon as it is bound');
  for(let i=0;i<20;i++){seen.push([image.src,image.style.visibility]);await sleep(2);}
  assert.equal(image.src,japanese);assert.equal(image.style.visibility,'visible');
  assert(!seen.some(([src,v])=>src===english&&v==='visible'),'the English picture is never visible');
});
test('the same picture with a different ?timestamp shows at once without reloading',async()=>{
  const image=fakeImage(english);
  local('https://cards.scryfall.io/normal/front/1/1/placeholder.jpg?999').bind(image,request,()=>{});
  await sleep(1);await sleep(1);
  assert.equal(image.src,english);assert.equal(image.style.visibility,'visible');
});
test('an image that fails to load falls back to the placeholder and shows it',async()=>{
  const image=fakeImage(english,{fail:true});image.fallback=english;const results=[];
  local(japanese).bind(image,request,r=>results.push(r.reason||'ok'));
  await sleep(30);
  assert.equal(image.src,english);assert.equal(image.style.visibility,'visible');assert(results.includes('image-load-failed'));
});
test('a slow lookup shows the placeholder after a short wait instead of a long blank',async()=>{
  const image=fakeImage(english);
  const slow=createCardImages({indexUrl:'index',cacheStorage:caches(),fetcher:()=>new Promise(()=>{})});
  const cancel=slow.bind(image,request,()=>{});
  await sleep(1400);assert.equal(image.style.visibility,'hidden');
  await sleep(250);assert.equal(image.style.visibility,'visible');assert.equal(image.src,english);
  cancel();
});
test('canceling (the card changed) never leaves the picture hidden; English requests are not hidden',async()=>{
  const image=fakeImage(english);
  const cancel=createCardImages({indexUrl:'index',cacheStorage:caches(),fetcher:()=>new Promise(()=>{})}).bind(image,request,()=>{});
  assert.equal(image.style.visibility,'hidden');cancel();assert.equal(image.style.visibility,'');
  const en=fakeImage(english);createCardImages({indexUrl:'index',cacheStorage:caches(),fetcher:()=>new Promise(()=>{})}).bind(en,{...request,language:'en'},()=>{});
  assert.equal(en.style.visibility,undefined);
});
