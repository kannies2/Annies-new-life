/* Annie's New Life — service worker. Guarda o app para funcionar sem internet. */
const CACHE = "anl-v3";
const ARQUIVOS = [
  "./", "./index.html",
  "./css/fontes.css", "./css/tokens.css", "./css/style.css",
  "./fonts/AnnieUseYourTelescope-Regular.woff2", "./fonts/Sacramento-Regular.woff2",
  "./fonts/quicksand-latin-400-normal.woff2", "./fonts/quicksand-latin-500-normal.woff2",
  "./fonts/quicksand-latin-600-normal.woff2", "./fonts/quicksand-latin-700-normal.woff2",
  "./js/agnes-arte.js", "./js/som.js", "./js/arte.js", "./js/dados.js", "./js/assessments.js", "./js/app.js",
  "./manifest.webmanifest",
  "./icons/agnes-192.png", "./icons/agnes-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== location.origin) return;

  // o resto: cache primeiro, rede depois
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copia));
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
