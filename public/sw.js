const CACHE_NAME = "it-inventory-v1";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(request, fallbackCache, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const timer = setTimeout(() => {
      caches.match(request).then((cached) => done(cached));
    }, timeoutMs || 5000);
    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(fallbackCache).then((cache) => cache.put(request, clone));
        }
        done(response);
      })
      .catch(() => {
        clearTimeout(timer);
        caches.match(request).then((cached) => done(cached));
      });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.hostname === "firestore.googleapis.com" || url.hostname.endsWith("googleapis.com")) {
    event.respondWith(networkFirst(request, "firestore-cache", 5000));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, "pages-cache", 4000).then((res) => res || caches.match("/"))
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open("static-cache").then((cache) => cache.put(request, clone));
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});
