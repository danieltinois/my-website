# Conteúdo do site

Fonte única dos textos do portfólio. O layout lê daqui; se um texto mudar, muda aqui primeiro.
Marcações `[?]` são lacunas que só o Daniel preenche.

Regras de escrita:
- frases curtas, verbo no começo, um fato por frase;
- número no lugar de adjetivo; nada de "apaixonado por tecnologia", "soluções inovadoras", "transformo café em código";
- cada projeto responde: qual problema, o que eu fiz, o que tem de difícil, em que estado está.

---

## Metadados

- **title:** Daniel Tinois — dev full stack
- **description:** Dev full stack pleno na Verzel, em São Paulo. React, Next, Flutter, Node e Spring. Projetos, trajetória e contato.

---

## Hero (capa, sem número)

**Daniel Tinois**

Dev full stack pleno na Verzel, em São Paulo.

Faço web com React e Next, mobile com Flutter e APIs em Node e Spring. Escrevo software que não
perde evento, não inventa dado e não apaga o que não deve.

- CTA principal: **me@danieltinois.dev** (mailto)
- Secundários: GitHub, LinkedIn

À direita: o campo de contribuições (ver `docs/design.md`, seção 6).

Abaixo, grade de especificações:

| Parâmetro | Valor |
|---|---|
| Local | São Paulo |
| Web | React, Next.js, TypeScript |
| Mobile | Flutter |
| Back-end | Node, Spring, PostgreSQL |
| Programando desde | 2020 |
| Formação | Engenharia de Software, FIAP (2027) |

---

## 1. Projetos

### 1.1 DevClean

**Descobre quais ferramentas de dev estão enchendo o disco do Mac — e limpa só o que é seguro.**

- **Problema:** DerivedData, simuladores, imagens do Android, `node_modules` e caches somam dezenas de GB. Limpadores genéricos não sabem o que dá pra recriar.
- **O que faz:** cada achado diz qual ferramenta criou, quanto ocupa, o risco de remover (SAFE, REVIEW, DANGER) e como recriar depois. O app move para a Lixeira só caches conhecidos, depois de confirmar, e nunca esvazia a Lixeira.
- **O difícil:** o mesmo motor em TypeScript roda na CLI (Bun) e dentro do app SwiftUI, no macOS e no iPhone, via JavaScriptCore. Regras são arquivos JSON: um scanner novo não exige código. Antes de mover, o app confere de novo o caminho real e o inode, então uma regra errada mostra mais, mas nunca apaga mais.
- **Resultado:** uso no meu Mac. [? quantos GB já liberou / com que frequência]
- **Papel:** projeto solo.
- **Stack:** TypeScript · Bun · Swift · SwiftUI · JavaScriptCore
- **Links:** github.com/danieltinois/dev-macos-clean
- **Ilustração:** a varredura de caches em caracteres (valores do exemplo do README)

### 1.2 Pato Commit

**Uma caixa de entrada do que espera decisão sua no GitHub, rodando na sua máquina.**

- **Problema:** PR esperando revisão, issue sem resposta e workflow vermelho ficam perdidos no meio das notificações.
- **O que faz:** recebe os webhooks de uma GitHub App e monta uma lista só do que precisa de você.
- **O difícil:** o GitHub entrega cada evento pelo menos uma vez. Cada entrega tem a assinatura conferida em tempo constante, é deduplicada pelo ID e gravada no Postgres antes da resposta; um `UPDATE` condicional garante que só um worker processa. A fila é uma tabela: sem Redis, sem broker, e três ADRs explicam por quê.
- **Estado:** recebimento de eventos pronto e testado com Testcontainers. A caixa de entrada é o próximo marco.
- **Papel:** projeto solo, do ADR ao CI.
- **Stack:** Java 25 · Spring Boot 4 · PostgreSQL 18 · Flyway · Next.js 16
- **Links:** github.com/danieltinois/pato-commit
- **Ilustração:** eventos andando pelo pipeline, com a entrega repetida descartada no webhook

### 1.3 resume-tailor

**Um perfil, um currículo sob medida para cada vaga — sem inventar nada.**

- **Problema:** adaptar o currículo pra cada vaga é manual, e ferramentas que reescrevem com IA inventam fatos.
- **O que faz:** você cola a vaga; o app acha as skills pedidas, sugere quais experiências mostrar e em que ordem, e gera um PDF A4 legível por ATS. Perfil em português e inglês.
- **O difícil:** o texto sempre vem do perfil. O montador copia por ID e rejeita ID desconhecido, então nem uma IA plugada depois consegue inventar empresa, cargo ou métrica. O contrato OpenAPI é checado por teste e gera os tipos do front; um E2E com Playwright vai do cadastro ao PDF.
- **Estado:** funcional, roda com Docker Compose.
- **Papel:** projeto solo.
- **Stack:** Java 21 · Spring Boot · Angular · PostgreSQL · Typst · Playwright
- **Links:** github.com/danieltinois/job-resume-generator
- **Ilustração:** experiências reordenadas pela aderência à vaga

---

## 2. Trajetória

- **2026 — Verzel.** Dev full stack pleno.
- **2026 — LBA Capital, freela.** Filas e webhook para destravar o processamento e a atualização de boletos. Node, Supabase, PostgreSQL.
- **2025 — 1º lugar no FIAP NEXT.** Desafio da Astéria: controle de caixa para pequenos supermercados, do protótipo ao pitch para banca C-level.
- **2025–2026 — Swift.** 1 ano e 7 meses no time de integrações: web com React, mobile com Flutter, APIs para e-commerce.
- **2024 — FIAP.** Engenharia de Software, formatura em 2027.
- **2021–2025 — Freelancer.** Quatro anos de e-commerces, landing pages e sistemas sob medida, sozinho do contrato ao deploy.
- **2021 — Primeiro site.** Voluntário, para orientar pacientes de UPA depois do atendimento.
- **2020 — Plugins de Minecraft.** Java, onde programar virou coisa que outras pessoas usam.

---

## 3. Contato

**Vamos conversar.**
O caminho mais rápido é o e-mail.

- me@danieltinois.dev
- LinkedIn · GitHub

Rodapé: © 2026 Daniel Tinois · São Paulo
