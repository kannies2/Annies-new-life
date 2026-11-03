/* Annie's New Life — armazenamento e modelo de dados.
   Tudo vive no localStorage deste navegador. */

const CHAVE = "annies-new-life/v1";

const AREAS = [
  { id: "espiritual", nome: "Espiritual", cor: "lilas" },
  { id: "mental",     nome: "Mental",     cor: "periwinkle" },
  { id: "fisica",     nome: "Física",     cor: "menta" },
  { id: "beleza",     nome: "Beleza",     cor: "rosa" },
  { id: "bemestar",   nome: "Bem-estar",  cor: "manteiga" },
  { id: "carreira",   nome: "Carreira",   cor: "pessego" }
];

const CORES = ["rosa", "lilas", "menta", "manteiga", "pessego", "periwinkle"];

const VAZIO = {
  versao: 1,
  tema: null,              // null = segue o sistema
  tarefas: [],
  habitos: [],
  metas: [],
  desafios: [],
  categorias: [
    { id: "c1", nome: "Pessoal",  cor: "rosa" },
    { id: "c2", nome: "Casa",     cor: "lilas" },
    { id: "c3", nome: "Estudos",  cor: "menta" },
    { id: "c4", nome: "Projetos", cor: "manteiga" }
  ],
  anotacoes: {},           // "2026-11-02": "texto"
  reflexoes: {},           // "2026-W45": "texto"
  humores: {},             // "2026-11-02": "ok"
  assessments: []          // resultados salvos
};

