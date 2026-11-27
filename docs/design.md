# Sistema de design

O site é **uma interface de dev com duas janelas para a noite**: escura, uma fonte mono, um
destaque, linhas de 1px; no hero um castelo medieval e no fechamento uma vela acesa, ambos em ASCII
quase realista. O castelo é a peça-assinatura e a vela fecha a página; o resto é tipografia e
grade, no espírito de sites como hackbrasil.com e abacatepay.com: uma ideia por bloco, um botão, nada sobrando. A história de
origem (plugins de Minecraft em 2020) justifica o castelo; o conteúdo continua em texto, legível
para recrutador e buscador.

Os tokens vivem em `src/app/globals.css` (`@theme`). O `@theme` zera os namespaces padrão do
Tailwind (`--color-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`...), então **só o que
está aqui existe como utilitário**. Se algo não tem token, a resposta é usar um que tem.

Textos: `docs/content.md`.

---

## 1. Tipografia

**Uma família: Martian Mono** (variável, 38 KB, eixos `wght` 100–800 e `wdth` 75–112,5).
Carregada por `next/font/local` em `src/app/fonts.ts`: preload no `<head>` e uma fonte de fallback
com métricas ajustadas, para a troca não mover o layout. A imagem de compartilhamento usa a versão
estática em woff (`@fontsource/martian-mono`, devDependency), porque o `ImageResponse` não lê woff2.

| Largura | Utilitário | Onde |
|---|---|---|
| 75% | `font-stretch-condensed` | rótulos, marcadores `[01]`, números, artes em caracteres |
| 100% | (padrão) | todo o resto |

**Pesos permitidos:** 400 (`font-regular`) e 600 (`font-semibold`). A única exceção é o texto vivo
(seção 7c): nos títulos, as letras perto do cursor vão até 800 de peso e 112,5% de largura.

**Escala fixa** (px / entrelinha / tracking):

| Token | Tamanho | Entrelinha | Tracking | Uso |
|---|---|---|---|---|
| `text-caption` | 12 | 18 | +0,01em | rótulos, faixa de status, legendas, cabeçalho |
| `text-body` | 15 | 24 | 0 | texto corrido |
| `text-lead` | 17 | 28 | 0 | cargo, resumo de projeto |
| `text-h3` | 20 | 28 | −0,01em | nome do projeto, números das estatísticas |
| `text-h2` | 32 | 38 | −0,03em | título de seção |
| `text-display-sm` | 52 | 52 | −0,05em | nome no hero, < 768px |
| `text-display` | 88 | 84 | −0,055em | nome no hero, ≥ 768px |

Regras:
- Títulos em sentence case; navegação, rótulos e faixa de status em minúsculas (é a voz de terminal
  do site). Nada em caixa alta.
- Números usam `tabular-nums`.
- Medida do texto: no máximo `max-w-measure` (40rem).
- Link é sublinhado (1px, offset 0,25em); no hover o sublinhado vai a 2px.
- Títulos usam `text-wrap: balance` (sem palavra órfã).

## 2. Cor

**Só escuro.** O tema claro saiu em 27 nov: a noite do castelo é a identidade do site.

| Token | Valor | Papel |
|---|---|---|
| `paper` | `#0B0C0E` | fundo |
| `plate` | `#131519` | painel (reservado) |
| `rule` | `#2A2E34` | linhas finas, bordas dos cards |
| `faint` | `#3A3F47` | caracteres de fundo (decorativo) |
| `muted` | `#8D939C` | texto secundário, rótulos |
| `ink` | `#E9EBEE` | texto, foco |
| `signal` | `#FF6A13` | o destaque: laranja de segurança |
| `on-signal` | `#0B0C0E` | texto sobre `signal` |

### Onde o `signal` pode aparecer

1. **No CTA de e-mail** (fundo), com texto `on-signal`.
2. **Na marca do campo de contribuições** (a semana de 24–29 set).
3. **No indicador "ao vivo"** da faixa de status (o quadrado que pulsa).
4. **Como fogo** (seção 7c): o lampião e as faíscas do cursor, os vaga-lumes do fundo e o ano de
   um marco da trajetória sob o cursor.

Em nenhum outro lugar: nem foco, nem seleção, nem borda, nem texto corrido.

### Contraste verificado (WCAG 2.1)

