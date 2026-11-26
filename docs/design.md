# Sistema de design

O site é **um mundo medieval à noite, desenhado em ASCII**, dentro de uma interface de dev
(escura, uma fonte mono, um destaque). Cada parte do site é um lugar desse mundo, renderizado como
imagem de luz feita de caracteres, no nível de detalhe de um jogo em ASCII: o castelo do hero, o
porão do DevClean, a torre do correio do Pato Commit, o escriba do resume-tailor, a estrada da
trajetória e o corvo do contato. A história de origem (plugins de Minecraft em 2020) justifica o
mundo; o conteúdo continua em texto, legível para recrutador e buscador.

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

**Pesos permitidos:** 400 (`font-regular`) e 600 (`font-semibold`).

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

**Escuro é o padrão.** O claro existe e é escolhido no botão do cabeçalho.

| Token | Escuro (padrão) | Claro | Papel |
|---|---|---|---|
| `paper` | `#0B0C0E` | `#FFFFFF` | fundo |
| `plate` | `#131519` | `#F1F2F3` | painel das artes |
| `rule` | `#2A2E34` | `#D5D8DC` | linhas finas, bordas dos cards |
| `faint` | `#3A3F47` | `#B8BDC4` | caracteres de fundo das artes (decorativo) |
| `muted` | `#8D939C` | `#575D66` | texto secundário, rótulos |
| `ink` | `#E9EBEE` | `#15181C` | texto, topo das colunas, foco |
| `signal` | `#FF6A13` | `#F25400` | o destaque: laranja de segurança |
| `on-signal` | `#0B0C0E` | `#15181C` | texto sobre `signal` |

### Onde o `signal` pode aparecer

1. **No CTA de e-mail** (fundo), com texto `on-signal`.
2. **Na marca do campo de contribuições** (a semana de 24–29 set).
3. **No indicador "ao vivo"** da faixa de status (o quadrado que pulsa).

Em nenhum outro lugar: nem hover, nem foco, nem seleção, nem borda. Nunca como cor de texto
pequeno (no tema claro ele não passa AA em 12–15px).

### Contraste verificado (WCAG 2.1)

| Par | Escuro | Claro | Exigido |
|---|---|---|---|
| `ink` sobre `paper` | 16,38 | 17,81 | 4,5 |
| `ink` sobre `plate` | 15,30 | 15,89 | 4,5 |
| `muted` sobre `paper` | 6,32 | 6,64 | 4,5 |
| `muted` sobre `plate` | 5,91 | 5,92 | 4,5 |
| `on-signal` sobre `signal` (CTA) | 6,82 | 5,12 | 4,5 |
| `signal` sobre `paper` (marca gráfica) | 6,82 | 3,47 | 3,0 |

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
  e tema; embaixo, a **faixa de status** (`■ são paulo 10:38`, total de contribuições, revisão).
- **Hero:** 5 colunas de texto (nome em duas linhas, cargo, resumo, CTA) e 7 colunas com o campo
  de contribuições. Abaixo, a grade de especificações (local, stack, desde, formação).
- **Projetos:** um card por projeto, a arte à esquerda (5 colunas, sobre `plate`) e o estudo de
  caso à direita (problema, como funciona, o difícil e a grade de parâmetros).
- **Tema:** um script inline no `<head>` (`src/lib/theme.ts`) aplica `data-theme` antes da pintura.
  O HTML já sai com `data-theme="dark"`, então sem JavaScript vale o escuro.

## 5. Motivos recorrentes

1. **Marcadores entre colchetes.** Seções `[01]`, `[02]`, `[03]` no título e no índice; projetos
   `[1.1]`, `[1.2]`, `[1.3]` no canto do banner da cena.
2. **Janelas para a noite.** Toda cena fica num bloco `.noite`: sempre noturno, inclusive no tema
   claro, onde vira um retângulo escuro dentro da página clara.
