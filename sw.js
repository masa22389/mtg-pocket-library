importScripts('./scanner/card-image-cache.js');
const CACHE = "mtg-pocket-v344";
const OFFLINE_PAGE = "./index.html?v=344";
const SHELL = ["./scanner/data/japanese-image-manifest.json","./scanner/card-image-cache.js","./scanner/card-images.js?v=344","./scanner/data/japanese-images.json","./mobile-inputs.css?v=344","./scanner-host.js?v=344","./diagnostics.js?v=344", OFFLINE_PAGE, "./styles.css?v=344", "./app.js?v=344", "./storage.js?v=344", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];
// The large search indexes are named by content hash (scripts/update-asset-hashes.mjs) and kept in their own
// cache across app versions, so an update downloads them only when their contents change.
const DATA_CACHE = "mtg-pocket-data";
const DATA = ["./mtg-jp-card-index.js?h=85c593dfed85", "./mtgjson-jp-search-index.js?h=950f31a46ea0"];

self.addEventListener("install", event => {
  event.waitUntil(Promise.all([
    caches.open(CACHE).then(cache => cache.addAll(SHELL)),
    caches.open(DATA_CACHE).then(async cache => { for (const url of DATA) if (!(await cache.match(url))) await cache.add(url); }),
  ]));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  const current = new Set(DATA.map(url => new URL(url, self.location).href));
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("mtg-pocket-v") && key !== CACHE).map(key => caches.delete(key)))),
    caches.open(DATA_CACHE).then(cache => cache.keys().then(requests => Promise.all(requests.filter(request => !current.has(request.url)).map(request => cache.delete(request))))),
  ]));
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if(handleCardImageRequest(event))return;
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.endsWith('/scanner/data/japanese-image-manifest.json')) {
    event.respondWith(fetch(new Request(event.request, {cache:'no-store'})).then(async response => {
      if (!response.ok) throw new Error('Image manifest unavailable');
      const cache = await caches.open(CACHE); await cache.put(event.request,response.clone()); return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  // BEGIN SCANNER TRIAL BYPASS
  // Never cache the trial page as the main app's offline shell, or retain its assets.
  if ((url.pathname.includes('/scanner/') && !/\/scanner\/(card-images\.js|data\/japanese-images\.json|data\/japanese-image-manifest\.json)$/.test(url.pathname)) || url.pathname.includes('/scanner-trial/') || url.hostname === 'hanclinto.github.io') return;
  // END SCANNER TRIAL BYPASS
  if (["api.scryfall.com", "wonder.wisdom-guild.net", "r.jina.ai", "api.allorigins.win"].includes(url.hostname)) return;

  if (event.request.mode === "navigate") {
    // Only a successful, unredirected response for the app's own start page may become the offline page:
    // never a 404, a server error, a Wi-Fi login page or another page of this site such as tests/.
    const scope = new URL(self.registration.scope).pathname;
    const isAppPage = url.origin === self.location.origin && (url.pathname === scope || url.pathname === scope + "index.html");
    const network = fetch(new Request(event.request, { cache: "reload" }));
    event.waitUntil(network.then(response => {
      if (!isAppPage || !response.ok || response.redirected || response.type !== "basic") return;
      const copy = response.clone();
      return caches.open(CACHE).then(cache => cache.put(OFFLINE_PAGE, copy));
    }).catch(() => {}));
    event.respondWith((async () => {
      const cached = isAppPage ? await caches.match(OFFLINE_PAGE) : undefined;
      try {
        // A stalled connection (weak signal, Wi-Fi login) falls back to the saved app after a few seconds.
        const response = await (cached ? Promise.race([network, new Promise(resolve => setTimeout(resolve, 5000, cached))]) : network);
        return !response.ok && cached ? cached : response;
      } catch {
        return cached || (await caches.match(OFFLINE_PAGE)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && (url.origin === self.location.origin || url.hostname === "cards.scryfall.io")) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    // A failed image or API request must fail as a network error, not return the app's HTML page.
    }).catch(() => Response.error()))
  );
});