| Par | Contraste | Exigido |
|---|---|---|
| `ink` sobre `paper` | 16,38 | 4,5 |
| `ink` sobre `plate` | 15,30 | 4,5 |
| `muted` sobre `paper` | 6,32 | 4,5 |
| `muted` sobre `plate` | 5,91 | 4,5 |
| `on-signal` sobre `signal` (CTA) | 6,82 | 4,5 |
| `signal` sobre `paper` (marca gráfica) | 6,82 | 3,0 |

`rule` e `faint` são decorativos: nunca são a única coisa que identifica algo.

## 3. Espaço, linha, raio, sombra

**Escala de espaçamento** (base 4px; só estes passos existem): `0` · `1`=4 · `2`=8 · `3`=12 ·
`4`=16 · `6`=24 · `8`=32 · `12`=48 · `16`=64 · `24`=96 · `32`=128.

**Linha:** uma espessura, **1px**, cor `rule`. Cards e grades de dados são caixas de 1px que
compartilham borda (`border-t border-l` no contêiner, `border-r border-b` nas células).

**Exceção de acessibilidade:** o anel de foco é `outline` de 2px em `ink`, offset 3px.

**Raio:** 0. **Sombra:** não existe.

## 4. Layout

- Container `max-w-page` (80rem), 24px de margem no mobile e 48px no desktop. Tudo à esquerda.
- **Cabeçalho fixo** com duas linhas: nome, índice `[01] projetos [02] trajetória [03] contato`
  e idioma (`pt en es ja`); embaixo, a **faixa de status** (`■ são paulo 10:38`, total de contribuições, revisão).
- **Hero:** um trecho alto (`[data-cena]`, 200svh no desktop, 160svh no celular) com o castelo
  preso na tela enquanto se revela. No desktop o texto (nome em duas linhas, cargo, resumo, CTA)
  fica preso à esquerda, por cima do céu, e aparece inteiro desde o primeiro quadro; no celular o
  texto vem antes e a cena fica presa logo abaixo. Abaixo, as estatísticas de contribuições e a
  grade de especificações (local, stack, desde, formação).
- **Projetos:** um card por projeto, uma caixa de 1px com o marcador `[1.1]` numa faixa no alto, o
  estudo de caso à esquerda (resumo, problema, como funciona, o difícil) e a grade de parâmetros à
  direita. Sem arte.
- **Trajetória:** uma agenda: uma linha por marco, a data numa coluna estreita e linhas finas entre
  elas.
- **Contato:** o fechamento, uma caixa só: à esquerda a frase, o botão de e-mail, "copiar" e os
  atalhos; à direita (no celular, embaixo) a vela acesa, com as bordas apagando no escuro (`.vinheta`).
- **Idiomas:** português na raiz (`/`), inglês, espanhol e japonês em `/en`, `/es` e `/ja`
  (`src/app/[lang]`, geradas na build). Os textos de cada um estão em `src/data/textos/<idioma>.ts`;
  o português é a fonte (`docs/content.md`). O seletor no cabeçalho é um link por idioma; o atual
  não é link. O `<html>` é o mesmo em todas (`lang="pt-BR"`); o idioma de cada página vai no
  contêiner dela (`lang` em `src/components/Pagina`), e o `<head>` tem canonical e hreflang de todas.
- **Japonês:** a Martian Mono não tem kana nem kanji; em `:lang(ja)` as fontes japonesas do sistema
  (Hiragino, Noto Sans JP, Yu Gothic, Meiryo) entram antes do fallback, e o `Decifrar` não embaralha
  texto que não é latino (a largura dupla mudaria a linha).

## 5. Motivos recorrentes

1. **Marcadores entre colchetes.** Seções `[01]`, `[02]`, `[03]` no título e no índice; projetos
   `[1.1]`, `[1.2]`, `[1.3]` na faixa do alto do card.
2. **Grade de dados em caixas de 1px.** Estatísticas, especificações, parâmetros e o fechamento.
3. **Fogo é o laranja.** O `signal`, fora do CTA e do indicador, só aparece como luz de fogo: no
   castelo (janelas, vaga-lumes, o sopro do dragão, faíscas do clique) e na página (o lampião do
   cursor, os vaga-lumes do fundo, o ano aceso na trajetória).

## 6. As cenas e a técnica

**Técnica: a cena é uma imagem convertida em ASCII a cada quadro.** Para chegar perto do realista,
o castelo não é desenhado com formas: ele parte de uma imagem noturna (`public/cenas/castelo.webp`,
gerada no Figma) e a converte em caracteres. A saída é 100% ASCII; a imagem nunca aparece.

