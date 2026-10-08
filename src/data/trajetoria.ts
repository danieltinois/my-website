// trajetória do about — linkedin (Profile.pdf) + currículo + histórico do github.

export type TipoMarco = "inicio" | "trabalho" | "freela" | "estudo" | "premio";

export interface Marco {
  quando: string;
  tipo: TipoMarco;
  titulo: string;
  onde?: string;
  texto: string;
  stack?: string[];
  artefatos?: { label: string; url: string }[];
}

const gh = (repo: string) => `https://github.com/danieltinois/${repo}`;

export const TRAJETORIA: Marco[] = [
  {
    quando: "2020",
    tipo: "inicio",
    titulo: "/plugin enable daniel",
    texto:
      "Comecei dentro do Minecraft. Quando faltava um comando ou uma mecânica no servidor, eu mesmo escrevia — plugins em Java, compilando, testando no jogo, quebrando, arrumando. Foi ali que programar deixou de ser abstrato: código era uma coisa que outras pessoas usavam.",
    stack: ["java"],
  },
  {
    quando: "jan 2021",
    tipo: "trabalho",
    titulo: "código com propósito",
    onde: "projeto social upa · dev web voluntário",
    texto:
      "Meu primeiro site fora do jogo foi voluntário: uma plataforma pra orientar pacientes de Unidades de Pronto Atendimento depois do atendimento — informação de saúde descentralizada, numa interface simples o bastante pra qualquer pessoa usar.",
    stack: ["html", "css", "javascript"],
  },
  {
    quando: "2021 – 2025",
    tipo: "freela",
    titulo: "freelancer, um cliente de cada vez",
    onde: "99freelas · full stack freelancer · ~4 anos",
    texto:
      "Em junho de 2021 peguei o primeiro cliente e não parei mais: e-commerces pequenos, landing pages de portfólio, aplicações web sob medida. Freela ensina o que curso nenhum ensina — prazo de verdade, cliente de verdade e a responsabilidade de entregar sozinho.",
    stack: ["react", "node.js", "typescript"],
  },
  {
    quando: "2022 – 2023",
    tipo: "estudo",
    titulo: "github, react e um projeto por dia",
    texto:
      "Abri o GitHub e comecei a construir em público: cobrinha, Flappy Bird, uma calculadora imitando o iOS (que explica bastante coisa sobre esse site virar celular no mobile). Depois veio a trilha Explorer da Rocketseat e uma enxurrada de repositórios.",
    artefatos: [
      { label: "calculadora ios", url: gh("calculadora_ios-ReactJs") },
      { label: "chat online", url: gh("Chat-online") },
    ],
  },
  {
    quando: "jan 2024",
    tipo: "estudo",
    titulo: "engenharia de software",
    onde: "fiap · bacharelado · formatura em 2027",
    texto:
      "Entrei na FIAP pra dar fundamento ao que eu já fazia na prática. Em paralelo, fui fundo no back-end: Node, bancos relacionais e até uma API em C# como teste técnico.",
    artefatos: [{ label: "food explorer", url: gh("food-explorer-back-end") }],
  },
  {
    quando: "mar 2025",
    tipo: "trabalho",
    titulo: "time de integrações",
    onde: "swift · full stack web & mobile · consultor de integrações",
    texto:
      "Um ano e sete meses construindo aplicações web com React e mobile com Flutter, além de APIs REST e integrações pra plataformas de e-commerce. Clean Architecture e SOLID no código, OpenAPI na documentação, testes unitários e funcionais, e squads Scrum com UX, produto e back-end — participando de review de código, design e arquitetura.",
    stack: ["react", "flutter", "next.js", "remix", "nestjs", "java/spring", "aws"],
  },
  {
    quando: "2025",
    tipo: "premio",
    titulo: "1º lugar no fiap next",
    onde: "enterprise challenge · astéria",
    texto:
      "No maior festival de inovação acadêmica do Brasil, meu time ficou em primeiro no desafio da Astéria: uma solução pra pequenos supermercados controlarem o fluxo de caixa, ligando leitura de código de barras e registro de compras à atualização do saldo no dashboard. Ideação, protótipo e pitch pra uma banca de executivos C-level.",
  },
  {
    quando: "set 2026",
    tipo: "freela",
    titulo: "filas, webhook e boleto em dia",
    onde: "lba capital · freelance por projeto",
    texto:
      "Um projeto curto e cirúrgico: implementei filas e um webhook pra resolver gargalos de processamento e problemas na atualização de boletos. Problema real, dinheiro real.",
    stack: ["node.js", "supabase", "postgresql", "edge functions"],
  },
  {
    quando: "out 2026",
    tipo: "trabalho",
    titulo: "hoje: dev pleno na verzel",
    onde: "verzel soluções em sistemas · mid-level software developer II",
    texto:
      "Capítulo novo, começando agora. Fora do expediente sigo tratando side project como startup — pato-commit, tinois.dev, git-validator — e estudando clean architecture, server-driven UI e agentes de IA.",
    artefatos: [
      { label: "tinois.dev", url: "https://tinois.dev" },
      { label: "git-validator", url: gh("git-validator") },
    ],
  },
];

export const ROADMAP = [
  { feito: true, item: "virar dev" },
  { feito: true, item: "fazer deploy na sexta (e sobreviver)" },
  { feito: true, item: "ter mais side projects do que tempo livre" },
  { feito: false, item: "transformar um side project em startup de verdade" },
  { feito: false, item: "achar product-market fit" },
  { feito: false, item: "IPO (sujeito a alterações sem aviso prévio)" },
];
