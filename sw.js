const CACHE = "mtg-pocket-v213";
const OFFLINE_PAGE = "./index.html?v=213";
const SHELL = [OFFLINE_PAGE, "./styles.css?v=213", "./mtg-jp-card-index.js?v=213", "./mtgjson-jp-search-index.js?v=213", "./app.js?v=213", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname === "api.scryfall.com") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(response => {
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
