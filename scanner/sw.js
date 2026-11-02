importScripts('./card-image-cache.js');
const META='mtg-pocket-hybrid-scanner-meta-v1',STAGE='mtg-pocket-hybrid-scanner-stage-';let active;
async function name(){if(active)return active;const r=await(await caches.open(META)).match('./active');return active=r?await r.text():null;}
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(handleCardImageRequest(e))return;
 const url=new URL(e.request.url);if(url.origin!==self.location.origin||e.request.method!=='GET')return;
 e.respondWith((async()=>{const n=await name(),cache=n&&await caches.open(n),saved=cache&&await cache.match(e.request,{ignoreSearch:true});
 // Models/catalogues are verified when staged. Reuse them without a network request.
 if(saved&&/\/(data|models|vendor)\//.test(url.pathname))return saved;
 // Code files carry no version in their URLs: ask the server whether they changed (a cheap 304 when not),
 // so an update is used at once instead of an older copy left in the browser cache.
 try{const response=await fetch(new Request(e.request,{cache:'no-cache'}));if(response.ok)return response;}catch{}
 if(saved)return saved;return new Response('Offline asset missing',{status:503});
 })());
});
// One preparation per pack: a retry while it is still running (the page gives up after 240s) joins it
// instead of downloading everything a second time. Stage caches left by an interrupted run are removed.
let preparing=null;const staging=new Set();
self.addEventListener('message',e=>{if(e.data?.type!=='PREPARE')return;const port=e.ports[0],pack=e.data.pack;
 if(preparing?.buildId===pack.buildId){preparing.ports.add(port);e.waitUntil(preparing.promise);return;}
 const ports=new Set([port]),send=message=>{for(const p of ports)try{p.postMessage(message);}catch{}};
 const promise=(async()=>{
 const oldName=await name();
 for(const key of await caches.keys())if(key.startsWith(STAGE)&&key!==oldName&&!staging.has(key))await caches.delete(key);
 const n=STAGE+Date.now(),cache=await caches.open(n),oldCache=oldName&&await caches.open(oldName);let oldPack;staging.add(n);
 if(oldCache){const response=await oldCache.match(new URL('./pack.json',self.location));if(response)oldPack=await response.json();}
 const oldAssets=new Map((oldPack?.assets||[]).map(a=>[a.path,a]));let reusedBytes=0,downloadedBytes=0;
 try{
  for(let i=0;i<pack.assets.length;i++){
   const asset=pack.assets[i],url=new URL(asset.path,self.location);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))throw Error('Invalid path');
   const previous=oldAssets.get(asset.path);let response;
   if(previous?.sha256===asset.sha256&&previous.bytes===asset.bytes&&oldCache){response=await oldCache.match(url);if(response)reusedBytes+=asset.bytes;}
   if(!response){response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(asset.path);const bytes=await response.clone().arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==asset.sha256||bytes.byteLength!==asset.bytes)throw Error('Checksum: '+asset.path);downloadedBytes+=bytes.byteLength;}
   await cache.put(url,response);send({progress:`${i+1}/${pack.assets.length}`,reusedBytes,downloadedBytes});
  }
  await cache.put(new URL('./pack.json',self.location),new Response(JSON.stringify(pack),{headers:{'Content-Type':'application/json'}}));await(await caches.open(META)).put('./active',new Response(n));active=n;send({done:true,reusedBytes,downloadedBytes});
  for(const key of await caches.keys())if(key.startsWith(STAGE)&&key!==n&&!staging.has(key))await caches.delete(key);
 }catch(error){await caches.delete(n);send({error:error.message});}
 finally{staging.delete(n);}
 })().finally(()=>{if(preparing?.promise===promise)preparing=null;});
 preparing={buildId:pack.buildId,promise,ports};e.waitUntil(promise);
});
