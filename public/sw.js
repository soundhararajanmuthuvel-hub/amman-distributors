// Amman Distributors PWA Service Worker
const CACHE_NAME = "amman-distributors-v1";

// Safe static assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.webmanifest"
];

// Install event: cache core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event: purge old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for APIs/dynamic data, stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache /api endpoints, dynamic mutations, or non-GET requests
  if (url.pathname.startsWith("/api") || event.request.method !== "GET") {
    return;
  }

  // 2. Safe static assets (JS, CSS, fonts, images, manifest)
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Navigation (HTML pages): Network-first with fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/");
      })
    );
  }
});
