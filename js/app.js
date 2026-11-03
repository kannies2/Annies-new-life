/* Annie's New Life — interface e comportamento. */
(function () {
"use strict";

const D = window.Dados, A = window.Arte, AS = window.Assessments, B = window.Biblioteca;
const S = window.Som || { tocar(){}, alternar(){}, ligado(){ return false; }, retomarSeLigado(){} };
const $ = (s, raiz = document) => raiz.querySelector(s);
const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const semMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const ABAS = [
  { id: "hoje", nome: "Hoje" }, { id: "semana", nome: "Semana" },
  { id: "mes", nome: "Mês" }, { id: "desafios", nome: "Desafios" },
  { id: "metas", nome: "Metas" }, { id: "revisao", nome: "Revisão" }
];

/* ícone e cor de cada faixa de seção */
const SECAO_ICONES = {
  habitos: () => A.mini("repete", 24), desafios: () => A.navIcone("desafios"),
  tarefas: () => A.mini("lista", 24), feitas: () => A.mini("ok2", 24),
  pendentes: () => A.mini("mover", 24), humor: () => A.carinha("bem", 26, "var(--manteiga)"),
  metas: () => A.navIcone("metas"), assessments: () => A.navIcone("revisao"),
  biblioteca: () => A.mini("biblioteca", 24), trofeus: () => A.mini("trofeu", 24),
  bloqueado: () => A.mini("cadeado", 24), lixeira: () => A.mini("excluir", 24),
  reflexao: () => A.mini("editar", 24), calendario: () => A.navIcone("mes")
};
function montarSecoes(raiz = document) {
  $$(".secao[data-icone]", raiz).forEach(s => {
    if (s.dataset.montada) return;
    s.dataset.montada = "1";
    const cor = s.dataset.cor || "rosa";
    s.style.setProperty("--secao-cor", `var(--${cor})`);
    s.insertAdjacentHTML("afterbegin", A.tarja(`var(--${cor}-claro)`));
    const fabrica = SECAO_ICONES[s.dataset.icone];
    if (fabrica) s.insertAdjacentHTML("beforeend", `<span class="secao-icone">${fabrica()}</span>`);
    const icone = $(".secao-icone", s);
    if (icone) s.insertBefore(icone, $(".secao-titulo", s));
  });
}
const MES_CURTO = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

let aba = "hoje", abaAnterior = "hoje";
const ORDEM = ["hoje", "semana", "mes", "desafios", "metas", "revisao"];
let areaDesafios = "", areaMetas = "", vistaSemana = "lista";
let diaHoje = D.hoje(), diaSemana = D.hoje(), diaMes = D.hoje(), diaMesSel = D.hoje(), diaRevisao = D.hoje();
let editandoTarefa = null, tarefaDetalhe = null, metaDaEtapa = null, tarefaReagendar = null;
let filtroBusca = { status: "", categoriaId: "" };
let habitoEditando = null;
let confirmarAcao = null, escopoAcao = null;

/* ---------------------------------------- tema */
function aplicarTema() {
  const t = D.estado.tema;
  document.documentElement.dataset.tema = t ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro");
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--creme-100").trim();
}
function alternarTema() {
  D.estado.tema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  D.salvar(); aplicarTema();
}

/* ---------------------------------------- navegação */
function montarNav() {
  $("#nav").innerHTML = ABAS.map(a =>
    `<button data-aba="${a.id}" ${a.id === aba ? 'aria-current="page"' : ""}>
       ${A.navIcone(a.id)}<span>${a.nome}</span></button>`).join("");
  $$("#nav button").forEach(b => b.onclick = () => irPara(b.dataset.aba));
}
function trocarTela(nova) {
  const de = ORDEM.indexOf(aba), para = ORDEM.indexOf(nova);
  abaAnterior = aba; aba = nova;
  document.documentElement.dataset.aba = ABAS.some(a => a.id === nova) ? nova : "hoje";
  const ehAba = ABAS.some(a => a.id === nova);
  document.documentElement.style.setProperty("--aba-atual-claro",
    ehAba ? `var(--aba-${nova}-claro)` : "var(--creme-200)");
  document.documentElement.style.setProperty("--aba-atual-cor",
    ehAba ? `var(--aba-${nova})` : "var(--rosa)");
  $$(".tela").forEach(t => t.classList.remove("ativa"));
  const alvo = $("#tela-" + nova);
  if (alvo) {
    alvo.classList.remove("vem-da-direita", "vem-da-esquerda");
    if (de >= 0 && para >= 0 && de !== para && !semMovimento())
      alvo.classList.add(para > de ? "vem-da-direita" : "vem-da-esquerda");
    alvo.classList.add("ativa");
  }
  $$("#nav button").forEach(b => {
    if (b.dataset.aba === nova) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  aplicarTema(); desenhar(); moverCorredor();
  window.scrollTo({ top: 0, behavior: "instant" });
  revelarTarjas(alvo || document);
  revelarOndinha();
}

/** o indicador do menu corre até a aba atual */
function moverCorredor() {
  const nav = $("#nav"), botao = $('#nav button[aria-current="page"]');
  let corredor = $(".corredor", nav);
  if (!botao) { if (corredor) corredor.style.opacity = "0"; return; }
  if (!corredor) {
    corredor = document.createElement("span");
    corredor.className = "corredor";
    nav.prepend(corredor);
  }
  corredor.style.opacity = "1";
  const r = botao.getBoundingClientRect(), rn = nav.getBoundingClientRect();
  corredor.style.width = r.width + "px";
  corredor.style.height = r.height + "px";
  corredor.style.transform = `translate(${r.left - rn.left}px, ${r.top - rn.top}px)`;
}
function irPara(nova) {
  if (nova !== aba) S.tocar("aba");
  if (document.startViewTransition && !semMovimento()) {
    const vt = document.startViewTransition(() => trocarTela(nova));
    // medir o menu durante a transição dá valores errados, então mede depois
    vt.finished.then(() => requestAnimationFrame(moverCorredor)).catch(() => {});
  } else trocarTela(nova);
}

/* ---------------------------------------- animação */
let observador = null;
let redeSeguranca = null;
function observarEntradas() {
  const alvos = $$(".reveal").filter(e => !e.dataset.entrou);
  if (!alvos.length) return;
  if (semMovimento() || !("IntersectionObserver" in window)) {
    alvos.forEach(e => e.dataset.entrou = "1"); return;
  }
  if (observador) observador.disconnect();
  observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visivel"), Math.min(i * 40, 200));
        observador.unobserve(e.target);
      }
    });
  }, { rootMargin: "120px 0px 120px 0px" });

  const altura = window.innerHeight;
  alvos.forEach(e => {
    e.dataset.entrou = "1";
    // a tarefa que acabou de ser marcada está viajando, não pode sumir
    if (semReveal && e.dataset.id === semReveal) return;
    // o que já está na tela não some nunca
    if (e.getBoundingClientRect().top < altura + 80) return;
    e.classList.add("vai-entrar");
    observador.observe(e);
  });
  // rede de segurança: nada fica invisível por mais de um segundo
  clearTimeout(redeSeguranca);
  redeSeguranca = setTimeout(() => $$(".vai-entrar:not(.visivel)").forEach(e => e.classList.add("visivel")), 1000);
}

/* ------- concluir tarefa: o card viaja até o lugar novo (FLIP) ------- */
let semReveal = null;

function medirTarefas() {
  const mapa = new Map();
  $$(".tarefa").forEach(li => mapa.set(li.dataset.id, li.getBoundingClientRect()));
  return mapa;
}

function animarMigracao(antes, idMarcada, virouFeita) {
  if (semMovimento() || !antes || typeof Element.prototype.animate !== "function") return;
  $$(".tarefa").forEach(li => {
    const de = antes.get(li.dataset.id);
    if (!de) return;
    const para = li.getBoundingClientRect();
    const dx = de.left - para.left, dy = de.top - para.top;
    const marcada = li.dataset.id === idMarcada;
    if (!marcada && Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    if (marcada) {
      li.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: .9 },
        { transform: `translate(${dx * .2}px, ${dy * .2}px) scale(1.04)`, opacity: 1, offset: .62 },
        { transform: "none", opacity: 1 }
      ], { duration: 460, easing: "cubic-bezier(.34,1.3,.64,1)" });
      const caixa = $(".caixa", li);
      if (caixa) {
        caixa.classList.remove("marcando");
        void caixa.offsetWidth;
        caixa.classList.add("marcando");
        if (virouFeita) brilhar(caixa);
      }
    } else {
      li.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
  });
}

/** três brilhos saindo da caixinha marcada */
function brilhar(caixa) {
  const r = caixa.getBoundingClientRect();
  const cores = ["var(--manteiga)", "var(--rosa)", "var(--menta)"];
  for (let i = 0; i < 3; i++) {
    const b = document.createElement("i");
    b.className = "brilho";
    b.innerHTML = A.estrela(14, cores[i]);
    b.style.left = (r.left + r.width / 2 - 7) + "px";
    b.style.top = (r.top + r.height / 2 - 7) + "px";
    document.body.appendChild(b);
    const ang = (-Math.PI / 2) + (i - 1) * 0.8;
    b.animate([
      { transform: "translate(0,0) scale(.4)", opacity: 1 },
      { transform: `translate(${Math.cos(ang) * 34}px, ${Math.sin(ang) * 34}px) scale(1.1) rotate(${i * 90}deg)`, opacity: 0 }
    ], { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => b.remove();
    setTimeout(() => b.remove(), 900);
  }
}

/* ---------------------------------------- arrastar a tarefa
   Puxar para a direita conclui, para a esquerda adia um dia.
   O card acompanha o dedo, mostra a pista colorida e encaixa sozinho. */
const LIMIAR = 78;          // quanto precisa andar para valer
const MAX_ARRASTO = 150;

function ligarArrasto(li) {
  if (li.dataset.arrasto) return;
  li.dataset.arrasto = "1";

  let id = null, x0 = 0, y0 = 0, dx = 0, decidido = false, arrastando = false, t0 = 0;
  const corpo = $(".tarefa-corpo", li);

  const pista = document.createElement("span");
  pista.className = "pista";
  pista.innerHTML = `<i class="pista-esq">${A.mini("mover", 20)}<b>Adiar</b></i>
                     <i class="pista-dir"><b>Concluir</b>${A.mini("ok2", 20)}</i>`;
  li.insertBefore(pista, li.firstChild);

  const soltar = () => {
    li.releasePointerCapture?.(id);
    id = null; arrastando = false; decidido = false;
    li.classList.remove("arrastando");
  };

  li.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button:not(.tarefa-corpo)")) return;
    id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = performance.now();
    decidido = false; arrastando = false;
  });

  li.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id) return;
    const ax = e.clientX - x0, ay = e.clientY - y0;
    if (!decidido) {
      if (Math.abs(ax) < 10 && Math.abs(ay) < 10) return;
      decidido = true;
      // se o dedo foi mais pra cima ou pra baixo, é rolagem, não arrasto
      if (Math.abs(ay) > Math.abs(ax)) { id = null; return; }
      arrastando = true;
      li.setPointerCapture?.(id);
      li.classList.add("arrastando");
      if (corpo) corpo.style.pointerEvents = "none";
    }
    if (!arrastando) return;
    e.preventDefault();
    // resistência depois do limiar, como elástico
    const bruto = ax;
    dx = Math.abs(bruto) <= LIMIAR ? bruto
      : Math.sign(bruto) * (LIMIAR + (Math.abs(bruto) - LIMIAR) * 0.38);
    dx = Math.max(-MAX_ARRASTO, Math.min(MAX_ARRASTO, dx));
    li.style.transform = `translateX(${dx}px)`;
    li.style.transition = "none";
    const forca = Math.min(1, Math.abs(dx) / LIMIAR);
    li.style.setProperty("--pista-forca", forca.toFixed(2));
    li.classList.toggle("vai-concluir", dx > 0 && forca >= 1);
    li.classList.toggle("vai-adiar", dx < 0 && forca >= 1);
  });

  const terminar = (e) => {
    if (e.pointerId !== id) return;
    const foiArrasto = arrastando;
    const distancia = dx;
    const veloc = Math.abs(distancia) / Math.max(1, performance.now() - t0);
    soltar();
    if (corpo) setTimeout(() => { corpo.style.pointerEvents = ""; }, 0);
    if (!foiArrasto) return;

    // inércia: um gesto rápido conta mesmo sem alcançar o limiar
    const passou = Math.abs(distancia) >= LIMIAR || veloc > 0.55;
    li.style.transition = "transform 320ms cubic-bezier(.34,1.3,.64,1)";
    li.style.transform = "";
    li.style.removeProperty("--pista-forca");
    li.classList.remove("vai-concluir", "vai-adiar");
    if (!passou) { S.tocar("toque"); return; }

    const t = acharPorId(li.dataset.id);
    if (!t) return;
    if (distancia > 0) acaoTarefa("alternar", t);
    else adiarUmDia(t);
  };
  li.addEventListener("pointerup", terminar);
  li.addEventListener("pointercancel", terminar);
}

/** adia a tarefa para o dia seguinte, com desfazer */
function adiarUmDia(t) {
  const real = D.materializar(t);
  const de = real.data, para = D.somaDias(real.data || D.hoje(), 1);
  D.atualizarTarefa(real.id, { data: para });
  S.tocar("toque");
  desenhar();
  avisarNaTela(`"${cortar(real.titulo)}" foi para ${D.dataCurta(para)}.`, {
    rotulo: "Desfazer",
    acao: () => { D.atualizarTarefa(real.id, { data: de }); S.tocar("desmarcar"); desenhar(); }
  });
}
const cortar = (s, n = 28) => (s || "").length > n ? (s || "").slice(0, n - 1) + "…" : (s || "");

/** liga o gesto em todas as tarefas da tela */
function ligarArrastos(raiz = document) {
  if (!window.PointerEvent) return;
  $$(".tarefa", raiz).forEach(ligarArrasto);
}

/* ---------------------------------------- a Agnes nos momentos-chave
   Ela aparece quando há o que dizer, e fica quieta no resto do tempo. */

/** a expressão dela segue o estado do dia */
function humorDaAgnes(tarefas, feitas) {
  if (!tarefas.length) return "curiosa";
  if (feitas.length === tarefas.length) return "acolhedora";
  if (feitas.length / tarefas.length >= 0.5) return "feliz";
  return "feliz";
}

/** mostra um recadinho dela no topo da tela Hoje, no máximo um por vez */
function recadoDaAgnes(texto, expr = "acolhedora") {
  const antigo = $(".recado");
  if (antigo) antigo.remove();
  const alvo = $("#bloco-recado");
  if (!alvo) return;
  alvo.innerHTML = `<div class="card recado">
    <span class="recado-agnes">${A.agnes(expr, 58)}</span>
    <p class="recado-texto">${esc(texto)}</p>
    <button class="recado-fechar" aria-label="Fechar recado">${A.mini("fechar", 16)}</button>
  </div>`;
  const card = $(".recado", alvo);
  if (!semMovimento()) {
    card.animate([{ opacity: 0, transform: "translateY(-10px) scale(.97)" }, { opacity: 1, transform: "none" }],
      { duration: 420, easing: "cubic-bezier(.34,1.3,.64,1)" });
  }
  $(".recado-fechar", card).onclick = () => {
    if (semMovimento()) { card.remove(); return; }
    card.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-8px)" }],
      { duration: 200, easing: "ease-in" }).onfinish = () => card.remove();
  };
}

