importScripts('./scanner/card-image-cache.js');
const CACHE = "mtg-pocket-v321";
const OFFLINE_PAGE = "./index.html?v=321";
const SHELL = ["./scanner/data/japanese-image-manifest.json","./scanner/card-image-cache.js","./scanner/card-images.js?v=321","./scanner/data/japanese-images.json","./mobile-inputs.css?v=321","./scanner-host.js?v=321","./diagnostics.js?v=321", OFFLINE_PAGE, "./styles.css?v=321", "./mtg-jp-card-index.js?v=321", "./mtgjson-jp-search-index.js?v=321", "./app.js?v=321", "./storage.js?v=321", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("mtg-pocket-v") && key !== CACHE).map(key => caches.delete(key)))));
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
    event.respondWith(
      fetch(new Request(event.request, { cache: "reload" })).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(OFFLINE_PAGE, copy));
        return response;
      }).catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && (url.origin === self.location.origin || url.hostname === "cards.scryfall.io")) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(OFFLINE_PAGE)))
  );
});
