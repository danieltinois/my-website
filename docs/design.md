# Sistema de design

O site parece **a ficha técnica de um componente**. Uma ficha técnica é o documento em que um
engenheiro prova que a peça é confiável: o que ela faz, os limites, as medições. É o formato do
posicionamento ("software que não perde, não inventa e não apaga o que não deve").

Os tokens vivem em `src/app/globals.css` (`@theme`). O `@theme` zera os namespaces padrão do
Tailwind (`--color-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`...), então **só o que
está aqui existe como utilitário**. Se algo não tem token, a resposta é usar um que tem, não criar
um valor arbitrário.

Textos: `docs/content.md`.

---

## 1. Tipografia

**Uma família: Archivo** (variável, `@fontsource-variable/archivo/wdth.css`, eixos `wght` 100–900 e
`wdth` 62–125). A personalidade vem da largura, não de uma segunda fonte.

| Largura | Utilitário | Onde |
|---|---|---|
| 62,5% | `font-stretch-extra-condensed` | só o nome no hero (`text-display`) |
| 75% | `font-stretch-condensed` | numeração de seção, rótulos de tabela, legendas de figura, números |
| 87,5% | `font-stretch-semi-condensed` | títulos de seção (`text-h2`) |
| 100% | (padrão) | todo o resto |

**Pesos permitidos:** 400 (`font-regular`) e 600 (`font-semibold`). Nada mais.

**Escala fixa** (px / entrelinha / tracking):

| Token | Tamanho | Entrelinha | Tracking | Peso | Uso |
|---|---|---|---|---|---|
| `text-caption` | 14 | 20 | +0,005em | 400 | legendas de figura, rótulos, rodapé |
| `text-body` | 16 | 26 | 0 | 400 | texto corrido |
| `text-lead` | 18 | 28 | 0 | 400 | frase do hero, resumo de projeto |
| `text-h3` | 24 | 30 | −0,01em | 600 | nome do projeto |
| `text-h2` | 36 | 40 | −0,015em | 600 | título de seção |
| `text-display-sm` | 60 | 56 | −0,02em | 600 | nome no hero, < 768px |
| `text-display` | 96 | 88 | −0,025em | 600 | nome no hero, ≥ 768px |

Regras:
- **Sentence case sempre.** Nada de rótulo em caixa alta.
- Números em tabela, figura e numeração usam `tabular-nums`.
- Medida do texto: no máximo `max-w-measure` (42rem, ~68 caracteres).
- Link é sublinhado (1px, offset 0,2em); no hover o sublinhado vai a 2px. Sem seta `→` no texto.

## 2. Cor

Quatro neutros por tema e **um** destaque.

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `paper` | `#FFFFFF` | `#1B1E22` | fundo |
| `plate` | `#F1F2F3` | `#24282D` | área de figura, cabeçalho de tabela |
| `rule` | `#C9CDD2` | `#454B53` | linhas finas, grade do gráfico (decorativo) |
| `muted` | `#575D66` | `#A2A8B0` | texto secundário, numeração |
| `ink` | `#15181C` | `#ECEEF0` | texto, dados, foco |
| `signal` | `#F25400` | `#FF6A13` | o destaque: laranja de segurança |
| `on-signal` | `#15181C` | `#15181C` | texto sobre `signal` |

### Onde o `signal` pode aparecer (regra escrita)

1. **No CTA de e-mail**, como fundo, com texto `on-signal`.
2. **Em no máximo dois dados** da página inteira, como marca gráfica (ponto, barra ou traço) — nunca
   como cor de texto. Hoje: o marcador "24–29 set" na curva de contribuições. O segundo fica
   reservado para o número de uso do DevClean, quando ele existir.

Em nenhum outro lugar: nem hover, nem foco, nem seleção, nem borda, nem ícone. Se aparecer um terceiro
uso, um dos dois existentes sai.

### Contraste verificado (WCAG 2.1)