- O `AsciiCanvas` carrega a imagem logo ao montar, decodifica fora da tela e a passa à cena como
  tabelas de soma acumulada de brilho e de calor (laranja = luz de fogo), então a média de qualquer
  retângulo custa quatro leituras, em qualquer resolução.
- `fundoImagem` (`src/components/Ascii/denso.ts`) enquadra a imagem em modo cover, aplica níveis
  automáticos (percentis 1 e 97) e gama, reforça a diferença de cada célula para a vizinhança
  (nitidez) e chama o `ajuste` da cena, onde entram os efeitos.
- A luminância escolhe o caractere numa rampa alfanumérica (` .,:;i1?7tPO09#@`) e o tom de cinza;
  o calor puxa o tom para o laranja. O canvas desenha com um atlas de glifos (cada caractere em
  cada tom é pintado uma vez), então cada quadro é só cópia de pedaços.
- **O que se mexe é código por cima da imagem:** água, janelas, cachoeira com espuma, estrelas e
  estrela cadente, nuvens, névoa, luar na água, morcegos, vaga-lumes e o dragão a cada 18s.
- **Espera:** enquanto a imagem decodifica, a cena mostra um campo de estrelas fraco
  (`estrelas.ts`) que some conforme a imagem surge, em vez de um quadro vazio.

**Revelação pela rolagem.** A cena começa com poucos caracteres grandes (15% da grade) e chega à
grade inteira (360 colunas no desktop, 120 no celular) conforme a pessoa rola pelo trecho alto do
hero, enquanto o enquadramento abre do castelo para a paisagem e o limiar de luz baixa: primeiro
aparece só o que brilha. As linhas seguem a proporção do contêiner, reservada antes do JavaScript
(CLS 0). Sem movimento, a cena aparece inteira de uma vez e o trecho alto encolhe.

**Bordas e véu.** O alto e a base do quadro dissolvem no fundo (`.bordas`; os lados também, quando a
janela passa da coluna da página). No desktop, um degradê do fundo sai da esquerda por baixo do
texto e some na metade (`.veu-hero`), e a própria cena apaga a área atrás dele.

**Dados reais.** `scripts/update-contributions.mts` lê o HTML público do GitHub e grava
`src/data/contributions.json` no `prebuild` (mantém o snapshot anterior se falhar). Os números
abaixo do hero e a imagem de compartilhamento saem daí.

## 7. Interação

O castelo responde ao ponteiro (mouse ou toque); o `AsciiCanvas` passa a posição e os cliques
recentes. **O cursor é um lampião**: uma luz quente que segue o ponteiro e revela o escuro. O clique
solta faíscas no ponto e, no lago, faz um anel de onda (passar o mouse na água também ondula).

**A vela** (`cenas/vela.ts`, `public/cenas/vela.webp`, a mesa do antigo escriba) usa a mesma
técnica, com a câmera no canto da vela: a própria chama da foto tremula e se inclina (`balancar`),
a luz da mesa pulsa com ela, sobe um fio de fumaça (`fumaca`), poeira dourada flutua na luz
(`poeira`) e nuvens passam pela lua na janela. Revela-se quando o quadro sobe pela tela: começa
fechada na chama e abre para a mesa. A imagem só carrega perto da tela. O clique é um sopro: a
chama dança e se deita por uns segundos, a luz cai e saem faíscas.

**Dicas e teclado.** Cada dica ("clique no céu ou no lago", "clique para soprar a vela") é um botão
(`Dica`, `src/components/Ascii/Dica.tsx`), não a arte focável: um `role="img"` com ação seria
anunciado errado. Ela fica dentro do `[data-cena]`, fora do `role="img"`, e ao ser ativada (Enter ou espaço)
dispara `cena:acionar` no bloco, que o `AsciiCanvas` trata como um clique.

- Na primeira interação o `AsciiCanvas` marca `data-tocado` no bloco, e a dica (`.dica`) some com
  uma transição de 0,6s e deixa de receber clique.
- Ao receber o foco do teclado ela volta (`.dica:focus-visible`), com o contorno global de 2px.
- Com `prefers-reduced-motion` não há interação (a cena fica parada) e a dica some.

**Copiar o e-mail.** Ao lado do botão de e-mail do contato, "copiar" vira uma carta em ASCII que se
dobra (`[==]`, `[--]`, `[\/]`) e então "copiado", com aviso para o leitor de tela (`CopiarEmail`).

