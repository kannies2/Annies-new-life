/* Annie's New Life — camada de ilustrações da Agnes.

   Duas linguagens convivem, separadas por tamanho:
   abaixo de 64px vai o vetor plano (js/agnes-arte.js), de 80px para cima
   vai a ilustração. Aqui ficam só as ilustrações.

   O app não quebra quando um arquivo ainda não existe: pede-se a ilustração
   e, se ela não estiver na lista DISPONIVEIS, volta o vetor plano no lugar.
   Cada arquivo novo em assets/agnes/ acende um momento, sem mexer no código:
   basta acrescentar o nome aqui. */

const PASTA = "assets/agnes/";

/* Os arquivos que já chegaram. Vazio = tudo cai no vetor plano. */
const DISPONIVEIS = new Set([
  // "area-espiritualidade", "area-fisica", "area-mental", "area-profissional",
  // "area-bemestar", "area-jogos", "area-beleza", "area-autoestima",
  // "area-financas", "area-viagens",
  // "momento-tutorial", "momento-comemora", "momento-revisao",
  // "momento-trofeu", "momento-meta", "momento-lista", "momento-calendario",
  // "momento-atrasada",
  // "vazio-tarefas", "vazio-habitos", "vazio-desafios", "vazio-busca", "vazio-lixeira"
]);

/* De que vetor cada ilustração se vira enquanto o arquivo não chega. */
const RESERVA = {
  "area-espiritualidade": "acolhedora", "area-fisica": "feliz",
  "area-mental": "acolhedora", "area-profissional": "concentrada",
  "area-bemestar": "acolhedora", "area-jogos": "feliz",
  "area-beleza": "feliz", "area-autoestima": "acolhedora",
  "area-financas": "concentrada", "area-viagens": "surpresa",
  "momento-tutorial": "acolhedora", "momento-comemora": "acolhedora_laco",
  "momento-revisao": "acolhedora", "momento-trofeu": "acolhedora_laco",
  "momento-meta": "feliz_laco", "momento-lista": "concentrada",
  "momento-calendario": "concentrada", "momento-atrasada": "surpresa",
  "vazio-tarefas": "curiosa", "vazio-habitos": "feliz",
  "vazio-desafios": "curiosa", "vazio-busca": "ops", "vazio-lixeira": "curiosa"
};

const tem = (nome) => DISPONIVEIS.has(nome);
const url = (nome) => PASTA + nome + ".webp";

/** A ilustração do momento, ou o vetor plano enquanto ela não existe. */
function peca(nome, tam = 96, alt = "Agnes") {
  if (!tem(nome)) {
    const expr = RESERVA[nome] || "feliz";
    return window.Arte ? window.Arte.agnes(expr, tam) : "";
  }
  return `<img class="agnes-ilustra" src="${url(nome)}" width="${tam}" height="${tam}"
    alt="${alt}" loading="lazy" decoding="async">`;
}

window.Ilustra = { peca, tem, url, PASTA, DISPONIVEIS, RESERVA };
