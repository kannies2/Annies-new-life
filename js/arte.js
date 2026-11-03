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
  espiritualidade: `<g fill="var(--lilas)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M44 40C36 32 22 30 11 34v40c11-4 25-2 33 6Z"/><path d="M44 40c8-8 22-10 33-6v40c-11-4-25-2-33 6Z"/></g><path d="M44 40v40" fill="none" stroke="var(--uva)" stroke-width="5"/><path d="M44 4l3.6 10.4L58 18l-10.4 3.6L44 32l-3.6-10.4L30 18l10.4-3.6Z" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="4" stroke-linejoin="round"/>`,
  mental: `<path d="M20 58A21 21 0 1 1 26 18A25 25 0 0 1 70 24A19 19 0 0 1 76 58Z" fill="var(--periwinkle)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><path d="M50 30L53 38L61 41L53 44L50 52L47 44L39 41L47 38Z" fill="var(--superficie)"/>`,
  fisica: `<g fill="var(--menta)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><rect x="8" y="26" width="14" height="36" rx="5"/><rect x="66" y="26" width="14" height="36" rx="5"/><rect x="20" y="36" width="48" height="16" rx="4"/></g>`,
  beleza: `<g fill="var(--rosa)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M44 42C38 24 16 22 18 40C19 54 36 50 44 42Z"/><path d="M44 42C50 24 72 22 70 40C69 54 52 50 44 42Z"/><path d="M38 48C34 62 30 68 29 76L42 62Z"/><path d="M50 48C54 62 58 68 59 76L46 62Z"/><circle cx="44" cy="44" r="8"/></g>`,
  bemestar: `<g fill="var(--manteiga)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M16 36h44v18a14 14 0 0 1-14 14H30a14 14 0 0 1-14-14Z"/><path d="M60 40a11 11 0 0 1 0 22" fill="none"/></g><g fill="none" stroke="var(--uva)" stroke-width="4" stroke-linecap="round"><path d="M30 28q8-5 0-12"/><path d="M44 28q8-5 0-12"/></g>`,
  profissional: `<g fill="var(--pessego)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M30 24V18a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v6"/><rect x="10" y="24" width="68" height="48" rx="8"/></g><path d="M10 44h68" fill="none" stroke="var(--uva)" stroke-width="5"/><rect x="36" y="38" width="16" height="12" rx="3" fill="var(--superficie)" stroke="var(--uva)" stroke-width="4"/>`,
  jogos: `<g fill="var(--rosa)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><path d="M24 26h40a20 20 0 0 1 8 38c-6 3-10-2-14-6H30c-4 4-8 9-14 6a20 20 0 0 1 8-38Z"/></g><g stroke="var(--uva)" stroke-width="4.5" stroke-linecap="round"><path d="M28 44h10M33 39v10"/></g><circle cx="58" cy="41" r="4" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="3"/><circle cx="66" cy="49" r="4" fill="var(--menta)" stroke="var(--uva)" stroke-width="3"/>`,
  autoestima: `<path d="M44 76C18 58 10 46 14 34c3-9 15-12 21-4 3 4 6 9 9 14 3-5 6-10 9-14 6-8 18-5 21 4 4 12-4 24-30 42Z" fill="var(--lilas)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><path d="M44 30l3.4 8.2 8.6.7-6.5 5.7 2 8.4L44 48.6l-7.5 4.4 2-8.4-6.5-5.7 8.6-.7Z" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="3" stroke-linejoin="round"/>`,
  financas: `<g fill="var(--menta)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"><ellipse cx="44" cy="68" rx="27" ry="9"/><ellipse cx="44" cy="55" rx="27" ry="9"/><ellipse cx="44" cy="42" rx="27" ry="9"/></g><path d="M44 42h.1" stroke="var(--uva)" stroke-width="5" stroke-linecap="round"/><path d="M44 2l3.4 9.6L57 15l-9.6 3.4L44 28l-3.4-9.6L31 15l9.6-3.4Z" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="4" stroke-linejoin="round"/>`,
  viagens: `<path d="M12 50 70 16c6-3 10 1 7 7L44 76l-7-18Z" fill="var(--periwinkle)" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><path d="M37 58 12 50" fill="none" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/><circle cx="68" cy="24" r="5" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="3"/>`
};
const areaIcone = (area, tam = 44) =>
  `<svg viewBox="0 0 88 88" width="${tam}" height="${tam}" class="area-icone" aria-hidden="true">${AREA_ICONES[area] || ""}</svg>`;