A interação é um extra: todo o conteúdo está no texto, para teclado e leitor de tela.

## 7b. Movimento

- O castelo anima a 20 quadros por segundo só enquanto aparece na tela e a aba está visível
  (`IntersectionObserver` e `visibilitychange`).
- A dica de clique some depois da primeira interação e volta com o foco do teclado (seção 7).
- Títulos se decifram em ASCII ao entrar na tela (`Decifrar`): cada letra passa pela rampa e
  assenta, da esquerda para a direita. O texto real fica no DOM para leitor de tela e buscador.
- Cards de projeto, títulos, marcos da trajetória e o fechamento sobem e aparecem com a rolagem
  (`.surgir`, `animation-timeline: view()`, só CSS; sem suporte, ficam parados).
- O quadrado da faixa de status pulsa; o relógio de São Paulo se atualiza.
- `prefers-reduced-motion: reduce`: o castelo desenha um quadro parado na resolução máxima e o
  trecho alto do hero encolhe; títulos não se decifram nem reagem ao cursor e nada surge; a dica
  de clique some; sem lampião, faíscas e vaga-lumes; os números e os resumos já aparecem inteiros;
  os links de âncora pulam direto.

## 7c. Aconchego

A estética não muda; o aconchego está no movimento: noite quente à luz de fogo, tudo devagar.

- **Lampião** (`Aconchego/Lampiao.tsx`, `.lampiao`): uma luz quente e fraca (um círculo de 18rem
  em `signal` a 9%, `mix-blend-mode: screen`) que segue o cursor com atraso, como chama que balança.
  Só com mouse; acende e apaga em 1,2s, e some sobre o castelo, que tem o lampião dele.
- **Vaga-lumes** (`Aconchego/VagaLumes.tsx`, `.vaga-lume`): 12 pontos de 3px com halo, atrás da
  página, cada um numa rota lenta (29–45s) e piscando no seu ritmo (3,6–6,3s). Só CSS.
- **Trajetória:** passar por um marco acende o ano dele em `signal`, com brilho, em 0,6s.
- **Faíscas do cursor** (`Aconchego/Faiscas.tsx`): um movimento rápido do mouse (acima de 1,6 px/ms)
  solta de 1 a 3 faíscas em ASCII (`. , ' * ·`, em `signal`) que saltam para trás do movimento, caem
  e se apagam em 0,9s; no máximo 36 vivas. Movimento lento não solta nada, e sobre as cenas também
  não. Um canvas fixo, desenhado só enquanto há faísca.
- **Números contando** (`Contador`): as quatro estatísticas do GitHub contam do zero ao valor em
  1,4s quando entram na tela, assentando devagar no fim. O HTML já traz o valor final.
- **Escrita à pena** (`Escrita`): o resumo de cada projeto aparece palavra por palavra (45ms entre
  elas, 0,6s cada, saindo de um borrão leve) quando entra na tela; no japonês, por trechos entre
  `、` e `。`. Cada palavra já ocupa o lugar dela, então nada se move.
- **Navegação animada** (`Navegacao`): os links para âncoras (índice do cabeçalho, nome, "voltar ao
  topo") rolam com inércia em vez de pular, em 0,6 a 1,6s conforme a distância (cúbica, saindo e
  chegando devagar). Na volta ao topo o castelo se desfaz e se refaz junto com a rolagem. Ao chegar,
  o foco vai para o destino, o endereço ganha a âncora e o título da seção se decifra de novo
  (evento `navegar:chegou`). Roda do mouse, toque ou tecla no caminho devolvem o controle.
- **Voltar ao topo** (`VoltarTopo`): depois do hero, um botão no canto (`↑ topo [####····]`) mostra
  quanto da página já foi lido em ASCII e sobe com a navegação animada; some perto do topo.
- **Texto vivo** (`src/lib/textoVivo.ts`, via `Decifrar`): no nome do hero, nos títulos das seções
  e na frase do contato, as letras perto do cursor engordam e alargam (`font-variation-settings`
  `wght` até 800 e `wdth` até 112,5, numa onda de raio 1,8× o tamanho da fonte) e voltam devagar
  quando ele se afasta. Um único `pointermove` para a página toda; cada letra anda 14% do caminho
  até o alvo por quadro, e o laço para quando tudo assentou. Só com mouse e com movimento.

