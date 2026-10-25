importScripts('./card-image-cache.js');
const META='mtg-pocket-hybrid-scanner-meta-v1';let active;
async function name(){if(active)return active;const r=await(await caches.open(META)).match('./active');return active=r?await r.text():null;}
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(handleCardImageRequest(e))return;
 const url=new URL(e.request.url);if(url.origin!==self.location.origin||e.request.method!=='GET')return;
 e.respondWith((async()=>{const n=await name(),cache=n&&await caches.open(n),saved=cache&&await cache.match(e.request,{ignoreSearch:true});
 // Models/catalogues are verified when staged. Reuse them without a network request.
 if(saved&&/\/(data|models|vendor)\//.test(url.pathname))return saved;
 try{const response=await fetch(e.request);if(response.ok)return response;}catch{}
 if(saved)return saved;return new Response('Offline asset missing',{status:503});
 })());
});
self.addEventListener('message',e=>{if(e.data?.type!=='PREPARE')return;const port=e.ports[0];e.waitUntil((async()=>{
 const pack=e.data.pack,n='mtg-pocket-hybrid-scanner-stage-'+Date.now(),cache=await caches.open(n),oldName=await name(),oldCache=oldName&&await caches.open(oldName);let oldPack;
 if(oldCache){const response=await oldCache.match(new URL('./pack.json',self.location));if(response)oldPack=await response.json();}
 const oldAssets=new Map((oldPack?.assets||[]).map(a=>[a.path,a]));let reusedBytes=0,downloadedBytes=0;
 try{
  for(let i=0;i<pack.assets.length;i++){
   const asset=pack.assets[i],url=new URL(asset.path,self.location);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))throw Error('Invalid path');
   const previous=oldAssets.get(asset.path);let response;
   if(previous?.sha256===asset.sha256&&previous.bytes===asset.bytes&&oldCache){response=await oldCache.match(url);if(response)reusedBytes+=asset.bytes;}
   if(!response){response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(asset.path);const bytes=await response.clone().arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==asset.sha256||bytes.byteLength!==asset.bytes)throw Error('Checksum: '+asset.path);downloadedBytes+=bytes.byteLength;}
   await cache.put(url,response);port.postMessage({progress:`${i+1}/${pack.assets.length}`,reusedBytes,downloadedBytes});
  }
  await cache.put(new URL('./pack.json',self.location),new Response(JSON.stringify(pack),{headers:{'Content-Type':'application/json'}}));await(await caches.open(META)).put('./active',new Response(n));active=n;port.postMessage({done:true,reusedBytes,downloadedBytes});
  for(const key of await caches.keys())if(key.startsWith('mtg-pocket-hybrid-scanner-stage-')&&key!==n)await caches.delete(key);
 }catch(error){await caches.delete(n);port.postMessage({error:error.message});}
})());});