let estado = carregar();

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return structuredClone(VAZIO);
    const dados = JSON.parse(bruto);
    return Object.assign(structuredClone(VAZIO), dados);
  } catch (e) {
    console.warn("Não deu para ler os dados salvos, começando do zero.", e);
    return structuredClone(VAZIO);
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (e) {
    console.warn("Não deu para salvar.", e);
  }
}

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------- datas ---------------- */
const iso = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const hoje = () => iso(new Date());
const deISO = (s) => { const [a, m, d] = s.split("-").map(Number); return new Date(a, m - 1, d); };
const somaDias = (s, n) => { const d = deISO(s); d.setDate(d.getDate() + n); return iso(d); };
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const DIAS_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
               "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function inicioSemana(s) {
  const d = deISO(s);
  const dow = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - dow);
  return iso(d);
}
function semanaDe(s) {
  const ini = deISO(inicioSemana(s));
  const quinta = new Date(ini); quinta.setDate(quinta.getDate() + 3);
  const inicioAno = new Date(quinta.getFullYear(), 0, 1);
  const num = Math.ceil(((quinta - inicioAno) / 86400000 + 1) / 7);
  return `${quinta.getFullYear()}-W${String(num).padStart(2, "0")}`;
}
function dataLonga(s) {
  const d = deISO(s);
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
function dataCurta(s) {
  const d = deISO(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ---------------- recorrência ----------------
   Uma tarefa-mãe guarda a regra. As ocorrências são geradas sob demanda
   e viram tarefa de verdade assim que a Annie mexe nelas. */
function ocorreEm(tarefa, data) {
  const r = tarefa.repete;
  if (!r || r.tipo === "nenhuma") return tarefa.data === data;
  if (data < tarefa.data) return false;
  if (r.ate && data > r.ate) return false;
  const d = deISO(data), base = deISO(tarefa.data);
  const difDias = Math.round((d - base) / 86400000);
  switch (r.tipo) {
    case "diaria":  return true;
    case "semanal": return difDias % 7 === 0;
    case "dias":    return (r.dias || []).includes(d.getDay());
    case "mensal":  return d.getDate() === base.getDate();
    default: return false;
  }
}

function tarefasDoDia(data) {
  const diretas = estado.tarefas.filter(t => !t.repete || t.repete.tipo === "nenhuma").filter(t => t.data === data);
  const geradas = [];
  for (const mae of estado.tarefas.filter(t => t.repete && t.repete.tipo !== "nenhuma")) {
    if (!ocorreEm(mae, data)) continue;
    const jaExiste = estado.tarefas.some(t => t.maeId === mae.id && t.data === data);
    if (jaExiste) continue;
    geradas.push({ ...mae, id: `${mae.id}@${data}`, data, virtual: true, maeId: mae.id, feita: false, feitaEm: null });
  }
  const materializadas = estado.tarefas.filter(t => t.maeId && t.data === data);
  return [...diretas, ...materializadas, ...geradas]
    .sort((a, b) => (a.hora || "99:99").localeCompare(b.hora || "99:99"));
}

/** Transforma uma ocorrência virtual em tarefa de verdade antes de mexer nela. */
function materializar(t) {
  if (!t.virtual) return t;
  const nova = { ...t, id: id(), virtual: false, repete: { tipo: "nenhuma" } };
  estado.tarefas.push(nova);
  salvar();
  return nova;
}

function pendentesAnteriores(data) {
  return estado.tarefas
    .filter(t => !t.feita && t.data < data && (!t.repete || t.repete.tipo === "nenhuma"))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/* ---------------- tarefas ---------------- */
function novaTarefa(dados) {
  const t = {
    id: id(), titulo: dados.titulo.trim(), data: dados.data,
    hora: dados.hora || "", obs: dados.obs || "",
    categoriaId: dados.categoriaId || "", metaId: dados.metaId || "",
    prioridade: !!dados.prioridade, feita: false, feitaEm: null,
    repete: dados.repete || { tipo: "nenhuma" },
    maeId: dados.maeId || null, criadaEm: new Date().toISOString()
  };
  estado.tarefas.push(t); salvar(); return t;
}
function acharTarefa(tid) { return estado.tarefas.find(t => t.id === tid); }
function atualizarTarefa(tid, mudancas) {
  const t = acharTarefa(tid); if (!t) return null;
  Object.assign(t, mudancas); salvar(); return t;
}
function excluirTarefa(tid) {
  estado.tarefas = estado.tarefas.filter(t => t.id !== tid && t.maeId !== tid);
  salvar();
}
function alternarFeita(tid) {
  const t = acharTarefa(tid); if (!t) return null;
  t.feita = !t.feita;
  t.feitaEm = t.feita ? new Date().toISOString() : null;
  salvar(); return t;
}
function prioridadesDoDia(data) { return tarefasDoDia(data).filter(t => t.prioridade).length; }

/* ---------------- hábitos ---------------- */
function novoHabito(dados) {
  const h = {
    id: id(), nome: dados.nome.trim(),
    tipo: dados.tipo,              // "diario" | "semanal"
    alvo: Number(dados.alvo) || 3, // só para semanal
    pausado: false, marcas: [], criadoEm: new Date().toISOString()
  };
  estado.habitos.push(h); salvar(); return h;
}
function marcarHabito(hid, data) {
  const h = estado.habitos.find(x => x.id === hid); if (!h) return null;
  const i = h.marcas.indexOf(data);
  if (i >= 0) h.marcas.splice(i, 1); else h.marcas.push(data);
  salvar(); return h;
}
function sequencia(h, ate = hoje()) {
  let n = 0, d = ate;
  if (!h.marcas.includes(d)) d = somaDias(d, -1);
  while (h.marcas.includes(d)) { n++; d = somaDias(d, -1); }
  return n;
}
function melhorSequencia(h) {
  const m = [...h.marcas].sort();
  let melhor = 0, atual = 0, anterior = null;
  for (const d of m) {
    atual = (anterior && somaDias(anterior, 1) === d) ? atual + 1 : 1;
    melhor = Math.max(melhor, atual); anterior = d;
  }
  return melhor;
}
function naSemana(h, data = hoje()) {
  const ini = inicioSemana(data);
  return h.marcas.filter(d => d >= ini && d <= somaDias(ini, 6)).length;
}

/* ---------------- metas ---------------- */
function novaMeta(dados) {
  const m = {
    id: id(), titulo: dados.titulo.trim(), descricao: dados.descricao || "",
    prazo: dados.prazo || "", etapas: [], concluida: false, criadaEm: new Date().toISOString()
  };
  estado.metas.push(m); salvar(); return m;
}
function progressoMeta(m) {
  const vinculadas = estado.tarefas.filter(t => t.metaId === m.id);
  const total = m.etapas.length + vinculadas.length;
  if (total === 0) return m.concluida ? 100 : 0;
  const feitas = m.etapas.filter(e => e.feita).length + vinculadas.filter(t => t.feita).length;
  return Math.round((feitas / total) * 100);
}

/* ---------------- desafios ---------------- */
function novoDesafio(dados) {
  const d = {
    id: id(), titulo: dados.titulo.trim(), area: dados.area,
    dias: Number(dados.dias) || 7, inicio: dados.inicio || hoje(),
    marcas: [], concluido: false, criadoEm: new Date().toISOString()
  };
  estado.desafios.push(d); salvar(); return d;
}
function desafiosAtivos() { return estado.desafios.filter(d => !d.concluido); }
function marcarDesafio(did, data) {
  const d = estado.desafios.find(x => x.id === did); if (!d) return null;
  const i = d.marcas.indexOf(data);
  if (i >= 0) d.marcas.splice(i, 1); else d.marcas.push(data);
  if (d.marcas.length >= d.dias) d.concluido = true;
  salvar(); return d;
}

/* ---------------- categorias ---------------- */
function novaCategoria(nome, cor) {
  const c = { id: id(), nome: nome.trim(), cor: cor || corSugerida() };
  estado.categorias.push(c); salvar(); return c;
}
function corSugerida() {
  const usadas = estado.categorias.map(c => c.cor);
  return CORES.find(c => !usadas.includes(c)) || CORES[estado.categorias.length % CORES.length];
}
function excluirCategoria(cid) {
  estado.categorias = estado.categorias.filter(c => c.id !== cid);
  estado.tarefas.forEach(t => { if (t.categoriaId === cid) t.categoriaId = ""; });
  salvar();
}
function categoria(cid) { return estado.categorias.find(c => c.id === cid); }

/* ---------------- anotações, humor, reflexão ---------------- */
function anotacao(data, texto) {
  if (texto === undefined) return estado.anotacoes[data] || "";
  if (texto.trim()) estado.anotacoes[data] = texto; else delete estado.anotacoes[data];
  salvar();
}
function humor(data, valor) {
  if (valor === undefined) return estado.humores[data] || "";
  if (valor) estado.humores[data] = valor; else delete estado.humores[data];
  salvar();
}
function reflexao(semana, texto) {
  if (texto === undefined) return estado.reflexoes[semana] || "";
  if (texto.trim()) estado.reflexoes[semana] = texto; else delete estado.reflexoes[semana];
  salvar();
}

/* ---------------- busca ---------------- */
function buscar(termo, filtros = {}) {
  const q = termo.trim().toLowerCase();
  const res = [];
  const combina = (txt) => !q || (txt || "").toLowerCase().includes(q);

  for (const t of estado.tarefas) {
    if (!combina(t.titulo) && !combina(t.obs)) continue;
    if (filtros.categoriaId && t.categoriaId !== filtros.categoriaId) continue;
    if (filtros.status === "pendente" && t.feita) continue;
    if (filtros.status === "feita" && !t.feita) continue;
    if (filtros.status === "atrasada" && (t.feita || t.data >= hoje())) continue;
    if (filtros.de && t.data < filtros.de) continue;
    if (filtros.ate && t.data > filtros.ate) continue;
    res.push({ tipo: "tarefa", item: t, data: t.data });
  }
  for (const m of estado.metas) {
    if (combina(m.titulo) || combina(m.descricao)) res.push({ tipo: "meta", item: m, data: m.prazo || "" });
    for (const e of m.etapas) if (combina(e.titulo)) res.push({ tipo: "etapa", item: e, pai: m, data: m.prazo || "" });
  }
  for (const [data, txt] of Object.entries(estado.anotacoes)) {
    if (combina(txt)) res.push({ tipo: "anotacao", item: { data, texto: txt }, data });
  }
  return res.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}

/* ---------------- resumo da semana ---------------- */
function resumoSemana(data = hoje()) {
  const ini = inicioSemana(data);
  const dias = Array.from({ length: 7 }, (_, i) => somaDias(ini, i));
  let feitas = 0, pendentes = 0;
  const porDia = dias.map(d => {
    const ts = tarefasDoDia(d);
    const f = ts.filter(t => t.feita).length;
    feitas += f; pendentes += ts.length - f;
    return { data: d, feitas: f, pendentes: ts.length - f, total: ts.length };
  });
  const total = feitas + pendentes;
  const habitosCumpridos = estado.habitos.reduce((n, h) => n + naSemana(h, data), 0);
  const metasProximas = estado.metas.filter(m => !m.concluida && m.prazo && m.prazo <= somaDias(ini, 20));
  return { ini, dias, porDia, feitas, pendentes, total,
           percentual: total ? Math.round((feitas / total) * 100) : 0,
           habitosCumpridos, metasProximas, semana: semanaDe(data) };
}

window.Dados = {
  get estado() { return estado; },
  AREAS, CORES, DIAS, DIAS_CURTO, MESES,
  salvar, hoje, iso, deISO, somaDias, inicioSemana, semanaDe, dataLonga, dataCurta,
  tarefasDoDia, pendentesAnteriores, materializar, novaTarefa, acharTarefa,
  atualizarTarefa, excluirTarefa, alternarFeita, prioridadesDoDia,
  novoHabito, marcarHabito, sequencia, melhorSequencia, naSemana,
  novaMeta, progressoMeta,
  novoDesafio, desafiosAtivos, marcarDesafio,
  novaCategoria, corSugerida, excluirCategoria, categoria,
  anotacao, humor, reflexao, buscar, resumoSemana, id
};
