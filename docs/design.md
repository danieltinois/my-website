# Sistema de design

O site parece **o painel de um dev ao vivo**: escuro, uma fonte mono, uma cor de destaque e uma
peça grande que se mexe com dados reais. A referência de energia é o hackbrasil.com; o que separa
este site dele é o conteúdo (as contribuições e os projetos do Daniel viram a arte), a cor
(laranja de segurança, não verde) e a fonte (Martian Mono, não JetBrains Mono).

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
   `[1.1]`, `[1.2]`, `[1.3]` no canto da arte.
2. **Arte feita de caracteres, com tema do próprio dono.** O campo de contribuições e as três artes
   dos projetos usam só caracteres da fonte; cada uma ilustra o que o projeto faz (DevClean varre
   caches, Pato Commit descarta entregas repetidas, resume-tailor reordena experiências). As artes
   dos projetos levam o rótulo "ilustração".
3. **Grade de dados em caixas de 1px.** Estatísticas do hero, especificações, parâmetros dos
   projetos e trajetória usam a mesma grade de células.

## 6. Peça-assinatura: o campo de contribuições

As contribuições públicas no GitHub dos últimos 12 meses viram um campo de caracteres de 53
colunas (semanas) por 20 linhas.

- **Dados reais, sem token.** `scripts/update-contributions.mts` lê o HTML público do GitHub
  (cada dia tem a contagem no tooltip) e grava `src/data/contributions.json`. Roda no `prebuild`;
  se o GitHub falhar ou o HTML mudar de formato, mantém o snapshot anterior e a build segue.
- **Desenho (`toField` em `src/lib/contributions.ts`):** a altura da coluna é proporcional às
  contribuições da semana; dentro dela o caractere fica mais denso perto do topo
  (`@ # * + = - :`), e acima só há pontos em `faint`. O topo de cada coluna fica em `ink`.
- **Uma marca em `signal`:** a semana de 24–29 set, quando começam os três projetos
  (`src/data/curva.ts`), com rótulo e linha de chamada. Some sozinha quando sai da janela.
- **Embaixo:** quatro números calculados (total, dias com contribuição, maior sequência, semana
  mais intensa) e a tabela completa em "ver os dados por semana", para leitor de tela e conferência.
- **Zero JavaScript.** É componente de servidor; o campo sai pronto da build.

## 7. Movimento

- **Varredura do campo:** cada coluna acende e apaga devagar, em sequência da esquerda para a
  direita, em loop de 6s. Só `opacity`, que a GPU compõe.
- **Artes dos projetos:** loops curtos só com `transform`, `opacity` e `clip-path`.
- **Indicador ao vivo:** o quadrado `signal` da faixa de status pulsa.
- **Relógio:** a hora de São Paulo se atualiza (o único JavaScript da página, junto com o botão de tema).
- `prefers-reduced-motion: reduce`: nada se mexe. Cada arte para num estado que faz sentido
  (campo aceso, eventos espalhados pelo caminho, experiências já na ordem da vaga).

## 8. Qualidade verificada (25 nov 2026)

Lighthouse 12 contra a build servida pelo `wrangler dev`:

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

LCP 2,5s no celular (simulado) e 0,5s no desktop; CLS 0; TBT ≤ 10ms.

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

A primeira versão deste sistema era uma "ficha técnica" clara e estática (Archivo, fundo branco,
curva em SVG). Foi rejeitada porque perdia a energia da referência: tinha a disciplina, mas não o
impacto. Ficaram dela a regra de um destaque, a linha de 1px, raio 0 e os dados reais.

## 10. Fora do sistema (removido)

Tokens: `cn-*`, cores de redes sociais, sombras `bump`/`flat`, `docker-*`, `wave-*`, cursores,
Roboto Mono e Archivo. Componentes: desktop, janelas, terminal, celular, Craft, Konami, sons,
a curva em SVG e o diagrama de blocos. Dependências: `framer-motion`, `react-draggable`,
`use-sound`, `three`, `@hugeicons/*`, `next-themes`. Deploy: o Worker de `/api/github/contributions`.
