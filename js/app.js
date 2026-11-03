/* Annie's New Life — interface e comportamento. */
(function () {
"use strict";

const D = window.Dados, A = window.Arte, AS = window.Assessments;
const $ = (s, raiz = document) => raiz.querySelector(s);
const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const semMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const ABAS = [
  { id: "hoje", nome: "Hoje" }, { id: "semana", nome: "Semana" },
  { id: "mes", nome: "Mês" }, { id: "metas", nome: "Metas" },
  { id: "revisao", nome: "Revisão" }
];
const MES_CURTO = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

let aba = "hoje", abaAnterior = "hoje";
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
  abaAnterior = aba; aba = nova;
  document.documentElement.dataset.aba = ABAS.some(a => a.id === nova) ? nova : "hoje";
  document.documentElement.style.setProperty("--aba-atual-claro",
    ABAS.some(a => a.id === nova) ? `var(--aba-${nova}-claro)` : "var(--creme-200)");
  $$(".tela").forEach(t => t.classList.remove("ativa"));
  const alvo = $("#tela-" + nova);
  if (alvo) alvo.classList.add("ativa");
  $$("#nav button").forEach(b => {
    if (b.dataset.aba === nova) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  aplicarTema(); desenhar();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function irPara(nova) {
  if (document.startViewTransition && !semMovimento()) document.startViewTransition(() => trocarTela(nova));
  else trocarTela(nova);
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
    // o que já está na tela não some nunca
    if (e.getBoundingClientRect().top < altura + 80) return;
    e.classList.add("vai-entrar");
    observador.observe(e);
  });
  // rede de segurança: nada fica invisível por mais de um segundo
  clearTimeout(redeSeguranca);
  redeSeguranca = setTimeout(() => $$(".vai-entrar:not(.visivel)").forEach(e => e.classList.add("visivel")), 1000);
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

  $("#hoje-data").textContent = D.dataLonga(diaHoje);
  const sauda = $("#t-hoje");
  sauda.textContent = diaHoje === D.hoje() ? "Oi, Annie" : "Esse dia";
  sauda.classList.remove("anima");
  void sauda.offsetWidth;
  if (!semMovimento()) sauda.classList.add("anima");
  $("#hoje-progresso").textContent = tarefas.length
    ? `${feitas.length} de ${tarefas.length} tarefas concluídas`
    : "Nenhuma tarefa ainda";
  $("#hoje-deco").innerHTML = A.agnes(tarefas.length && feitas.length === tarefas.length ? "acolhedora" : "feliz", 64);

  $("#lista-tarefas").innerHTML = pendentes.length
    ? pendentes.map(t => linhaTarefa(t)).join("")
    : vazio("curiosa", "Nenhuma tarefa por aqui", "Que tal começar com uma?", "Adicionar tarefa", "tarefa");

  $("#bloco-feitas").classList.toggle("oculto", !feitas.length);
  $("#lista-feitas").innerHTML = feitas.map(t => linhaTarefa(t)).join("");

  const atrasadas = D.pendentesAnteriores(diaHoje);
  $("#bloco-pendentes").classList.toggle("oculto", !atrasadas.length);
  $("#pendentes-conta").textContent = atrasadas.length ? `${atrasadas.length} item${atrasadas.length > 1 ? "s" : ""}` : "";
  $("#lista-pendentes").innerHTML = atrasadas.map(t => linhaTarefa(t, { mostrarData: true })).join("");

  desenharHabitos(); desenharDesafiosHoje(); desenharHumor();
  $("#anotacao").value = D.anotacao(diaHoje);
  observarEntradas(); animarProgresso();
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
  { id: "ok", rotulo: "ok", cor: "menta" }, { id: "bem", rotulo: "bem", cor: "manteiga" },
  { id: "otimo", rotulo: "ótimo", cor: "rosa" }, { id: "cansada", rotulo: "cansada", cor: "periwinkle" },
  { id: "off", rotulo: "off", cor: "lilas" }
];
function desenharHumor() {
  const atual = D.humor(diaHoje);
  $("#humor-linha").innerHTML = HUMORES.map(h =>
    `<button class="btn" data-humor="${h.id}" aria-pressed="${atual === h.id}"
      style="background:var(--${h.cor}${atual === h.id ? "" : "-claro"});color:var(--tinta);min-height:40px;padding:8px 16px">
      ${h.rotulo}</button>`).join("");
}

/* ---------------------------------------- SEMANA */
function desenharSemana() {
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
  observarEntradas();
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
    return `<button class="cal-dia ${fora ? "fora" : ""} ${d === D.hoje() ? "hoje" : ""} ${d === diaMesSel ? "sel" : ""}"
      data-dia="${d}" aria-label="${D.dataLonga(d)}, ${ts.length} tarefas">
      <span>${D.deISO(d).getDate()}</span><span class="pts">${pts}</span></button>`;
  }).join("");

  $("#mes-dia-titulo").textContent = D.dataLonga(diaMesSel);
  const ts = D.tarefasDoDia(diaMesSel);
  $("#mes-lista").innerHTML = ts.length ? ts.map(t => linhaTarefa(t)).join("")
    : `<li class="card apoio" style="text-align:center">Nenhuma tarefa nesse dia.</li>`;
  observarEntradas();
}