## 8. Qualidade verificada (25 nov 2026)

Lighthouse 12 contra a build servida pelo `wrangler dev`, ainda com as seis cenas (antes da
simplificação de 27 nov; não medido de novo depois dela):

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

LCP 2,3s no celular (simulado) e 0,5s no desktop; CLS 0; TBT 80ms no celular. Com duas cenas em vez de seis, a
página baixa 8 imagens a menos e roda um canvas em vez de sete.

- **Teclado:** o primeiro Tab mostra "Pular para o conteúdo"; a ordem segue a leitura (índice, idioma,
  CTA, links, dados, repositórios, contato). Foco com contorno de 2px. `scroll-padding-top` evita que
  o cabeçalho fixo cubra o elemento focado.
- **Arte:** o castelo é `role="img"` com descrição; os caracteres decorativos não entram na árvore
  de acessibilidade. A dica de clique é um botão fora do `role="img"`, alcançável por Tab, com foco
  visível mesmo depois de ter desaparecido.
- **Metadados:** título, descrição, canonical, Open Graph e Twitter; imagem de compartilhamento
  gerada na build (`src/app/opengraph-image.tsx`) com o mesmo campo de contribuições; `robots.txt` e
  `sitemap.xml`. O `public/_headers` serve a imagem como `image/png`, porque o export do Next a
  grava sem extensão.

## 9. Histórico

1. "Ficha técnica" clara e estática (Archivo, fundo branco): rejeitada, sem a energia da referência.
2. "Painel de dev ao vivo" (escuro, mono, campo de contribuições em caracteres): aprovado, mas o
   pedido seguinte foi um tema e um ASCII de jogo.
3. Mundo medieval em ASCII de contorno (`|`, `_`, `/`): rejeitado por ser simples demais.
4. Mundo medieval em ASCII denso, como imagem renderizada em caracteres, tudo desenhado em código:
   aprovado, mas o pedido seguinte foi um hero "quase realista".
5. Castelo convertido de uma imagem gerada no Figma, revelado pela rolagem (de poucos caracteres
   grandes a milhares de pequenos), com as outras cenas ainda em código: o pedido seguinte foi o
   mesmo detalhe em todas e mais animação.
6. As seis cenas feitas de imagem e reveladas pela rolagem, com a história de cada uma em código
   por cima, títulos que se decifram e blocos que surgem: o pedido seguinte foi que os personagens
   parecessem de verdade, e não formas de código.
7. Personagens de imagem: o velho do porão, o viajante da estrada e o corvo viram folhas de partes
   feitas no Figma, compostas na grade por ossos em código, com 30 quadros por segundo, estrelas
   de espera, dicas que são botões e somem depois da primeira interação.
8. Simplificação (27 nov): mundo demais, seis peças-assinatura competindo e um hero de três telas
   antes do primeiro projeto. Fica só o castelo, revelado ao carregar num hero de uma tela; projetos,
   trajetória e contato voltam a ser tipografia e grade de 1px, no espírito do hackbrasil.com e do
   abacatepay.com. O tema claro sai e o site ganha inglês, espanhol e japonês: a versão atual.
9. O hero de uma tela ficou cru: a revelação pela rolagem volta (num trecho mais curto) e entra o
   aconchego no movimento (lampião, vaga-lumes, anos acesos), sem mudar a estética. Regra: ASCII
   novo só no nível do castelo (feito de imagem); uma vela de contorno foi trocada pela vela feita
   da imagem da mesa do escriba.

## 10. Fora do sistema (removido)

Cenas: porão, torre, escriba, estrada, corvo e as brasas do fundo, com os personagens de imagem
(`figura.ts`, `public/cenas/figuras/`), o modo de contorno (`engine.ts`) e a revelação pela rolagem.

Tema claro: o botão, o script do `<head>` (`src/lib/theme.ts`) e os valores claros dos tokens.

Tokens: `cn-*`, cores de redes sociais, sombras `bump`/`flat`, `docker-*`, `wave-*`, cursores,
Roboto Mono e Archivo. Componentes: desktop, janelas, terminal, celular, Craft, Konami, sons,
a curva em SVG, o diagrama de blocos, o campo de caracteres em CSS e as artes de contorno dos projetos. Dependências: `framer-motion`, `react-draggable`,
`use-sound`, `three`, `@hugeicons/*`, `next-themes`. Deploy: o Worker de `/api/github/contributions`.