/* ---- ícones da navegação ---- */
const NAV_ICONES = {
  hoje: `<path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z"/><path d="M4 9h16M8 3v3M16 3v3"/><circle cx="12" cy="14" r="2.2" fill="currentColor" stroke="none"/>`,
  semana: `<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="13" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.6" fill="currentColor" stroke="none"/>`,
  mes: `<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v3M16 3v3"/><path d="M8 14h2M14 14h2M8 17h2"/>`,
  metas: `<path d="M12 3v18"/><path d="M12 4h7l-2 3 2 3h-7Z"/><circle cx="12" cy="20" r="1.6" fill="currentColor" stroke="none"/>`,
  revisao: `<path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/>`,
  desafios: `<path d="M12 21c4.4 0 7-2.8 7-6.4 0-4.6-4.2-6.4-4.6-11.6-2 1.4-3.3 3.5-3.6 5.8-1-.8-1.6-1.9-1.8-3.1C7 7.4 5 9.9 5 14.6 5 18.2 7.6 21 12 21Z"/><path d="M12 21c2 0 3.3-1.4 3.3-3.2 0-2-1.9-2.9-2.1-5.2-1.6 1.2-2.5 2.9-2.5 5 0 1.9 1.3 3.4 1.3 3.4Z"/>`,
  trofeus: `<path d="M12 3.2l2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 8.7l5.2-.8Z"/>`
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
  musica: `<path d="M8 14.5V3.5l8-1.7v11"/><ellipse cx="5.6" cy="14.9" rx="2.5" ry="2.1" fill="currentColor" stroke="none"/><ellipse cx="13.6" cy="13.2" rx="2.5" ry="2.1" fill="currentColor" stroke="none"/>`,
  musicaOff: `<path d="M8 14.5V4"/><ellipse cx="5.6" cy="14.9" rx="2.5" ry="2.1" fill="currentColor" stroke="none"/><path d="M11 5l6 6M17 5l-6 6"/>`,
  frente: `<path d="M8 4l6 6-6 6"/>`,
  fechar: `<path d="M5 5l10 10M15 5L5 15"/>`,
  ok2: `<path d="M3.5 10.5 8 15l8.5-10"/>`,
  lista: `<path d="M8.4 5.2h9M8.4 10h9M8.4 14.8h9"/><path d="M2.8 5.2l1.4 1.4 2.2-2.6M2.8 10l1.4 1.4 2.2-2.6M2.8 14.8l1.4 1.4 2.2-2.6"/>`,
  som2: `<path d="M4 8h3l4-3v10l-4-3H4Z"/><path d="M13.5 7.5a3.4 3.4 0 0 1 0 5"/>`,
  categorias: `<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h3l2 2.5h4A2.5 2.5 0 0 1 17 8v6.5A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5Z"/>`,
  ajustes: `<path d="M10 1.4l2 1.2 2.3-.5 1 2.1 2.1 1-.5 2.3 1.2 2-1.2 2 .5 2.3-2.1 1-1 2.1-2.3-.5-2 1.2-2-1.2-2.3.5-1-2.1-2.1-1 .5-2.3-1.2-2 1.2-2-.5-2.3 2.1-1 1-2.1 2.3.5Z"/><circle cx="10" cy="10" r="3.1"/>`,
  cadeado: `<rect x="3.6" y="8.4" width="12.8" height="9.2" rx="2.6"/><path d="M6.6 8.4V6.2a3.4 3.4 0 0 1 6.8 0v2.2"/><circle cx="10" cy="12.8" r="1.3" fill="currentColor" stroke="none"/>`,
  trofeu: `<path d="M6 2h8v5a4 4 0 0 1-8 0Z"/><path d="M6 3.5H3.2a3 3 0 0 0 3 3M14 3.5h2.8a3 3 0 0 1-3 3"/><path d="M10 11v3M6.5 17.5h7l-1-3h-5Z"/>`,
  tutorial: `<circle cx="10" cy="10" r="8"/><path d="M7.8 7.6a2.3 2.3 0 1 1 2.6 2.4v1.4"/><circle cx="10" cy="14.3" r=".9" fill="currentColor" stroke="none"/>`,
  enviar: `<path d="M17.5 2.5 8.6 11.4M17.5 2.5l-5.6 15-3.3-6.1-6.1-3.3Z"/>`,
  nome: `<path d="M10 10.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z"/><path d="M3.4 17.2c.8-3 3.4-4.6 6.6-4.6s5.8 1.6 6.6 4.6"/>`,
  biblioteca: `<path d="M3 4.5h5a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h5v11h-5a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H3Z"/><path d="M10 5.5v11"/>`,
  desafio: `<path d="M5 2v16"/><path d="M5 3h9l-2.2 3.4L14 10H5Z"/>`
};
const mini = (k, tam = 18) =>
  `<svg viewBox="0 0 20 20" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[k] || ""}</svg>`;

