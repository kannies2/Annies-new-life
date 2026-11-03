/* Annie's New Life — som.
   Nada é arquivo de áudio: tudo é sintetizado pelo próprio navegador.
   Isso mantém o app leve, offline e sem nenhuma questão de licença. */
(function () {
"use strict";

let ctx = null, masterEfeitos = null, masterMusica = null;
let tocandoMusica = false, proximoPasso = 0, passo = 0, agendador = null;

/* O navegador só deixa tocar som depois de um toque da pessoa. */
function acordar() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterEfeitos = ctx.createGain(); masterEfeitos.gain.value = 0.16; masterEfeitos.connect(ctx.destination);
  masterMusica = ctx.createGain(); masterMusica.gain.value = 0.0; masterMusica.connect(ctx.destination);
  return ctx;
}

/** uma nota curta e macia */
function nota(freq, inicio, duracao, volume, tipo, destino) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freq, inicio);
  g.gain.setValueAtTime(0, inicio);
  g.gain.linearRampToValueAtTime(volume, inicio + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  osc.connect(g); g.connect(destino || masterEfeitos);
  osc.start(inicio); osc.stop(inicio + duracao + 0.02);
}

/* ---------------- efeitos ---------------- */
const EFEITOS = {
  marcar:    (t) => { nota(660, t, 0.18, 0.5, "sine"); nota(990, t + 0.045, 0.22, 0.26, "sine"); },
  desmarcar: (t) => { nota(520, t, 0.16, 0.34, "sine"); nota(390, t + 0.05, 0.2, 0.2, "sine"); },
  toque:     (t) => { nota(880, t, 0.09, 0.2, "sine"); },
  aba:       (t) => { nota(560, t, 0.1, 0.18, "triangle"); },
  abrir:     (t) => { nota(700, t, 0.12, 0.2, "sine"); nota(940, t + 0.04, 0.14, 0.12, "sine"); },
  limite:    (t) => { nota(300, t, 0.16, 0.28, "triangle"); nota(250, t + 0.09, 0.18, 0.2, "triangle"); },
  festa:     (t) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(f, t + i * 0.09, 0.42, 0.42, "sine"));
    nota(1318.5, t + 0.42, 0.6, 0.2, "sine");
  }
};

function tocar(nome) {
  if (!ligado("som")) return;
  const c = acordar(); if (!c) return;
  const fn = EFEITOS[nome]; if (!fn) return;
  try { fn(c.currentTime + 0.01); } catch (e) { /* som nunca quebra o app */ }
}

/* ---------------- musiquinha ----------------
   Um loop gerado em escala pentatônica, lento e baixinho.
   Nunca repete igual: o acompanhamento varia dentro da mesma harmonia. */
const ACORDES = [
  [261.63, 329.63, 392.00],  // dó
  [293.66, 349.23, 440.00],  // ré menor
  [349.23, 440.00, 523.25],  // fá
  [392.00, 493.88, 587.33]   // sol
];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
const COMPASSO = 2.0; // segundos

function agendarCompasso(quando) {
  const acorde = ACORDES[passo % ACORDES.length];
  // colchão: as três notas do acorde, bem suaves
  acorde.forEach((f, i) => nota(f / 2, quando, COMPASSO * 0.95, 0.12 - i * 0.02, "sine", masterMusica));
  // melodia: três notas da pentatônica, posição variando
  for (let i = 0; i < 3; i++) {
    const t = quando + i * (COMPASSO / 3) + (i === 1 ? 0.08 : 0);
    const f = PENTA[(passo * 2 + i * 3) % PENTA.length];
    nota(f, t, 0.5, 0.075, "triangle", masterMusica);
  }
  passo++;
}

function rodarAgendador() {
  if (!tocandoMusica || !ctx) return;
  while (proximoPasso < ctx.currentTime + 1.5) {
    agendarCompasso(proximoPasso);
    proximoPasso += COMPASSO;
  }
  agendador = setTimeout(rodarAgendador, 400);
}

function musicaLigar() {
  const c = acordar(); if (!c) return;
  tocandoMusica = true;
  proximoPasso = c.currentTime + 0.1;
  masterMusica.gain.cancelScheduledValues(c.currentTime);
  masterMusica.gain.setValueAtTime(masterMusica.gain.value, c.currentTime);
  masterMusica.gain.linearRampToValueAtTime(0.07, c.currentTime + 1.2);
  rodarAgendador();
}
function musicaDesligar() {
  tocandoMusica = false;
  clearTimeout(agendador);
  if (ctx && masterMusica) {
    masterMusica.gain.cancelScheduledValues(ctx.currentTime);
    masterMusica.gain.setValueAtTime(masterMusica.gain.value, ctx.currentTime);
    masterMusica.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  }
}

/* ---------------- preferências ---------------- */
function ligado(qual) {
  const D = window.Dados;
  return !!(D && D.estado && D.estado[qual]);
}
function alternar(qual) {
  const D = window.Dados;
  D.estado[qual] = !D.estado[qual];
  D.salvar();
  if (qual === "musica") { if (D.estado.musica) musicaLigar(); else musicaDesligar(); }
  if (qual === "som" && D.estado.som) tocar("toque");
  return D.estado[qual];
}
/** chamado quando o app abre: só retoma a música depois do primeiro toque */
function retomarSeLigado() {
  const D = window.Dados;
  if (!D.estado.musica) return;
  const uma = () => {
    document.removeEventListener("pointerdown", uma);
    document.removeEventListener("keydown", uma);
    if (D.estado.musica) musicaLigar();
  };
  document.addEventListener("pointerdown", uma, { once: true });
  document.addEventListener("keydown", uma, { once: true });
}
/* some com a música quando o app sai de vista, volta quando retorna */
document.addEventListener("visibilitychange", () => {
  const D = window.Dados;
  if (!D || !D.estado.musica) return;
  if (document.hidden) musicaDesligar(); else musicaLigar();
});

window.Som = { tocar, alternar, ligado, musicaLigar, musicaDesligar, retomarSeLigado };
})();