/* ---------------------------------------- METAS */
function desenharMetas() {
  const ativos = D.desafiosAtivos();
  const emAndamento = D.estado.metas.filter(m => !m.concluida);
  $("#metas-apoio").textContent =
    `${emAndamento.length} meta${emAndamento.length === 1 ? "" : "s"} em andamento · ${ativos.length} desafio${ativos.length === 1 ? "" : "s"} ativo${ativos.length === 1 ? "" : "s"}`;
  $("#desafios-aviso").textContent = ativos.length >= 2
    ? "Dois desafios ativos é o limite. Termine um antes de começar outro."
    : "No máximo dois ao mesmo tempo, para não virar lista de cobrança.";
  $("#btn-novo-desafio").disabled = ativos.length >= 2;

  const todos = D.estado.desafios;
  $("#lista-desafios").innerHTML = todos.length ? todos.map(d => {
    const area = D.AREAS.find(a => a.id === d.area);
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
      ${d.concluido ? A.selo(String(d.dias), "DIAS", "var(--oliva)", 62)
        : `<button class="caixa" role="checkbox" aria-checked="${d.marcas.includes(D.hoje())}"
             data-acao="marcar-desafio" aria-label="Marcar hoje"></button>`}
    </div>`;
  }).join("") : vazio("feliz", "Nenhum desafio ainda",
      "Um desafio é um compromisso curto, com data para acabar.", "Criar o primeiro", "desafio");

  const concluidas = D.estado.metas.filter(m => m.concluida);
  $("#lista-metas").innerHTML = emAndamento.length ? emAndamento.map(cardMeta).join("")
    : vazio("curiosa", "Nenhuma meta em andamento", "O que você quer alcançar neste mês?", "Criar uma meta", "meta");
  $("#bloco-metas-feitas").classList.toggle("oculto", !concluidas.length);
  $("#lista-metas-feitas").innerHTML = concluidas.map(cardMeta).join("");

  desenharAssessments();
  observarEntradas(); animarProgresso();
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
  $("#revisao-apoio").textContent = `${r.percentual}% das tarefas concluídas`;

  const maior = Math.max(1, ...r.porDia.map(d => d.total));
  const grafico = r.porDia.map(d => `
    <div class="col">
      <div class="barra ok" style="height:${(d.feitas / maior) * 100}%"></div>
      <div class="barra pend" style="height:${(d.pendentes / maior) * 100}%"></div>
      <span class="rot">${D.DIAS_CURTO[D.deISO(d.data).getDay()]}</span>
    </div>`).join("");

  $("#revisao-bento").innerHTML = `
    <div class="card reveal card-destaque" style="--grad-a:var(--menta-claro);--grad-b:var(--periwinkle-claro)">
      <p class="micro">Concluídas</p><p class="numerao">${r.feitas}</p><p class="apoio">de ${r.total} tarefas</p></div>
    <div class="card reveal"><p class="micro">Pendentes</p><p class="numerao">${r.pendentes}</p>
      <p class="apoio">para reagendar ou soltar</p></div>
    <div class="card reveal"><p class="micro">Hábitos</p><p class="numerao">${r.habitosCumpridos}</p>
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

  $("#reflexao").value = D.reflexao(r.semana);
  observarEntradas(); animarProgresso();
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
  observarEntradas();
}

function desenhar() {
  ({ hoje: desenharHoje, semana: desenharSemana, mes: desenharMes, metas: desenharMetas,
     revisao: desenharRevisao, busca: desenharBusca, detalhe: desenharDetalhe }[aba] || (() => {}))();
}

/* ---------------------------------------- modais */
const abrir = (d) => d.showModal();
const fechar = (d) => d.close();
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
  $("#btn-tema").innerHTML = A.mini("tema", 20);
  $("#btn-busca").innerHTML = A.mini("busca", 20);
  $("#btn-categorias").innerHTML = A.mini("mais", 20);
  $("#marca-agnes").innerHTML = A.agnes("feliz", 34);
  $("#btn-tema").onclick = alternarTema;
  $("#btn-busca").onclick = () => irPara("busca");
  $("#btn-categorias").onclick = () => { desenharCategorias(); abrir($("#dlg-categorias")); };
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

  $("#hoje-anterior").onclick = () => { diaHoje = D.somaDias(diaHoje, -1); desenharHoje(); };
  $("#hoje-proximo").onclick = () => { diaHoje = D.somaDias(diaHoje, 1); desenharHoje(); };
  $("#hoje-voltar").onclick = () => { diaHoje = D.hoje(); desenharHoje(); };
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
    confirmar("Excluir o hábito?", `"${h.nome}" e todo o histórico dele serão apagados.`, () => {
      D.estado.habitos = D.estado.habitos.filter(x => x.id !== h.id); D.salvar();
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
  $("#reflexao").oninput = (ev) => D.reflexao(D.resumoSemana(diaRevisao).semana, ev.target.value);
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

  const humorBtn = alvo.closest("[data-humor]");
  if (humorBtn) {
    const v = humorBtn.dataset.humor;
    D.humor(diaHoje, D.humor(diaHoje) === v ? "" : v);
    desenharHumor(); return;
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
      const seq = D.sequencia(h, diaHoje);
      desenharHabitos(); animarProgresso($("#lista-habitos"));
      if (h.tipo === "diario" && seq > 0 && seq % 7 === 0) A.festejar(true, String(seq), "DIAS");
      return;
    }
  }

  // desafios
  const cardDesafio = alvo.closest("[data-desafio]");
  if (cardDesafio) {
    const d = D.estado.desafios.find(x => x.id === cardDesafio.dataset.desafio);
    if (!d) return;
    if (alvo.closest('[data-acao="excluir-desafio"]')) {
      confirmar("Desistir do desafio?", `"${d.titulo}" e os dias já marcados serão apagados.`, () => {
        D.estado.desafios = D.estado.desafios.filter(x => x.id !== d.id); D.salvar();
      });
      return;
    }
    if (alvo.closest('[data-acao="marcar-desafio"]')) {
      const r = D.marcarDesafio(d.id, D.hoje());
      desenhar();
      if (r && r.concluido) A.festejar(true, String(r.dias), "DIAS");
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
      if (m.concluida) A.festejar(true, "META", "FEITA");
      return;
    }
    if (alvo.closest('[data-acao="meta-etapa"]')) { metaDaEtapa = m; $("#form-etapa").reset(); abrir($("#dlg-etapa")); return; }
    if (alvo.closest('[data-acao="meta-concluir"]')) {
      m.concluida = true; D.salvar(); desenharMetas(); A.festejar(true, "META", "FEITA"); return;
    }
    if (alvo.closest('[data-acao="meta-excluir"]')) {
      confirmar("Excluir a meta?", `"${m.titulo}" e suas etapas serão apagadas. As tarefas ligadas continuam.`, () => {
        D.estado.metas = D.estado.metas.filter(x => x.id !== m.id);
        D.estado.tarefas.forEach(t => { if (t.metaId === m.id) t.metaId = ""; });
        D.salvar();
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
    D.alternarFeita(real.id);
    if (tarefaDetalhe && (tarefaDetalhe.id === t.id || tarefaDetalhe.id === real.id)) tarefaDetalhe = D.acharTarefa(real.id);
    desenhar();
    const dia = D.tarefasDoDia(real.data);
    if (dia.length && dia.every(x => x.feita)) A.festejar(true, "DIA", "FEITO");
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
      confirmar("Excluir a tarefa?", `"${t.titulo}" será apagada.`, () => {
        D.excluirTarefa(t.id);
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
  $$(".faixa").forEach(f => f.insertAdjacentHTML("beforeend", A.ondinha()));
  ligarEventos();
  trocarTela("hoje");
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
}
document.addEventListener("DOMContentLoaded", iniciar);
})();
