/* Annie's New Life — armazenamento e modelo de dados.
   Tudo vive no localStorage deste navegador. */

const CHAVE = "annies-new-life/v1";

const AREAS = [
  { id: "espiritualidade", nome: "Espiritualidade", cor: "lilas",
    sobre: "Fé, conexão com Deus, oração e propósito." },
  { id: "fisica", nome: "Saúde física", cor: "menta",
    sobre: "Movimento, disposição, alimentação e cuidados com o corpo." },
  { id: "mental", nome: "Saúde mental", cor: "periwinkle",
    sobre: "Equilíbrio emocional, concentração e autoconhecimento." },
  { id: "profissional", nome: "Desenvolvimento profissional", cor: "pessego",
    sobre: "Conhecimento, carreira, habilidades e crescimento intelectual." },
  { id: "bemestar", nome: "Bem-estar", cor: "manteiga",
    sobre: "Qualidade de vida, descanso, lazer e equilíbrio cotidiano." },
  { id: "jogos", nome: "Jogos e diversão", cor: "rosa",
    sobre: "Jogos, entretenimento, criatividade e experiências divertidas." },
  { id: "beleza", nome: "Beleza e autocuidado", cor: "rosa",
    sobre: "Cuidados pessoais, aparência, pele, cabelo e apresentação." },
  { id: "autoestima", nome: "Autoestima", cor: "lilas",
    sobre: "Autoconfiança, identidade, limites e valorização pessoal." },
  { id: "financas", nome: "Finanças pessoais", cor: "menta",
    sobre: "Organização financeira, economia, planejamento e patrimônio." },
  { id: "viagens", nome: "Viagens e experiências", cor: "periwinkle",
    sobre: "Turismo, descobertas, cultura e novas experiências." }
];

/* nomes antigos das áreas, para não perder o que já estava guardado */
const AREAS_ANTIGAS = { espiritual: "espiritualidade", carreira: "profissional" };

const CORES = ["rosa", "lilas", "menta", "manteiga", "pessego", "periwinkle"];

const VAZIO = {
  versao: 1,
  nome: "Annie",           // quem está usando
  tema: null,              // null = segue o sistema
  som: true,               // efeitos sonoros
  musica: false,           // musiquinha de fundo
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
  humores: {},             // "2026-11-02": { v, em, nota }
  assessments: [],         // resultados salvos
  selos: {},               // "primeiro-passo": "2026-11-03"
  tutorialVisto: false,
  lixeira: [],             // o que foi apagado, guardado por 30 dias
  ultimoDia: ""            // último dia em que o app foi aberto
};

let estado = carregar();

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return structuredClone(VAZIO);
    const dados = JSON.parse(bruto);
    const pronto = Object.assign(structuredClone(VAZIO), dados);
    // as áreas foram renomeadas; o que já existia continua valendo
    (pronto.desafios || []).forEach(d => { if (AREAS_ANTIGAS[d.area]) d.area = AREAS_ANTIGAS[d.area]; });
    (pronto.assessments || []).forEach(a => { if (AREAS_ANTIGAS[a.area]) a.area = AREAS_ANTIGAS[a.area]; });
    return pronto;
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
    passos: Array.isArray(dados.passos) ? dados.passos : [],
    maeId: dados.maeId || null, criadaEm: new Date().toISOString()
  };
  estado.tarefas.push(t); salvar(); return t;
}

/* ---------------- colunas do quadro ----------------
   A tarefa está em uma de três colunas, deduzidas do que ela já guarda. */
const COLUNAS = [
  { id: "afazer", nome: "A fazer", cor: "rosa" },
  { id: "fazendo", nome: "Fazendo", cor: "manteiga" },
  { id: "feito", nome: "Feito", cor: "menta" }
];
function colunaDe(t) { return t.feita ? "feito" : (t.andamento ? "fazendo" : "afazer"); }
function moverParaColuna(tid, coluna) {
  const t = acharTarefa(tid); if (!t) return null;
  if (coluna === "feito") { t.feita = true; t.feitaEm = t.feitaEm || new Date().toISOString(); t.andamento = false; }
  else if (coluna === "fazendo") { t.feita = false; t.feitaEm = null; t.andamento = true; }
  else { t.feita = false; t.feitaEm = null; t.andamento = false; }
  salvar(); return t;
}