3. **Grade de dados em caixas de 1px.** Estatísticas, especificações, parâmetros e trajetória.
4. **Fogo é o laranja.** Dentro das cenas, o `signal` só aparece como luz de fogo: tochas, janelas,
   fogueira, vela, braseiro, lampiões.

## 6. As cenas e a técnica

**Técnica: cada cena é uma imagem convertida em ASCII a cada quadro.** Para chegar perto do
realista, nenhuma cena desenha o cenário com formas: cada uma parte de uma imagem noturna
(`public/cenas/*.webp`, geradas no Figma) e a converte em caracteres. A saída é 100% ASCII; a
imagem nunca aparece.

- O `AsciiCanvas` carrega a imagem quando o canvas chega perto da tela, decodifica fora da tela e
  a passa à cena como tabelas de soma acumulada de brilho e de calor (laranja = luz de fogo), então
  a média de qualquer retângulo custa quatro leituras, em qualquer resolução.
- `fundoImagem` (`src/components/Ascii/denso.ts`) enquadra a imagem em modo cover, aplica níveis
  automáticos (percentis 1 e 97) e gama, reforça a diferença de cada célula para a vizinhança
  (nitidez) e chama o `ajuste` da cena, onde entram os efeitos.
- A luminância escolhe o caractere numa rampa alfanumérica (` .,:;i1?7tPO09#@`) e o tom de cinza;
  o calor puxa o tom para o laranja. O canvas desenha com um atlas de glifos (cada caractere em
  cada tom é pintado uma vez), então cada quadro é só cópia de pedaços.
- **O que se mexe é código por cima da imagem:** a própria chama da foto balança (`balancar`
  desloca a amostragem dentro da chama), a luz das paredes pulsa com o fogo, e partículas
  (`fagulhas`, `fumaca`, `poeira`), luzes, figuras (pombo, dragão) e dígitos em pixel-font 3×5
  entram por cima.

**Personagens de imagem (sprites).** O velho do porão, o viajante da estrada e o corvo não são
formas desenhadas em código: cada um vem de uma folha de partes (corpo, braço, perna, cabeça,
asas...) feita no Figma sobre fundo verde (`public/cenas/figuras/*.webp`).

- O `AsciiCanvas` baixa as folhas junto com a imagem de fundo (`figuras`, nome → URL) e as entrega
  à cena em `dados.figuras`. `figura.ts` (módulo puro, sem DOM) tira o fundo verde (chroma key, com
  corte do verde que sobra nas bordas) e guarda brilho, calor e opacidade em tabelas de soma
  acumulada, como a imagem de fundo.
- A cena compõe cada parte na grade girando em torno do seu pivô, e cada célula amostra a área
  exata da folha, então a figura fica nítida em qualquer resolução. Os ossos são código: o velho
  varre, o viajante balança a lanterna e anda, o corvo bate as asas e vira a cabeça.
- As células da figura ganham `mat` 5 (superfície): o `lampiao` e as luzes de fogo as iluminam
  como a qualquer parte da imagem.
- `fps` por cena: as cenas com personagem animam a 30 quadros por segundo, as outras a 20.
- **Espera:** enquanto a imagem de fundo decodifica, a cena mostra um campo de estrelas fraco
  (`estrelas.ts`) que some conforme a imagem surge, em vez de um quadro vazio.
- **Reduced motion:** com `parado`, as figuras aparecem em repouso (ângulos 0, sem balanço).