/** decide se há algo a dizer hoje */
function verMomentos() {
  if (aba !== "hoje" || diaHoje !== D.hoje()) return;
  const alvo = $("#bloco-recado");
  if (!alvo || alvo.dataset.jaFalou === D.hoje()) return;

  const ontemAberto = visitaAnterior;
  const tarefas = D.tarefasDoDia(diaHoje);
  const feitas = tarefas.filter(t => t.feita);
  const atrasadas = D.pendentesAnteriores(diaHoje);
  const seqHumor = D.humorSequencia(D.somaDias(D.hoje(), -1));
  const melhorHabito = D.estado.habitos.reduce((n, h) => Math.max(n, D.sequencia(h, diaHoje)), 0);

  let recado = null, expr = "acolhedora";

  if (ontemAberto && ontemAberto < D.somaDias(D.hoje(), -3)) {
    const dias = Math.round((D.deISO(D.hoje()) - D.deISO(ontemAberto)) / 86400000);
    recado = `Que bom te ver. Fazia ${dias} dias. Comece pelo que for mais leve.`;
    expr = "acolhedora";
  } else if (melhorHabito >= 3 && melhorHabito % 3 === 0) {
    recado = `${melhorHabito} dias seguidos num hábito. Isso já virou rotina.`;
    expr = "feliz";
  } else if (seqHumor >= 3) {
    recado = `Você registrou o humor ${seqHumor} dias seguidos. Dá pra ver o desenho da semana na Revisão.`;
    expr = "curiosa";
  } else if (atrasadas.length >= 3) {
    recado = `${atrasadas.length} coisas ficaram para trás. Escolha uma só e deixe o resto quieto.`;
    expr = "curiosa";
  } else if (!tarefas.length) {
    recado = `Dia em branco. Dá pra encher ou dá pra descansar, você escolhe.`;
    expr = "curiosa";
  } else if (feitas.length === tarefas.length && tarefas.length >= 2) {
    recado = `Tudo riscado. Esse dia já está ganho.`;
    expr = "acolhedora";
  }

  if (!recado) { alvo.innerHTML = ""; return; }
  alvo.dataset.jaFalou = D.hoje();
  recadoDaAgnes(recado, expr);
}

/** guarda o último dia em que o app foi aberto, para saber quando ela some.
    O valor anterior fica aqui, porque é ele que interessa. */
let visitaAnterior = "";
function marcarVisita() {
  visitaAnterior = D.estado.ultimoDia || "";
  if (visitaAnterior !== D.hoje()) { D.estado.ultimoDia = D.hoje(); D.salvar(); }
}

/** depois de apagar, oferece o caminho de volta na hora */
function avisarApagado(nome) {
  const reg = D.estado.lixeira[0];
  avisarNaTela(`"${cortar(nome)}" foi para a lixeira.`, {
    rotulo: "Desfazer",
    acao: () => {
      if (reg) D.restaurar(reg.id);
      S.tocar("marcar");
      desenhar();
    }
  });
}

/** a bolha do alternador corre até a aba escolhida */
function moverBolha() {
  const caixa = $(".troca-vista");
  if (!caixa) return;
  const b = $('[aria-selected="true"]', caixa), bolha = $(".troca-bolha", caixa);
  if (!b || !bolha) return;
  const r = b.getBoundingClientRect(), rc = caixa.getBoundingClientRect();
  bolha.style.width = r.width + "px";
  bolha.style.transform = `translateX(${r.left - rc.left}px)`;
}

/** a saudação muda com a hora do dia */
function saudacaoDaHora(nome) {
  const h = new Date().getHours();
  const quem = nome ? `, ${nome}` : "";
  if (h < 5) return `Boa madrugada${quem}`;
  if (h < 12) return `Bom dia${quem}`;
  if (h < 18) return `Boa tarde${quem}`;
  return `Boa noite${quem}`;
}

/** o texto aparece letra por letra, no ritmo de quem escreve à mão */
function escrever(el, texto, atraso = 0) {
  if (!el) return;
  if (semMovimento()) { el.textContent = texto; return; }
  el.textContent = "";
  el.setAttribute("aria-label", texto);
  const frag = document.createDocumentFragment();
  let i = 0;
  // as letras ficam agrupadas por palavra, senão a linha quebra no meio dela
  texto.split(" ").forEach((palavra, p, todas) => {
    const bloco = document.createElement("span");
    bloco.className = "palavra";
    bloco.setAttribute("aria-hidden", "true");
    [...palavra].forEach((c) => {
      const s = document.createElement("span");
      s.className = "letra";
      s.textContent = c;
      // a mão hesita um pouco depois da vírgula
      s.style.animationDelay = `${atraso + i * 42 + (/[,.!?]/.test(palavra[0]) ? 0 : 0)}ms`;
      i++;
      bloco.appendChild(s);
    });
    frag.appendChild(bloco);
    if (p < todas.length - 1) { frag.appendChild(document.createTextNode(" ")); i++; }
  });
  el.appendChild(frag);
}

/** parallax: a decoração da faixa anda mais devagar que o resto */
function ligarParallax() {
  if (semMovimento()) return;
  let pedido = false;
  const mover = () => {
    pedido = false;
    const y = window.scrollY;
    const faixa = $(".tela.ativa .faixa");
    if (!faixa) return;
    const deco = $(".faixa-deco", faixa), fundo = $(".faixa-fundo", faixa);
    if (deco) deco.style.transform = `translateY(${Math.min(y * 0.22, 40)}px)`;
    if (fundo) fundo.style.transform = `translateY(${Math.min(y * 0.1, 24)}px)`;
    const barra = $("#barra-leitura");
    if (barra) {
      const total = document.documentElement.scrollHeight - innerHeight;
      barra.style.transform = `scaleX(${total > 60 ? Math.min(1, y / total) : 0})`;
    }
  };
  addEventListener("scroll", () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(mover);
  }, { passive: true });
  mover();
}

/** números sobem até o valor, em vez de aparecerem prontos */
function animarNumeros(raiz = document) {
  $$("[data-num]", raiz).forEach(el => {
    const alvo = Number(el.dataset.num);
    if (!isFinite(alvo)) return;
    const sufixo = el.dataset.sufixo || "";
    if (semMovimento() || alvo === 0) { el.textContent = alvo + sufixo; return; }
    const dur = Math.min(900, 320 + Math.abs(alvo) * 22);
    const inicio = performance.now();
    el.textContent = "0" + sufixo;
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / dur);
      // desacelera no fim, como se estivesse chegando
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(alvo * suave) + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

/** as tarjas de seção entram por máscara, da esquerda para a direita */
function revelarTarjas(raiz = document) {
  if (semMovimento()) return;
  $$(".secao .tarja-fundo", raiz).forEach((t, i) => {
    t.style.clipPath = "inset(0 100% 0 0 round 10px)";
    setTimeout(() => {
      t.style.transition = "clip-path 520ms cubic-bezier(.2,.8,.2,1)";
      t.style.clipPath = "inset(0 0 0 0 round 10px)";
    }, 60 + i * 70);
  });
}

/** a ondinha da faixa é descoberta junto com a tela */
function revelarOndinha(raiz = document) {
  if (semMovimento()) return;
  const o = $(".tela.ativa .ondinha", raiz);
  if (!o) return;
  o.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)", delay: 90, fill: "backwards" });
}

/** os elos da corrente aparecem um atrás do outro */
function animarCorrentes(raiz = document) {
  if (semMovimento() || typeof Element.prototype.animate !== "function") return;
  $$(".corrente", raiz).forEach(c => {
    if (c.dataset.animada) return;
    c.dataset.animada = "1";
    [...c.children].forEach((elo, i) => {
      elo.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
        { duration: 320, delay: i * 38, easing: "cubic-bezier(.34,1.3,.64,1)", fill: "backwards" });
    });
  });
}

/** anéis e barras crescem do zero */
function animarProgresso(raiz = document) {
  if (semMovimento()) return;
  $$(".anel circle.valor", raiz).forEach(c => {
    const alvo = c.getAttribute("stroke-dashoffset");
    const total = c.getAttribute("stroke-dasharray");
    c.setAttribute("stroke-dashoffset", total);
    requestAnimationFrame(() => requestAnimationFrame(() => c.setAttribute("stroke-dashoffset", alvo)));
  });
  $$(".meta-barra span", raiz).forEach(b => {
    const w = b.style.width; b.style.width = "0%";
    requestAnimationFrame(() => requestAnimationFrame(() => b.style.width = w));
  });
  $$(".grafico .barra", raiz).forEach(b => {
    const h = b.style.height; b.style.height = "0%";
    requestAnimationFrame(() => requestAnimationFrame(() => b.style.height = h));
  });
}

function festejarComSom(comAgnes, texto, sub, opcoes) {
  S.tocar("festa");
  A.festejar(comAgnes, texto, sub, opcoes);
}

/* ---------------------------------------- peças */
function etiquetaCategoria(cid) {
  const c = D.categoria(cid);
  if (!c) return "";
  return `<span class="etq etq-cat" style="background:var(--${c.cor}-claro)">
    <i class="ponto" style="background:var(--${c.cor})"></i>${esc(c.nome)}</span>`;
}
function etiquetaPrazo(t) {
  if (t.feita) return "";
  const h = D.hoje();
  if (t.data < h) return `<span class="etq etq-atrasada">Atrasada</span>`;
  if (t.data === h) return `<span class="etq etq-hoje">Hoje</span>`;
  if (t.data === D.somaDias(h, 1)) return `<span class="etq etq-amanha">Amanhã</span>`;
  return "";
}
/** mostra quantos passos já foram feitos, com uma barrinha */
function etiquetaPassos(t) {
  const { feitos, total } = D.progressoPassos(t);
  if (!total) return "";
  const pct = Math.round((feitos / total) * 100);
  return `<span class="etq etq-passos ${feitos === total ? "cheia" : ""}" title="Subtarefas">
    <span class="passos-barra"><i style="width:${pct}%"></i></span>${feitos}/${total}</span>`;
}

/** o checklist da tarefa, usado na tela de detalhe */
function listaPassos(t) {
  const ps = D.passos(t);
  const { feitos, total } = D.progressoPassos(t);
  return `<div class="card" id="card-passos">
    <div class="passos-topo">
      <p class="micro" style="margin:0">Subtarefas</p>
      ${total ? `<span class="micro" style="color:var(--framboesa)">${feitos} de ${total}</span>` : ""}
    </div>
    ${total ? `<div class="meta-barra" style="margin-top:var(--space-2)"><span style="width:${total ? (feitos / total) * 100 : 0}%"></span></div>` : ""}
    <ul class="passos" id="lista-passos">
      ${ps.map(p => `<li class="passo ${p.feito ? "feito" : ""}" data-passo="${p.id}">
        <button class="caixa" role="checkbox" aria-checked="${p.feito}" data-acao="passo-alternar"
          aria-label="${esc(p.titulo)}"></button>
        <span class="passo-titulo">${esc(p.titulo)}</span>
        <button class="passo-excluir" data-acao="passo-excluir" aria-label="Excluir subtarefa">${A.mini("excluir", 15)}</button>
      </li>`).join("")}
    </ul>
    <form id="form-passo" class="passo-novo">
      <input type="text" name="titulo" maxlength="120" placeholder="Quebrar em um passo menor" autocomplete="off" aria-label="Nova subtarefa">
      <button type="submit" class="btn btn-secundario" aria-label="Adicionar subtarefa">${A.mini("mais", 18)}</button>
    </form>
  </div>`;
}

function linhaTarefa(t, opcoes = {}) {
  const meta = D.estado.metas.find(m => m.id === t.metaId);
  const classes = ["tarefa", "reveal"];
  if (t.prioridade && !t.feita) classes.push("prioridade");
  if (!t.feita && t.data < D.hoje()) classes.push("atrasada");
  if (t.feita) classes.push("feita");
  return `<li class="${classes.join(" ")}" data-id="${t.id}">
    <button class="caixa" role="checkbox" aria-checked="${t.feita}" data-acao="alternar"
      aria-label="${t.feita ? "Reabrir" : "Concluir"} ${esc(t.titulo)}"></button>
    <div class="tarefa-corpo" data-acao="detalhe" role="button" tabindex="0">
      <p class="tarefa-titulo">${esc(t.titulo)}</p>
      <div class="tarefa-meta">
        ${t.prioridade && !t.feita ? '<span class="etq etq-prioridade">Prioridade</span>' : ""}
        ${etiquetaPrazo(t)}
        ${etiquetaCategoria(t.categoriaId)}
        ${meta ? `<span class="etq etq-meta">${esc(meta.titulo)}</span>` : ""}
        ${t.hora ? `<span class="apoio">${esc(t.hora)}</span>` : ""}
        ${t.repete && t.repete.tipo !== "nenhuma" ? `<span class="repete" title="Repete">${A.mini("repete", 16)}</span>` : ""}
        ${etiquetaPassos(t)}
        ${opcoes.mostrarData ? `<span class="apoio">${D.dataCurta(t.data)}</span>` : ""}
      </div>
    </div>
    <div class="tarefa-acoes">
      <button data-acao="editar" aria-label="Editar">${A.mini("editar")}</button>
      <button data-acao="mover" aria-label="Reagendar">${A.mini("mover")}</button>
      <button data-acao="excluir" aria-label="Excluir">${A.mini("excluir")}</button>
    </div>
  </li>`;
}
function vazio(expr, titulo, apoio, botao, marca) {
  return `<div class="vazio reveal">${A.agnes(expr, 92)}
    <p>${esc(titulo)}</p><p class="apoio">${esc(apoio)}</p>
    ${botao ? `<button class="btn btn-principal" data-vazio="${marca || ""}">${esc(botao)}</button>` : ""}</div>`;
}

/* ---------------------------------------- HOJE */
function desenharHoje() {
  const tarefas = D.tarefasDoDia(diaHoje);
  const pendentes = tarefas.filter(t => !t.feita);
  const feitas = tarefas.filter(t => t.feita);

  const obj = D.deISO(diaHoje);
  const ehHoje = diaHoje === D.hoje();
  const ontem = diaHoje === D.somaDias(D.hoje(), -1);
  const amanha = diaHoje === D.somaDias(D.hoje(), 1);
  $("#hoje-etiqueta").outerHTML = A.etiquetaDia(String(obj.getDate()).padStart(2, "0"), MES_CURTO[obj.getMonth()])
    .replace('class="etiqueta-dia"', 'class="etiqueta-dia" id="hoje-etiqueta"');
  $("#hoje-semana").textContent = D.DIAS[obj.getDay()];
  $("#hoje-data").textContent = ehHoje ? "hoje" : ontem ? "ontem" : amanha ? "amanhã"
    : `${obj.getDate()} de ${D.MESES[obj.getMonth()]} de ${obj.getFullYear()}`;

  const sauda = $("#t-hoje");
  const nome = D.nome();
  const texto = ehHoje ? saudacaoDaHora(nome) : (nome || "Esse dia");
  escrever(sauda, texto, 80);
  $("#hoje-progresso").textContent = tarefas.length
    ? `${feitas.length} de ${tarefas.length} tarefas concluídas`
    : "Nenhuma tarefa ainda";
  $("#tarefas-conta").textContent = pendentes.length ? `${pendentes.length} pendente${pendentes.length === 1 ? "" : "s"}` : "";
  $("#hoje-deco").innerHTML = A.agnes(humorDaAgnes(tarefas, feitas), 64);

  $("#lista-tarefas").innerHTML = pendentes.length
    ? pendentes.map(t => linhaTarefa(t)).join("")
    : vazio("curiosa", "Nenhuma tarefa por aqui", "Que tal começar com uma?", "Adicionar tarefa", "tarefa");

  $("#bloco-feitas").classList.toggle("oculto", !feitas.length);
  $("#lista-feitas").innerHTML = feitas.map(t => linhaTarefa(t)).join("");

  const atrasadas = D.pendentesAnteriores(diaHoje);
  $("#bloco-pendentes").classList.toggle("oculto", !atrasadas.length);
  $("#pendentes-conta").textContent = atrasadas.length ? `${atrasadas.length} item${atrasadas.length > 1 ? "s" : ""}` : "";
  $("#lista-pendentes").innerHTML = atrasadas.map(t => linhaTarefa(t, { mostrarData: true })).join("");

  desenharHabitos(); desenharDesafiosHoje(); desenharHumor(); verMomentos();
  $("#anotacao").value = D.anotacao(diaHoje);
  observarEntradas(); animarProgresso(); animarNumeros(); animarCorrentes(); ligarArrastos();
}

