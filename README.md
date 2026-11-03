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
| `js/dados.js` | Armazenamento, modelo de dados, recorrência e cálculos |
| `js/arte.js` | Peças gráficas da biblioteca, em SVG |
| `js/agnes-arte.js` | A Agnes em seis expressões. Gerado, não editar à mão |
| `js/assessments.js` | Estrutura dos testes. É aqui que você preenche as perguntas |
| `js/app.js` | A interface e o comportamento |
| `sw.js` | Guarda o app para funcionar sem internet |

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

## Mudar o visual

Abra `css/tokens.css`. Cor, fonte, raio, espaçamento e tempos de animação estão todos lá,
nos dois temas. Trocar um valor muda o app inteiro.

As fontes são Annie Use Your Telescope, Sacramento e Quicksand, todas do Google Fonts
com licença SIL OFL.

## O que ficou de fora desta versão

Login, colaboração, inteligência artificial, integrações, notificações push e exportação de backup.