/* ---- tarja decorada atrás dos títulos de seção ---- */
function tarja(cor = "var(--rosa)") {
  return `<svg class="tarja-fundo" viewBox="0 0 300 44" preserveAspectRatio="none" aria-hidden="true">
    <path d="M6 12q8-7 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0v22q-8 7-16 0t-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0-16 0Z"
      fill="${cor}"/></svg>`;
}

/** cabeçalho de seção: ícone, título e tarja no fundo */
function cabecalhoSecao(icone, titulo, cor, extra = "") {
  return `<div class="secao" style="--secao-cor:var(--${cor});--secao-claro:var(--${cor}-claro)">
    ${tarja(`var(--${cor}-claro)`)}
    <span class="secao-icone">${icone}</span>
    <h2 class="titulo-m secao-titulo">${titulo}</h2>
    <span class="secao-extra">${extra}</span>
  </div>`;
}

/* ---- troféus ---- */
const TROFEU_FORMAS = {
  estrela: (c) => `<polygon points="${pontosEstrela(44, 44, 32)}" fill="${c}" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/>`,
  selo: (c) => `<path d="${caminhoSerrilhado(44, 44, 32, 16)}" fill="${c}" stroke="var(--uva)" stroke-width="5" stroke-linejoin="round"/>`,
  medalha: (c) => `<g fill="${c}" stroke="var(--uva)" stroke-width="4.5" stroke-linejoin="round">
      <path d="M19 4h15l10 28H29Z"/><path d="M69 4H54L44 32h15Z"/></g>
    <circle cx="44" cy="53" r="24" fill="${c}" stroke="var(--uva)" stroke-width="5"/>
    <circle cx="44" cy="53" r="16" fill="none" stroke="var(--uva)" stroke-width="2.5" stroke-dasharray="5 5" opacity=".6"/>`,
  corrente: (c) => `<circle cx="20" cy="44" r="12" fill="${c}" stroke="var(--uva)" stroke-width="5"/>
    <circle cx="44" cy="44" r="12" fill="${c}" stroke="var(--uva)" stroke-width="5"/>
    <circle cx="68" cy="44" r="12" fill="${c}" stroke="var(--uva)" stroke-width="5"/>`,
  flor: (c) => `${petalas(44, 44, 30, c)}<circle cx="44" cy="44" r="30" fill="none"/>
    <circle cx="44" cy="44" r="11" fill="var(--manteiga)" stroke="var(--uva)" stroke-width="4"/>`,
  carinha: (c) => `<circle cx="44" cy="44" r="30" fill="${c}" stroke="var(--uva)" stroke-width="5"/>
    <g fill="none" stroke="var(--uva)" stroke-width="5" stroke-linecap="round"><path d="M31 37q4-5 8 0"/><path d="M49 37q4-5 8 0"/><path d="M31 52q13 12 26 0"/></g>`
};
function trofeu(s, tam = 72, ganho = true) {
  const cor = ganho ? `var(--${s.cor})` : "var(--borda)";
  const forma = (TROFEU_FORMAS[s.forma] || TROFEU_FORMAS.selo)(cor);
  return `<svg viewBox="0 0 88 88" width="${tam}" height="${tam}" class="trofeu ${ganho ? "" : "bloqueado"}" role="img" aria-label="${s.nome}">
    ${forma}
    ${s.sub ? `<text x="44" y="${s.forma === "medalha" ? 60 : 51}" text-anchor="middle" font-family="var(--font-texto)"
      font-size="${String(s.sub).length > 2 ? 14 : 20}" font-weight="700"
      fill="${ganho ? "var(--tinta-sobre-cor)" : "var(--tinta-rotulo)"}">${s.sub}</text>` : ""}
  </svg>`;
}

/* ---- carinhas do humor ---- */
const ROSTOS = {
  otimo: `<path d="M10 13q2.4-3 4.8 0" /><path d="M17.2 13q2.4-3 4.8 0" /><path d="M10.5 18.5q5.5 6 11 0" /><path d="M10.5 18.5q5.5 1.6 11 0" fill="var(--uva)" stroke="none" opacity=".18"/>`,
  bem: `<circle cx="12.4" cy="13.4" r="1.7" fill="var(--uva)" stroke="none"/><circle cx="19.6" cy="13.4" r="1.7" fill="var(--uva)" stroke="none"/><path d="M11.5 19q4.5 4.4 9 0"/>`,
  ok: `<circle cx="12.4" cy="13.6" r="1.7" fill="var(--uva)" stroke="none"/><circle cx="19.6" cy="13.6" r="1.7" fill="var(--uva)" stroke="none"/><path d="M12 20h8"/>`,
  cansada: `<path d="M10.4 14.2h4"/><path d="M17.6 14.2h4"/><path d="M11.8 20.4q2-1.8 4 0t4 0"/>`,
  off: `<path d="M10.4 14.6q2.2 2.4 4.4 0"/><path d="M17.2 14.6q2.2 2.4 4.4 0"/><path d="M13 20.2h6"/>`
};
function carinha(humor, tam = 30, cor = "var(--manteiga)") {
  return `<svg viewBox="0 0 32 32" width="${tam}" height="${tam}" class="carinha" aria-hidden="true">
    <circle cx="16" cy="16" r="13" fill="${cor}" stroke="var(--uva)" stroke-width="2.2"/>
    <g fill="none" stroke="var(--uva)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${ROSTOS[humor] || ROSTOS.ok}
    </g></svg>`;
}

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

