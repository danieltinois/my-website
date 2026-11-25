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
   como cor de texto. Hoje: o marcador "24–29 set" na curva de contribuições e o número de destaque
   do DevClean.

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
- Cabeçalho corrido como o de uma ficha técnica: nome à esquerda, revisão à direita
  ("Rev. nov 2026", gerada na build).

## 5. Motivos recorrentes

1. **Numeração de documento.** As seções são numeradas porque a página é um documento com índice:
   `1 Visão geral`, `2 Projetos` (`2.1 DevClean`, `2.2 Pato Commit`, `2.3 resume-tailor`),
   `3 Trajetória`, `4 Contato`. O número fica na coluna de margem, em `condensed` + `muted`.
2. **Tabela de parâmetros.** Todo projeto tem uma tabela de duas colunas (parâmetro / valor) com
   linhas de 1px: Problema, Papel, Estado, Stack, Código. É o "datasheet" de cada peça.
3. **Figura com legenda.** Todo visual é uma figura numerada sobre `plate`, com grade em `rule` e
   legenda embaixo: "Figura 1. Contribuições por semana nos últimos 12 meses." Prints e diagramas
   seguem a mesma regra.

## 6. Movimento

- **Um** momento orquestrado: a curva de contribuições se desenha uma vez ao carregar (Fase 4).
- Interação responde ao usuário: sublinhado no hover, foco visível. Nada entra deslizando ao rolar.
- `prefers-reduced-motion: reduce`: nenhuma animação; a curva já aparece desenhada.

## 7. Revisão do plano contra os padrões genéricos

O que mudou em relação ao esboço da Fase 2, e por quê:

| Esboço | Agora | Motivo |
|---|---|---|
| Fundo creme `#F4F3EF` | Branco `#FFFFFF` | Creme é o padrão genérico; ficha técnica é papel branco. |
| Escuro `#111110` | Grafite `#1B1E22` | Quase-preto tingido é tique; grafite lê como tela, não como tinta. |
| "DT-2026 · FICHA TÉCNICA" em caixa alta com ponto médio | "Rev. nov 2026" em sentence case | Rótulo decorativo em caixa alta é marca de template. |
| `01 / 02 / 03` nos projetos | `2.1 / 2.2 / 2.3` | Os projetos não são sequência; a numeração é a do documento. |
| Rótulos em monospace | Archivo condensada + `tabular-nums` | Mono puxa para terminal, que o brief exclui. |
| Links com `→` | Sublinhado | Seta no fim do link é tique. |
| Laranja como texto em números | Laranja só como marca gráfica | Laranja em texto não passa AA no claro; e reforça a regra. |

## 8. Fora do sistema (removido)

Tokens apagados do `globals.css`: `cn-*`, cores de redes sociais (`instagram`, `linkdin`, `github`),
sombras `bump`/`flat`, `docker-*`, `wave-*`, `bg-header`, cursores customizados e Roboto Mono.
Os componentes antigos que ainda os usam saem na Fase 5.