| Cena | Onde | Colunas (desktop) | Imagem | O que se mexe |
|---|---|---|---|---|
| `castelo` | hero | até 360 | castelo no penhasco, cachoeira, lago | água, janelas, cachoeira com espuma, estrelas e estrela cadente, nuvens, névoa, luar na água, morcegos, vaga-lumes, dragão a cada 18s |
| `porao` | DevClean | até 340 | abóbada de pedra, duas tochas, carroça | tochas com fagulhas e fumaça, luz pulsando, poeira; o velho (sprite) varre os três sacos seguros até a carroça, o "?" fica; um rato a cada 15s |
| `torre` | Pato Commit | até 340 | torre com janela acesa, braseiro, lua, vila | nuvens, estrelas, janelas da vila, fumaça das chaminés, braseiro; pombos entregam cartas e a repetida queima |
| `escriba` | resume-tailor | até 340 | mesa à luz de vela, pergaminho, livros | vela e luz pulsando, fumaça, poeira, nuvens na janela; as linhas se reordenam e a pena sai do tinteiro para escrever |
| `estrada` | trajetória | até 340 | estrada sob a Via Láctea, castelo ao fundo | estrelas, estrela cadente, névoa nos vales, vaga-lumes; o viajante de capa (sprite) com lanterna balançando anda com a rolagem e acende os marcos |
| `corvo` | contato | até 220 | lua cheia enorme, poste com lampião e caixa de correio | nuvens na lua, neblina, árvore ao vento, mariposas no lampião; o corvo (sprite) bate as asas, pousa, solta a carta na caixa, olha em volta e vai embora |

**Revelação pela rolagem.** Toda cena começa com poucos caracteres grandes e ganha resolução
conforme a rolagem: o limiar de luz também baixa, então primeiro aparece só o que brilha.

- No hero, um trecho alto (`[data-revelar]`, 260svh no desktop) prende a cena na tela (`sticky`);
  a grade vai de 15% até 360 colunas (120 no celular) e o enquadramento abre do castelo para a
  paisagem.
- Nos banners, a grade vai de 25–30% até a máxima entre o banner entrar pela base da tela e o topo
  dele chegar a um quarto da altura.
- As linhas seguem a proporção do contêiner (`aspect-ratio`), reservada antes do JavaScript
  (CLS 0). Cálculo de 3 a 6 ms por quadro na grade máxima. Sem movimento, tudo aparece inteiro.

**Dados reais.** `scripts/update-contributions.mts` lê o HTML público do GitHub e grava
`src/data/contributions.json` no `prebuild` (mantém o snapshot anterior se falhar). Os números
abaixo do hero e a imagem de compartilhamento saem daí.

**Hero no desktop.** O texto fica preso por cima do céu, à esquerda, durante a revelação; a cena
apaga quase tudo atrás dele. No celular o texto vem antes e a cena fica presa logo abaixo.

## 7. Interação

As cenas respondem ao ponteiro (mouse ou toque); o `AsciiCanvas` passa a posição e os cliques
recentes em coordenadas do mundo. Em todas, **o cursor é um lampião**: uma luz quente que segue o
ponteiro e revela o escuro. Cada banner diz em uma linha o que o clique faz.

| Cena | O clique faz |
|---|---|
| castelo | faíscas no ponto; no lago, um anel de onda (passar o mouse na água também ondula) |
| porão | o velho recomeça a limpeza |
| torre | solta um pombo com uma carta do ponto clicado; dois cliques a menos de 1,5s são a mesma entrega duas vezes, e a repetida queima no braseiro (a deduplicação do webhook, na mão) |
| escriba | respingo de tinta no ponto; troca a vaga (react/node/flutter ↔ java/spring): as linhas se reordenam e a pena reescreve |
| estrada | faíscas (o viajante anda com a rolagem) |
| corvo | o corvo levanta voo: na hora se já entregou a carta, ou logo depois de entregá-la se ainda chega |

**Dicas e teclado.** Cada dica de clique é um botão (`Dica`, `src/components/Ascii/Dica.tsx`), não
a arte focável: um `role="img"` com ação seria anunciado errado, e o botão é anunciado como botão.
Ele fica dentro do `[data-revelar]` da cena, fora do `role="img"`, e ao ser ativado (Enter ou
espaço) dispara `cena:acionar` no bloco, que o `AsciiCanvas` trata como um clique (no último ponto
do ponteiro ou no centro). As dicas só informativas ("role para revelar") e a nota "role a página" da estrada são
texto (`span` com a classe `dica`), não botões.

