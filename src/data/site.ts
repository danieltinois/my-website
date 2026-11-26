// Todo o texto da página. Fonte: docs/content.md (se um texto mudar, muda lá e aqui).

export const SITE_URL = "https://danieltinois.dev";

export const EMAIL = "me@danieltinois.dev";

export const LINKS = {
  github: "https://github.com/danieltinois",
  linkedin: "https://www.linkedin.com/in/danieltinois",
};

export const PERFIL = {
  nome: "Daniel Tinois",
  cargo: "Dev full stack pleno na Verzel, em São Paulo.",
  resumo:
    "Faço web com React e Next, mobile com Flutter e APIs em Node e Spring. Escrevo software que não perde evento, não inventa dado e não apaga o que não deve.",
};

// a tabela de especificações do hero: o que um recrutador procura, numa olhada
export const ESPECIFICACOES = [
  { k: "Local", v: "São Paulo" },
  { k: "Web", v: "React, Next.js, TypeScript" },
  { k: "Mobile", v: "Flutter" },
  { k: "Back-end", v: "Node, Spring, PostgreSQL" },
  { k: "Programando desde", v: "2020" },
  { k: "Formação", v: "Engenharia de Software, FIAP (2027)" },
];

export interface Projeto {
  id: string;
  nome: string;
  resumo: string;
  problema: string;
  comoFunciona: string;
  dificil: string;
  parametros: { k: string; v: string }[];
  codigo: string;
}

export const PROJETOS: Projeto[] = [
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
    parametros: [
      { k: "Estado", v: "Em uso no meu Mac" },
      { k: "Papel", v: "Projeto solo" },
      { k: "Stack", v: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore" },
    ],
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
    parametros: [
      { k: "Estado", v: "Recebimento de eventos pronto; a caixa de entrada é o próximo marco" },
      { k: "Papel", v: "Projeto solo, do ADR ao CI" },
      { k: "Stack", v: "Java 25, Spring Boot 4, PostgreSQL 18, Flyway, Next.js 16" },
    ],
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
    parametros: [
      { k: "Estado", v: "Funcional, roda com Docker Compose" },
      { k: "Papel", v: "Projeto solo" },
      { k: "Stack", v: "Java 21, Spring Boot, Angular, PostgreSQL, Typst, Playwright" },
    ],
    codigo: "https://github.com/danieltinois/job-resume-generator",
  },
];

// curto: o rótulo do marco na estrada em ASCII da trajetória
export const TRAJETORIA = [
  { quando: "2026", titulo: "Verzel", curto: "verzel", texto: "Dev full stack pleno." },
  {
    quando: "2026",
    titulo: "LBA Capital, freela", curto: "lba",
    texto: "Filas e webhook para destravar o processamento e a atualização de boletos. Node, Supabase, PostgreSQL.",
  },
  {
    quando: "2025",
    titulo: "1º lugar no FIAP NEXT", curto: "fiap next",
    texto: "Desafio da Astéria: controle de caixa para pequenos supermercados, do protótipo ao pitch para banca C-level.",
  },
  {
    quando: "2025–2026",
    titulo: "Swift", curto: "swift",
    texto: "1 ano e 7 meses no time de integrações: web com React, mobile com Flutter, APIs para e-commerce.",
  },
  { quando: "2024", titulo: "FIAP", curto: "fiap", texto: "Engenharia de Software, formatura em 2027." },
  {
    quando: "2021–2025",
    titulo: "Freelancer", curto: "freela",
    texto: "Quatro anos de e-commerces, landing pages e sistemas sob medida, sozinho do contrato ao deploy.",
  },
  { quando: "2021", titulo: "Primeiro site", curto: "upa", texto: "Voluntário, para orientar pacientes de UPA depois do atendimento." },
  {
    quando: "2020",
    titulo: "Plugins de Minecraft", curto: "plugins",
    texto: "Java, onde programar virou coisa que outras pessoas usam.",
  },
];
