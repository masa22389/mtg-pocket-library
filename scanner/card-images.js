// Image lookup never changes a card's identity, printing, language or ownership.
((root) => {
  function createCardImages({fetcher = (...args) => fetch(...args), indexUrl, cacheStorage = root.caches, now = Date.now} = {}) {
    const memory = new Map(), pending = new Map();
    let indexPromise, tail = Promise.resolve();
    const trusted = value => { try { const u = new URL(value); return u.protocol === 'https:' && ['cards.scryfall.io','mtg-jp.com','media.wizards.com','files.hareruyamtg.com','cardshop-serra.com'].includes(u.hostname); } catch { return false; } };
    function displayImage(card, face = 0) {
      const native = face ? card?.card_faces?.[face]?.image_uris?.normal || card?.backImage || '' : card?.image_uris?.normal || card?.card_faces?.[0]?.image_uris?.normal || card?.image || '';
      const japanese = String(card?.lang || card?.language || '').toLowerCase() === 'ja' && card?._jpImageExact;
      return (japanese ? (face ? card?.jpImages?.back : card?.jpImage || card?.jpImages?.normal) : '') || native;
    }
    async function index() {
      if (!indexPromise) indexPromise = fetcher(indexUrl).then(r => {if (!r.ok) throw Error('image index'); return r.json();}).catch(() => {indexPromise = null; return {};});
      return indexPromise;
    }
    async function cached(key) {
      if (memory.has(key) && memory.get(key).expires > now()) return memory.get(key).value;
      try {const response = await (await cacheStorage?.open('mtg-card-image-metadata-v3'))?.match(key); if (response) {const record = await response.json(); if (record.expires > now()) {memory.set(key,record); return record.value;}}} catch {}
      return null;
    }
    async function remember(key,value,days) {
      const record = {value,expires:now()+days*86400000}; memory.set(key,record);
      try {const cache = await cacheStorage?.open('mtg-card-image-metadata-v3'); if (cache) {await cache.put(key,new Response(JSON.stringify(record))); const keys = await cache.keys(); for (const old of keys.slice(0,Math.max(0,keys.length-1000))) await cache.delete(old);}} catch {}
      return value;
    }
    function validCard(card, request) {
      const ids = [card?.oracle_id,...(card?.card_faces || []).map(f => f.oracle_id)];
      return card?.lang === request.language && String(card.set).toLowerCase() === request.set && String(card.collector_number) === request.number && (!request.oracleId || ids.includes(request.oracleId));
    }
    async function lookup(request) {
      const {set,number,language,oracleId,face} = request;
      const key = `https://mtg-pocket.invalid/card-image/${encodeURIComponent(set)}/${encodeURIComponent(number)}/${language}/${face}?oracle=${encodeURIComponent(oracleId)}`;
      const saved = await cached(key); if (saved) return saved;
      if (language === 'ja') {
        const known = (await index())[set+':'+number];
        const url = face ? known?.images?.back : known?.images?.normal;
        if (url && trusted(url) && known.source !== 'scryfall-ja' && (!oracleId || known.oracleId === oracleId)) return remember(key,{url,language:'ja',source:known.source,fallback:false},7);
      }
      // One in-flight API request, with a minimum gap. Only visible images request metadata.
      const operation = tail.then(async () => {
        const started = Date.now();
        try {
          const response = await fetcher(`https://api.scryfall.com/cards/${encodeURIComponent(set)}/${encodeURIComponent(number)}/${language}`,{signal:AbortSignal.timeout(8000)});
          if (response.status === 404) return remember(key,{url:'',language,reason:'not-available'},1);
          if (!response.ok) throw Error('image metadata');
          const card = await response.json();
          if (!validCard(card,request)) return {url:'',language,reason:'printing-mismatch'};
          const url = ['placeholder','missing'].includes(card.image_status) ? '' : displayImage(card,face);
          return remember(key,{url:trusted(url)?url:'',language,source:'scryfall',fallback:false,reason:url?'':'image-missing'},url?7:1);
        } finally {await new Promise(resolve => setTimeout(resolve,Math.max(0,120-(Date.now()-started))));}
      });
      tail = operation.catch(() => {});
      return operation;
    }
    async function resolve({set,number,language='ja',oracleId='',face=0,fallbackUrl=''}) {
      const request = {set:String(set || '').toLowerCase(),number:String(number ?? ''),language,oracleId,face};
      if (!request.set || !request.number || !['ja','en'].includes(language)) return {url:fallbackUrl,fallback:true,reason:'printing-unselected'};
      const key = JSON.stringify(request);
      if (!pending.has(key)) pending.set(key,lookup(request).catch(() => ({url:'',language,reason:'unavailable'})).finally(() => pending.delete(key)));
      const result = await pending.get(key);
      return result.url ? result : {...result,url:fallbackUrl,fallback:true};
    }
    function bind(image,request,onResult) {
      let canceled = false,observer;
      const run = async () => {
        observer?.disconnect();
        const result = await resolve(request);
        if (canceled || !image.isConnected) return;
        const fallback = request.fallbackUrl || '';
        image.onerror = () => {if (canceled) return; image.onerror = null; if (fallback && image.src !== fallback) {image.src = fallback; onResult?.({...result,fallback:true,reason:'image-load-failed'});} else {image.style.visibility='hidden'; onResult?.({...result,fallback:true,reason:'image-load-failed'});}};
        if (result.url) {image.hidden=false;image.src = result.url; image.style.visibility='visible';}
        onResult?.(result);
      };
      if (typeof IntersectionObserver === 'function') {observer = new IntersectionObserver(entries => {if (entries.some(e => e.isIntersecting)) run();}); observer.observe(image);} else run();
      return () => {canceled=true;observer?.disconnect();};
    }
    function observe(document) {
      const bound=new Map();
      const scan=()=>{
        for(const [image,entry] of bound)if(!image.isConnected||!image.hasAttribute('data-japanese-image')){entry.cancel();bound.delete(image);}
        for(const image of document.querySelectorAll('img[data-japanese-image]')) {
          const attribute=image.getAttribute('data-japanese-image');if(bound.get(image)?.attribute===attribute)continue;
          bound.get(image)?.cancel();
          let request;try{request=JSON.parse(attribute);}catch{continue;}
          const cancel=bind(image,request,result=>{
            image.title=result.fallback?'この収録版の日本語画像は未取得です':'この収録版の日本語画像';
            const pictures=image.closest('.card-detail-images');if(!pictures)return;
            let note=pictures.nextElementSibling;
            if(!note?.classList.contains('localized-image-note')){note=document.createElement('small');note.className='localized-image-note';pictures.after(note);}
            note.textContent=result.fallback?'この収録版の日本語画像は未取得です':'';
            note.hidden=!note.textContent;
          });bound.set(image,{attribute,cancel});
        }
      };
      const observer=new MutationObserver(()=>{scan();});
      observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-japanese-image']});scan();
      return ()=>observer.disconnect();
    }
    return {displayImage,resolve,bind,validCard,observe};
  }
  root.createMtgCardImages = createCardImages;
  const script = root.document?.currentScript;
  if (script) root.MtgCardImages = createCardImages({indexUrl:new URL('./data/japanese-images.json',script.src).href});
  if (typeof module === 'object') module.exports = {createCardImages};
})(globalThis);
