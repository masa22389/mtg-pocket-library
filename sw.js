const CACHE = "mtg-pocket-v309";
const OFFLINE_PAGE = "./index.html?v=309";
const SHELL = ["./mobile-inputs.css?v=309","./scanner-host.js?v=309","./diagnostics.js?v=309", OFFLINE_PAGE, "./styles.css?v=309", "./mtg-jp-card-index.js?v=309", "./mtgjson-jp-search-index.js?v=309", "./app.js?v=309", "./storage.js?v=309", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

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
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // BEGIN SCANNER TRIAL BYPASS
  // Never cache the trial page as the main app's offline shell, or retain its assets.
  if (url.pathname.includes('/scanner/') || url.pathname.includes('/scanner-trial/') || url.hostname === 'hanclinto.github.io') return;
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
