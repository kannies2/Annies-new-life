/* Annie's New Life — service worker. Guarda o app para funcionar sem internet. */
const CACHE = "anl-v1";
const ARQUIVOS = [
  "./", "./index.html",
  "./css/tokens.css", "./css/style.css",
  "./js/agnes-arte.js", "./js/arte.js", "./js/dados.js", "./js/assessments.js", "./js/app.js",
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

  // fontes do Google: busca na rede e guarda
  if (url.origin.includes("fonts.g")) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit))
      )
    );
    return;
  }
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
