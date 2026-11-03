/* Annie's New Life — peças gráficas da biblioteca, como SVG inline. */

const svg = (vb, corpo, cls = "", extra = "") =>
  `<svg viewBox="${vb}" class="${cls}" ${extra} aria-hidden="true" focusable="false">${corpo}</svg>`;

/* ---- Agnes ---- */
function agnes(expr = "feliz", tam = 96, extra = "") {
  const corpo = (window.AGNES && window.AGNES[expr]) || (window.AGNES && window.AGNES.feliz) || "";
  const alto = expr.includes("laco");
  const vb = alto ? "-96 -136 192 274" : "-96 -110 192 248";
  return `<svg viewBox="${vb}" width="${tam}" height="${Math.round(tam * (alto ? 1.43 : 1.29))}" role="img" aria-label="Agnes" ${extra}>${corpo}</svg>`;
}

/* ---- ondinha da faixa ---- */
function ondinha() {
  let d = "M0,0 H560 V7 ";
  for (let x = 540; x >= 0; x -= 20) d += `Q${x + 10},22 ${x},7 `;
  return `<svg class="ondinha" viewBox="0 0 560 22" preserveAspectRatio="none" aria-hidden="true"><path d="${d}Z"/></svg>`;
}

/* ---- selo serrilhado ---- */
function caminhoSerrilhado(cx, cy, R, n = 20) {
  const r = (Math.PI * R) / n * 0.98;
  const p = [...Array(n)].map((_, i) => [cx + R * Math.cos((2 * Math.PI * i) / n), cy + R * Math.sin((2 * Math.PI * i) / n)]);
  let d = `M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)} `;
  for (let i = 1; i <= n; i++) {
    const [x, y] = p[i % n];
    d += `A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d + "Z";
}
function selo(texto, sub = "", cor = "var(--rosa)", tam = 120) {
  return `<svg viewBox="0 0 140 140" width="${tam}" height="${tam}" role="img" aria-label="${texto} ${sub}">
    <path d="${caminhoSerrilhado(70, 70, 58)}" fill="${cor}" stroke="var(--superficie)" stroke-width="5"/>
    <circle cx="70" cy="70" r="46" fill="none" stroke="var(--tinta-sobre-cor)" stroke-width="2" stroke-dasharray="6 6" opacity=".5"/>
    <text x="70" y="${sub ? 66 : 78}" text-anchor="middle" font-family="var(--font-texto)" font-size="${texto.length > 2 ? 22 : 32}" font-weight="700" fill="var(--tinta-sobre-cor)">${texto}</text>
    ${sub ? `<text x="70" y="88" text-anchor="middle" font-family="var(--font-texto)" font-size="12" font-weight="700" letter-spacing="1.6" fill="var(--tinta-sobre-cor)">${sub}</text>` : ""}
  </svg>`;
}

/* ---- ícones das seis áreas ---- */
const AREA_ICONES = {
  espiritual: `<path d="M44 12A32 32 0 1 0 44 76A26 26 0 1 1 44 12Z" fill="var(--lilas)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><path d="M62 24L66 34L78 38L66 42L62 52L58 42L46 38L58 34Z" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="4" stroke-linejoin="round"/>`,
  mental: `<path d="M20 58A21 21 0 1 1 26 18A25 25 0 0 1 70 24A19 19 0 0 1 76 58Z" fill="var(--periwinkle)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><path d="M50 30L53 38L61 41L53 44L50 52L47 44L39 41L47 38Z" fill="var(--superficie)"/>`,
  fisica: `<g fill="var(--menta)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><rect x="8" y="26" width="14" height="36" rx="5"/><rect x="66" y="26" width="14" height="36" rx="5"/><rect x="20" y="36" width="48" height="16" rx="4"/></g>`,
  beleza: `<g fill="var(--rosa)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M44 42C38 24 16 22 18 40C19 54 36 50 44 42Z"/><path d="M44 42C50 24 72 22 70 40C69 54 52 50 44 42Z"/><path d="M38 48C34 62 30 68 29 76L42 62Z"/><path d="M50 48C54 62 58 68 59 76L46 62Z"/><circle cx="44" cy="44" r="8"/></g>`,
  bemestar: `<g fill="var(--manteiga)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M16 36h44v18a14 14 0 0 1-14 14H30a14 14 0 0 1-14-14Z"/><path d="M60 40a11 11 0 0 1 0 22" fill="none"/></g><g fill="none" stroke="var(--uva)" stroke-width="4" stroke-linecap="round"><path d="M30 28q8-5 0-12"/><path d="M44 28q8-5 0-12"/></g>`,
  carreira: `<g fill="var(--pessego)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M44 8C56 18 58 34 54 52C50 62 38 62 34 52C30 34 32 18 44 8Z"/><path d="M34 40L16 60L32 60Z"/><path d="M54 40L72 60L56 60Z"/></g><circle cx="44" cy="32" r="8" fill="var(--superficie)" stroke="var(--uva)" stroke-width="4"/><path d="M44 62q6 8 0 16" fill="none" stroke="var(--alerta)" stroke-width="4" stroke-linecap="round"/>`
};
const areaIcone = (area, tam = 44) =>
  `<svg viewBox="0 0 88 88" width="${tam}" height="${tam}" class="area-icone" aria-hidden="true">${AREA_ICONES[area] || ""}</svg>`;

/* ---- ícones da navegação ---- */
const NAV_ICONES = {
  hoje: `<path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z"/><path d="M4 9h16M8 3v3M16 3v3"/><circle cx="12" cy="14" r="2.2" fill="currentColor" stroke="none"/>`,
  semana: `<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="13" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.6" fill="currentColor" stroke="none"/>`,
  mes: `<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v3M16 3v3"/><path d="M8 14h2M14 14h2M8 17h2"/>`,
  metas: `<path d="M12 3v18"/><path d="M12 4h7l-2 3 2 3h-7Z"/><circle cx="12" cy="20" r="1.6" fill="currentColor" stroke="none"/>`,
  revisao: `<path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/>`
};
const navIcone = (k) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICONES[k] || ""}</svg>`;

/* ---- ícones miúdos ---- */
const MINI = {
  repete: `<path d="M4 9a5 5 0 0 1 5-5h5M14 2l2.5 2L14 6"/><path d="M14 11a5 5 0 0 1-5 5H4M4 18l-2.5-2L4 14"/>`,
  editar: `<path d="M12 3.5 15.5 7 6 16.5l-4 .8.8-4Z"/>`,
  excluir: `<path d="M3 5h12M7 5V3h4v2M5 5l.8 10a1.5 1.5 0 0 0 1.5 1.4h3.4A1.5 1.5 0 0 0 12.2 15L13 5"/>`,
  mover: `<path d="M6 2v3M12 2v3M2.5 7h13M3 5h12v10a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 15Z"/>`,
  busca: `<circle cx="8" cy="8" r="5.2"/><path d="M12 12l4 4"/>`,
  tema: `<path d="M16 10.5A7 7 0 0 1 7.5 2a7.5 7.5 0 1 0 8.5 8.5Z"/>`,
  mais: `<path d="M10 4v12M4 10h12"/>`,
  volta: `<path d="M12 4 6 10l6 6"/>`,
  som: `<path d="M4 8h3l4-3v10l-4-3H4Z"/><path d="M13.5 7.5a3.4 3.4 0 0 1 0 5"/><path d="M16 5a7 7 0 0 1 0 10"/>`,
  somOff: `<path d="M4 8h3l4-3v10l-4-3H4Z"/><path d="M13 8l5 4M18 8l-5 4"/>`,
  musica: `<path d="M8 15V4l8-1.6V13"/><circle cx="6" cy="15.4" r="2.4"/><circle cx="14" cy="13.4" r="2.4"/>`,
  musicaOff: `<path d="M8 15V5.6"/><circle cx="6" cy="15.4" r="2.4"/><path d="M3 3l14 14"/>`,
  frente: `<path d="M8 4l6 6-6 6"/>`
};
const mini = (k, tam = 18) =>
  `<svg viewBox="0 0 20 20" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[k] || ""}</svg>`;

/* ---- anel de progresso ---- */
function anel(valor, alvo, cor = "var(--oliva)", tam = 64, texto = null) {
  const r = 26, c = 2 * Math.PI * r;
  const p = alvo ? Math.min(1, valor / alvo) : 0;
  return `<svg viewBox="0 0 64 64" width="${tam}" height="${tam}" class="anel" role="img" aria-label="${valor} de ${alvo}">
    <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--borda)" stroke-width="8"/>
    <circle class="valor" cx="32" cy="32" r="${r}" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" transform="rotate(-90 32 32)"/>
    <text x="32" y="37" text-anchor="middle" font-family="var(--font-texto)" font-size="${String(texto ?? valor).length > 2 ? 15 : 18}" font-weight="700" fill="var(--tinta)">${texto ?? valor}</text>
  </svg>`;
}


/* ---- corrente de sequência ---- */
function corrente(marcados, total, indiceHoje) {
  const elos = [];
  for (let i = 0; i < total; i++) {
    if (i === indiceHoje) {
      elos.push(`<span class="estrela">${estrela(22, marcados[i] ? "var(--oliva)" : "var(--manteiga)")}</span>`);
    } else {
      elos.push(`<i class="elo ${marcados[i] ? "ok" : (i > indiceHoje ? "futuro" : "")}"></i>`);
    }
  }
  return `<div class="corrente">${elos.join("")}</div>`;
}
function estrela(tam, cor) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 11 : 5;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(1)},${(12 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" aria-hidden="true">
    <polygon points="${pts.join(" ")}" fill="${cor}" stroke="var(--uva)" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
}

/* ---- etiqueta de dia ---- */
function etiquetaDia(dia, mes) {
  return `<span class="etiqueta-dia" aria-hidden="true"><span class="n">${dia}</span><span class="m">${mes}</span></span>`;
}

/* ---- chip de palavra ---- */
const PALAVRAS = ["feito!", "uhul", "quase lá", "isso!", "boa"];
function chipPalavra(texto) {
  const t = texto || PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
  return `<span class="chip-palavra" style="background:var(--acao);color:#fff">${t}</span>`;
}

function pontosEstrela(cx, cy, R) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? R : R * 0.46;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(" ");
}
function petalas(cx, cy, R, cor) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (2 * Math.PI * i) / 6 - Math.PI / 2;
    s += `<circle cx="${(cx + R * 0.56 * Math.cos(a)).toFixed(1)}" cy="${(cy + R * 0.56 * Math.sin(a)).toFixed(1)}" r="${(R * 0.5).toFixed(1)}" fill="${cor}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(R * 0.62).toFixed(1)}" fill="${cor}"/>`;
}

/* ---- confete ---- */
function festejar(comAgnes = true, textoSelo = "7", subSelo = "DIAS") {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) comAgnes = true;
  const caixa = document.createElement("div");
  caixa.className = "festa";
  caixa.innerHTML = comAgnes
    ? `<div style="text-align:center">
         <div class="selo">${selo(textoSelo, subSelo, "var(--manteiga)", 140)}</div>
         <div style="margin-top:-12px">${agnes("acolhedora_laco", 110)}</div>
         <div style="margin-top:var(--space-3);transform:rotate(-3deg)">${chipPalavra()}</div>
       </div>` : "";
  const pecas = [
    (c) => `<svg viewBox="0 0 24 24"><polygon points="${pontosEstrela(12,12,11)}" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24"><path d="M12 21C4 15 2 11 5 7c2.4-3 6-1.6 7 .8C13 5.4 16.6 4 19 7c3 4 1 8-7 14Z" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24">${petalas(12,12,9,c)}</svg>`,
    (c) => `<svg viewBox="0 0 24 24"><path d="M12 1 14 9 22 12 14 15 12 23 10 15 2 12 10 9Z" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${c}"/></svg>`
  ];
  const cores = ["var(--rosa)", "var(--manteiga)", "var(--menta)", "var(--lilas)", "var(--acao)", "var(--pessego)"];
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < 30; i++) {
      const c = document.createElement("i");
      c.className = "confete";
      const tam = 12 + Math.random() * 12;
      c.style.cssText = `left:${Math.random() * 100}%;width:${tam}px;height:${tam}px;animation-delay:${Math.random() * 400}ms`;
      c.innerHTML = pecas[i % pecas.length](cores[(i * 3) % cores.length]);
      caixa.appendChild(c);
    }
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 2000);
}

window.Arte = { agnes, ondinha, selo, caminhoSerrilhado, areaIcone, navIcone, mini, anel, festejar, svg, corrente, estrela, etiquetaDia, chipPalavra, pontosEstrela };