function desenharHabitos() {
  const hs = D.estado.habitos;
  $("#lista-habitos").innerHTML = hs.length ? hs.map((h, idx) => {
    const marcado = h.marcas.includes(diaHoje);
    const diario = h.tipo === "diario";
    const valor = diario ? D.sequencia(h, diaHoje) : D.naSemana(h, diaHoje);
    const alvo = diario ? Math.max(valor, 7) : h.alvo;
    const ini = D.inicioSemana(diaHoje);
    const dias = Array.from({ length: 7 }, (_, i) => D.somaDias(ini, i));
    const marcados = dias.map(d => h.marcas.includes(d));
    const indiceHoje = dias.indexOf(diaHoje);
    const destaque = idx === 0 ? " card-destaque" : "";
    return `<div class="card habito reveal${destaque} ${h.pausado ? "pausado" : ""}" data-habito="${h.id}"
      style="--grad-a:var(--menta-claro);--grad-b:var(--manteiga-claro)">
      <div class="card-acoes"><button data-acao="editar-habito" aria-label="Editar hábito">${A.mini("editar", 16)}</button></div>
      ${A.anel(valor, alvo, diario ? "var(--oliva)" : "var(--acao)", 64, diario ? valor : `${valor}/${h.alvo}`)}
      <div class="habito-corpo">
        <h3>${esc(h.nome)}</h3>
        <p class="apoio">${h.pausado ? "pausado" : diario ? `${valor} dia${valor === 1 ? "" : "s"} seguidos` : `${valor} de ${h.alvo} nesta semana`}</p>
        ${A.corrente(marcados, 7, indiceHoje)}
      </div>
      <button class="caixa" role="checkbox" aria-checked="${marcado}" data-acao="marcar-habito"
        aria-label="Marcar ${esc(h.nome)}"></button>
    </div>`;
  }).join("") : `<p class="apoio">Nenhum hábito ainda. Crie um para acompanhar sua rotina.</p>`;
}

function desenharDesafiosHoje() {
  const ds = D.desafiosAtivos();
  $("#bloco-desafios-hoje").classList.toggle("oculto", !ds.length);
  $("#desafios-hoje-conta").textContent = ds.length ? `${ds.length} ativo${ds.length === 1 ? "" : "s"}` : "";
  $("#lista-desafios-hoje").innerHTML = ds.map(d => {
    const marcado = d.marcas.includes(diaHoje);
    const area = D.AREAS.find(a => a.id === d.area);
    return `<div class="card desafio reveal area-${d.area}" data-desafio="${d.id}">
      ${A.areaIcone(d.area, 44)}
      <div class="habito-corpo">
        <h3>${esc(d.titulo)}</h3>
        <p class="apoio">${d.marcas.length} de ${d.dias} dias · ${esc(area ? area.nome : "")}</p>
      </div>
      <button class="caixa" role="checkbox" aria-checked="${marcado}" data-acao="marcar-desafio"
        aria-label="Marcar ${esc(d.titulo)}"></button>
    </div>`;
  }).join("");
}

const HUMORES = [
  { id: "otimo", rotulo: "ótimo", cor: "rosa" },
  { id: "bem", rotulo: "bem", cor: "manteiga" },
  { id: "ok", rotulo: "ok", cor: "menta" },
  { id: "cansada", rotulo: "cansada", cor: "periwinkle" },
  { id: "off", rotulo: "off", cor: "lilas" }
];
const humorPor = (id) => HUMORES.find(h => h.id === id);

/* quando a pessoa já respondeu, o card vira uma tira fininha */
let humorAberto = false;

function desenharHumor() {
  const reg = D.humorRegistro(diaHoje);
  const atual = reg ? reg.v : "";
  const encolhido = !!atual && !humorAberto;

  $("#humor-tira").classList.toggle("oculto", !encolhido);
  $("#card-humor").classList.toggle("oculto", encolhido);
  if (atual) {
    const h = humorPor(atual);
    $("#humor-tira-carinha").innerHTML = A.carinha(atual, 36, `var(--${h ? h.cor : "menta"})`);
    $("#humor-tira-titulo").textContent = `Dia marcado como ${h ? h.rotulo : atual}`;
    const nota = D.humorNota(diaHoje), anot = D.anotacao(diaHoje);
    $("#humor-tira-sub").textContent = nota || (anot ? "com anotações" : (reg.em ? `às ${reg.em}` : "guardado"));
  }

  $("#humor-linha").innerHTML = HUMORES.map(h =>
    `<button class="humor-chip" data-humor="${h.id}" aria-pressed="${atual === h.id}"
      style="--chip:var(--${h.cor});--chip-claro:var(--${h.cor}-claro)">
      ${A.carinha(h.id, 34, `var(--${h.cor})`)}<span>${h.rotulo}</span></button>`).join("");

  const status = $("#humor-status");
  if (atual) {
    const h = humorPor(atual);
    status.innerHTML = `Guardado${reg.em ? ` às ${reg.em}` : ""} · você marcou <b>${h ? h.rotulo : atual}</b>`
      + ` · <button class="elo-texto" data-humor-limpar>apagar</button>`;
  } else {
    status.textContent = diaHoje === D.hoje()
      ? "Ainda não registrado hoje. É só tocar numa carinha."
      : "Nada registrado nesse dia.";
  }
  status.classList.toggle("tem", !!atual);

  $("#humor-nota-campo").classList.toggle("oculto", !atual);
  $("#humor-nota").value = D.humorNota(diaHoje);
}