/* ---------------- subtarefas ---------------- */
function passos(t) { return Array.isArray(t && t.passos) ? t.passos : []; }
function novoPasso(tid, titulo) {
  const t = acharTarefa(tid); if (!t || !titulo.trim()) return null;
  if (!Array.isArray(t.passos)) t.passos = [];
  const p = { id: id(), titulo: titulo.trim().slice(0, 120), feito: false };
  t.passos.push(p); salvar(); return p;
}
function alternarPasso(tid, pid) {
  const t = acharTarefa(tid); if (!t) return null;
  const p = passos(t).find(x => x.id === pid); if (!p) return null;
  p.feito = !p.feito;
  // com todos os passos feitos, a tarefa se dá por concluída
  if (passos(t).length && passos(t).every(x => x.feito) && !t.feita) {
    t.feita = true; t.feitaEm = new Date().toISOString();
  } else if (t.feita && !p.feito) {
    t.feita = false; t.feitaEm = null;
  }
  salvar(); return t;
}
function excluirPasso(tid, pid) {
  const t = acharTarefa(tid); if (!t) return;
  t.passos = passos(t).filter(x => x.id !== pid); salvar();
}
/** quantos passos já foram feitos */
function progressoPassos(t) {
  const ps = passos(t);
  return { feitos: ps.filter(p => p.feito).length, total: ps.length };
}
function acharTarefa(tid) { return estado.tarefas.find(t => t.id === tid); }
function atualizarTarefa(tid, mudancas) {
  const t = acharTarefa(tid); if (!t) return null;
  Object.assign(t, mudancas); salvar(); return t;
}
function excluirTarefa(tid) {
  const vao = estado.tarefas.filter(t => t.id === tid || t.maeId === tid);
  if (vao.length) paraLixeira("tarefa", vao, vao[0].titulo);
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
  const c = estado.categorias.find(x => x.id === cid);
  if (c) paraLixeira("categoria", [c], c.nome);
  estado.categorias = estado.categorias.filter(c => c.id !== cid);
  estado.tarefas.forEach(t => { if (t.categoriaId === cid) t.categoriaId = ""; });
  salvar();
}

/* ---------------- lixeira ----------------
   Nada é apagado de vez na hora. Fica guardado por 30 dias. */
const GUARDA_DIAS = 30;
const LISTAS = { tarefa: "tarefas", habito: "habitos", meta: "metas", desafio: "desafios", categoria: "categorias" };

function paraLixeira(tipo, itens, rotulo) {
  if (!itens || !itens.length) return null;
  const reg = {
    id: id(), tipo, rotulo: (rotulo || "").slice(0, 120),
    itens: structuredClone(itens), em: new Date().toISOString()
  };
  estado.lixeira.unshift(reg);
  limparLixeiraVelha();
  return reg;
}
function limparLixeiraVelha() {
  const limite = Date.now() - GUARDA_DIAS * 86400000;
  estado.lixeira = estado.lixeira.filter(r => new Date(r.em).getTime() > limite);
}
function restaurar(rid) {
  const i = estado.lixeira.findIndex(r => r.id === rid);
  if (i < 0) return null;
  const reg = estado.lixeira[i];
  const lista = LISTAS[reg.tipo];
  if (!lista) return null;
  reg.itens.forEach(item => {
    if (!estado[lista].some(x => x.id === item.id)) estado[lista].push(item);
  });
  estado.lixeira.splice(i, 1);
  salvar();
  return reg;
}
function apagarDeVez(rid) {
  estado.lixeira = estado.lixeira.filter(r => r.id !== rid);
  salvar();
}
function esvaziarLixeira() { estado.lixeira = []; salvar(); }
function categoria(cid) { return estado.categorias.find(c => c.id === cid); }

