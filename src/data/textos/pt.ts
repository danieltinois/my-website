import type { Textos } from "../site";

// Português: a fonte dos textos (docs/content.md). As outras línguas traduzem daqui.
export const pt: Textos = {
  meta: {
    titulo: "Daniel Tinois, dev full stack",
    descricao: "Dev full stack pleno na Verzel, em São Paulo. React, Next, Flutter, Node e Spring. Projetos, trajetória e contato.",
  },
  ui: {
    pular: "Pular para o conteúdo",
    secoes: "Seções",
    idioma: "Idioma",
    titulos: { projetos: "Projetos", trajetoria: "Trajetória", contato: "Contato" },
    cidade: "são paulo",
    contribuicoes12m: "{n} contribuições em 12 meses",
    revisao: "rev.",
    dica: "clique no céu ou no lago",
    cena: "Cena em ASCII quase realista: um castelo iluminado sobre um penhasco à noite, com uma cachoeira caindo num lago que reflete a lua cheia, floresta de pinheiros ao redor e, de vez em quando, um dragão cruzando o céu.",
    stats: {
      legenda: "Minhas contribuições públicas no GitHub, de {de} a {ate}.",
      total: "contribuições em 12 meses",
      dias: "dias com contribuição",
      sequencia: "maior sequência",
      unidadeDias: "{n} dias",
      semanaPico: "semana mais intensa",
      ver: "ver os dados por semana",
      semanaDe: "semana de",
      contribuicoes: "contribuições",
      emCurso: "(em curso)",
    },
    projeto: {
      problema: "problema",
      comoFunciona: "como funciona",
      dificil: "o difícil",
      estado: "estado",
      papel: "papel",
      stack: "stack",
      codigo: "código",
    },
    copiar: { acao: "copiar", copiado: "copiado", falhou: "não deu para copiar", rotulo: "copiar e-mail" },
    voltarTopo: "voltar ao topo",
  },
  perfil: {
    cargo: "Dev full stack pleno na Verzel, em São Paulo.",
    resumo:
      "Faço web com React e Next, mobile com Flutter e APIs em Node e Spring. Escrevo software que não perde evento, não inventa dado e não apaga o que não deve.",
  },
  // a tabela de especificações do hero: o que um recrutador procura, numa olhada
  especificacoes: [
    { k: "local", v: "São Paulo" },
    { k: "web", v: "React, Next.js, TypeScript" },
    { k: "mobile", v: "Flutter" },
    { k: "back-end", v: "Node, Spring, PostgreSQL" },
    { k: "programando desde", v: "2020" },
    { k: "formação", v: "Engenharia de Software, FIAP (2027)" },
  ],
  projetos: [
    {
      id: "devclean",
      nome: "DevClean",
      resumo: "Descobre quais ferramentas de dev estão enchendo o disco do Mac e limpa só o que é seguro.",
      problema:
        "DerivedData, simuladores, imagens do Android, node_modules e caches somam dezenas de GB. Limpadores genéricos não sabem o que dá pra recriar.",
      comoFunciona:
        "Cada achado diz qual ferramenta criou, quanto ocupa, o risco de remover e como recriar depois. O app move para a Lixeira só caches conhecidos, depois de confirmar, e nunca esvazia a Lixeira.",
      dificil:
        "O mesmo motor em TypeScript roda na CLI e dentro do app SwiftUI, no macOS e no iPhone, via JavaScriptCore. Regras são arquivos JSON: um scanner novo não exige código. Antes de mover, o app confere de novo o caminho real e o inode, então uma regra errada mostra mais, mas nunca apaga mais.",
      estado: "Em uso no meu Mac",
      papel: "Projeto solo",
      stack: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore",
      codigo: "https://github.com/danieltinois/dev-macos-clean",
    },
    {
      id: "pato-commit",
      nome: "Pato Commit",
      resumo: "Uma caixa de entrada do que espera decisão sua no GitHub, rodando na sua máquina.",
      problema: "PR esperando revisão, issue sem resposta e workflow vermelho ficam perdidos no meio das notificações.",
      comoFunciona: "Recebe os webhooks de uma GitHub App e monta uma lista só do que precisa de você.",
      dificil:
        "O GitHub entrega cada evento pelo menos uma vez. Cada entrega tem a assinatura conferida, é deduplicada pelo ID e gravada no Postgres antes da resposta; um UPDATE condicional garante que só um worker processa. A fila é uma tabela: sem Redis, sem broker, e três ADRs explicam por quê.",
      estado: "Recebimento de eventos pronto; a caixa de entrada é o próximo marco",
      papel: "Projeto solo, do ADR ao CI",
      stack: "Java 25, Spring Boot 4, PostgreSQL 18, Flyway, Next.js 16",
      codigo: "https://github.com/danieltinois/pato-commit",
    },
    {
      id: "resume-tailor",
      nome: "resume-tailor",
      resumo: "Um perfil, um currículo sob medida para cada vaga, sem inventar nada.",
      problema: "Adaptar o currículo pra cada vaga é manual, e ferramentas que reescrevem com IA inventam fatos.",
      comoFunciona:
        "Você cola a vaga; o app acha as skills pedidas, sugere quais experiências mostrar e em que ordem, e gera um PDF A4 legível por ATS. Perfil em português e inglês.",
      dificil:
        "O texto sempre vem do perfil. O montador copia por ID e rejeita ID desconhecido, então nem uma IA plugada depois consegue inventar empresa, cargo ou métrica. O contrato OpenAPI é checado por teste e gera os tipos do front; um teste de ponta a ponta vai do cadastro ao PDF.",
      estado: "Funcional, roda com Docker Compose",
      papel: "Projeto solo",
      stack: "Java 21, Spring Boot, Angular, PostgreSQL, Typst, Playwright",
      codigo: "https://github.com/danieltinois/job-resume-generator",
    },
  ],
  trajetoria: [
    { quando: "2026", titulo: "Verzel", texto: "Dev full stack pleno." },
    {
      quando: "2026",
      titulo: "LBA Capital, freela",
      texto: "Filas e webhook para destravar o processamento e a atualização de boletos. Node, Supabase, PostgreSQL.",
    },
    {
      quando: "2025",
      titulo: "1º lugar no FIAP NEXT",
      texto: "Desafio da Astéria: controle de caixa para pequenos supermercados, do protótipo ao pitch para banca C-level.",
    },
    {
      quando: "2025–2026",
      titulo: "Swift",
      texto: "1 ano e 7 meses no time de integrações: web com React, mobile com Flutter, APIs para e-commerce.",
    },
    { quando: "2024", titulo: "FIAP", texto: "Engenharia de Software, formatura em 2027." },
    {
      quando: "2021–2025",
      titulo: "Freelancer",
      texto: "Quatro anos de e-commerces, landing pages e sistemas sob medida, sozinho do contrato ao deploy.",
    },
    { quando: "2021", titulo: "Primeiro site", texto: "Voluntário, para orientar pacientes de UPA depois do atendimento." },
    { quando: "2020", titulo: "Plugins de Minecraft", texto: "Java, onde programar virou coisa que outras pessoas usam." },
  ],
  contato: {
    titulo: "Leu até aqui? Vamos conversar.",
    texto: "O caminho mais rápido é o e-mail.",
  },
};
