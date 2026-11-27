import type { Textos } from "../site";

// English: translated from pt.ts.
export const en: Textos = {
  meta: {
    titulo: "Daniel Tinois, full stack developer",
    descricao: "Mid-level full stack developer at Verzel, in São Paulo. React, Next, Flutter, Node and Spring. Projects, background and contact.",
  },
  ui: {
    pular: "Skip to content",
    secoes: "Sections",
    idioma: "Language",
    titulos: { projetos: "Projects", trajetoria: "Background", contato: "Contact" },
    cidade: "são paulo",
    contribuicoes12m: "{n} contributions in 12 months",
    revisao: "rev.",
    rolar: "scroll to reveal",
    dica: "click the sky or the lake",
    cena: "Near-photographic ASCII scene: a lit castle on a cliff at night, with a waterfall falling into a lake that reflects the full moon, pine forest all around and, every now and then, a dragon crossing the sky.",
    vela: {
      cena: "Near-photographic ASCII scene: a lit candle in a brass holder on a wooden table at night, next to an inkwell with a quill and a stone window with the full moon. The flame flickers, a thread of smoke rises and dust glows in the light.",
      dica: "click to blow on the candle",
    },
    stats: {
      legenda: "My public GitHub contributions, from {de} to {ate}.",
      total: "contributions in 12 months",
      dias: "days with contributions",
      sequencia: "longest streak",
      unidadeDias: "{n} days",
      semanaPico: "busiest week",
      ver: "see the data by week",
      semanaDe: "week of",
      contribuicoes: "contributions",
      emCurso: "(in progress)",
    },
    projeto: {
      problema: "problem",
      comoFunciona: "how it works",
      dificil: "the hard part",
      estado: "status",
      papel: "role",
      stack: "stack",
      codigo: "code",
    },
    copiar: { acao: "copy", copiado: "copied", falhou: "couldn't copy", rotulo: "copy e-mail" },
    voltarTopo: "back to top",
  },
  perfil: {
    cargo: "Mid-level full stack developer at Verzel, in São Paulo.",
    resumo:
      "I build web apps with React and Next, mobile apps with Flutter and APIs with Node and Spring. I write software that doesn't lose events, doesn't make up data and doesn't delete what it shouldn't.",
  },
  especificacoes: [
    { k: "location", v: "São Paulo, Brazil" },
    { k: "web", v: "React, Next.js, TypeScript" },
    { k: "mobile", v: "Flutter" },
    { k: "back end", v: "Node, Spring, PostgreSQL" },
    { k: "coding since", v: "2020" },
    { k: "education", v: "Software Engineering, FIAP (2027)" },
  ],
  projetos: [
    {
      id: "devclean",
      nome: "DevClean",
      resumo: "Finds which developer tools are filling up your Mac's disk and cleans only what is safe.",
      problema:
        "DerivedData, simulators, Android images, node_modules and caches add up to tens of GB. Generic cleaners don't know what can be rebuilt.",
      comoFunciona:
        "Each finding says which tool created it, how much space it takes, the risk of removing it and how to rebuild it later. The app moves only known caches to the Trash, after you confirm, and never empties the Trash.",
      dificil:
        "The same TypeScript engine runs in the CLI and inside the SwiftUI app, on macOS and on iPhone, through JavaScriptCore. Rules are JSON files: a new scanner needs no code. Before moving anything, the app checks the real path and the inode again, so a wrong rule can show more, but never delete more.",
      estado: "In use on my Mac",
      papel: "Solo project",
      stack: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore",
      codigo: "https://github.com/danieltinois/dev-macos-clean",
    },
    {
      id: "pato-commit",
      nome: "Pato Commit",
      resumo: "An inbox of everything on GitHub that is waiting for your decision, running on your machine.",
      problema: "PRs waiting for review, unanswered issues and red workflows get lost among the notifications.",
      comoFunciona: "It receives the webhooks of a GitHub App and builds a list of only what needs you.",
      dificil:
        "GitHub delivers each event at least once. Every delivery has its signature checked, is deduplicated by ID and saved to Postgres before the response; a conditional UPDATE makes sure only one worker processes it. The queue is a table: no Redis, no broker, and three ADRs explain why.",
      estado: "Event intake done; the inbox is the next milestone",
      papel: "Solo project, from ADR to CI",
      stack: "Java 25, Spring Boot 4, PostgreSQL 18, Flyway, Next.js 16",
      codigo: "https://github.com/danieltinois/pato-commit",
    },
    {
      id: "resume-tailor",
      nome: "resume-tailor",
      resumo: "One profile, a tailored résumé for every job, without making anything up.",
      problema: "Tailoring a résumé for each job is manual work, and tools that rewrite it with AI make up facts.",
      comoFunciona:
        "You paste the job post; the app finds the skills it asks for, suggests which experiences to show and in what order, and generates an ATS-readable A4 PDF. Profile in Portuguese and English.",
      dificil:
        "The text always comes from the profile. The builder copies by ID and rejects unknown IDs, so not even an AI plugged in later can invent a company, title or metric. The OpenAPI contract is checked by tests and generates the front-end types; an end-to-end test goes from sign-up to PDF.",
      estado: "Working, runs with Docker Compose",
      papel: "Solo project",
      stack: "Java 21, Spring Boot, Angular, PostgreSQL, Typst, Playwright",
      codigo: "https://github.com/danieltinois/job-resume-generator",
    },
  ],
  trajetoria: [
    { quando: "2026", titulo: "Verzel", texto: "Mid-level full stack developer." },
    {
      quando: "2026",
      titulo: "LBA Capital, freelance",
      texto: "Queues and a webhook to unblock the processing and updating of bank slips. Node, Supabase, PostgreSQL.",
    },
    {
      quando: "2025",
      titulo: "1st place at FIAP NEXT",
      texto: "Astéria's challenge: cash control for small supermarkets, from prototype to a pitch for a C-level panel.",
    },
    {
      quando: "2025–2026",
      titulo: "Swift",
      texto: "1 year and 7 months on the integrations team: web with React, mobile with Flutter, APIs for e-commerce.",
    },
    { quando: "2024", titulo: "FIAP", texto: "Software Engineering, graduating in 2027." },
    {
      quando: "2021–2025",
      titulo: "Freelancer",
      texto: "Four years of online stores, landing pages and custom systems, on my own from contract to deploy.",
    },
    { quando: "2021", titulo: "First website", texto: "Volunteer work, to guide emergency care patients after their visit." },
    { quando: "2020", titulo: "Minecraft plugins", texto: "Java, where programming became something other people use." },
  ],
  contato: {
    titulo: "Read this far? Let's talk.",
    texto: "The fastest way is e-mail.",
  },
};