/* ---------------- anotações, humor, reflexão ---------------- */
function anotacao(data, texto) {
  if (texto === undefined) return estado.anotacoes[data] || "";
  if (texto.trim()) estado.anotacoes[data] = texto; else delete estado.anotacoes[data];
  salvar();
}
/* O humor é guardado como { v, em, nota }. Versões antigas guardavam só o texto,
   então a leitura aceita os dois formatos. */
function humorRegistro(data) {
  const bruto = estado.humores[data];
  if (!bruto) return null;
  if (typeof bruto === "string") return { v: bruto, em: "", nota: "" };
  return { v: bruto.v || "", em: bruto.em || "", nota: bruto.nota || "" };
}
function humor(data, valor) {
  const atual = humorRegistro(data);
  if (valor === undefined) return atual ? atual.v : "";
  if (valor) {
    const agora = new Date();
    estado.humores[data] = {
      v: valor,
      em: `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`,
      nota: atual ? atual.nota : ""
    };
  } else delete estado.humores[data];
  salvar();
  return valor;
}
function humorNota(data, texto) {
  const atual = humorRegistro(data);
  if (texto === undefined) return atual ? atual.nota : "";
  if (!atual) return "";
  atual.nota = texto.slice(0, 200);
  estado.humores[data] = atual;
  salvar();
  return atual.nota;
}
/** os últimos n dias, do mais antigo ao mais novo */
function humorSerie(ate = hoje(), n = 30) {
  const fim = deISO(ate);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(fim);
    d.setDate(d.getDate() - (n - 1 - i));
    const data = iso(d);
    return { data, ...(humorRegistro(data) || { v: "", em: "", nota: "" }) };
  });
}
/** quantas vezes cada humor apareceu no período */
function humorContagem(serie) {
  const c = {};
  serie.forEach(d => { if (d.v) c[d.v] = (c[d.v] || 0) + 1; });
  return c;
}
/** quantos dias seguidos, até a data, têm humor registrado */
function humorSequencia(ate = hoje()) {
  let n = 0, d = ate;
  while (humorRegistro(d)) { n++; d = somaDias(d, -1); }
  return n;
}
function reflexao(semana, texto) {
  if (texto === undefined) return estado.reflexoes[semana] || "";
  if (texto.trim()) estado.reflexoes[semana] = texto; else delete estado.reflexoes[semana];
  salvar();
}

/* ---------------- selos ----------------
   Cada selo tem uma regra que olha os dados. Quando a regra passa pela
   primeira vez, a data fica guardada e o selo nunca mais sai. */
