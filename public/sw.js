// OnePost AI Service Worker — PWA offline support with cache-first strategy
const CACHE = "onepost-v2";
const STATIC_ASSETS = ["/", "/op-icon-192.svg", "/op-logo.svg", "/manifest.json"];

// Install: pre-cache static assets
self.addEventListener("install", (e) => {
  (e as any).waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches, claim clients
self.addEventListener("activate", (e) => {
  (e as any).waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  (e as any).waitUntil(self.clients.claim());
});

// Fetch: stale-while-revalidate for navigation, network-first for API, cache-first for static
self.addEventListener("fetch", (e: any) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  // API requests: network-first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Navigation requests (HTML pages): stale-while-revalidate
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// Listen for "save-dashboard-state" message from client
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SAVE_DASHBOARD_STATE") {
    caches.open(CACHE).then((cache) => {
      const blob = new Blob([JSON.stringify(e.data.payload)], {
        type: "application/json",
      });
      const res = new Response(blob);
      cache.put("/__cached_dashboard_state", res);
    });
  }
});
