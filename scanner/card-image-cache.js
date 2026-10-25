// Shared by the app and scanner service workers; keep only recently viewed pictures.
function handleCardImageRequest(event) {
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||request.destination!=='image'||url.protocol!=='https:'||!(['cards.scryfall.io','mtg-jp.com','media.wizards.com','files.hareruyamtg.com','cardshop-serra.com'].includes(url.hostname)||(url.hostname==='cdn.shopify.com'&&url.pathname.startsWith('/s/files/1/0672/8302/6038/'))))return false;
  event.respondWith((async()=>{
    const cache=await caches.open('mtg-card-pictures-v1'),saved=await cache.match(request,{ignoreVary:true});
    if(saved)return saved;
    // Opaque responses can consume heavily padded quota on mobile browsers.
    // Cache CORS-readable images; leave other hosts to the normal HTTP cache.
    let response;
    try{response=await fetch(new Request(request,{mode:'cors',credentials:'omit'}));}
    catch{response=await fetch(request);}
    if(response.ok&&response.type!=='opaque')event.waitUntil((async()=>{
      await cache.put(request,response.clone());const keys=await cache.keys();
      for(const old of keys.slice(0,Math.max(0,keys.length-160)))await cache.delete(old);
    })().catch(()=>{}));
    return response;
  })());
  return true;
}
