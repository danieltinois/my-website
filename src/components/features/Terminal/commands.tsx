import { ReactNode } from "react";
import { PROJECTS } from "@/src/data/projects";

export interface TerminalEntry {
  input: string;
  output?: ReactNode;
}

export interface CommandHelpers {
  setTheme?: (theme: "dark" | "light") => void;
  repos?: typeof PROJECTS;
}

export const FILES: Record<string, string> = {
  "info.json": `{
  "user": "Daniel Tinois",
  "role": "Full Stack Developer",
  "location": "São Paulo, BR",
  "stack": ["React", "Next.js", "Node", "TypeScript"],
  "status": "online && coding"
}`,
  "bio.txt": `Transformando café em código e ideias em interfaces interativas. Especialista em construir ecossistemas digitais robustos (Web & Mobile) com foco total na experiência do usuário.`,
  "skills.md": `## Stack
- Frontend: React, Next.js, TypeScript, Tailwind
- Backend: Node.js, PostgreSQL
- Mobile: React Native
- Extras: git rebase com orgulho, deploy às 22h sem medo`,
  "mindset.txt": `"The best way to predict the future is to implement it."`,
};

export const SOCIALS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/danieltinois" },
  { label: "GitHub", url: "https://github.com/danieltinois" },
  { label: "Instagram", url: "https://www.instagram.com/daniel.tinois" },
];

const helpText = `Comandos disponíveis:
  help              mostra isso
  whoami            quem é você
  pwd               diretório atual
  ls                lista arquivos
  cat <arquivo>     lê info.json | bio.txt | skills.md | mindset.txt
  neofetch          specs do sistema
  projects          meus projetos
  contact           como me achar
  coffee            pausa pro café
  theme <dark/light> troca o tema
  social            meus links
  github            abre meu GitHub
  say <mensagem>    deixa eu ecoar
  date              data e hora
  history           histórico de comandos
  sudo <cmd>        escalate (ou não)
  clear | cls       limpa o terminal`;

const COFFEE_ART = `
     ( (
      ) )
    ........
    |      |]
    \\      /
     \`----'
  transformando café em código...`;