const SELOS = [
  { id: "primeiro-passo", nome: "Primeiro passo", sub: "1ª", cor: "rosa", forma: "estrela",
    comoGanha: "Concluir a primeira tarefa.",
    regra: () => estado.tarefas.some(t => t.feita) },
  { id: "dia-limpo", nome: "Dia redondo", sub: "DIA", cor: "oliva", forma: "selo",
    comoGanha: "Terminar um dia com todas as tarefas concluídas.",
    regra: () => {
      const dias = [...new Set(estado.tarefas.filter(t => t.data).map(t => t.data))];
      return dias.some(d => { const ts = tarefasDoDia(d); return ts.length >= 2 && ts.every(t => t.feita); });
    } },
  { id: "dez-tarefas", nome: "Dez de dez", sub: "10", cor: "manteiga", forma: "selo",
    comoGanha: "Concluir dez tarefas.",
    regra: () => estado.tarefas.filter(t => t.feita).length >= 10 },
  { id: "cinquenta-tarefas", nome: "Meia centena", sub: "50", cor: "pessego", forma: "selo",
    comoGanha: "Concluir cinquenta tarefas.",
    regra: () => estado.tarefas.filter(t => t.feita).length >= 50 },
  { id: "semana-de-habito", nome: "Sete seguidos", sub: "7", cor: "menta", forma: "corrente",
    comoGanha: "Manter um hábito por sete dias seguidos.",
    regra: () => estado.habitos.some(h => melhorSequencia(h) >= 7) },
  { id: "mes-de-habito", nome: "Mês inteiro", sub: "30", cor: "periwinkle", forma: "corrente",
    comoGanha: "Manter um hábito por trinta dias seguidos.",
    regra: () => estado.habitos.some(h => melhorSequencia(h) >= 30) },
  { id: "primeiro-desafio", nome: "Desafio vencido", sub: "✓", cor: "lilas", forma: "medalha",
    comoGanha: "Concluir o primeiro desafio.",
    regra: () => estado.desafios.some(d => d.concluido) },
  { id: "cinco-desafios", nome: "Colecionadora", sub: "5", cor: "rosa", forma: "medalha",
    comoGanha: "Concluir cinco desafios.",
    regra: () => estado.desafios.filter(d => d.concluido).length >= 5 },
  { id: "areas-tres", nome: "Vida em três", sub: "3", cor: "manteiga", forma: "flor",
    comoGanha: "Concluir desafios em três áreas diferentes.",
    regra: () => new Set(estado.desafios.filter(d => d.concluido).map(d => d.area)).size >= 3 },
  { id: "areas-seis", nome: "Vida inteira", sub: "6", cor: "lilas", forma: "flor",
    comoGanha: "Concluir desafios em seis áreas diferentes.",
    regra: () => new Set(estado.desafios.filter(d => d.concluido).map(d => d.area)).size >= 6 },
  { id: "primeira-meta", nome: "Meta cumprida", sub: "META", cor: "oliva", forma: "medalha",
    comoGanha: "Concluir a primeira meta.",
    regra: () => estado.metas.some(m => m.concluida) },
  { id: "cinco-metas", nome: "Realizadora", sub: "5", cor: "pessego", forma: "medalha",
    comoGanha: "Concluir cinco metas.",
    regra: () => estado.metas.filter(m => m.concluida).length >= 5 },
  { id: "humor-sete", nome: "Me escutando", sub: "7", cor: "periwinkle", forma: "carinha",
    comoGanha: "Registrar o humor por sete dias seguidos.",
    regra: () => humorSequencia(hoje()) >= 7 || humorSequencia(somaDias(hoje(), -1)) >= 7 },
  { id: "humor-trinta", nome: "Mês de escuta", sub: "30", cor: "rosa", forma: "carinha",
    comoGanha: "Registrar o humor por trinta dias seguidos.",
    regra: () => humorSequencia(hoje()) >= 30 || humorSequencia(somaDias(hoje(), -1)) >= 30 },
  { id: "reflexao", nome: "Olhar pra trás", sub: "4", cor: "menta", forma: "estrela",
    comoGanha: "Escrever a reflexão de quatro semanas.",
    regra: () => Object.values(estado.reflexoes).filter(t => (t || "").trim().length > 20).length >= 4 }
];

/** confere as regras e devolve os selos ganhos agora */
function conferirSelos() {
  const novos = [];
  for (const s of SELOS) {
    if (estado.selos[s.id]) continue;
    let passou = false;
    try { passou = !!s.regra(); } catch (e) { passou = false; }
    if (passou) { estado.selos[s.id] = hoje(); novos.push(s); }
  }
  if (novos.length) salvar();
  return novos;
}
function selosGanhos() { return SELOS.filter(s => estado.selos[s.id]); }

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
  passos, novoPasso, alternarPasso, excluirPasso, progressoPassos,
  COLUNAS, colunaDe, moverParaColuna,
  paraLixeira, restaurar, apagarDeVez, esvaziarLixeira, limparLixeiraVelha,
  novoHabito, marcarHabito, sequencia, melhorSequencia, naSemana,
  novaMeta, progressoMeta,
  novoDesafio, desafiosAtivos, marcarDesafio,
  novaCategoria, corSugerida, excluirCategoria, categoria,
  anotacao, humor, humorRegistro, humorNota, humorSerie, humorContagem, humorSequencia,
  reflexao, buscar, resumoSemana, id,
  SELOS, conferirSelos, selosGanhos,
  area: (aid) => AREAS.find(a => a.id === aid),
  nome: (novo) => { if (novo === undefined) return estado.nome || ""; estado.nome = novo.trim().slice(0, 40); salvar(); return estado.nome; }
};
