/* Service worker LubriOCP — mode hors ligne */
const CACHE_VERSION = "lubriocp-v2";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/tableau-de-bord",
  "/inventaire",
  "/interventions",
  "/alertes",
  "/parametres",
  "/exports",
  "/install",
];

const STATIC_DESTINATIONS = new Set(["image", "font", "style", "script", "manifest"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const pagesCache = await caches.open(PAGES_CACHE);
      for (const url of PRECACHE_URLS) {
        try {
          const res = await fetch(url, { credentials: "same-origin" });
          if (res.ok) {
            if (url === "/" || url.startsWith("/tableau") || url.startsWith("/invent") || url.startsWith("/inter") || url.startsWith("/alert") || url.startsWith("/param") || url.startsWith("/export") || url.startsWith("/install")) {
              await pagesCache.put(url, res.clone());
            } else {
              await staticCache.put(url, res.clone());
            }
          }
        } catch {
          /* hors ligne à l'install : ignoré */
        }
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api");
}

function isStaticAsset(request, url) {
  if (STATIC_DESTINATIONS.has(request.destination)) return true;
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/icons/")) return true;
  return /\.(png|jpg|jpeg|svg|webp|woff2?|css|js)$/i.test(url.pathname);
}

function isAppRoute(pathname) {
  return (
    pathname === "/" ||
    pathname.startsWith("/tableau-de-bord") ||
    pathname.startsWith("/inventaire") ||
    pathname.startsWith("/interventions") ||
    pathname.startsWith("/alertes") ||
    pathname.startsWith("/parametres") ||
    pathname.startsWith("/exports") ||
    pathname.startsWith("/install")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (isApiRequest(url)) {
    event.respondWith(networkOnly(request));
    return;
  }

  const accept = request.headers.get("accept") || "";
  const isDocument = request.mode === "navigate" || accept.includes("text/html");

  if (isDocument) {
    event.respondWith(networkFirstPages(request, url.pathname));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response?.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function networkFirstPages(request, pathname) {
  const pagesCache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response?.ok) {
      if (isAppRoute(pathname)) {
        await pagesCache.put(pathname, response.clone());
      }
      await pagesCache.put(request, response.clone());
    }
    return response;
  } catch {
    const byPath = isAppRoute(pathname) ? await pagesCache.match(pathname) : null;
    if (byPath) return byPath;
    const cached = await caches.match(request);
    if (cached) return cached;
    const shell = (await pagesCache.match("/tableau-de-bord")) || (await pagesCache.match("/"));
    if (shell) return shell;
    return offlineHtmlResponse();
  }
}

async function networkOnly(request) {
  return fetch(request);
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response?.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}

function offlineHtmlResponse() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hors ligne — LubriOCP</title>
  <style>
    body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f1f5f9;color:#0f172a;text-align:center;padding:24px}
    .box{max-width:360px;background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    h1{font-size:1.25rem;margin:0 0 8px}
    p{font-size:.9rem;color:#475569;margin:0 0 16px;line-height:1.5}
    a{display:inline-block;background:#003366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600}
  </style>
</head>
<body>
  <div class="box">
    <h1>Vous êtes hors ligne</h1>
    <p>Les pages déjà visitées restent accessibles. Reconnectez-vous pour synchroniser.</p>
    <a href="/tableau-de-bord">Tableau de bord</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
