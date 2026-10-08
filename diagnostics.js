// Opt-in diagnostics: no card names, URLs, tokens, or response bodies are recorded.
(() => {
  const $ = id => document.getElementById(id);
  const LIMIT = 720; // Six hours at 30 seconds; bounded across reloads.
  let db, log = { enabled:false, samples:[], events:[], sessions:0 }, timer, observer;
  let resources = 0, duration = 0, started = performance.now(), saving = false;
  const status = text => { $('diagnosticStatus').textContent = text; };
  const persist = () => new Promise((resolve, reject) => {
    const tx = db.transaction('log','readwrite');
    tx.objectStore('log').put(log,'current');
    tx.oncomplete = resolve; tx.onabort = () => reject(tx.error); tx.onerror = () => {};
  });
  function event(kind) {
    if (!log.enabled) return;
    log.events.push({at:Date.now(),kind}); log.events = log.events.slice(-60);
  }
  async function sample() {
    if (!log.enabled || saving) return;
    saving = true;
    try {
      const memory = performance.memory;
      let app = null;
      try { app = window.mtgDiagnosticProbe?.() || null; } catch { event('probe-error'); }
      log.samples.push({at:Date.now(), elapsedMs:Math.round(performance.now()-started),
        session:log.sessions, version:'v284',
        view:document.querySelector('main > section:not([hidden])')?.id || null,
        visible:document.visibilityState, online:navigator.onLine,
        heapUsed:memory?.usedJSHeapSize ?? null, heapTotal:memory?.totalJSHeapSize ?? null,
        heapLimit:memory?.jsHeapSizeLimit ?? null,
        domNodes:document.getElementsByTagName('*').length, images:document.images.length,
        resources, resourceDurationMs:Math.round(duration), app});
      log.samples = log.samples.slice(-LIMIT);
      await persist();
      status(log.enabled ? `記録中：${log.samples.length}件（30秒間隔・最新720件）。端末内に保存しています。` : `停止中：保存済み${log.samples.length}件。書き出せます。`);
    } catch {
      log.enabled = false; clearTimeout(timer); observer?.disconnect();
      status('診断記録を保存できなかったため停止しました。通常の保存データは変更していません。');
    } finally {
      saving = false;
      if(log.enabled) timer = setTimeout(sample,30000);
    }
  }
  function observe() {
    observer?.disconnect();
    try {
      observer = new PerformanceObserver(list => { for (const entry of list.getEntries()) { resources++; duration += entry.duration; } });
      observer.observe({type:'resource',buffered:false});
    } catch { event('resource-observer-unavailable'); }
  }
  window.addEventListener('error', e => event(e instanceof ErrorEvent ? 'javascript-error' : 'resource-error'), true);
  window.addEventListener('unhandledrejection', () => event('unhandled-rejection'));
  window.addEventListener('online',()=>event('online'));
  window.addEventListener('offline',()=>event('offline'));
  window.addEventListener('pagehide',()=>{event('pagehide');});
  document.addEventListener('visibilitychange',()=>event(document.visibilityState));
  const ready = new Promise((resolve,reject)=>{
    const request=indexedDB.open('mtg-pocket-diagnostics-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('log');
    request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
  }).then(async database=>{
    db=database;
    const previous=await new Promise((resolve,reject)=>{const r=db.transaction('log').objectStore('log').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    if(previous) log=previous;
    log.sessions++; log.samples=log.samples.slice(-LIMIT); log.events=log.events.slice(-60);
    if(log.enabled){event('page-start');observe();sample();}
    else status(log.samples.length ? `停止中：保存済み${log.samples.length}件。書き出せます。` : '停止中。調査するときだけ開始してください。');
  }).catch(()=>status('診断保存領域を開けませんでした。'));
  $('diagnosticStart').onclick=async()=>{await ready;if(!db || log.enabled || saving)return;log.enabled=true;event('start');observe();sample();};
  $('diagnosticStop').onclick=async()=>{await ready;if(!db)return;event('stop');log.enabled=false;clearTimeout(timer);observer?.disconnect();try{await persist();status(`停止中：保存済み${log.samples.length}件。書き出せます。`);}catch{status('停止しましたが、診断記録の保存に失敗しました。');}};
  $('diagnosticExport').onclick=async()=>{await ready;if(!db)return;
    const blob=new Blob([JSON.stringify({schema:1,exportedAt:Date.now(),note:'JS heap is approximate, not total process/GPU memory. Resources count completed observed requests, not active requests or timers.',...log},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mtg-diagnostics-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
})();