/* ---- confete e comemoração ----
   O fundo fica desfocado e a Agnes só sai quando a pessoa fecha. */
function festejar(comAgnes = true, textoSelo = "7", subSelo = "DIAS", opcoes = {}) {
  const anterior = document.querySelector(".festa");
  if (anterior) anterior.remove();

  const caixa = document.createElement("div");
  caixa.className = "festa";
  const peca = opcoes.selo
    ? trofeu(opcoes.selo, 150)
    : selo(textoSelo, subSelo, "var(--manteiga)", 140);

  caixa.innerHTML = `
    <div class="festa-fundo"></div>
    <div class="festa-caixa" role="dialog" aria-modal="true" aria-label="${opcoes.titulo || "Parabéns"}">
      <button class="festa-fechar" aria-label="Fechar">${mini("fechar", 20)}</button>
      <div class="festa-peca">${peca}</div>
      ${comAgnes ? `<div class="festa-agnes">${(window.Ilustra
        ? window.Ilustra.peca(opcoes.selo ? "momento-trofeu" : "momento-comemora", 116, "Agnes comemorando")
        : agnes("acolhedora_laco", 116))}</div>` : ""}
      <p class="festa-titulo">${opcoes.titulo || "Conseguiu!"}</p>
      ${opcoes.texto ? `<p class="festa-texto">${opcoes.texto}</p>` : ""}
      <div class="festa-chip">${chipPalavra(opcoes.palavra)}</div>
      <button class="btn btn-principal festa-ok">${opcoes.botao || "Obrigada, Agnes"}</button>
    </div>`;

  const pecas = [
    (c) => `<svg viewBox="0 0 24 24"><polygon points="${pontosEstrela(12,12,11)}" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24"><path d="M12 21C4 15 2 11 5 7c2.4-3 6-1.6 7 .8C13 5.4 16.6 4 19 7c3 4 1 8-7 14Z" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24">${petalas(12,12,9,c)}</svg>`,
    (c) => `<svg viewBox="0 0 24 24"><path d="M12 1 14 9 22 12 14 15 12 23 10 15 2 12 10 9Z" fill="${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${c}"/></svg>`
  ];
  const cores = ["var(--rosa)", "var(--manteiga)", "var(--menta)", "var(--lilas)", "var(--acao)", "var(--pessego)"];
  const fundo = caixa.querySelector(".festa-fundo");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < 34; i++) {
      const c = document.createElement("i");
      c.className = "confete";
      const tam = 12 + Math.random() * 12;
      c.style.cssText = `left:${Math.random() * 100}%;width:${tam}px;height:${tam}px;animation-delay:${Math.random() * 500}ms`;
      c.innerHTML = pecas[i % pecas.length](cores[(i * 3) % cores.length]);
      fundo.appendChild(c);
    }
  }

  document.body.appendChild(caixa);
  document.body.classList.add("com-festa");

  const sair = () => {
    document.removeEventListener("keydown", aoTecla);
    document.body.classList.remove("com-festa");
    caixa.classList.add("saindo");
    setTimeout(() => caixa.remove(), 220);
    if (typeof opcoes.aoFechar === "function") opcoes.aoFechar();
  };
  function aoTecla(e) { if (e.key === "Escape") { e.preventDefault(); sair(); } }

  caixa.querySelector(".festa-fechar").onclick = sair;
  caixa.querySelector(".festa-ok").onclick = sair;
  document.addEventListener("keydown", aoTecla);
  setTimeout(() => caixa.querySelector(".festa-fechar").focus(), 60);
  return sair;
}

window.Arte = { agnes, ondinha, selo, caminhoSerrilhado, areaIcone, navIcone, mini, anel, festejar,
  svg, corrente, estrela, etiquetaDia, chipPalavra, pontosEstrela, carinha, tarja, cabecalhoSecao, trofeu };