/** depois de responder, o card se recolhe sozinho */
let relogioEncolher = null;
function encolherHumorDepois(ms = 1800) {
  clearTimeout(relogioEncolher);
  relogioEncolher = setTimeout(() => {
    if (!D.humor(diaHoje)) return;
    humorAberto = false;
    desenharHumor();
    const tira = $("#humor-tira");
    if (tira && !semMovimento()) {
      tira.animate([{ transform: "scaleY(.7)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 260, easing: "cubic-bezier(.34,1.3,.64,1)" });
    }
  }, ms);
}
function abrirHumor() {
  clearTimeout(relogioEncolher);
  humorAberto = true;
  desenharHumor();
  const card = $("#card-humor");
  if (card && !semMovimento()) {
    card.animate([{ transform: "scaleY(.9)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 240, easing: "cubic-bezier(.34,1.3,.64,1)" });
  }
}

function rolarAte(seletor) {
  const el = $(seletor);
  if (!el) return;
  el.scrollIntoView({ behavior: semMovimento() ? "instant" : "smooth", block: "start" });
  el.classList.remove("destacado"); void el.offsetWidth; el.classList.add("destacado");
  setTimeout(() => el.classList.remove("destacado"), 1600);
}

/** confirmação visível de que o dia foi guardado */
function avisarSalvo(texto = "Guardado ✓") {
  const alvo = $("#dia-salvo");
  if (!alvo) return;
  alvo.textContent = texto;
  alvo.classList.remove("aparece");
  void alvo.offsetWidth;
  alvo.classList.add("aparece");
  clearTimeout(avisarSalvo.t);
  avisarSalvo.t = setTimeout(() => alvo.classList.remove("aparece"), 2600);
}

/* ---------------------------------------- SEMANA */
function desenharSemana() {
  if (vistaSemana === "quadro") { desenharQuadro(); return; }
  $("#semana-dias").classList.remove("oculto");
  $("#semana-quadro").classList.add("oculto");
  $("#semana-dica").textContent = "Cada dia com as suas tarefas. Puxe a tarefa para o lado para concluir ou adiar.";
  desenharSemanaLista();
}

function desenharSemanaLista() {
  const ini = D.inicioSemana(diaSemana);
  const dias = Array.from({ length: 7 }, (_, i) => D.somaDias(ini, i));
  $("#t-semana").textContent = `${D.dataCurta(ini)} a ${D.dataCurta(dias[6])}`;
  const todas = dias.flatMap(d => D.tarefasDoDia(d));
  const pend = todas.filter(t => !t.feita).length;
  $("#semana-apoio").textContent = `${todas.length} tarefa${todas.length === 1 ? "" : "s"}, ${pend} pendente${pend === 1 ? "" : "s"}`;

  $("#semana-dias").innerHTML = dias.map(d => {
    const ts = D.tarefasDoDia(d);
    const obj = D.deISO(d);
    return `<div class="dia-bloco reveal ${d === D.hoje() ? "hoje" : ""}">
      <div class="dia-topo">
        ${A.etiquetaDia(String(obj.getDate()).padStart(2, "0"), MES_CURTO[obj.getMonth()])}
        <h2 class="titulo-m dia-nome">${D.DIAS[obj.getDay()]}</h2>
        <span class="micro">${ts.filter(t => t.feita).length}/${ts.length}</span>
      </div>
      <ul class="lista">${ts.length ? ts.map(t => linhaTarefa(t)).join("")
        : `<li class="card apoio" style="text-align:center">Dia livre.
             <button class="btn btn-discreto" data-nova-em="${d}" style="min-height:36px;padding:6px 14px;margin-left:var(--space-2)">Adicionar</button></li>`}
      </ul></div>`;
  }).join("");
  observarEntradas(); animarCorrentes(); ligarArrastos();
}

/* ---------------------------------------- QUADRO
   Três colunas com as tarefas da semana. Arrastar o cartão muda a coluna. */
function desenharQuadro() {
  $("#semana-dias").classList.add("oculto");
  $("#semana-quadro").classList.remove("oculto");
  $("#semana-dica").textContent = "Arraste o cartão de uma coluna para a outra. No celular, deslize o quadro para o lado.";

  const ini = D.inicioSemana(diaSemana);
  const dias = Array.from({ length: 7 }, (_, i) => D.somaDias(ini, i));
  const todas = dias.flatMap(d => D.tarefasDoDia(d));
  $("#t-semana").textContent = `${D.dataCurta(ini)} a ${D.dataCurta(dias[6])}`;
  const pend = todas.filter(t => !t.feita).length;
  $("#semana-apoio").textContent = `${todas.length} tarefa${todas.length === 1 ? "" : "s"}, ${pend} pendente${pend === 1 ? "" : "s"}`;

  $("#semana-quadro").innerHTML = D.COLUNAS.map(c => {
    const daColuna = todas.filter(t => D.colunaDe(t) === c.id);
    return `<section class="coluna" data-coluna="${c.id}" style="--col:var(--${c.cor});--col-claro:var(--${c.cor}-claro)">
      <header class="coluna-topo">
        <span class="coluna-ponto"></span>
        <h3 class="titulo-m">${c.nome}</h3>
        <span class="micro" data-num="${daColuna.length}">0</span>
      </header>
      <div class="coluna-corpo" data-solta="${c.id}">
        ${daColuna.map(cartaoQuadro).join("") ||
          `<p class="coluna-vazia">${c.id === "feito" ? "Nada aqui ainda." : "Solte um cartão aqui."}</p>`}
      </div>
    </section>`;
  }).join("");

  ligarQuadro();
  observarEntradas(); animarNumeros();
}

function cartaoQuadro(t) {
  const cat = D.categoria(t.categoriaId);
  const obj = D.deISO(t.data);
  const { feitos, total } = D.progressoPassos(t);
  return `<article class="cartao ${t.prioridade && !t.feita ? "prioridade" : ""} ${!t.feita && t.data < D.hoje() ? "atrasada" : ""}"
    data-id="${t.id}" tabindex="0" aria-label="${esc(t.titulo)}">
    <span class="cartao-pega" aria-hidden="true"></span>
    <p class="cartao-titulo">${esc(t.titulo)}</p>
    <div class="cartao-pe">
      <span class="cartao-dia">${String(obj.getDate()).padStart(2, "0")} ${MES_CURTO[obj.getMonth()]}</span>
      ${t.hora ? `<span class="cartao-hora">${esc(t.hora)}</span>` : ""}
      ${total ? `<span class="cartao-passos">${feitos}/${total}</span>` : ""}
      ${cat ? `<span class="cartao-cat" style="background:var(--${cat.cor})" title="${esc(cat.nome)}"></span>` : ""}
    </div>
  </article>`;
}

/** arrastar o cartão entre as colunas, com encaixe */
function ligarQuadro() {
  if (!window.PointerEvent) return;
  const quadro = $("#semana-quadro");
  let carta = null, fantasma = null, id = null, ox = 0, oy = 0, decidido = false, alvoCol = null;

  const colunaSob = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const c = el && el.closest("[data-solta]");
    return c || null;
  };

  quadro.onpointerdown = (e) => {
    const c = e.target.closest(".cartao");
    if (!c || (e.pointerType === "mouse" && e.button !== 0)) return;
    carta = c; id = e.pointerId; decidido = false;
    const r = c.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
  };

  quadro.onpointermove = (e) => {
    if (!carta || e.pointerId !== id) return;
    if (!decidido) {
      const r = carta.getBoundingClientRect();
      if (Math.abs(e.clientX - (r.left + ox)) < 8 && Math.abs(e.clientY - (r.top + oy)) < 8) return;
      decidido = true;
      carta.setPointerCapture?.(id);
      fantasma = carta.cloneNode(true);
      fantasma.classList.add("cartao-voando");
      fantasma.style.width = r.width + "px";
      document.body.appendChild(fantasma);
      carta.classList.add("cartao-origem");
      S.tocar("toque");
    }
    e.preventDefault();
    fantasma.style.transform = `translate(${e.clientX - ox}px, ${e.clientY - oy}px) rotate(-2deg)`;
    const sob = colunaSob(e.clientX, e.clientY);
    if (sob !== alvoCol) {
      if (alvoCol) alvoCol.classList.remove("recebendo");
      alvoCol = sob;
      if (alvoCol) alvoCol.classList.add("recebendo");
    }
  };

  const largar = (e) => {
    if (!carta || e.pointerId !== id) return;
    const cartaRef = carta, destino = alvoCol, moveu = decidido;
    if (alvoCol) alvoCol.classList.remove("recebendo");
    if (fantasma) fantasma.remove();
    cartaRef.classList.remove("cartao-origem");
    carta = null; fantasma = null; id = null; alvoCol = null; decidido = false;
    if (!moveu) return;

    const t = acharPorId(cartaRef.dataset.id);
    if (!t || !destino) { S.tocar("desmarcar"); return; }
    const col = destino.dataset.solta;
    const real = D.materializar(t);
    const antes = D.colunaDe(real);
    if (antes === col) return;
    D.moverParaColuna(real.id, col);
    S.tocar(col === "feito" ? "marcar" : "toque");
    desenharQuadro();
    const novo = $(`.cartao[data-id="${CSS.escape(real.id)}"]`);
    if (novo && !semMovimento()) {
      novo.animate([{ transform: "scale(.9)", opacity: .6 }, { transform: "scale(1.03)", offset: .6 }, { transform: "none", opacity: 1 }],
        { duration: 380, easing: "cubic-bezier(.34,1.3,.64,1)" });
    }
    if (col === "feito") {
      const dia = D.tarefasDoDia(real.data);
      if (dia.length && dia.every(x => x.feita)) festejarComSom(true, "DIA", "FEITO");
    }
  };
  quadro.onpointerup = largar;
  quadro.onpointercancel = largar;

  // teclado: setas movem o cartão de coluna
  quadro.onkeydown = (e) => {
    const c = e.target.closest(".cartao");
    if (!c || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    const t = acharPorId(c.dataset.id); if (!t) return;
    const real = D.materializar(t);
    const i = D.COLUNAS.findIndex(x => x.id === D.colunaDe(real));
    const j = Math.max(0, Math.min(D.COLUNAS.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
    if (i === j) return;
    e.preventDefault();
    D.moverParaColuna(real.id, D.COLUNAS[j].id);
    S.tocar("toque");
    desenharQuadro();
    const novo = $(`.cartao[data-id="${CSS.escape(real.id)}"]`);
    if (novo) novo.focus();
  };
}

/* ---------------------------------------- MÊS */
function desenharMes() {
  const base = D.deISO(diaMes);
  const ano = base.getFullYear(), mes = base.getMonth();
  $("#t-mes").textContent = `${D.MESES[mes]} de ${ano}`;
  const inicio = D.deISO(D.inicioSemana(D.iso(new Date(ano, mes, 1))));
  const celulas = [];
  for (let i = 0; i < 42; i++) { const d = new Date(inicio); d.setDate(d.getDate() + i); celulas.push(D.iso(d)); }
  const noMes = celulas.filter(d => D.deISO(d).getMonth() === mes);
  const totalMes = noMes.reduce((n, d) => n + D.tarefasDoDia(d).length, 0);
  $("#mes-apoio").textContent = `${totalMes} tarefa${totalMes === 1 ? "" : "s"} no mês`;

  const cab = ["S", "T", "Q", "Q", "S", "S", "D"].map(l => `<span class="micro cab">${l}</span>`).join("");
  $("#calendario").innerHTML = cab + celulas.map(d => {
    const ts = D.tarefasDoDia(d);
    const fora = D.deISO(d).getMonth() !== mes;
    const pts = ts.slice(0, 3).map(t => `<i class="${t.feita ? "feito" : ""}"></i>`).join("");
    const hm = D.humor(d), hc = humorPor(hm);
    return `<button class="cal-dia ${fora ? "fora" : ""} ${d === D.hoje() ? "hoje" : ""} ${d === diaMesSel ? "sel" : ""}"
      data-dia="${d}" aria-label="${D.dataLonga(d)}, ${ts.length} tarefas${hc ? ", humor " + hc.rotulo : ""}">
      ${hm ? `<i class="cal-humor" style="background:var(--${hc ? hc.cor : "menta"})"></i>` : ""}
      <span>${D.deISO(d).getDate()}</span><span class="pts">${pts}</span></button>`;
  }).join("");

  $("#mes-dia-titulo").textContent = D.dataLonga(diaMesSel);
  const ts = D.tarefasDoDia(diaMesSel);
  $("#mes-lista").innerHTML = ts.length ? ts.map(t => linhaTarefa(t)).join("")
    : `<li class="card apoio" style="text-align:center">Nenhuma tarefa nesse dia.</li>`;
  observarEntradas(); animarCorrentes(); ligarArrastos();
}

/* ---------------------------------------- DESAFIOS */
function cardDesafio(d) {
  const area = D.area(d.area);
  const dias = Array.from({ length: d.dias }, (_, i) => D.somaDias(d.inicio, i));
  const marcados = dias.map(x => d.marcas.includes(x));
  const idxHoje = dias.indexOf(D.hoje());
  return `<div class="card desafio reveal area-${d.area}" data-desafio="${d.id}">
    <div class="card-acoes"><button data-acao="excluir-desafio" aria-label="Excluir desafio">${A.mini("excluir", 16)}</button></div>
    ${A.areaIcone(d.area, 44)}
    <div class="habito-corpo">
      <h3>${esc(d.titulo)}</h3>
      <p class="apoio">${d.marcas.length} de ${d.dias} dias · ${esc(area ? area.nome : "")}${d.concluido ? " · concluído" : ""}</p>
      ${A.corrente(marcados, Math.min(d.dias, 14), idxHoje)}
    </div>
    ${d.concluido ? A.selo(String(d.dias), "DIAS", "var(--oliva)", 58)
      : `<button class="caixa" role="checkbox" aria-checked="${d.marcas.includes(D.hoje())}"
           data-acao="marcar-desafio" aria-label="Marcar hoje"></button>`}
  </div>`;
}

/** botões das dez áreas, para filtrar a biblioteca */
function filtrosDeArea(atual, marca) {
  return `<button class="area-chip ${atual ? "" : "ativo"}" data-${marca}="">Todas</button>` +
    D.AREAS.map(a => `<button class="area-chip ${atual === a.id ? "ativo" : ""}" data-${marca}="${a.id}"
      style="--chip:var(--${a.cor});--chip-claro:var(--${a.cor}-claro)">
      ${A.areaIcone(a.id, 22)}<span>${esc(a.nome)}</span></button>`).join("");
}

function cartaoSugestao(area, tipo, i, item) {
  const a = D.area(area);
  const jaTem = tipo === "desafio"
    ? D.estado.desafios.some(d => d.titulo === item.titulo && !d.concluido)
    : D.estado.metas.some(m => m.titulo === item.titulo && !m.concluida);
  return `<div class="card sugestao reveal" style="--sg:var(--${a.cor});--sg-claro:var(--${a.cor}-claro)">
    <div class="sugestao-topo">
      <span class="sugestao-icone">${A.areaIcone(area, 40)}</span>
      <span class="etq etq-cat" style="background:var(--${a.cor}-claro)">
        <i class="ponto" style="background:var(--${a.cor})"></i>${esc(a.nome)}</span>
    </div>
    <h3 class="sugestao-titulo">${esc(item.titulo)}</h3>
    <p class="apoio">${tipo === "desafio"
      ? `${item.dias} dias, marcando todo dia`
      : `${item.etapas.length} etapas`}</p>
    ${tipo === "meta" ? `<ul class="sugestao-etapas">${item.etapas.slice(0, 3).map(e =>
        `<li>${esc(e)}</li>`).join("")}${item.etapas.length > 3 ? `<li class="mais-etapas">e mais ${item.etapas.length - 3}</li>` : ""}</ul>` : ""}
    <button class="btn ${jaTem ? "btn-discreto" : "btn-principal"}" ${jaTem ? "disabled" : ""}
      data-sugestao="${tipo}" data-area="${area}" data-i="${i}">
      ${jaTem ? "Já está na sua lista" : (tipo === "desafio" ? "Começar desafio" : "Virar meta")}</button>
  </div>`;
}

function desenharDesafios() {
  const ativos = D.desafiosAtivos();
  const feitos = D.estado.desafios.filter(d => d.concluido);
  $("#desafios-apoio").textContent =
    `${ativos.length} ativo${ativos.length === 1 ? "" : "s"} · ${feitos.length} concluído${feitos.length === 1 ? "" : "s"}`;
  $("#desafios-aviso").textContent = ativos.length >= 2
    ? "Dois ativos é o limite. Termine um antes de começar outro."
    : "No máximo dois ao mesmo tempo, para não virar lista de cobrança.";
  $("#btn-novo-desafio").disabled = ativos.length >= 2;

  $("#lista-desafios-ativos").innerHTML = ativos.length ? ativos.map(cardDesafio).join("")
    : vazio("feliz", "Nenhum desafio rolando", "Escolha um da biblioteca aqui embaixo.", "", "");

  $("#desafios-areas").innerHTML = filtrosDeArea(areaDesafios, "area-desafio");
  const areas = areaDesafios ? [areaDesafios] : D.AREAS.map(a => a.id);
  $("#desafios-sugeridos").innerHTML = areas.flatMap(aid =>
    B.desafiosDe(aid).map((item, i) => cartaoSugestao(aid, "desafio", i, item))).join("");

  $("#bloco-desafios-feitos").classList.toggle("oculto", !feitos.length);
  $("#desafios-feitos-conta").textContent = feitos.length ? `${feitos.length}` : "";
  $("#lista-desafios-feitos").innerHTML = feitos.map(cardDesafio).join("");

  observarEntradas(); animarProgresso(); animarNumeros(); animarCorrentes(); ligarArrastos();
}

/* ---------------------------------------- METAS */
function desenharMetas() {
  const emAndamento = D.estado.metas.filter(m => !m.concluida);
  const concluidas = D.estado.metas.filter(m => m.concluida);
  $("#metas-apoio").textContent =
    `${emAndamento.length} em andamento · ${concluidas.length} concluída${concluidas.length === 1 ? "" : "s"}`;

  $("#lista-metas").innerHTML = emAndamento.length ? emAndamento.map(cardMeta).join("")
    : vazio("curiosa", "Nenhuma meta em andamento", "O que você quer alcançar neste mês?", "Criar uma meta", "meta");
  $("#bloco-metas-feitas").classList.toggle("oculto", !concluidas.length);
  $("#lista-metas-feitas").innerHTML = concluidas.map(cardMeta).join("");

  $("#metas-areas").innerHTML = filtrosDeArea(areaMetas, "area-meta");
  const areas = areaMetas ? [areaMetas] : D.AREAS.map(a => a.id);
  $("#metas-sugeridas").innerHTML = areas.flatMap(aid =>
    B.metasDe(aid).map((item, i) => cartaoSugestao(aid, "meta", i, item))).join("");

  desenharAssessments();
  observarEntradas(); animarProgresso(); animarNumeros(); animarCorrentes(); ligarArrastos();
}

function cardMeta(m, i) {
  const p = D.progressoMeta(m);
  const vinculadas = D.estado.tarefas.filter(t => t.metaId === m.id);
  const destaque = i === 0 && !m.concluida ? " card-destaque" : "";
  return `<div class="card reveal${destaque}" data-meta="${m.id}"
    style="--grad-a:var(--manteiga-claro);--grad-b:var(--rosa-claro)">
    <div class="bloco-topo" style="margin:0">
      <h3 class="titulo-m">${esc(m.titulo)}</h3>
      <div class="tarefa-acoes">
        <button data-acao="meta-etapa" aria-label="Adicionar etapa">${A.mini("mais")}</button>
        <button data-acao="meta-excluir" aria-label="Excluir meta">${A.mini("excluir")}</button>
      </div>
    </div>
    ${m.descricao ? `<p class="apoio">${esc(m.descricao)}</p>` : ""}
    ${m.prazo ? `<p class="micro" style="margin-top:var(--space-2)">até ${D.dataCurta(m.prazo)}</p>` : ""}
    <div class="meta-barra" aria-label="${p} por cento"><span style="width:${p}%"></span></div>
    <p class="apoio" style="margin-top:var(--space-2)">${p}% concluída</p>
    ${m.etapas.length ? `<ul class="etapas">${m.etapas.map((e, j) => `
      <li><button class="caixa" role="checkbox" aria-checked="${e.feita}" data-acao="etapa" data-i="${j}"
        aria-label="${esc(e.titulo)}"></button>
        <span style="${e.feita ? "text-decoration:line-through;color:var(--oliva-escuro)" : ""}">${esc(e.titulo)}</span></li>`).join("")}</ul>` : ""}
    ${vinculadas.length ? `<p class="apoio" style="margin-top:var(--space-3)">
      ${vinculadas.filter(t => t.feita).length} de ${vinculadas.length} tarefas ligadas concluídas</p>` : ""}
    ${!m.etapas.length && !vinculadas.length && !m.concluida ? `
      <button class="btn btn-secundario" data-acao="meta-concluir" style="margin-top:var(--space-3);min-height:40px">Marcar como concluída</button>` : ""}
  </div>`;
}

function desenharAssessments() {
  $("#lista-assessments").innerHTML = AS.ASSESSMENTS.map(a => {
    const ultimo = [...D.estado.assessments].reverse().find(r => r.id === a.id);
    const area = D.AREAS.find(x => x.id === a.area);
    return `<div class="card reveal" data-assessment="${a.id}">
      <div style="display:flex;gap:var(--space-3);align-items:center">
        ${A.areaIcone(a.area, 40)}
        <div style="flex:1;min-width:0">
          <h3 class="titulo-m">${esc(a.nome)}</h3>
          <p class="apoio">${esc(a.subtitulo)} · ${esc(area ? area.nome : "")}</p>
        </div>
        ${ultimo ? `<span class="etq etq-feita">${ultimo.pontos}</span>` : ""}
      </div>
      <p class="apoio" style="margin-top:var(--space-3)">
        ${a.pronto ? `${a.quantos} perguntas` : "Perguntas ainda não preenchidas"}</p>
      <button class="btn ${a.pronto ? "btn-principal" : "btn-discreto"}" data-acao="abrir-assessment"
        style="margin-top:var(--space-3);min-height:40px">${a.pronto ? "Responder" : "Ver como ativar"}</button>
    </div>`;
  }).join("");
}

/* ---------------------------------------- REVISÃO */
function desenharRevisao() {
  const r = D.resumoSemana(diaRevisao);
  $("#t-revisao").textContent = `${D.dataCurta(r.ini)} a ${D.dataCurta(D.somaDias(r.ini, 6))}`;
  $("#revisao-apoio").innerHTML = `<span data-num="${r.percentual}" data-sufixo="%">0%</span> das tarefas concluídas`;

  const maior = Math.max(1, ...r.porDia.map(d => d.total));
  const grafico = r.porDia.map(d => `
    <div class="col">
      <div class="barra ok" style="height:${(d.feitas / maior) * 100}%"></div>
      <div class="barra pend" style="height:${(d.pendentes / maior) * 100}%"></div>
      <span class="rot">${D.DIAS_CURTO[D.deISO(d.data).getDay()]}</span>
    </div>`).join("");

  $("#revisao-bento").innerHTML = `
    <div class="card reveal card-destaque" style="--grad-a:var(--menta-claro);--grad-b:var(--periwinkle-claro)">
      <p class="micro">Concluídas</p><p class="numerao" data-num="${r.feitas}">0</p><p class="apoio">de ${r.total} tarefas</p></div>
    <div class="card reveal"><p class="micro">Pendentes</p><p class="numerao" data-num="${r.pendentes}">0</p>
      <p class="apoio">para reagendar ou soltar</p></div>
    <div class="card reveal"><p class="micro">Hábitos</p><p class="numerao" data-num="${r.habitosCumpridos}">0</p>
      <p class="apoio">marcações na semana</p></div>
    <div class="card largo reveal"><p class="micro">Por dia</p><div class="grafico">${grafico}</div></div>
    <div class="card largo reveal"><p class="micro">Metas com prazo próximo</p>
      ${r.metasProximas.length ? `<ul class="etapas">${r.metasProximas.map(m =>
        `<li><span>${esc(m.titulo)}</span><span class="apoio" style="margin-left:auto">${D.progressoMeta(m)}%</span></li>`).join("")}</ul>`
        : `<p class="apoio">Nenhuma meta vencendo agora.</p>`}</div>
    ${r.percentual >= 80 && r.total > 0 ? `<div class="card largo reveal" style="text-align:center">
      ${A.agnes("acolhedora_laco", 96)}<p style="font-weight:600">Que semana!</p>
      <p class="apoio">Você fechou ${r.percentual}% do que planejou.</p>
      <div style="margin-top:var(--space-3)">${A.chipPalavra("uhul")}</div></div>` : ""}`;

  desenharPainelHumor(r);
  $("#reflexao").value = D.reflexao(r.semana);
  $("#reflexao-estado").textContent = D.reflexao(r.semana).trim() ? "guardada" : "";
  observarEntradas(); animarProgresso(); animarNumeros(); animarCorrentes(); ligarArrastos();
}

/* ---------------------------------------- HUMOR: acompanhamento */
function desenharPainelHumor(r) {
  const semana = r.dias.map(d => ({ data: d, ...(D.humorRegistro(d) || { v: "", em: "", nota: "" }) }));
  // o mapa termina no fim da semana atual, então cada coluna é sempre o mesmo dia da semana
  const fimDaSemana = D.somaDias(D.inicioSemana(D.hoje()), 6);
  const mes = D.humorSerie(fimDaSemana, 35);
  const contagem = D.humorContagem(mes);
  const passados = mes.filter(d => d.data <= D.hoje());
  const registrados = passados.filter(d => d.v).length;
  const seq = D.humorSequencia(D.hoje()) || D.humorSequencia(D.somaDias(D.hoje(), -1));

  $("#humor-sequencia").textContent = seq > 1 ? `${seq} dias seguidos` : "";

  const linhaSemana = semana.map(d => {
    const h = humorPor(d.v);
    const ehHoje = d.data === D.hoje();
    return `<div class="humor-dia ${ehHoje ? "hoje" : ""}">
      <span class="rot">${D.DIAS_CURTO[D.deISO(d.data).getDay()]}</span>
      ${d.v ? A.carinha(d.v, 36, `var(--${h ? h.cor : "menta"})`) : `<span class="humor-vazio"></span>`}
      <span class="num">${D.deISO(d.data).getDate()}</span>
    </div>`;
  }).join("");

  const cabecalho = ["S", "T", "Q", "Q", "S", "S", "D"].map(l => `<span class="micro cab">${l}</span>`).join("");
  const mapa = cabecalho + mes.map(d => {
    const h = humorPor(d.v);
    const futuro = d.data > D.hoje();
    return `<span class="humor-celula ${d.v ? "" : "sem"} ${futuro ? "futuro" : ""} ${d.data === D.hoje() ? "hoje" : ""}"
      style="${d.v ? `background:var(--${h ? h.cor : "menta"})` : ""}"
      title="${D.dataCurta(d.data)}${d.v ? ` · ${h ? h.rotulo : d.v}` : ""}"></span>`;
  }).join("");

  const legenda = HUMORES.map(h => `<span class="humor-legenda">
      <i style="background:var(--${h.cor})"></i>${h.rotulo}<b>${contagem[h.id] || 0}</b></span>`).join("");

  const comNota = mes.filter(d => d.v && d.nota).slice(-4).reverse();

  $("#humor-painel").innerHTML = `
    <p class="micro">Esta semana</p>
    <div class="humor-semana">${linhaSemana}</div>

    <p class="micro" style="margin-top:var(--space-5)">Últimas cinco semanas</p>
    <div class="humor-mapa">${mapa}</div>
    <div class="humor-legendas">${legenda}</div>
    <p class="apoio" style="margin-top:var(--space-3)">
      ${registrados ? `${registrados} de ${passados.length} dias registrados.` : "Nenhum dia registrado ainda. Marque uma carinha na aba Hoje."}</p>

    ${comNota.length ? `<p class="micro" style="margin-top:var(--space-5)">O que você escreveu</p>
      <ul class="humor-notas">${comNota.map(d => {
        const h = humorPor(d.v);
        return `<li><i style="background:var(--${h ? h.cor : "menta"})"></i>
          <span><b>${D.dataCurta(d.data)}</b> ${esc(d.nota)}</span></li>`;
      }).join("")}</ul>` : ""}`;
}

/* ---------------------------------------- TROFÉUS */
function desenharTrofeus() {
  const ganhos = D.selosGanhos();
  const faltam = D.SELOS.filter(s => !D.estado.selos[s.id]);
  $("#trofeus-apoio").innerHTML = ganhos.length
    ? `<span data-num="${ganhos.length}">0</span> de ${D.SELOS.length} conquistados`
    : "Nenhum ainda. Eles aparecem sozinhos conforme você usa o app.";
  $("#trofeus-conta").textContent = ganhos.length ? `${ganhos.length}` : "";
  $("#bloco-trofeus-ganhos").classList.toggle("oculto", !ganhos.length);

  $("#lista-trofeus").innerHTML = ganhos.map(s => `
    <div class="trofeu-card reveal ganho">
      ${A.trofeu(s, 76, true)}
      <b>${esc(s.nome)}</b>
      <span class="apoio">${esc(s.comoGanha)}</span>
      <span class="micro">${D.dataCurta(D.estado.selos[s.id])}</span>
    </div>`).join("");

  $("#lista-trofeus-faltam").innerHTML = faltam.length ? faltam.map(s => `
    <div class="trofeu-card reveal">
      ${A.trofeu(s, 76, false)}
      <b>${esc(s.nome)}</b>
      <span class="apoio">${esc(s.comoGanha)}</span>
    </div>`).join("")
    : `<p class="apoio">Você conquistou todos. Sério.</p>`;

  observarEntradas(); animarNumeros();
}

/* ---------------------------------------- LIXEIRA */
const NOME_TIPO = { tarefa: "Tarefa", habito: "Hábito", meta: "Meta", desafio: "Desafio", categoria: "Categoria" };

function desenharLixeira() {
  D.limparLixeiraVelha();
  const itens = D.estado.lixeira;
  $("#lixeira-apoio").textContent = itens.length
    ? `${itens.length} ite${itens.length === 1 ? "m" : "ns"} guardado${itens.length === 1 ? "" : "s"}. Depois de 30 dias somem sozinhos.`
    : "Nada aqui. O que você apagar fica guardado por 30 dias antes de sumir.";
  $("#btn-esvaziar").disabled = !itens.length;

  $("#lista-lixeira").innerHTML = itens.length ? itens.map(r => {
    const quando = new Date(r.em);
    const dias = Math.max(0, 30 - Math.floor((Date.now() - quando.getTime()) / 86400000));
    return `<li class="card lixo reveal" data-lixo="${r.id}">
      <div class="lixo-corpo">
        <p class="micro">${NOME_TIPO[r.tipo] || r.tipo}${r.itens.length > 1 ? ` · ${r.itens.length} itens` : ""}</p>
        <p class="lixo-titulo">${esc(r.rotulo || "Sem nome")}</p>
        <p class="apoio">Apagado em ${D.dataCurta(D.iso(quando))} · some em ${dias} dia${dias === 1 ? "" : "s"}</p>
      </div>
      <div class="lixo-acoes">
        <button class="btn btn-principal" data-lixo-acao="restaurar" style="min-height:38px;padding:6px 16px">Restaurar</button>
        <button class="btn-icone" data-lixo-acao="apagar" aria-label="Apagar de vez" style="width:38px;height:38px">${A.mini("excluir", 16)}</button>
      </div>
    </li>`;
  }).join("") : `<li>${vazio("curiosa", "Lixeira vazia", "Nada foi apagado por aqui.", "", "")}</li>`;

  observarEntradas();
}

/* ---------------------------------------- TUTORIAL */
const TUTORIAL = [
  { icone: "hoje", cor: "rosa", titulo: "A tela Hoje é a sua base",
    texto: "Tudo que importa no dia mora aqui: as tarefas, os hábitos, os desafios ativos e o seu humor. As setas no topo levam pro dia anterior e pro seguinte, e o botão Hoje traz você de volta." },
  { icone: "tarefas", cor: "rosa", titulo: "Tarefa é coisa de fazer e riscar",
    texto: "Toque em Adicionar tarefa. Em Mais detalhes você escolhe data, horário, categoria, meta ligada e repetição. No celular, toque na tarefa para abrir o detalhe, onde ficam editar, reagendar e excluir." },
  { icone: "tarefas", cor: "rosa", titulo: "Puxe a tarefa para o lado",
    texto: "No celular e no computador: arraste a tarefa para a direita e ela é concluída, para a esquerda e ela vai para amanhã. Aparece um aviso com Desfazer, caso tenha sido sem querer." },
  { icone: "feitas", cor: "periwinkle", titulo: "Quebre em subtarefas",
    texto: "Abra a tarefa e escreva os passos menores. A linha passa a mostrar quantos já foram, e quando o último é marcado a tarefa se dá por concluída sozinha." },
  { icone: "calendario", cor: "periwinkle", titulo: "A semana também é um quadro",
    texto: "Na aba Semana, troque de Lista para Quadro. Três colunas, a fazer, fazendo e feito, e você arrasta o cartão entre elas. No celular, deslize o quadro para o lado; pelo teclado, as setas movem o cartão." },
  { icone: "habitos", cor: "menta", titulo: "Hábito é coisa de repetir",
    texto: "Hábito não tem prazo, tem constância. O diário conta dias seguidos; o semanal conta quantas vezes na semana. A correntinha mostra sua sequência, e a estrela marca o dia de hoje." },
  { icone: "desafios", cor: "lilas", titulo: "Desafio é curto, meta é longa",
    texto: "Desafio tem começo e fim e você marca todo dia, como ler a Bíblia por sete dias. Meta tem prazo e etapas, como concluir a leitura de um livro. Dois desafios ativos por vez é o limite, de propósito." },
  { icone: "biblioteca", cor: "pessego", titulo: "A biblioteca já vem pronta",
    texto: "Nas abas Desafios e Metas tem uma biblioteca com sugestões nas dez áreas da sua vida. Toque num cartão e ele vira um item seu, com as etapas já montadas. Dá pra editar depois." },
  { icone: "humor", cor: "manteiga", titulo: "Registre como você está",
    texto: "Na tela Hoje, toque numa carinha. Ele guarda com a hora e você pode escrever o porquê. Depois de responder, o cartão encolhe pra não ocupar espaço. O histórico fica na Revisão." },
  { icone: "metas", cor: "periwinkle", titulo: "A Revisão é o seu retrovisor",
    texto: "Toda semana ela mostra quanto você fechou, o gráfico por dia, os hábitos, o mapa do humor e um espaço pra escrever a reflexão da semana." },
  { icone: "trofeus", cor: "manteiga", titulo: "Os troféus aparecem sozinhos",
    texto: "Cada conquista tem uma regra e vira um selo quando você passa por ela. Não precisa fazer nada: a Agnes aparece pra avisar. O troféu fica guardado com a data." },
  { icone: "lixeira", cor: "pessego", titulo: "Nada some de vez na hora",
    texto: "O que você apaga fica trinta dias na lixeira, em Ajustes, e dá pra restaurar com um toque. Esvaziar a lixeira, essa sim, não tem volta." }
];

function desenharTutorial() {
  $("#tutorial-conteudo").innerHTML = `
    <div class="card card-destaque reveal" style="--grad-a:var(--rosa-claro);--grad-b:var(--lilas-claro);text-align:center">
      ${A.agnes("acolhedora", 96)}
      <p style="font-weight:600;margin-top:var(--space-2)">Oi, eu sou a Agnes</p>
      <p class="apoio">Vou te mostrar o app em ${TUTORIAL.length} passos. Pode voltar aqui quando quiser, em Ajustes.</p>
    </div>
    <ol class="tutorial-passos">
      ${TUTORIAL.map((p, i) => `
        <li class="card reveal tutorial-passo" style="--tp:var(--${p.cor});--tp-claro:var(--${p.cor}-claro)">
          <span class="tutorial-n">${i + 1}</span>
          <span class="tutorial-icone">${(SECAO_ICONES[p.icone] || SECAO_ICONES.tarefas)()}</span>
          <div>
            <h3 class="titulo-m">${esc(p.titulo)}</h3>
            <p class="apoio">${esc(p.texto)}</p>
          </div>
        </li>`).join("")}
    </ol>
    <div class="card reveal" style="text-align:center">
      <p style="font-weight:600">Seus dados são só seus</p>
      <p class="apoio">Tudo fica guardado neste navegador, neste aparelho. Nada vai pra internet, e ninguém além de você vê.</p>
      <button class="btn btn-principal" id="tutorial-pronto" style="margin-top:var(--space-3)">Entendi, bora usar</button>
    </div>`;
  if (!D.estado.tutorialVisto) { D.estado.tutorialVisto = true; D.salvar(); }
  observarEntradas(); animarCorrentes(); ligarArrastos();
}

/* ---------------------------------------- DETALHE */
function abrirDetalhe(t) {
  tarefaDetalhe = t;
  if (document.startViewTransition && !semMovimento()) {
    const li = $(`.tarefa[data-id="${CSS.escape(t.id)}"]`);
    if (li) li.style.viewTransitionName = "tarefa";
    document.startViewTransition(() => {
      if (li) li.style.viewTransitionName = "";
      trocarTela("detalhe");
    });
  } else trocarTela("detalhe");
}
function desenharDetalhe() {
  const t = tarefaDetalhe;
  if (!t) { trocarTela("hoje"); return; }
  const meta = D.estado.metas.find(m => m.id === t.metaId);
  $("#detalhe-data").textContent = D.dataLonga(t.data);
  $("#t-detalhe").textContent = t.titulo;
  $("#detalhe-faixa").style.setProperty("--faixa-cor",
    t.feita ? "var(--menta-claro)" : t.data < D.hoje() ? "var(--pessego-claro)" : "var(--aba-hoje-claro)");
  $("#detalhe-etiquetas").innerHTML = [
    t.prioridade && !t.feita ? '<span class="etq etq-prioridade">Prioridade</span>' : "",
    etiquetaPrazo(t), etiquetaCategoria(t.categoriaId),
    meta ? `<span class="etq etq-meta">${esc(meta.titulo)}</span>` : "",
    t.feita ? '<span class="etq etq-feita">Concluída</span>' : ""
  ].join("");

  $("#detalhe-corpo").innerHTML = `
    <div class="card">
      <p class="micro">Quando</p>
      <p>${D.dataLonga(t.data)}${t.hora ? ` às ${esc(t.hora)}` : ""}</p>
      ${t.repete && t.repete.tipo !== "nenhuma" ? `<p class="apoio" style="margin-top:var(--space-2)">
        ${A.mini("repete", 16)} ${textoRepeticao(t.repete)}</p>` : ""}
    </div>
    ${listaPassos(t)}
    ${t.obs ? `<div class="card"><p class="micro">Observações</p><p>${esc(t.obs)}</p></div>` : ""}
    ${meta ? `<div class="card"><p class="micro">Meta ligada</p>
      <p style="font-weight:600">${esc(meta.titulo)}</p>
      <div class="meta-barra"><span style="width:${D.progressoMeta(meta)}%"></span></div>
      <p class="apoio" style="margin-top:var(--space-2)">${D.progressoMeta(meta)}% concluída</p></div>` : ""}
    <div class="detalhe-acoes">
      <button class="btn btn-principal" data-det="alternar">${t.feita ? "Reabrir" : "Concluir"}</button>
      <button class="btn btn-secundario" data-det="editar">Editar</button>
      <button class="btn btn-secundario" data-det="mover">Reagendar</button>
      <button class="btn btn-discreto" data-det="excluir">Excluir</button>
    </div>`;
  animarProgresso($("#detalhe-corpo"));
  ligarFormPasso();
}

function ligarFormPasso() {
  const f = $("#form-passo");
  if (!f) return;
  f.onsubmit = (ev) => {
    ev.preventDefault();
    const t = tarefaDetalhe; if (!t) return;
    const real = D.materializar(t);
    if (real.id !== t.id) tarefaDetalhe = real;
    const v = f.titulo.value.trim();
    if (!v) return;
    D.novoPasso(real.id, v);
    f.titulo.value = "";
    S.tocar("toque");
    tarefaDetalhe = D.acharTarefa(real.id);
    desenharDetalhe();
    const ultimo = $("#lista-passos .passo:last-child");
    if (ultimo && !semMovimento()) {
      ultimo.animate([{ transform: "translateX(-10px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 300, easing: "cubic-bezier(.34,1.3,.64,1)" });
    }
    $("#form-passo").titulo.focus();
  };
}

function textoRepeticao(r) {
  const nomes = { diaria: "Todo dia", semanal: "Toda semana", mensal: "Todo mês, no mesmo dia" };
  if (r.tipo === "dias") return "Nos dias: " + (r.dias || []).map(d => D.DIAS[d]).join(", ");
  return nomes[r.tipo] || "";
}

/* ---------------------------------------- BUSCA */
function desenharBusca() {
  const cats = D.estado.categorias;
  $("#busca-filtros").innerHTML = [
    ...["pendente", "feita", "atrasada"].map(s =>
      `<button class="filtro" data-filtro="status" data-valor="${s}" aria-pressed="${filtroBusca.status === s}">${s}</button>`),
    ...cats.map(c =>
      `<button class="filtro" data-filtro="categoriaId" data-valor="${c.id}" aria-pressed="${filtroBusca.categoriaId === c.id}">${esc(c.nome)}</button>`)
  ].join("");

  const termo = $("#busca-campo").value;
  if (!termo.trim() && !filtroBusca.status && !filtroBusca.categoriaId) {
    $("#busca-resultados").innerHTML = `<li class="apoio" style="text-align:center;padding:var(--space-6)">
      Procure por tarefa, meta, etapa ou anotação.</li>`;
    return;
  }
  const res = D.buscar(termo, filtroBusca);
  $("#busca-resultados").innerHTML = res.length ? res.map(r => {
    if (r.tipo === "tarefa") return linhaTarefa(r.item, { mostrarData: true });
    const rotulos = { meta: "Meta", etapa: "Etapa", anotacao: "Anotação" };
    const texto = r.tipo === "anotacao" ? r.item.texto : r.item.titulo;
    return `<li class="card reveal"><p class="micro">${rotulos[r.tipo]}${r.data ? " · " + D.dataCurta(r.data) : ""}</p>
      <p style="font-weight:600;margin:var(--space-1) 0 0">${esc(texto)}</p></li>`;
  }).join("") : `<li class="apoio" style="text-align:center;padding:var(--space-6)">Nada encontrado.</li>`;
  observarEntradas(); animarCorrentes(); ligarArrastos();
}

function desenhar() {
  ({ hoje: desenharHoje, semana: desenharSemana, mes: desenharMes, desafios: desenharDesafios,
     metas: desenharMetas, revisao: desenharRevisao, busca: desenharBusca,
     detalhe: desenharDetalhe, trofeus: desenharTrofeus, tutorial: desenharTutorial,
     lixeira: desenharLixeira }[aba] || (() => {}))();
  conferirConquistas();
}

/** depois de qualquer ação, vê se nasceu um troféu novo */
let festejandoSelo = false;
function conferirConquistas() {
  if (festejandoSelo) return;
  const novos = D.conferirSelos();
  if (!novos.length) return;
  festejandoSelo = true;
  const s = novos[0];
  S.tocar("festa");
  A.festejar(true, "", "", {
    selo: s, titulo: s.nome, texto: s.comoGanha,
    palavra: "troféu novo!", botao: "Ver meus troféus",
    aoFechar: () => { festejandoSelo = false; irPara("trofeus"); }
  });
}

/* ---------------------------------------- modais */
const abrir = (d) => { d.showModal(); S.tocar("abrir"); };
function fechar(d) {
  if (semMovimento()) { d.close(); return; }
  d.classList.add("saindo");
  setTimeout(() => { d.classList.remove("saindo"); d.close(); }, 150);
}
function confirmar(titulo, texto, acao) {
  $("#confirma-titulo").textContent = titulo;
  $("#confirma-texto").textContent = texto;
  confirmarAcao = acao; abrir($("#dlg-confirma"));
}
/** pergunta se a mudança vale só para a ocorrência ou para as próximas */
function perguntarEscopo(titulo, texto, acao, rotulos) {
  $("#escopo-titulo").textContent = titulo;
  $("#escopo-texto").textContent = texto;
  $("#escopo-uma").textContent = (rotulos && rotulos.uma) || "Só este dia";
  $("#escopo-proximas").textContent = (rotulos && rotulos.proximas) || "A série inteira";
  escopoAcao = acao; abrir($("#dlg-escopo"));
}

function preencherSelects() {
  const f = $("#form-tarefa");
  f.categoriaId.innerHTML = `<option value="">Sem categoria</option>` +
    D.estado.categorias.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("");
  f.metaId.innerHTML = `<option value="">Sem meta</option>` +
    D.estado.metas.filter(m => !m.concluida).map(m => `<option value="${m.id}">${esc(m.titulo)}</option>`).join("");
  $("#dias-semana").innerHTML = D.DIAS.map((d, i) =>
    `<button type="button" class="filtro" data-dow="${(i + 1) % 7}" aria-pressed="false">${D.DIAS_CURTO[(i + 1) % 7]}</button>`).join("");
  $("#desafio-area").innerHTML = D.AREAS.map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join("");
}

function abrirTarefa(tarefa, dataPadrao) {
  editandoTarefa = tarefa || null;
  preencherSelects();
  const f = $("#form-tarefa"); f.reset();
  $("#dlg-tarefa-titulo").textContent = tarefa ? "Editar tarefa" : "Nova tarefa";
  f.data.value = tarefa ? tarefa.data : (dataPadrao || diaHoje);
  if (tarefa) {
    f.titulo.value = tarefa.titulo; f.hora.value = tarefa.hora || "";
    f.obs.value = tarefa.obs || ""; f.categoriaId.value = tarefa.categoriaId || "";
    f.metaId.value = tarefa.metaId || ""; f.prioridade.checked = !!tarefa.prioridade;
    f.repeteTipo.value = (tarefa.repete && tarefa.repete.tipo) || "nenhuma";
    f.repeteAte.value = (tarefa.repete && tarefa.repete.ate) || "";
    const dias = (tarefa.repete && tarefa.repete.dias) || [];
    $$("#dias-semana .filtro").forEach(b => b.setAttribute("aria-pressed", dias.includes(+b.dataset.dow)));
  }
  atualizarCamposRepeticao(); abrir($("#dlg-tarefa"));
  setTimeout(() => f.titulo.focus(), 50);
}
function atualizarCamposRepeticao() {
  const tipo = $("#form-tarefa").repeteTipo.value;
  $("#campo-dias").classList.toggle("oculto", tipo !== "dias");
  $("#campo-ate").classList.toggle("oculto", tipo === "nenhuma");
}

/* ---------------------------------------- biblioteca */
function criarDaBiblioteca(tipo, area, i) {
  const item = B.pegar(area, tipo, i);
  if (!item) return;
  const nomeArea = (D.area(area) || {}).nome || "";

  if (tipo === "desafio") {
    if (D.desafiosAtivos().length >= 2) {
      S.tocar("limite");
      confirmar("Dois desafios já é o limite",
        "Termine ou apague um dos ativos antes de começar este. É de propósito: três viram cobrança.", () => {});
      return;
    }
    D.novoDesafio({ titulo: item.titulo, area, dias: item.dias, inicio: D.hoje() });
    S.tocar("marcar");
    desenhar();
    avisarNaTela(`Desafio criado em ${nomeArea}. Marque o primeiro dia hoje.`);
    return;
  }

  const m = D.novaMeta({ titulo: item.titulo, descricao: nomeArea, prazo: "" });
  m.etapas = item.etapas.map(t => ({ titulo: t, feita: false }));
  D.salvar();
  S.tocar("marcar");
  desenhar();
  avisarNaTela(`Meta criada com ${item.etapas.length} etapas. Abra para pôr um prazo.`);
}

/** avisinho que sobe por cima do menu, com um botão opcional de desfazer */
let relogioAviso = null;
function avisarNaTela(texto, opcoes = {}) {
  const antigo = $(".aviso-flutuante");
  if (antigo) antigo.remove();
  clearTimeout(relogioAviso);

  const el = document.createElement("div");
  el.className = "aviso-flutuante";
  el.setAttribute("role", "status");
  el.innerHTML = `<span class="aviso-texto"></span>`;
  $(".aviso-texto", el).textContent = texto;

  const sair = () => {
    el.classList.add("saindo");
    setTimeout(() => el.remove(), 260);
  };

  if (opcoes.acao) {
    const b = document.createElement("button");
    b.className = "aviso-botao";
    b.textContent = opcoes.rotulo || "Desfazer";
    b.onclick = () => { clearTimeout(relogioAviso); opcoes.acao(); sair(); };
    el.appendChild(b);
  }

  document.body.appendChild(el);
  relogioAviso = setTimeout(sair, opcoes.acao ? 6000 : 3200);
  return sair;
}

/* ---------------------------------------- ajustes */
function pintarAjustes() {
  $("#ajuste-nome-valor").textContent = D.nome() || "ainda sem nome";
  const escuro = document.documentElement.dataset.tema === "escuro";
  $("#ajuste-tema-valor").textContent = escuro ? "Escuro" : "Claro";
  $("#ajuste-cat-valor").textContent = `${D.estado.categorias.length} categoria${D.estado.categorias.length === 1 ? "" : "s"}`;
  const n = D.estado.lixeira.length;
  $("#ajuste-lixeira-valor").textContent = n
    ? `${n} ite${n === 1 ? "m" : "ns"} dá para recuperar`
    : "Vazia";
  const bs = $("#btn-som"), bm = $("#btn-musica");
  bs.setAttribute("aria-checked", String(!!D.estado.som));
  bm.setAttribute("aria-checked", String(!!D.estado.musica));
}
function abrirAjustes() { pintarAjustes(); abrir($("#dlg-ajustes")); }
function abrirNome() {
  const f = $("#form-nome");
  f.nome.value = D.nome();
  abrir($("#dlg-nome"));
  setTimeout(() => f.nome.select(), 60);
}

/* ---------------------------------------- categorias */
function desenharCategorias() {
  $("#cat-lista").innerHTML = D.estado.categorias.map(c => `
    <li class="card" data-cat="${c.id}">
      <input type="text" value="${esc(c.nome)}" maxlength="40" aria-label="Nome da categoria">
      <div class="cores">${D.CORES.map(cor =>
        `<button type="button" data-cor="${cor}" aria-pressed="${c.cor === cor}" aria-label="Cor ${cor}"
          style="background:var(--${cor})"></button>`).join("")}</div>
      <button class="btn-icone" data-acao="cat-excluir" aria-label="Excluir ${esc(c.nome)}"
        style="width:36px;height:36px">${A.mini("excluir", 16)}</button>
    </li>`).join("") || `<li class="apoio">Nenhuma categoria. Crie a primeira abaixo.</li>`;
}

/* ---------------------------------------- assessments */
function abrirAssessment(aid) {
  const a = AS.ASSESSMENTS.find(x => x.id === aid);
  if (!a) return;
  const dlg = $("#dlg-assessment");
  if (!a.pronto || !a.itens.length) {
    dlg.innerHTML = `<h2>${esc(a.nome)}</h2>
      <p class="apoio">${esc(a.subtitulo)}</p>
      <div class="card" style="margin-top:var(--space-4)">
        <p class="micro">Como ativar</p>
        <p>As perguntas deste instrumento são protegidas por direito autoral, então não vêm escritas no app.</p>
        <ol class="apoio" style="padding-left:1.2em">
          <li>${a.registro ? "Faça o registro com os autores." : "Não precisa de registro."}</li>
          <li>Copie as perguntas da fonte oficial.</li>
          <li>Cole na lista do arquivo <code>js/assessments.js</code>.</li>
          <li>Troque <code>pronto: false</code> por <code>pronto: true</code>.</li>
        </ol>
        <p class="apoio"><strong>Licença:</strong> ${esc(a.licenca)}</p>
        <p class="apoio"><a href="${esc(a.fonte)}" target="_blank" rel="noopener">Fonte oficial</a></p>
        ${a.observacao ? `<p class="apoio">${esc(a.observacao)}</p>` : ""}
      </div>
      <div class="modal-acoes"><button type="button" class="btn btn-principal" data-fechar>Entendi</button></div>`;
    abrir(dlg); return;
  }
  let respostas = new Array(a.itens.length).fill(null), i = 0;
  function passo() {
    if (i >= a.itens.length) return resultado();
    const op = a.tipo === "minutos"
      ? `<input type="number" min="0" max="900" id="resp-min" class="busca-campo" placeholder="minutos">`
      : a.escala.map((e, v) =>
          `<button type="button" class="btn btn-secundario" data-v="${v}" style="width:100%;justify-content:flex-start;margin-bottom:var(--space-2)">${esc(e)}</button>`).join("");
    dlg.innerHTML = `<p class="micro">${esc(a.nome)} · ${i + 1} de ${a.itens.length}</p>
      <h2 style="font-size:var(--t-titulo-m);line-height:var(--lh-titulo-m)">${esc(a.itens[i])}</h2>
      <div style="margin-top:var(--space-4)">${op}</div>
      <div class="modal-acoes">
        ${i > 0 ? `<button type="button" class="btn btn-discreto" id="resp-voltar">Voltar</button>` : ""}
        ${a.tipo === "minutos" ? `<button type="button" class="btn btn-principal" id="resp-ok">Próxima</button>` : ""}
        <button type="button" class="btn btn-discreto" data-fechar>Sair</button>
      </div>`;
    $$("[data-v]", dlg).forEach(b => b.onclick = () => { respostas[i] = +b.dataset.v; i++; passo(); });
    const ok = $("#resp-ok", dlg);
    if (ok) ok.onclick = () => { respostas[i] = Number($("#resp-min", dlg).value) || 0; i++; passo(); };
    const voltar = $("#resp-voltar", dlg);
    if (voltar) voltar.onclick = () => { i--; passo(); };
  }
  function resultado() {
    const pontos = a.pontuar(respostas);
    const faixa = a.faixas.find(f => pontos <= f.ate) || a.faixas[a.faixas.length - 1];
    D.estado.assessments.push({ id: a.id, pontos, quando: new Date().toISOString(), faixa: faixa.rotulo });
    D.salvar();
    const sug = AS.DESAFIO_SUGERIDO[a.area];
    dlg.innerHTML = `<p class="micro">${esc(a.nome)}</p>
      <h2>${esc(faixa.rotulo)}</h2>
      <div style="text-align:center;margin:var(--space-4) 0">${A.anel(pontos, a.maximo, "var(--acao)", 120, String(pontos))}</div>
      <p>${esc(faixa.texto)}</p>
      <p class="apoio" style="margin-top:var(--space-3)">
        Isso não é um diagnóstico. Se a pontuação preocupar, vale conversar com um profissional.</p>
      ${faixa.sugereDesafio && sug ? `<div class="card" style="margin-top:var(--space-4)">
        <p class="micro">Sugestão de desafio</p>
        <p style="font-weight:600">${esc(sug.titulo)}</p>
        <p class="apoio">${sug.dias} dias · área ${esc((D.AREAS.find(x => x.id === a.area) || {}).nome || "")}</p>
        <button type="button" class="btn btn-principal" id="aceitar-desafio" style="margin-top:var(--space-3);min-height:40px">Começar esse desafio</button>
      </div>` : ""}
      <div class="modal-acoes"><button type="button" class="btn btn-discreto" data-fechar>Fechar</button></div>`;
    animarProgresso(dlg);
    const ac = $("#aceitar-desafio", dlg);
    if (ac) ac.onclick = () => {
      if (D.desafiosAtivos().length >= 2) { $("#confirma-texto").textContent = ""; confirmar("Limite de desafios", "Você já tem dois desafios ativos. Termine um antes de começar outro.", () => {}); return; }
      D.novoDesafio({ titulo: sug.titulo, area: a.area, dias: sug.dias, inicio: D.hoje() });
      fechar(dlg); desenhar();
    };
  }
  passo(); abrir(dlg);
}

/* ---------------------------------------- eventos */
function ligarEventos() {
  $("#btn-busca").innerHTML = A.mini("busca", 20);
  $("#btn-trofeus").innerHTML = A.mini("trofeu", 20);
  $("#btn-ajustes").innerHTML = A.mini("ajustes", 20);
  $("#marca-agnes").innerHTML = A.agnes("feliz", 34);
  $("#btn-busca").onclick = () => irPara("busca");
  $("#btn-trofeus").onclick = () => irPara("trofeus");
  $("#btn-ajustes").onclick = abrirAjustes;
  $("#btn-editar-nome").innerHTML = A.mini("editar", 16);
  $("#trofeus-voltar").onclick = () => irPara(abaAnterior === "trofeus" ? "hoje" : abaAnterior);
  $("#tutorial-voltar").onclick = () => irPara(abaAnterior === "tutorial" ? "hoje" : abaAnterior);

  // ajustes
  $$("#dlg-ajustes .ajuste-icone").forEach(s => { s.innerHTML = A.mini(s.dataset.icone, 20); });
  $("#btn-tema").onclick = () => { alternarTema(); pintarAjustes(); };
  $("#btn-categorias").onclick = () => { fechar($("#dlg-ajustes")); setTimeout(() => { desenharCategorias(); abrir($("#dlg-categorias")); }, 180); };
  $("#btn-tutorial").onclick = () => { fechar($("#dlg-ajustes")); setTimeout(() => irPara("tutorial"), 180); };
  $("#btn-lixeira").onclick = () => { fechar($("#dlg-ajustes")); setTimeout(() => irPara("lixeira"), 180); };
  $("#lixeira-voltar").onclick = () => irPara(abaAnterior === "lixeira" ? "hoje" : abaAnterior);
  $("#btn-esvaziar").onclick = () => {
    confirmar("Esvaziar a lixeira?", "Tudo que está aqui some de vez. Isso não tem volta.", () => {
      D.esvaziarLixeira(); S.tocar("limite"); desenharLixeira();
    });
  };
  $("#btn-trocar-nome").onclick = () => { fechar($("#dlg-ajustes")); setTimeout(abrirNome, 180); };
  $("#btn-som").onclick = () => { S.alternar("som"); pintarAjustes(); };
  $("#btn-musica").onclick = () => { S.alternar("musica"); pintarAjustes(); };

  // trocar o nome
  $("#t-hoje").onclick = abrirNome;
  $("#btn-editar-nome").onclick = abrirNome;
  $("#form-nome").onsubmit = () => {
    const v = $("#form-nome").nome.value.trim();
    if (v) { D.nome(v); S.tocar("marcar"); }
    desenhar();
  };
  // renomear categoria direto na lista
  $("#cat-lista").addEventListener("change", (ev) => {
    const campo = ev.target.closest('input[type="text"]');
    if (!campo) return;
    const c = D.categoria(campo.closest("[data-cat]").dataset.cat);
    if (c && campo.value.trim()) { c.nome = campo.value.trim(); D.salvar(); desenhar(); }
    else if (c) campo.value = c.nome;
  });

  [["#hoje-anterior", "volta"], ["#hoje-proximo", "frente"], ["#semana-anterior", "volta"],
   ["#semana-proxima", "frente"], ["#mes-anterior", "volta"], ["#mes-proximo", "frente"],
   ["#rev-anterior", "volta"], ["#rev-proxima", "frente"]]
    .forEach(([sel, ic]) => { const e = $(sel); if (e) e.innerHTML = A.mini(ic, 18); });
  $("#detalhe-voltar").innerHTML = A.mini("volta", 18) + " Voltar";

  const trocarDia = (novo) => {
    const indo = novo > diaHoje ? 1 : -1;
    diaHoje = novo;
    humorAberto = false;
    clearTimeout(relogioEncolher);
    desenharHoje();
    S.tocar("toque");
    const faixa = $("#tela-hoje .faixa");
    if (faixa && !semMovimento()) {
      faixa.animate([{ transform: `translateX(${indo * 18}px)`, opacity: .5 }, { transform: "none", opacity: 1 }],
        { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  };
  // alternador lista e quadro na semana
  $$(".troca-vista [data-vista]").forEach(b => {
    b.onclick = () => {
      if (vistaSemana === b.dataset.vista) return;
      vistaSemana = b.dataset.vista;
      S.tocar("aba");
      $$(".troca-vista [data-vista]").forEach(x =>
        x.setAttribute("aria-selected", String(x.dataset.vista === vistaSemana)));
      moverBolha();
      const tela = $("#tela-semana");
      desenharSemana();
      if (!semMovimento()) {
        const alvo = vistaSemana === "quadro" ? $("#semana-quadro") : $("#semana-dias");
        alvo.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    };
  });

  $("#hoje-anterior").onclick = () => trocarDia(D.somaDias(diaHoje, -1));
  $("#hoje-proximo").onclick = () => trocarDia(D.somaDias(diaHoje, 1));
  $("#hoje-voltar").onclick = () => trocarDia(D.hoje());
  $("#semana-anterior").onclick = () => { diaSemana = D.somaDias(diaSemana, -7); desenharSemana(); };
  $("#semana-proxima").onclick = () => { diaSemana = D.somaDias(diaSemana, 7); desenharSemana(); };
  $("#semana-atual").onclick = () => { diaSemana = D.hoje(); desenharSemana(); };
  $("#mes-anterior").onclick = () => { const d = D.deISO(diaMes); d.setMonth(d.getMonth() - 1); diaMes = D.iso(d); desenharMes(); };
  $("#mes-proximo").onclick = () => { const d = D.deISO(diaMes); d.setMonth(d.getMonth() + 1); diaMes = D.iso(d); desenharMes(); };
  $("#mes-atual").onclick = () => { diaMes = D.hoje(); diaMesSel = D.hoje(); desenharMes(); };
  $("#rev-anterior").onclick = () => { diaRevisao = D.somaDias(diaRevisao, -7); desenharRevisao(); };
  $("#rev-proxima").onclick = () => { diaRevisao = D.somaDias(diaRevisao, 7); desenharRevisao(); };
  $("#rev-atual").onclick = () => { diaRevisao = D.hoje(); desenharRevisao(); };
  $("#detalhe-voltar").onclick = () => irPara(abaAnterior === "detalhe" ? "hoje" : abaAnterior);

  $("#btn-nova-tarefa").onclick = () => abrirTarefa(null, diaHoje);
  $("#mes-nova-tarefa").onclick = () => abrirTarefa(null, diaMesSel);
  $("#btn-novo-habito").onclick = () => { $("#form-habito").reset(); $("#campo-alvo").classList.add("oculto"); abrir($("#dlg-habito")); };
  $("#btn-nova-meta").onclick = () => { $("#form-meta").reset(); abrir($("#dlg-meta")); };
  $("#btn-novo-desafio").onclick = () => {
    preencherSelects(); $("#form-desafio").reset();
    $("#form-desafio").inicio.value = D.hoje(); abrir($("#dlg-desafio"));
  };
  $("#btn-assessments").onclick = () => abrirAssessment((AS.ASSESSMENTS.find(a => a.pronto) || AS.ASSESSMENTS[0]).id);

  $("#form-tarefa").repeteTipo.onchange = atualizarCamposRepeticao;

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-fechar]");
    if (b) { const d = b.closest("dialog"); if (d) fechar(d); }
    const dow = ev.target.closest("[data-dow]");
    if (dow) dow.setAttribute("aria-pressed", dow.getAttribute("aria-pressed") !== "true");
    const atalho = ev.target.closest("[data-atalho]");
    if (atalho) $("#form-reagendar").data.value = D.somaDias(D.hoje(), +atalho.dataset.atalho);
  });

  $("#form-tarefa").onsubmit = () => {
    const f = $("#form-tarefa");
    const dias = $$("#dias-semana .filtro").filter(b => b.getAttribute("aria-pressed") === "true").map(b => +b.dataset.dow);
    const repete = { tipo: f.repeteTipo.value };
    if (repete.tipo === "dias") repete.dias = dias.length ? dias : [D.deISO(f.data.value || diaHoje).getDay()];
    if (repete.tipo !== "nenhuma" && f.repeteAte.value) repete.ate = f.repeteAte.value;
    const dados = {
      titulo: f.titulo.value, data: f.data.value || diaHoje, hora: f.hora.value,
      obs: f.obs.value, categoriaId: f.categoriaId.value, metaId: f.metaId.value,
      prioridade: f.prioridade.checked, repete
    };
    if (dados.prioridade && (!editandoTarefa || !editandoTarefa.prioridade) && D.prioridadesDoDia(dados.data) >= 3) {
      dados.prioridade = false;
      S.tocar("limite");
      setTimeout(() => confirmar("Três prioridades já é o limite",
        "Essa tarefa entrou sem prioridade. Tire a prioridade de outra se quiser trocar.", () => {}), 60);
    }
    if (editandoTarefa) {
      const alvo = editandoTarefa;
      D.atualizarTarefa(alvo.id, dados);
      if (tarefaDetalhe && tarefaDetalhe.id === alvo.id) tarefaDetalhe = D.acharTarefa(alvo.id);
    } else D.novaTarefa(dados);
    editandoTarefa = null; desenhar();
  };
  $("#form-habito").tipo.onchange = (ev) => $("#campo-alvo").classList.toggle("oculto", ev.target.value !== "semanal");
  $("#form-habito").onsubmit = () => {
    const f = $("#form-habito");
    D.novoHabito({ nome: f.nome.value, tipo: f.tipo.value, alvo: f.alvo.value }); desenhar();
  };
  $("#form-habito-editar").tipo.onchange = (ev) =>
    $("#campo-alvo-editar").classList.toggle("oculto", ev.target.value !== "semanal");
  $("#form-habito-editar").onsubmit = () => {
    const f = $("#form-habito-editar");
    if (!habitoEditando) return;
    habitoEditando.nome = f.nome.value.trim() || habitoEditando.nome;
    habitoEditando.tipo = f.tipo.value;
    habitoEditando.alvo = Number(f.alvo.value) || habitoEditando.alvo;
    D.salvar(); habitoEditando = null; desenhar();
  };
  $("#habito-pausar").onclick = () => {
    if (!habitoEditando) return;
    habitoEditando.pausado = !habitoEditando.pausado; D.salvar();
    fechar($("#dlg-habito-editar")); habitoEditando = null; desenhar();
  };
  $("#habito-excluir").onclick = () => {
    const h = habitoEditando; if (!h) return;
    fechar($("#dlg-habito-editar")); habitoEditando = null;
    confirmar("Excluir o hábito?", `"${h.nome}" vai para a lixeira, com o histórico junto.`, () => {
      D.paraLixeira("habito", [h], h.nome);
      D.estado.habitos = D.estado.habitos.filter(x => x.id !== h.id); D.salvar();
      avisarApagado(h.nome);
    });
  };
  $("#form-meta").onsubmit = () => {
    const f = $("#form-meta");
    D.novaMeta({ titulo: f.titulo.value, descricao: f.descricao.value, prazo: f.prazo.value }); desenhar();
  };
  $("#form-desafio").onsubmit = () => {
    const f = $("#form-desafio");
    D.novoDesafio({ titulo: f.titulo.value, area: f.area.value, dias: f.dias.value, inicio: f.inicio.value || D.hoje() });
    desenhar();
  };
  $("#form-etapa").onsubmit = () => {
    const f = $("#form-etapa");
    if (metaDaEtapa && f.titulo.value.trim()) {
      metaDaEtapa.etapas.push({ titulo: f.titulo.value.trim(), feita: false });
      metaDaEtapa.concluida = false; D.salvar();
    }
    metaDaEtapa = null; f.reset(); desenhar();
  };
  $("#form-reagendar").onsubmit = () => {
    const nova = $("#form-reagendar").data.value;
    if (tarefaReagendar && nova) {
      D.atualizarTarefa(tarefaReagendar.id, { data: nova });
      if (tarefaDetalhe && tarefaDetalhe.id === tarefaReagendar.id) tarefaDetalhe = D.acharTarefa(tarefaReagendar.id);
    }
    tarefaReagendar = null; desenhar();
  };
  $("#form-categoria").onsubmit = (ev) => {
    ev.preventDefault();
    const nome = ev.target.nome.value.trim();
    if (nome) { D.novaCategoria(nome); ev.target.reset(); desenharCategorias(); desenhar(); }
  };
  $("#confirma-ok").onclick = () => {
    if (confirmarAcao) confirmarAcao();
    confirmarAcao = null; fechar($("#dlg-confirma")); desenhar();
  };
  $("#escopo-uma").onclick = () => { if (escopoAcao) escopoAcao("uma"); escopoAcao = null; fechar($("#dlg-escopo")); };
  $("#escopo-proximas").onclick = () => { if (escopoAcao) escopoAcao("proximas"); escopoAcao = null; fechar($("#dlg-escopo")); };

  $("#anotacao").oninput = (ev) => D.anotacao(diaHoje, ev.target.value);
  $("#humor-nota").oninput = (ev) => D.humorNota(diaHoje, ev.target.value);
  $("#btn-salvar-dia").onclick = () => {
    D.anotacao(diaHoje, $("#anotacao").value);
    D.humorNota(diaHoje, $("#humor-nota").value);
    S.tocar("toque");
    avisarSalvo("Dia guardado ✓");
  };
  $("#btn-ver-humor").onclick = () => { irPara("revisao"); setTimeout(() => rolarAte("#bloco-humor"), 360); };

  $("#reflexao").oninput = (ev) => {
    D.reflexao(D.resumoSemana(diaRevisao).semana, ev.target.value);
    $("#reflexao-estado").textContent = "não guardada";
  };
  $("#btn-salvar-reflexao").onclick = () => {
    const semana = D.resumoSemana(diaRevisao).semana;
    D.reflexao(semana, $("#reflexao").value);
    S.tocar("toque");
    const alvo = $("#reflexao-salva");
    alvo.textContent = $("#reflexao").value.trim() ? "Guardado ✓" : "Vazio, nada a guardar";
    alvo.classList.remove("aparece"); void alvo.offsetWidth; alvo.classList.add("aparece");
    $("#reflexao-estado").textContent = $("#reflexao").value.trim() ? "guardada" : "";
    conferirConquistas();
  };
  $("#busca-campo").oninput = desenharBusca;

  document.addEventListener("click", aoClicar);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      const corpo = ev.target.closest('[data-acao="detalhe"]');
      if (corpo) { ev.preventDefault(); corpo.click(); }
    }
  });
}

/** acha a tarefa pelo id, inclusive ocorrências geradas */
function acharPorId(tid) {
  let t = D.acharTarefa(tid);
  if (t) return t;
  const bases = [diaHoje, diaMesSel, diaSemana, D.hoje()];
  for (const base of bases) {
    for (let i = -14; i <= 14; i++) {
      const achou = D.tarefasDoDia(D.somaDias(base, i)).find(x => x.id === tid);
      if (achou) return achou;
    }
  }
  return null;
}

function aoClicar(ev) {
  const alvo = ev.target;

  // modal de categorias
  const liCat = alvo.closest("[data-cat]");
  if (liCat) {
    const c = D.categoria(liCat.dataset.cat);
    const cor = alvo.closest("[data-cor]");
    if (c && cor) { c.cor = cor.dataset.cor; D.salvar(); desenharCategorias(); desenhar(); return; }
    if (c && alvo.closest('[data-acao="cat-excluir"]')) {
      const emUso = D.estado.tarefas.filter(t => t.categoriaId === c.id).length;
      fechar($("#dlg-categorias"));
      confirmar("Excluir a categoria?",
        emUso ? `${emUso} tarefa${emUso > 1 ? "s" : ""} usa${emUso > 1 ? "m" : ""} "${c.nome}". Elas ficam sem categoria.`
              : `"${c.nome}" será apagada.`,
        () => { D.excluirCategoria(c.id); setTimeout(() => { desenharCategorias(); abrir($("#dlg-categorias")); }, 80); });
      return;
    }
  }

  const vazioBtn = alvo.closest("[data-vazio]");
  if (vazioBtn) {
    const marca = vazioBtn.dataset.vazio;
    if (marca === "desafio") $("#btn-novo-desafio").click();
    else if (marca === "meta") $("#btn-nova-meta").click();
    else abrirTarefa(null, diaHoje);
    return;
  }
  const novaEm = alvo.closest("[data-nova-em]");
  if (novaEm) { abrirTarefa(null, novaEm.dataset.novaEm); return; }

  if (alvo.closest("[data-humor-limpar]")) {
    D.humor(diaHoje, "");
    S.tocar("desmarcar");
    desenharHumor(); avisarSalvo("Humor apagado");
    return;
  }
  const humorBtn = alvo.closest("[data-humor]");
  if (humorBtn) {
    const v = humorBtn.dataset.humor;
    const tirando = D.humor(diaHoje) === v;
    D.humor(diaHoje, tirando ? "" : v);
    S.tocar(tirando ? "desmarcar" : "marcar");
    humorAberto = true;   // deixa a confirmação na tela antes de encolher
    desenharHumor();
    if (!tirando) {
      const novo = $(`[data-humor="${v}"]`);
      if (novo && !semMovimento()) {
        novo.animate([{ transform: "scale(.9)" }, { transform: "scale(1.08)", offset: .55 }, { transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.34,1.3,.64,1)" });
        brilhar(novo);
      }
      avisarSalvo("Humor guardado ✓");
      encolherHumorDepois();
    } else { avisarSalvo("Humor apagado"); clearTimeout(relogioEncolher); }
    return;
  }
  if (alvo.closest("#humor-tira")) { abrirHumor(); return; }

  // subtarefas
  const linhaPasso = alvo.closest("[data-passo]");
  if (linhaPasso && tarefaDetalhe) {
    const acao = alvo.closest("[data-acao]");
    const pid = linhaPasso.dataset.passo;
    const real = D.materializar(tarefaDetalhe);
    if (acao && acao.dataset.acao === "passo-excluir") {
      const p = D.passos(real).find(x => x.id === pid);
      D.excluirPasso(real.id, pid);
      S.tocar("desmarcar");
      tarefaDetalhe = D.acharTarefa(real.id);
      desenhar();
      if (p) avisarNaTela(`Subtarefa apagada.`, {
        acao: () => {
          const novo = D.novoPasso(real.id, p.titulo);
          if (novo) novo.feito = p.feito;
          D.salvar(); tarefaDetalhe = D.acharTarefa(real.id); desenhar();
        }
      });
      return;
    }
    if (acao && acao.dataset.acao === "passo-alternar") {
      const antes = !!(D.passos(real).find(x => x.id === pid) || {}).feito;
      D.alternarPasso(real.id, pid);
      S.tocar(antes ? "desmarcar" : "marcar");
      tarefaDetalhe = D.acharTarefa(real.id);
      const virouFeita = tarefaDetalhe && tarefaDetalhe.feita && !antes;
      desenhar();
      if (virouFeita) festejarComSom(true, "TUDO", "FEITO", {
        titulo: "Todos os passos",
        texto: `"${cortar(tarefaDetalhe.titulo, 40)}" ficou pronta.`
      });
      return;
    }
  }
  // filtros de área da biblioteca
  const fArea = alvo.closest("[data-area-desafio]");
  if (fArea) { areaDesafios = fArea.dataset.areaDesafio; S.tocar("toque"); desenharDesafios(); return; }
  const fAreaM = alvo.closest("[data-area-meta]");
  if (fAreaM) { areaMetas = fAreaM.dataset.areaMeta; S.tocar("toque"); desenharMetas(); return; }

  // criar a partir da biblioteca
  const sug = alvo.closest("[data-sugestao]");
  if (sug) { criarDaBiblioteca(sug.dataset.sugestao, sug.dataset.area, Number(sug.dataset.i)); return; }

  if (alvo.closest("#tutorial-pronto")) { irPara("hoje"); return; }

  // lixeira
  const linhaLixo = alvo.closest("[data-lixo]");
  if (linhaLixo) {
    const acao = alvo.closest("[data-lixo-acao]");
    if (!acao) return;
    const rid = linhaLixo.dataset.lixo;
    const reg = D.estado.lixeira.find(r => r.id === rid);
    if (acao.dataset.lixoAcao === "restaurar") {
      D.restaurar(rid);
      S.tocar("marcar");
      desenharLixeira();
      avisarNaTela(`"${cortar(reg ? reg.rotulo : "")}" voltou.`);
      return;
    }
    confirmar("Apagar de vez?", `"${reg ? reg.rotulo : ""}" não poderá mais ser recuperado.`, () => {
      D.apagarDeVez(rid); S.tocar("limite"); desenharLixeira();
    });
    return;
  }

  const calDia = alvo.closest("[data-dia]");
  if (calDia) { diaMesSel = calDia.dataset.dia; desenharMes(); return; }

  const filtro = alvo.closest("[data-filtro]");
  if (filtro) {
    const campo = filtro.dataset.filtro, valor = filtro.dataset.valor;
    filtroBusca[campo] = filtroBusca[campo] === valor ? "" : valor;
    desenharBusca(); return;
  }
  const assessBtn = alvo.closest('[data-acao="abrir-assessment"]');
  if (assessBtn) { abrirAssessment(assessBtn.closest("[data-assessment]").dataset.assessment); return; }

  // ações do detalhe
  const det = alvo.closest("[data-det]");
  if (det && tarefaDetalhe) { acaoTarefa(det.dataset.det, tarefaDetalhe); return; }

  // hábitos
  const cardHabito = alvo.closest("[data-habito]");
  if (cardHabito) {
    const h = D.estado.habitos.find(x => x.id === cardHabito.dataset.habito);
    if (!h) return;
    if (alvo.closest('[data-acao="editar-habito"]')) {
      habitoEditando = h;
      const f = $("#form-habito-editar");
      f.nome.value = h.nome; f.tipo.value = h.tipo; f.alvo.value = h.alvo;
      $("#campo-alvo-editar").classList.toggle("oculto", h.tipo !== "semanal");
      $("#habito-pausar").textContent = h.pausado ? "Retomar" : "Pausar";
      abrir($("#dlg-habito-editar")); return;
    }
    if (alvo.closest('[data-acao="marcar-habito"]')) {
      D.marcarHabito(h.id, diaHoje);
      S.tocar(h.marcas.includes(diaHoje) ? "marcar" : "desmarcar");
      const seq = D.sequencia(h, diaHoje);
      desenharHabitos(); animarProgresso($("#lista-habitos"));
      if (h.tipo === "diario" && seq > 0 && seq % 7 === 0) festejarComSom(true, String(seq), "DIAS");
      return;
    }
  }

  // desafios
  const cardDesafio = alvo.closest("[data-desafio]");
  if (cardDesafio) {
    const d = D.estado.desafios.find(x => x.id === cardDesafio.dataset.desafio);
    if (!d) return;
    if (alvo.closest('[data-acao="excluir-desafio"]')) {
      confirmar("Desistir do desafio?", `"${d.titulo}" vai para a lixeira, com os dias marcados.`, () => {
        D.paraLixeira("desafio", [d], d.titulo);
        D.estado.desafios = D.estado.desafios.filter(x => x.id !== d.id); D.salvar();
        avisarApagado(d.titulo);
      });
      return;
    }
    if (alvo.closest('[data-acao="marcar-desafio"]')) {
      const r = D.marcarDesafio(d.id, D.hoje());
      S.tocar(r && r.marcas.includes(D.hoje()) ? "marcar" : "desmarcar");
      desenhar();
      if (r && r.concluido) festejarComSom(true, String(r.dias), "DIAS");
      return;
    }
  }

  // metas
  const cardM = alvo.closest("[data-meta]");
  if (cardM) {
    const m = D.estado.metas.find(x => x.id === cardM.dataset.meta);
    if (!m) return;
    if (alvo.closest('[data-acao="etapa"]')) {
      const i = +alvo.closest("[data-i]").dataset.i;
      m.etapas[i].feita = !m.etapas[i].feita;
      if (m.etapas.length && m.etapas.every(e => e.feita)) m.concluida = true;
      D.salvar(); desenharMetas();
      if (m.concluida) festejarComSom(true, "META", "FEITA");
      return;
    }
    if (alvo.closest('[data-acao="meta-etapa"]')) { metaDaEtapa = m; $("#form-etapa").reset(); abrir($("#dlg-etapa")); return; }
    if (alvo.closest('[data-acao="meta-concluir"]')) {
      m.concluida = true; D.salvar(); desenharMetas(); festejarComSom(true, "META", "FEITA"); return;
    }
    if (alvo.closest('[data-acao="meta-excluir"]')) {
      confirmar("Excluir a meta?", `"${m.titulo}" vai para a lixeira. As tarefas ligadas continuam.`, () => {
        D.paraLixeira("meta", [m], m.titulo);
        D.estado.metas = D.estado.metas.filter(x => x.id !== m.id);
        D.estado.tarefas.forEach(t => { if (t.metaId === m.id) t.metaId = ""; });
        D.salvar();
        avisarApagado(m.titulo);
      });
      return;
    }
  }

  // tarefas
  const li = alvo.closest(".tarefa");
  if (!li) return;
  const acao = alvo.closest("[data-acao]");
  if (!acao) return;
  const t = acharPorId(li.dataset.id);
  if (!t) return;
  acaoTarefa(acao.dataset.acao, t);
}

function acaoTarefa(tipo, t) {
  const repetida = !!(t.repete && t.repete.tipo !== "nenhuma") || !!t.virtual;

  if (tipo === "detalhe") { tarefaDetalhe = t; abrirDetalhe(t); return; }

  if (tipo === "alternar") {
    const real = D.materializar(t);
    const antes = medirTarefas();
    D.alternarFeita(real.id);
    const agoraFeita = !!(D.acharTarefa(real.id) || {}).feita;
    S.tocar(agoraFeita ? "marcar" : "desmarcar");
    if (tarefaDetalhe && (tarefaDetalhe.id === t.id || tarefaDetalhe.id === real.id)) tarefaDetalhe = D.acharTarefa(real.id);
    semReveal = real.id;
    desenhar();
    semReveal = null;
    animarMigracao(antes, real.id, agoraFeita);
    const dia = D.tarefasDoDia(real.data);
    if (dia.length && dia.every(x => x.feita)) festejarComSom(true, "DIA", "FEITO");
    return;
  }

  if (tipo === "editar") {
    if (repetida) {
      perguntarEscopo("Essa tarefa repete", "A mudança vale só para este dia ou para a série inteira?", (escopo) => {
        if (escopo === "uma") abrirTarefa(D.materializar(t));
        else abrirTarefa(D.acharTarefa(t.maeId || t.id) || D.materializar(t));
      });
    } else abrirTarefa(t);
    return;
  }

  if (tipo === "mover") {
    const abrirReagendar = (alvo) => {
      tarefaReagendar = alvo;
      $("#reagendar-titulo").textContent = alvo.titulo;
      $("#form-reagendar").data.value = alvo.data;
      abrir($("#dlg-reagendar"));
    };
    if (repetida) {
      perguntarEscopo("Essa tarefa repete", "Reagendar só este dia, ou mover a série inteira?", (escopo) => {
        abrirReagendar(escopo === "uma" ? D.materializar(t) : (D.acharTarefa(t.maeId || t.id) || D.materializar(t)));
      });
    } else abrirReagendar(t);
    return;
  }

  if (tipo === "excluir") {
    if (repetida) {
      perguntarEscopo("Essa tarefa repete", "Excluir só este dia ou a série inteira?", (escopo) => {
        if (escopo === "uma") {
          const real = D.materializar(t);
          D.excluirTarefa(real.id);
        } else {
          D.excluirTarefa(t.maeId || t.id);
        }
        if (aba === "detalhe") irPara(abaAnterior === "detalhe" ? "hoje" : abaAnterior); else desenhar();
      });
    } else {
      confirmar("Excluir a tarefa?", `"${t.titulo}" vai para a lixeira. Dá para trazer de volta depois.`, () => {
        D.excluirTarefa(t.id);
        avisarApagado(t.titulo);
        if (aba === "detalhe") setTimeout(() => irPara(abaAnterior === "detalhe" ? "hoje" : abaAnterior), 10);
      });
    }
    return;
  }
}

/* ---------------------------------------- início */
function iniciar() {
  document.documentElement.classList.add("js");
  aplicarTema();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!D.estado.tema) aplicarTema(); });
  montarNav();
  montarSecoes();
  D.limparLixeiraVelha();
  marcarVisita();
  $$(".faixa").forEach(f => {
    f.insertAdjacentHTML("afterbegin", '<span class="faixa-fundo"></span>');
    f.insertAdjacentHTML("beforeend", A.ondinha());
  });
  ligarEventos();
  // na primeira vez, o tutorial abre sozinho
  trocarTela(D.estado.tutorialVisto ? "hoje" : "tutorial");
  requestAnimationFrame(() => { moverCorredor(); moverBolha(); });
  addEventListener("resize", () => { moverCorredor(); moverBolha(); });
  S.retomarSeLigado();
  ligarParallax();
  cuidarDaVersao();
}

/* ---------------------------------------- versão e atualização
   O app fica guardado no aparelho pra funcionar sem internet. Sem isso aqui,
   uma versão nova no servidor não chegaria até a tela. */
const VERSAO_APP = "1.4.0";

function cuidarDaVersao() {
  const marca = $("#versao-app");
  if (marca) marca.textContent = `versão ${VERSAO_APP}`;
  if (!("serviceWorker" in navigator)) return;

  // na primeira visita o worker assume sem haver nada velho na tela:
  // recarregar ali atrapalharia, então só recarrega quando é troca de versão
  const jaTinhaControle = !!navigator.serviceWorker.controller;
  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!jaTinhaControle || recarregando) return;
    recarregando = true;
    location.reload();
  });

  const registrar = () => navigator.serviceWorker.register("sw.js").then((reg) => {
    reg.update().catch(() => {});
    // ao voltar pro app, confere se saiu versão nova
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) reg.update().catch(() => {});
    });
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => {});

  if (document.readyState === "complete") registrar();
  else window.addEventListener("load", registrar);
}
document.addEventListener("DOMContentLoaded", iniciar);
})();