export const runCommand = (
  raw: string,
  history: string[],
  helpers?: CommandHelpers,
): TerminalEntry => {
  const input = raw.trim();
  if (!input) return { input };

  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(" ").toLowerCase();

  switch (cmd) {
    case "help":
      return {
        input,
        output: <pre className="whitespace-pre-wrap">{helpText}</pre>,
      };

    case "whoami":
      return {
        input,
        output: (
          <span>
            danieltinois — Full Stack Developer (São Paulo, BR). Transforma
            café em código desde sempre.
          </span>
        ),
      };

    case "pwd":
      return { input, output: <span>~/portfolio</span> };

    case "ls":
      return {
        input,
        output: (
          <span className="text-gray-100">
            info.json&nbsp;&nbsp;&nbsp;bio.txt&nbsp;&nbsp;&nbsp;skills.md&nbsp;&nbsp;&nbsp;mindset.txt&nbsp;&nbsp;&nbsp;projects/&nbsp;&nbsp;&nbsp;.config
          </span>
        ),
      };

    case "cat":
      return { input, output: renderFile(arg) };

    case "neofetch":
      return {
        input,
        output: (
          <pre className="whitespace-pre-wrap">{`       .--.          daniel@portfolio
      /    \\         --------------------
     /  🐧  \\        OS: PortfolioOS XP (3.11 vibes)
     '~-.-~'         Uptime: ∞ (perpetuamente)
  daniel@portfolio   Shell: bash 5.2 (falso)
  -----------------  DE: Desktop Window Manager
  Resolution: viewport-dependent
  Theme: terracota (clay dev)
  Terminal: você está nele`}</pre>
        ),
      };

    case "projects": {
      const list = helpers?.repos ?? PROJECTS;
      return {
        input,
        output: (
          <div className="space-y-3">
            {list.map((p) => (
              <div key={p.name}>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-300 font-bold">{p.name}</span>
                  <span
                    className={`text-xs uppercase ${
                      p.status === "live" ? "text-green-400" : "text-yellow-300"
                    }`}
                  >
                    [{p.status}]
                  </span>
                  {p.links.github && (
                    <a
                      href={p.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      repo ↗
                    </a>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{p.description}</p>
                <p className="text-xs text-cyan-200/70">
                  stack: {p.stack.join(", ")}
                </p>
              </div>
            ))}
          </div>
        ),
      };
    }

    case "contact":
      return {
        input,
        output: (
          <div className="space-y-1">
            <div>
              <span className="inline-block w-24 text-blue-400">email</span>
              <span className="text-gray-100">danieltinois@gmail.com</span>
            </div>
            {SOCIALS.map((s) => (
              <div key={s.label} className="flex gap-4">
                <span className="w-20 text-blue-400">{s.label}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 underline hover:text-green-300"
                >
                  {s.url} ↗
                </a>
              </div>
            ))}
          </div>
        ),
      };

    case "coffee":
      return {
        input,
        output: <pre className="whitespace-pre-wrap text-amber-300">{COFFEE_ART}</pre>,
      };

    case "theme":
      if (arg === "dark" || arg === "light") {
        helpers?.setTheme?.(arg);
        return {
          input,
          output: (
            <span className="text-cyan-300">
              tema alterado para {arg}. suave, né?
            </span>
          ),
        };
      }
      if (!arg) {
        return {
          input,
          output: <span>uso: theme dark | theme light</span>,
        };
      }
      return {
        input,
        output: <span className="text-red-400">theme {arg}: esse tema não existe ainda</span>,
      };

    case "social":
      return {
        input,
        output: (
          <div className="space-y-1">
            {SOCIALS.map((s) => (
              <div key={s.label} className="flex gap-4">
                <span className="w-20 text-blue-400">{s.label}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 underline hover:text-green-300"
                >
                  {s.url} ↗
                </a>
              </div>
            ))}
          </div>
        ),
      };

    case "github":
      return {
        input,
        output: (
          <a
            href="https://github.com/danieltinois"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 underline hover:text-green-300"
          >
            https://github.com/danieltinois ↗
          </a>
        ),
      };

    case "say":
    case "echo":
      return {
        input,
        output: (
          <span>
            {cmd === "say" ? `"${arg}"` : arg || ".......mute"}
          </span>
        ),
      };

    case "date":
      return { input, output: <span>{new Date().toLocaleString("pt-BR")}</span> };

    case "history":
      return {
        input,
        output: (
          <pre className="whitespace-pre-wrap">
            {history.map((h, i) => `  ${i + 1}  ${h}`).join("\n") || "histórico vazio. atrevido, né?"}
          </pre>
        ),
      };

    case "sudo":
      if (arg.includes("rm -rf /")) {
        return {
          input,
          output: (
            <div>
              <p className="text-yellow-400">
                sudo: /dev/null acelerando...
              </p>
              <p className="text-green-400">
                rm: não vai dar. ibagens quase foram pro espaço, coração agradece.
              </p>
            </div>
          ),
        };
      }
      return {
        input,
        output: (
          <p className="text-red-400">
            sudo: permission denied. incidente reportado... ao seu eu do futuro.
          </p>
        ),
      };

    case "clear":
    case "cls":
      return { input };

    default:
      return {
        input,
        output: (
          <div>
            <p className="text-red-400">bash: {cmd}: command not found</p>
            <p className="mt-1 text-yellow-400">
              Calma aí hacker, isso é só um terminal fake! &gt;:D
            </p>
            <p className="mt-1 text-gray-500">
              dica: digite <span className="text-green-400">help</span>
            </p>
          </div>
        ),
      };
  }
};

const renderFile = (name: string) => {
  const content = FILES[name];
  if (!content) {
    return <p className="text-red-400">cat: {name}: No such file or directory</p>;
  }
  return <pre className="whitespace-pre-wrap text-gray-300">{content}</pre>;
};