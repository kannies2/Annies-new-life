/* Annie's New Life — estrutura dos assessments.
   =================================================================
   LEIA ANTES DE PREENCHER

   As perguntas de cada instrumento são protegidas por direito autoral
   e vários exigem registro com os autores antes do uso. Por isso elas
   NÃO vêm escritas aqui.

   Para ativar um teste:
   1. Faça o registro no site oficial, quando o autor pedir.
   2. Copie as perguntas da fonte oficial, nunca de blog ou PDF solto.
   3. Cole cada pergunta na lista "itens" do instrumento.
   4. Troque "pronto: false" por "pronto: true".

   Nenhuma pontuação é diagnóstico. O app sempre mostra isso na tela
   de resultado.
   ================================================================= */

const ASSESSMENTS = [
  {
    id: "who5",
    nome: "WHO-5",
    subtitulo: "Bem-estar das duas últimas semanas",
    area: "mental",
    quantos: 5,
    escala: ["Nunca", "De vez em quando", "Menos da metade do tempo",
             "Mais da metade do tempo", "Quase sempre", "O tempo todo"],
    // 0 a 5 por item, soma de 0 a 25, multiplicada por 4 = 0 a 100
    pontuar: (r) => r.reduce((a, b) => a + b, 0) * 4,
    maximo: 100,
    faixas: [
      { ate: 50, rotulo: "Vale olhar com carinho",
        texto: "Pontuação igual ou abaixo de 50 é um sinal para investigar melhor com um profissional. Não é diagnóstico.",
        sugereDesafio: true },
      { ate: 100, rotulo: "Bem por aqui",
        texto: "Seu bem-estar nas duas últimas semanas aparece em boa faixa." }
    ],
    licenca: "Gratuito, sem necessidade de permissão.",
    fonte: "https://www.corc.uk.net/outcome-experience-measures/the-world-health-organisation-five-well-being-index-who-5",
    registro: false,
    pronto: false,
    itens: [
      // "", "", "", "", ""
    ]
  },
  {
    id: "perma",
    nome: "PERMA-Profiler",
    subtitulo: "Bem-estar em cinco pilares",
    area: "bemestar",
    quantos: 23,
    escala: Array.from({ length: 11 }, (_, i) => String(i)),
    pontuar: (r) => Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10),
    maximo: 100,
    faixas: [
      { ate: 60, rotulo: "Tem espaço para crescer", sugereDesafio: true,
        texto: "Olhe qual pilar puxou a média para baixo e comece por ele." },
      { ate: 100, rotulo: "Florescendo", texto: "Seus pilares aparecem equilibrados." }
    ],
    licenca: "Gratuito para uso não comercial, com créditos e registro prévio.",
    fonte: "https://ppc.sas.upenn.edu/node/375",
    registro: true,
    pronto: false,
    itens: []
  },
  {
    id: "scs",
    nome: "Autocompaixão",
    subtitulo: "Como você se trata nos dias difíceis",
    area: "mental",
    quantos: 12,
    escala: ["Quase nunca", "Raramente", "Às vezes", "Com frequência", "Quase sempre"],
    pontuar: (r) => Math.round((r.reduce((a, b) => a + b, 0) / (r.length * 4)) * 100),
    maximo: 100,
    faixas: [
      { ate: 55, rotulo: "Você se cobra bastante", sugereDesafio: true,
        texto: "Um desafio curto de autocuidado costuma ajudar mais que uma meta grande." },
      { ate: 100, rotulo: "Você se trata bem", texto: "Boa base de autocompaixão." }
    ],
    licenca: "Permissão ampla da autora, Kristin Neff.",
    fonte: "https://self-compassion.org/wp-content/uploads/2021/03/SCS-SF-information.pdf",
    registro: false,
    pronto: false,
    itens: []
  },
  {
    id: "dses",
    nome: "Experiências espirituais",
    subtitulo: "Conexão no dia a dia",
    area: "espiritual",
    quantos: 16,
    escala: ["Nunca", "Às vezes", "Em alguns dias", "Na maioria dos dias", "Todo dia", "Várias vezes ao dia"],
    pontuar: (r) => Math.round((r.reduce((a, b) => a + b, 0) / (r.length * 5)) * 100),
    maximo: 100,
    faixas: [
      { ate: 50, rotulo: "Pouca conexão ultimamente", sugereDesafio: true,
        texto: "Cinco minutos por dia de silêncio ou gratidão já mexem nesse número." },
      { ate: 100, rotulo: "Conexão presente", texto: "Você tem encontrado esses momentos." }
    ],
    licenca: "Gratuito para uso sem fins lucrativos, com registro prévio.",
    fonte: "https://www.dsescale.org/",
    registro: true,
    pronto: false,
    itens: []
  },
  {
    id: "ipaq",
    nome: "Atividade física",
    subtitulo: "Últimos sete dias",
    area: "fisica",
    quantos: 4,
    escala: null, // respostas em minutos, não em escala
    tipo: "minutos",
    pontuar: (r) => r.reduce((a, b) => a + b, 0),
    maximo: 600,
    faixas: [
      { ate: 149, rotulo: "Abaixo do recomendado", sugereDesafio: true,
        texto: "A recomendação geral é de pelo menos 150 minutos por semana de atividade moderada." },
      { ate: 10000, rotulo: "Dentro do recomendado", texto: "Você bateu os 150 minutos da semana." }
    ],
    licenca: "Uso encorajado. Versão curta, validada no Brasil.",
    fonte: "https://sites.google.com/view/ipaq",
    registro: false,
    pronto: false,
    observacao: "A versão curta superestima a inatividade. Serve como termômetro, não como medida fina.",
    itens: []
  },
  {
    id: "caas",
    nome: "Adaptabilidade de carreira",
    subtitulo: "Preocupação, controle, curiosidade e confiança",
    area: "carreira",
    quantos: 12,
    escala: ["Pouco forte", "Mais ou menos forte", "Forte", "Muito forte", "A mais forte"],
    pontuar: (r) => Math.round((r.reduce((a, b) => a + b, 0) / (r.length * 4)) * 100),
    maximo: 100,
    faixas: [
      { ate: 60, rotulo: "Dá para fortalecer", sugereDesafio: true,
        texto: "Escolha um dos quatro recursos e trabalhe nele por algumas semanas." },
      { ate: 100, rotulo: "Bem adaptável", texto: "Você se move bem nas mudanças de carreira." }
    ],
    licenca: "Acesso gratuito pelo Vocopher.",
    fonte: "https://www.vocopher.com/",
    registro: true,
    pronto: false,
    itens: []
  }
];

/* Beleza não tem instrumento validado equivalente.
   Essa área fica só com desafio e rotina, de propósito. */

const DESAFIO_SUGERIDO = {
  mental:     { titulo: "Uma semana sem celular na primeira hora do dia", dias: 7 },
  bemestar:   { titulo: "Dormir antes das onze", dias: 10 },
  espiritual: { titulo: "Cinco minutos de silêncio ou gratidão", dias: 7 },
  fisica:     { titulo: "Caminhar trinta minutos", dias: 14 },
  carreira:   { titulo: "Estudar uma hora por dia", dias: 7 },
  beleza:     { titulo: "Rotina de pele completa", dias: 14 }
};

window.Assessments = { ASSESSMENTS, DESAFIO_SUGERIDO };
