// BRAVA+ Service Worker — cache + push (suporta os 5 roles)
//  - assets estáticos do Next (_next/static/*): cache-first imutável
//  - imagens / _next/image: stale-while-revalidate
//  - rotas HTML: network-first com fallback /offline
//  - manifests por role: stale-while-revalidate

const VERSION = "brava-sw-v3";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        "/offline",
        "/logo-mark.svg",
        "/logo.svg",
        "/logo-dark.svg",
      ]).catch(() => {})
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (
    url.pathname.startsWith("/_next/image") ||
    /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  if (url.pathname.endsWith("/manifest.webmanifest")) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflineFallback(req));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const networkPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await networkPromise) || Response.error();
}

async function networkFirstWithOfflineFallback(req) {
  try {
    return await fetch(req);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match("/offline");
    return fallback || new Response("Offline", { status: 503 });
  }
}

// Push (já estava — preservado)
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "BRAVA+", body: event.data ? event.data.text() : "Nova notificação" };
  }
  const title = payload.title || "BRAVA+";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo-mark.svg",
    badge: payload.badge || "/logo-mark.svg",
    data: { url: payload.url || "/app/notificacoes" },
    tag: payload.tag || "brava-notif",
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && "focus" in w) return w.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
