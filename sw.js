const MEDIA_CACHE = "unible-media-v1";

const CRITICAL_IMAGES = [
  "/images/hero/new0-hero.webp",
  "/images/hero/new3-hero.webp",
  "/images/hero/new4-hero.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(MEDIA_CACHE).then((cache) => cache.addAll(CRITICAL_IMAGES)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("unible-media-") && cacheName !== MEDIA_CACHE)
        .map((cacheName) => caches.delete(cacheName)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isLocalMedia = url.origin === self.location.origin
    && (url.pathname.startsWith("/images/") || url.pathname.startsWith("/web/"));

  if (!isLocalMedia) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(MEDIA_CACHE).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    }),
  );
});
