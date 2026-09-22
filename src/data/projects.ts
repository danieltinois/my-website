export interface Project {
  name: string;
  description: string;
  stack: string[];
  status: "live" | "wip" | "archived";
  links: { github?: string; live?: string };
}

// ponytail: placeholders — pedir a lista real de projetos pro Daniel
export const PROJECTS: Project[] = [
  {
    name: "my-website",
    description:
      "Este portfolio: um desktop interativo com janelas arrastáveis, terminal e easter eggs. Todo em Next.js + Tailwind.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind"],
    status: "live",
    links: {
      github: "https://github.com/danieltinois/my-website",
      live: "/",
    },
  },
  {
    name: "cafe-break-cli",
    description:
      "Pomodoro de linha de comando que lembra você de tomar café (e de parar de café). Feito com Node puro.",
    stack: ["Node.js", "TypeScript"],
    status: "wip",
    links: { github: "https://github.com/danieltinois" },
  },
  {
    name: "git-toolbox",
    description:
      "Coleção de scripts git para ninjas: rebase sem medo, alias, autosquash e proteção contra push na sexta 22h.",
    stack: ["Shell", "Git"],
    status: "wip",
    links: { github: "https://github.com/danieltinois" },
  },
];