- Na primeira interação o `AsciiCanvas` marca `data-tocado` no bloco, e as dicas (`.dica`) somem
  com uma transição de 0,6s e deixam de receber clique.
- Ao receber o foco do teclado a dica volta (`.dica:focus-visible`), com o contorno global de 2px,
  então quem navega por Tab nunca perde o botão de vista.
- Com `prefers-reduced-motion` não há `cena:acionar` (a cena fica parada): os botões somem em qualquer largura
  (`motion-safe:` nas classes de largura) e não há transição.

As brasas do fundo desviam do cursor. Com `prefers-reduced-motion` não há interação: as cenas ficam
paradas. A interação é um extra: todo o conteúdo está no texto ao lado, para teclado e leitor de
tela.

## 7b. Movimento

- Cada cena anima a 20 quadros por segundo (30 as que têm personagem de imagem: porão, estrada e
  corvo) só enquanto aparece na tela e a aba está visível (`IntersectionObserver` e
  `visibilitychange`).
- Os personagens se movem por ossos em código sobre partes de imagem (`figura.ts`): o velho varre
  e se encurva, o viajante balança a lanterna, o corvo bate as asas, vira a cabeça, pousa e
  levanta voo (a aterrissagem, a decolagem e o clique em pleno voo são suaves, sem salto).
- As dicas de clique somem depois da primeira interação e voltam com o foco do teclado (seção 7).
- A estrada não anda com o tempo: anda com a rolagem. Todas as cenas ganham resolução com a
  rolagem.
- Títulos se decifram em ASCII ao entrar na tela (`Decifrar`): cada letra passa pela rampa e
  assenta, da esquerda para a direita. O texto real fica no DOM para leitor de tela e buscador.
- Cards de projeto, títulos e marcos da trajetória sobem e aparecem com a rolagem (`.surgir`,
  `animation-timeline: view()`, só CSS; sem suporte, ficam parados).
- Brasas sobem atrás da página (só no tema escuro); o quadrado da faixa de status pulsa; o
  relógio de São Paulo se atualiza.
- `prefers-reduced-motion: reduce`: cada cena desenha um quadro parado na resolução máxima (a
  estrada aparece completa e o trecho alto do hero encolhe em qualquer largura); os personagens ficam em repouso;
  títulos não se decifram e nada surge; as dicas de clique somem.

## 8. Qualidade verificada (25 nov 2026)

Lighthouse 12 contra a build servida pelo `wrangler dev`:

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

LCP 2,3s no celular (simulado) e 0,5s no desktop; CLS 0; TBT 80ms no celular, com as seis cenas
feitas de imagem (as dos banners só carregam perto da tela).

Medido de novo com os personagens de imagem, no build de produção servido pelo wrangler
(Lighthouse 12): celular 98 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100, CLS 0, TBT 80ms e
LCP 2,3s no celular.

- **Teclado:** o primeiro Tab mostra "Pular para o conteúdo"; a ordem segue a leitura (índice, tema,
  CTA, links, dados, repositórios, contato). Foco com contorno de 2px. `scroll-padding-top` evita que
  o cabeçalho fixo cubra o elemento focado.
- **Artes:** cada uma é `role="img"` com descrição; os caracteres decorativos não entram na árvore
  de acessibilidade. As dicas de clique são botões fora do `role="img"`, alcançáveis por Tab, com
  foco visível mesmo depois de terem desaparecido.
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
   de espera, dicas que são botões e somem depois da primeira interação: a versão atual.

## 10. Fora do sistema (removido)

Tokens: `cn-*`, cores de redes sociais, sombras `bump`/`flat`, `docker-*`, `wave-*`, cursores,
Roboto Mono e Archivo. Componentes: desktop, janelas, terminal, celular, Craft, Konami, sons,
a curva em SVG, o diagrama de blocos, o campo de caracteres em CSS e as artes de contorno dos projetos. Dependências: `framer-motion`, `react-draggable`,
`use-sound`, `three`, `@hugeicons/*`, `next-themes`. Deploy: o Worker de `/api/github/contributions`.
