/* Annie's New Life — biblioteca de desafios e metas, por área.
   Desafio: curto, tem começo e fim, progresso diário.
   Meta: médio ou longo prazo, tem prazo e etapas. */

const BIBLIOTECA = {
  espiritualidade: {
    desafios: [
      { titulo: "Ler a Bíblia todo dia", dias: 7 },
      { titulo: "Cinco minutos de oração pela manhã", dias: 7 }
    ],
    metas: [
      { titulo: "Concluir um plano de leitura bíblica",
        etapas: ["Escolher o plano", "Separar o horário do dia", "Primeira semana em dia", "Metade do plano", "Última leitura"] },
      { titulo: "Desenvolver uma rotina de devocional",
        etapas: ["Definir hora e lugar", "Montar o material", "Duas semanas seguidas", "Um mês seguido"] }
    ]
  },
  fisica: {
    desafios: [
      { titulo: "Caminhar 30 minutos, 4 vezes na semana", dias: 7 },
      { titulo: "Experimentar uma atividade física nova", dias: 5 }
    ],
    metas: [
      { titulo: "Estabelecer uma rotina de exercícios",
        etapas: ["Escolher a atividade", "Definir os dias da semana", "Primeiro mês completo", "Três meses seguidos"] },
      { titulo: "Melhorar a resistência física",
        etapas: ["Medir o ponto de partida", "Aumentar o tempo em 25%", "Aumentar em 50%", "Dobrar o tempo inicial"] }
    ]
  },
  mental: {
    desafios: [
      { titulo: "Uma semana sem celular na primeira hora do dia", dias: 7 },
      { titulo: "Escrever três páginas de diário por semana", dias: 7 }
    ],
    metas: [
      { titulo: "Desenvolver uma rotina de descanso",
        etapas: ["Mapear o que cansa", "Reservar uma pausa por dia", "Uma tarde livre por semana", "Um mês mantendo"] },
      { titulo: "Concluir um processo de autoconhecimento",
        etapas: ["Escolher o caminho", "Primeiras quatro sessões ou capítulos", "Metade", "Fechar e anotar o que mudou"] }
    ]
  },
  profissional: {
    desafios: [
      { titulo: "Estudar uma hora por dia", dias: 7 },
      { titulo: "Concluir um curso curto", dias: 10 }
    ],
    metas: [
      { titulo: "Aprender uma nova habilidade",
        etapas: ["Escolher a habilidade", "Achar o material", "Primeira prática de verdade", "Um projeto pronto"] },
      { titulo: "Conquistar uma certificação profissional",
        etapas: ["Escolher a certificação", "Montar o cronograma", "Terminar o conteúdo", "Fazer simulados", "Marcar a prova"] }
    ]
  },
  bemestar: {
    desafios: [
      { titulo: "Dormir antes das 23h", dias: 7 },
      { titulo: "Reservar uma noite para mim", dias: 5 }
    ],
    metas: [
      { titulo: "Estabelecer uma rotina de sono",
        etapas: ["Definir a hora de dormir", "Montar o ritual da noite", "Duas semanas seguidas", "Um mês seguido"] },
      { titulo: "Organizar uma rotina mais equilibrada",
        etapas: ["Olhar como a semana está hoje", "Cortar o que não cabe", "Marcar o descanso na agenda", "Um mês rodando"] }
    ]
  },
  jogos: {
    desafios: [
      { titulo: "Experimentar três jogos novos", dias: 7 },
      { titulo: "Completar um jogo de raciocínio", dias: 7 }
    ],
    metas: [
      { titulo: "Concluir um jogo que está na lista",
        etapas: ["Escolher qual", "Começar", "Metade da história", "Final"] },
      { titulo: "Desenvolver uma habilidade em um jogo",
        etapas: ["Escolher o que treinar", "Treinar quatro vezes", "Sentir diferença", "Chegar no objetivo"] }
    ]
  },
  beleza: {
    desafios: [
      { titulo: "Rotina completa de skincare", dias: 14 },
      { titulo: "Ritual semanal de autocuidado", dias: 7 }
    ],
    metas: [
      { titulo: "Montar uma rotina de cuidados com a pele",
        etapas: ["Descobrir o tipo de pele", "Escolher os produtos", "Um mês de manhã e noite", "Rever o que funcionou"] },
      { titulo: "Organizar um cronograma capilar",
        etapas: ["Avaliar o cabelo", "Montar o calendário", "Primeiro ciclo completo", "Segundo ciclo"] }
    ]
  },
  autoestima: {
    desafios: [
      { titulo: "Registrar uma qualidade minha por dia", dias: 7 },
      { titulo: "Fazer algo novo sozinha", dias: 5 }
    ],
    metas: [
      { titulo: "Desenvolver mais autoconfiança",
        etapas: ["Anotar o que me trava", "Fazer uma coisa que dá medo", "Repetir mais três vezes", "Olhar o quanto mudou"] },
      { titulo: "Estabelecer limites pessoais saudáveis",
        etapas: ["Listar o que me pesa", "Escrever o que quero dizer", "Dizer um não", "Manter por um mês"] }
    ]
  },
  financas: {
    desafios: [
      { titulo: "Registrar todos os gastos", dias: 7 },
      { titulo: "Uma semana sem compras não planejadas", dias: 7 }
    ],
    metas: [
      { titulo: "Montar uma reserva de emergência",
        etapas: ["Definir o valor", "Escolher onde guardar", "Primeiro depósito", "Metade do valor", "Valor completo"] },
      { titulo: "Economizar um valor até uma data",
        etapas: ["Definir valor e prazo", "Cortar um gasto fixo", "Metade guardada", "Valor na conta"] }
    ]
  },
  viagens: {
    desafios: [
      { titulo: "Conhecer um lugar novo na própria cidade", dias: 5 },
      { titulo: "Visitar um museu ou exposição", dias: 5 }
    ],
    metas: [
      { titulo: "Planejar uma viagem internacional",
        etapas: ["Escolher o destino", "Conferir documentos", "Montar o orçamento", "Comprar a passagem", "Fechar a hospedagem", "Montar o roteiro"] },
      { titulo: "Conhecer um destino até o fim do ano",
        etapas: ["Escolher o lugar", "Marcar a data", "Reservar", "Fazer a mala"] }
    ]
  }
};

window.Biblioteca = {
  BIBLIOTECA,
  desafiosDe: (area) => (BIBLIOTECA[area] || {}).desafios || [],
  metasDe: (area) => (BIBLIOTECA[area] || {}).metas || [],
  /** acha uma sugestão pelo índice, para criar com um toque */
  pegar: (area, tipo, i) => ((BIBLIOTECA[area] || {})[tipo === "desafio" ? "desafios" : "metas"] || [])[i] || null
};
