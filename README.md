# Annie's New Life

Planner pessoal: tarefas, hábitos, metas e desafios de autocuidado.
Site estático, sem build, sem login e sem servidor. Os dados ficam no navegador.

## Abrir no computador

Clique duas vezes no `index.html`.

Para testar como app instalável, precisa de um servidor local, porque o service worker não roda em arquivo solto:

```
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Publicar no GitHub Pages

1. Suba estes arquivos para o repositório, na raiz.
2. No GitHub, vá em Settings, Pages.
3. Em Source, escolha Deploy from a branch, branch `main`, pasta `/ (root)`.
4. Salve. Em alguns minutos o endereço aparece ali.

O arquivo `.nojekyll` já está incluído e evita que o GitHub ignore pastas.

## Instalar no celular

Abra o endereço no Safari, toque em compartilhar e depois em "Adicionar à Tela de Início".
O ícone é a Agnes. Depois de instalado, funciona sem internet.

## Onde ficam os dados

Tudo no `localStorage` deste navegador, na chave `annies-new-life/v1`.
Não sai do aparelho e não tem cópia em servidor. Se você limpar os dados do navegador, se perde.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | A estrutura das telas |
| `css/tokens.css` | Toda a paleta, tipografia, raio e espaçamento. Mexa aqui para mudar o visual |
| `css/style.css` | Os estilos. Nenhuma cor solta, só variáveis |
| `js/dados.js` | Armazenamento, modelo de dados, recorrência, cálculos, áreas e troféus |
| `js/biblioteca.js` | Os desafios e metas sugeridos de cada área |
| `js/arte.js` | Peças gráficas da biblioteca, em SVG |
| `js/agnes-arte.js` | A Agnes em seis expressões. Gerado, não editar à mão |
| `js/assessments.js` | Estrutura dos testes. É aqui que você preenche as perguntas |
| `js/som.js` | Efeitos sonoros e musiquinha, sintetizados pelo navegador |
| `js/app.js` | A interface e o comportamento |
| `sw.js` | Guarda o app para funcionar sem internet |

## Gestos e movimento

Arrastar a tarefa para a direita conclui, para a esquerda adia um dia. O gesto tem
resistência depois do limiar e vale também num movimento rápido e curto, pela inércia.
Um movimento mais vertical que horizontal é entendido como rolagem e não vira arrasto.

No quadro da Semana, arrastar o cartão muda a coluna; pelo teclado as setas fazem o mesmo.

As animações seguem o guia de efeitos: mola, reorganização de layout (FLIP), transição de
elemento compartilhado, entrada em sequência, entrada e saída coordenadas, animação por
rolagem, vidro fosco, números animados, texto por letras, revelação por máscara, parallax,
gradiente orgânico, textura de papel e SVG desenhando. Tudo em CSS e Web Animations, sem
nenhuma biblioteca. Shaders, 3D e partículas ficaram de fora de propósito: quebrariam o
funcionamento offline e pesariam no celular.

Tudo respeita `prefers-reduced-motion`.

## Lixeira

O que é apagado vai para `estado.lixeira` e fica trinta dias antes de sumir sozinho.
Cada exclusão mostra um aviso com Desfazer. A tela fica em Ajustes.

## As dez áreas

Espiritualidade, saúde física, saúde mental, desenvolvimento profissional, bem-estar,
jogos e diversão, beleza e autocuidado, autoestima, finanças pessoais, viagens e experiências.

Cada uma tem cor, ícone próprio e sugestões prontas em `js/biblioteca.js`:
dois desafios e duas metas, com as etapas já escritas. Para mexer, edite esse arquivo.

Desafio é curto, tem começo e fim, e você marca todo dia. Meta é de médio ou longo prazo,
tem etapas e prazo. O limite de dois desafios ativos é de propósito.

## Troféus

As regras ficam na lista `SELOS` em `js/dados.js`. Cada uma é uma função que olha os dados;
quando passa pela primeira vez, a data é guardada e o selo não sai mais. Não há nada a marcar
à mão. Para criar um troféu novo, acrescente um item na lista com `regra`, `forma` e `cor`.

## Como ativar os assessments

As perguntas dos instrumentos são protegidas por direito autoral e vários exigem registro
com os autores. Por isso elas não vêm escritas aqui.

Para cada teste, em `js/assessments.js`:

1. Faça o registro, quando o autor pedir. O link está no campo `fonte`.
2. Copie as perguntas da fonte oficial, nunca de blog ou PDF solto.
3. Cole cada uma na lista `itens`.
4. Troque `pronto: false` por `pronto: true`.

| Teste | Registro | Licença |
| --- | --- | --- |
| WHO-5 | não precisa | gratuito, sem necessidade de permissão |
| PERMA-Profiler | precisa | gratuito para uso não comercial, com créditos |
| Autocompaixão (SCS-SF) | não precisa | permissão ampla da autora |
| Experiências espirituais (DSES) | precisa | gratuito para uso sem fins lucrativos |
| Atividade física (IPAQ curto) | não precisa | uso encorajado |
| Adaptabilidade de carreira (CAAS) | precisa | acesso gratuito pelo Vocopher |

Nenhuma pontuação é diagnóstico. O app já mostra isso na tela de resultado.

Beleza não tem instrumento validado equivalente, então essa área fica só com desafio e rotina.

## Som

Não existe arquivo de áudio no projeto. Os efeitos e a musiquinha são gerados
pelo próprio navegador com a Web Audio API, em `js/som.js`. Isso mantém o app
leve, offline e sem nenhuma questão de licença.

Os dois interruptores ficam em Ajustes, na engrenagem do topo, e a escolha fica salva.
O navegador só libera som depois do primeiro toque na tela, então a musiquinha
começa quando você interage com o app.

Para trocar a musiquinha por uma música sua, veja `musicaLigar` em `js/som.js`.
Use só música que você tenha direito de usar.

## Mudar o visual

Abra `css/tokens.css`. Cor, fonte, raio, espaçamento e tempos de animação estão todos lá,
nos dois temas. Trocar um valor muda o app inteiro.

As fontes são Annie Use Your Telescope, Sacramento e Quicksand, todas do Google Fonts
com licença SIL OFL.

## Atualização

O service worker busca o código na internet primeiro e só usa o cache quando a rede falha,
então uma versão nova chega sozinha. Fontes e ícones continuam vindo do cache.
Ao publicar uma versão, troque `VERSAO` em `sw.js` e `VERSAO_APP` em `js/app.js`.
O número aparece no rodapé do app.

## O que ficou de fora desta versão

Login, colaboração, inteligência artificial, integrações, notificações push e exportação de backup.
