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

**Técnica (modo denso, `src/components/Ascii/denso.ts`).** Cada cena calcula, por célula, uma
luminância (0–1) e um calor (0 = luar, 1 = fogo) num mundo de coordenadas contínuas (X de 0 a A,
Y de 0 a 1). Uma curva de exposição levanta os meios-tons; a luminância escolhe o caractere numa
rampa alfanumérica (` .,:;i1?7tPO09#@`) e o tom de cinza; o calor puxa o tom para o laranja. O
`AsciiCanvas` desenha com um atlas de glifos (cada caractere em cada tom é pintado uma vez), então
cada quadro é só cópia de pedaços. Ferramentas compartilhadas: céu com lua e estrelas, luz quente,
chama de ruído, pedra com fiadas, névoa, figuras (pessoa, elipse, triângulo, traço) e dígitos em
pixel-font 3×5 (o único texto legível dentro das cenas).

| Cena | Onde | Grade (desktop) | O que acontece |
|---|---|---|---|
| `castelo` | hero | 260×80 | castelo no penhasco, cachoeira, floresta, lago com reflexo e trilha de luar, raios de lua, dragão a cada 18s; as montanhas são as contribuições reais e a fogueira marca 24–29 set |
| `porao` | DevClean | 300×54 | varredor leva os três sacos seguros à carroça da Lixeira; o saco "?" fica |
| `torre` | Pato Commit | 300×54 | pombos entregam cartas na janela; a repetida queima no braseiro |
| `escriba` | resume-tailor | 300×54 | à luz de vela, as linhas se reordenam pela vaga e a pena escreve o currículo |
| `estrada` | trajetória | 280×32 | viajante anda com a rolagem; lampiões e anos acendem quando ele passa |
| `corvo` | contato | 150×37 | corvo cruza a lua, pousa no poste do correio e deixa a carta |

Grades menores no tablet e no celular; a proporção de cada grade bate com o `aspect-ratio` do
contêiner, então a altura é reservada antes do JavaScript (CLS 0).

**Dados reais.** `scripts/update-contributions.mts` lê o HTML público do GitHub e grava
`src/data/contributions.json` no `prebuild` (mantém o snapshot anterior se falhar). As montanhas,
os números abaixo do hero e a imagem de compartilhamento saem daí.

**Hero no desktop.** O texto fica por cima do céu, à esquerda; a cena apaga quase tudo atrás dele.

## 7. Interação

As cenas respondem ao ponteiro (mouse ou toque); o `AsciiCanvas` passa a posição e os cliques
recentes em coordenadas do mundo. Em todas, **o cursor é um lampião**: uma luz quente que segue o
ponteiro e revela o escuro. Cada banner diz em uma linha o que o clique faz.

| Cena | O clique faz |
|---|---|
| castelo | faíscas no ponto; no lago, um anel de onda (passar o mouse na água também ondula) |
| porão | o varredor recomeça a limpeza |
| torre | solta um pombo com uma carta do ponto clicado; dois cliques a menos de 1,5s são a mesma entrega duas vezes, e a repetida queima no braseiro (a deduplicação do webhook, na mão) |
| escriba | troca a vaga (react/node/flutter ↔ java/spring): as linhas se reordenam e a pena reescreve |
| estrada | faíscas (o viajante anda com a rolagem) |
| corvo | o corvo levanta voo na hora |

As brasas do fundo desviam do cursor. Com `prefers-reduced-motion` não há interação: as cenas ficam
paradas. A interação é um extra: todo o conteúdo está no texto ao lado, para teclado e leitor de
tela.

## 7b. Movimento

- Cada cena anima a 20 quadros por segundo só enquanto aparece na tela e a aba está visível
  (`IntersectionObserver` e `visibilitychange`). Cálculo de 0,2 a 2,2 ms por quadro.
- A estrada não anda com o tempo: anda com a rolagem.
- Brasas sobem atrás da página (só no tema escuro); o quadrado da faixa de status pulsa; o
  relógio de São Paulo se atualiza.
- `prefers-reduced-motion: reduce`: cada cena desenha um quadro parado (a estrada aparece completa).

## 8. Qualidade verificada (25 nov 2026)

Lighthouse 12 contra a build servida pelo `wrangler dev`:

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

LCP 2,3s no celular (simulado) e 0,5s no desktop; CLS 0; TBT 70ms no celular, com todas as cenas densas.

- **Teclado:** o primeiro Tab mostra "Pular para o conteúdo"; a ordem segue a leitura (índice, tema,
  CTA, links, dados, repositórios, contato). Foco com contorno de 2px. `scroll-padding-top` evita que
  o cabeçalho fixo cubra o elemento focado.
- **Artes:** cada uma é `role="img"` com descrição; os caracteres decorativos não entram na árvore
  de acessibilidade.
- **Metadados:** título, descrição, canonical, Open Graph e Twitter; imagem de compartilhamento
  gerada na build (`src/app/opengraph-image.tsx`) com o mesmo campo de contribuições; `robots.txt` e
  `sitemap.xml`. O `public/_headers` serve a imagem como `image/png`, porque o export do Next a
  grava sem extensão.

## 9. Histórico

1. "Ficha técnica" clara e estática (Archivo, fundo branco): rejeitada, sem a energia da referência.
2. "Painel de dev ao vivo" (escuro, mono, campo de contribuições em caracteres): aprovado, mas o
   pedido seguinte foi um tema e um ASCII de jogo.
3. Mundo medieval em ASCII de contorno (`|`, `_`, `/`): rejeitado por ser simples demais.
4. Mundo medieval em ASCII denso, como imagem renderizada em caracteres: a versão atual.

## 10. Fora do sistema (removido)

Tokens: `cn-*`, cores de redes sociais, sombras `bump`/`flat`, `docker-*`, `wave-*`, cursores,
Roboto Mono e Archivo. Componentes: desktop, janelas, terminal, celular, Craft, Konami, sons,
a curva em SVG, o diagrama de blocos, o campo de caracteres em CSS e as artes de contorno dos projetos. Dependências: `framer-motion`, `react-draggable`,
`use-sound`, `three`, `@hugeicons/*`, `next-themes`. Deploy: o Worker de `/api/github/contributions`.