| Par | Claro | Escuro | Exigido |
|---|---|---|---|
| `ink` sobre `paper` | 17,81 | 14,38 | 4,5 |
| `ink` sobre `plate` | 15,89 | 12,75 | 4,5 |
| `muted` sobre `paper` | 6,64 | 6,98 | 4,5 |
| `muted` sobre `plate` | 5,92 | 6,19 | 4,5 |
| `on-signal` sobre `signal` (CTA) | 5,12 | 6,21 | 4,5 |
| `signal` sobre `paper` (marca gráfica) | 3,47 | 5,83 | 3,0 |
| `signal` sobre `plate` (marca gráfica) | 3,10 | 5,17 | 3,0 |
| `ink` sobre `paper` (anel de foco) | 17,81 | 14,38 | 3,0 |

`rule` (1,60 / 1,90) é decorativo: nunca é a única coisa que separa ou identifica algo.

## 3. Espaço, linha, raio, sombra

**Escala de espaçamento** (base 4px; só estes passos existem): `1`=4 · `2`=8 · `3`=12 · `4`=16 ·
`6`=24 · `8`=32 · `12`=48 · `16`=64 · `24`=96 · `32`=128.

- Dentro de um bloco: 4–16. Entre blocos de uma seção: 24–48. Entre seções: 96 (mobile 64).

**Linha:** uma espessura, **1px**, cor `rule` (padrão de todo `border`). Linha separa
informação: entre seções, entre linhas de tabela, eixo de figura. Não se usa linha como enfeite.

**Exceção de acessibilidade:** o anel de foco é `outline` de 2px em `ink`, offset 3px. Ele não é
uma borda e não conta como segunda espessura.

**Raio:** 0. Tudo é retangular, como papel impresso. (`--radius-*` está zerado.)

**Sombra:** não existe. Profundidade é dada por `plate` e por linha. (`--shadow-*` está zerado.)

## 4. Layout

- Container `max-w-page` (75rem), alinhado à esquerda do grid, com 24px de margem no mobile e 48px no desktop.
- Grid de 12 colunas a partir de 1024px: **coluna de margem** (colunas 1–3) para número de seção e
  rótulos, **coluna de conteúdo** (4–12). Abaixo de 1024px a margem vira uma linha acima do conteúdo.
- Tudo alinhado à esquerda. Nada centralizado.
- Cabeçalho corrido como o de uma ficha técnica: nome à esquerda, índice das seções e botão de
  tema à direita. A revisão ("Rev. 25 nov 2026", data do snapshot) fica no rodapé.
- Rótulo e valor de tabelas e listas se alinham pela linha de base, nunca pelo topo.
- No celular o CTA de e-mail ocupa a largura toda.

**Tema:** um script inline no `<head>` (`src/lib/theme.ts`) aplica `data-theme` antes da pintura,
a partir da escolha salva ou da preferência do sistema. O botão do cabeçalho só troca o atributo
e grava a escolha. Sem JavaScript, vale o tema claro.

## 5. Motivos recorrentes

1. **Numeração de documento.** O hero é a capa, sem número. As seções são numeradas porque a
   página é um documento com índice (o mesmo do cabeçalho): `1 Projetos` (`1.1 DevClean`,
   `1.2 Pato Commit`, `1.3 resume-tailor`), `2 Trajetória`, `3 Contato`. O número fica na coluna
   de margem, no tamanho do título, em `condensed` + `muted`, alinhado pela linha de base; abaixo
   de 1024px ele vai junto do título.
2. **Tabela de parâmetros.** Todo projeto tem uma tabela de duas colunas (parâmetro / valor) com
   linhas de 1px: Problema, Papel, Estado, Stack, Código. É o "datasheet" de cada peça.
