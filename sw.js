/* Annie's New Life — service worker.
   Guarda o app pra funcionar sem internet, mas sem travar a versão antiga:
   o código vem da rede primeiro, e o cache só entra quando a rede falha. */
const VERSAO = "1.4.1";
const CACHE = "anl-" + VERSAO;

const ARQUIVOS = [
  "./", "./index.html",
  "./css/fontes.css", "./css/tokens.css", "./css/style.css",
  "./fonts/AnnieUseYourTelescope-Regular.woff2", "./fonts/Sacramento-Regular.woff2",
  "./fonts/quicksand-latin-400-normal.woff2", "./fonts/quicksand-latin-500-normal.woff2",
  "./fonts/quicksand-latin-600-normal.woff2", "./fonts/quicksand-latin-700-normal.woff2",
  "./js/agnes-arte.js", "./js/som.js", "./js/ilustra.js", "./js/biblioteca.js", "./js/arte.js", "./js/dados.js", "./js/assessments.js", "./js/app.js",
  "./manifest.webmanifest",
  "./icons/agnes-192.png", "./icons/agnes-512.png"
];

/* fontes e ícones não mudam, podem vir do cache direto */
const IMUTAVEL = /\/(fonts|icons)\//;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ARQUIVOS.map((a) => c.add(new Request(a, { cache: "reload" })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* a página pode pedir uma conferida na hora */
self.addEventListener("message", (e) => {
  if (e.data === "versao" && e.source) e.source.postMessage({ versao: VERSAO });
});

function guardar(req, res) {
  if (res && res.ok && res.type === "basic") {
    const copia = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copia));
  }
  return res;
}

/** rede primeiro, com um limite de espera; se demorar ou falhar, usa o cache */
function redePrimeiro(req, limite = 3500) {
  return new Promise((resolve) => {
    let respondido = false;
    const doCache = () => caches.match(req)
      .then((hit) => hit || caches.match("./index.html"))
      .then((hit) => hit || Response.error());

    const relogio = setTimeout(() => {
      if (!respondido) { respondido = true; doCache().then(resolve); }
    }, limite);

    // no-cache obriga o navegador a conferir com o servidor, em vez de
    // entregar o que ele mesmo guardou. É o que faz a versão nova chegar.
    const pedido = new Request(req.url, { cache: "no-cache", credentials: "same-origin" });
    fetch(pedido)
      .then((res) => {
        guardar(req, res);
        clearTimeout(relogio);
        if (!respondido) { respondido = true; resolve(res); }
      })
      .catch(() => {
        clearTimeout(relogio);
        if (!respondido) { respondido = true; doCache().then(resolve); }
      });
  });
}

function cachePrimeiro(req) {
  return caches.match(req).then((hit) => hit || fetch(req).then((res) => guardar(req, res)));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (IMUTAVEL.test(url.pathname)) { e.respondWith(cachePrimeiro(req)); return; }
  e.respondWith(redePrimeiro(req));
});