3. **Figura com legenda.** Todo visual é uma figura numerada sobre `plate`, com grade em `rule` e
   legenda embaixo: "Figura 1. Contribuições por semana nos últimos 12 meses." Prints e diagramas
   seguem a mesma regra. **Tracejado quer dizer incompleto**: a semana em curso na Figura 1 e o
   bloco ainda não construído no diagrama do Pato Commit (Figura 2).

## 6. Peça-assinatura: a curva característica

A Figura 1 é o gráfico das contribuições públicas no GitHub por semana, nos últimos 12 meses,
desenhado como a curva característica de uma ficha técnica.

- **Dados reais, sem token.** `scripts/update-contributions.mts` lê o HTML público do GitHub
  (cada dia tem a contagem no tooltip) e grava `src/data/contributions.json`. Roda no `prebuild`;
  se o GitHub falhar ou o HTML mudar de formato, mantém o snapshot anterior e a build segue.
- **Zero JavaScript no cliente.** `src/components/ContributionCurve` é componente de servidor: o SVG
  sai pronto da build. Os dados se atualizam a cada deploy; a legenda diz a data do recorte.
- **Desenho:** linha em `ink` (curva monotônica, que passa por todos os pontos sem inventar picos),
  grade em `rule`, eixos em `caption` condensada. A semana em curso é tracejada, porque está incompleta.
- **Uma anotação em `signal`:** o marcador quadrado em 24–29 set, quando começam os três projetos
  (`src/data/curva.ts`). Ela some sozinha quando a data sai da janela de 12 meses.
- **Características típicas:** abaixo da figura, quatro números calculados (total, dias com
  contribuição, maior sequência, semana mais intensa) e a tabela completa em "Dados da figura 1",
  para leitor de tela e para quem quer conferir.
- **Geometria:** proporção 2:1 no celular e 4:1 a partir de 768px; o rótulo da anotação tem largura
  máxima `max-w-callout` (15rem). São as únicas medidas fora da escala de espaçamento.

## 7. Movimento

- **Um** momento orquestrado: a curva se desenha da esquerda para a direita uma vez ao carregar
  (`animate-draw`, 1,6s) e a anotação aparece quando a linha chega nela (`animate-mark`). Só CSS.
- Interação responde ao usuário: sublinhado no hover, foco visível. Nada entra deslizando ao rolar.
- `prefers-reduced-motion: reduce`: nenhuma animação; a curva já aparece desenhada.

## 8. Revisão do plano contra os padrões genéricos

O que mudou em relação ao esboço da Fase 2, e por quê:

| Esboço | Agora | Motivo |
|---|---|---|
| Fundo creme `#F4F3EF` | Branco `#FFFFFF` | Creme é o padrão genérico; ficha técnica é papel branco. |
| Escuro `#111110` | Grafite `#1B1E22` | Quase-preto tingido é tique; grafite lê como tela, não como tinta. |
| "DT-2026 · FICHA TÉCNICA" em caixa alta com ponto médio | "Rev. nov 2026" em sentence case | Rótulo decorativo em caixa alta é marca de template. |
| `01 / 02 / 03` nos projetos | `1.1 / 1.2 / 1.3` | Os projetos não são sequência; a numeração é a do documento. |
| Rótulos em monospace | Archivo condensada + `tabular-nums` | Mono puxa para terminal, que o brief exclui. |
| Links com `→` | Sublinhado | Seta no fim do link é tique. |
| Laranja como texto em números | Laranja só como marca gráfica | Laranja em texto não passa AA no claro; e reforça a regra. |

## 9. Fora do sistema (removido)

Tokens apagados do `globals.css`: `cn-*`, cores de redes sociais (`instagram`, `linkdin`, `github`),
sombras `bump`/`flat`, `docker-*`, `wave-*`, `bg-header`, cursores customizados e Roboto Mono.
Junto saíram o desktop, as janelas, o terminal, o celular, o Craft, o Konami, os sons e as
dependências `framer-motion`, `react-draggable`, `use-sound`, `three`, `@hugeicons/*` e `next-themes`.
