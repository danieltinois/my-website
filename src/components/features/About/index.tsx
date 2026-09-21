"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BlinkingCursor,
  TerminalPrompt,
} from "@/src/components/ui/TerminalElements";
import { Typewriter } from "@/src/components/ui/Typewriter";

interface TerminalEntry {
  input: string;
  output?: React.ReactNode;
}

const outputVariants = {
  hidden: { opacity: 0, y: -5, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

const FILES: Record<string, string> = {
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

const SOCIALS = [
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
  social            meus links
  github            abre meu GitHub
  say <mensagem>    deixa eu ecoar
  date              data e hora
  history           histórico de comandos
  sudo <cmd>        escalate (ou não)
  clear | cls       limpa o terminal`;

const runCommand = (
  raw: string,
  history: string[],
): { input: string; output?: React.ReactNode } => {
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
            info.json&nbsp;&nbsp;&nbsp;bio.txt&nbsp;&nbsp;&nbsp;skills.md&nbsp;&nbsp;&nbsp;mindset.txt&nbsp;&nbsp;&nbsp;.config
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
  Theme: alterna (dark/light no navbar)
  Terminal: você está nele`}</pre>
        ),
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

const About = () => {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [entries, setEntries] = useState<TerminalEntry[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 3 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, step]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const raw = inputValue;
    const cmd = raw.trim().split(/\s+/)[0];

    if (cmd === "clear" || cmd === "cls") {
      setEntries([]);
      setInputValue("");
      return;
    }

    const entry = runCommand(raw, entries.map((en) => en.input));
    setEntries((prev) => [...prev, entry]);
    setInputValue("");
  };

  return (
    <div
      className="h-full w-full overflow-y-auto bg-black/80 p-6 font-mono text-sm text-gray-300 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex flex-col antialiased"
      onClick={() => {
        if (step === 3 && inputRef.current) inputRef.current.focus();
      }}
    >
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center">
            <TerminalPrompt />
            <Typewriter
              text="cat info.json"
              delay={500}
              onComplete={() => setStep(1)}
            />
            {step === 0 && <BlinkingCursor />}
          </div>

          {step >= 1 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={outputVariants}
              className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
            >
              <pre className="whitespace-pre-wrap">
                {FILES["info.json"]}
              </pre>
            </motion.div>
          )}
        </div>

        {step >= 1 && (
          <div className="mb-6">
            <div className="flex items-center">
              <TerminalPrompt />
              <Typewriter
                text="cat bio.txt"
                delay={800}
                onComplete={() => setStep(2)}
              />
              {step === 1 && <BlinkingCursor />}
            </div>

            {step >= 2 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={outputVariants}
                className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
              >
                <p className="leading-relaxed">{FILES["bio.txt"]}</p>
              </motion.div>
            )}
          </div>
        )}

        {step >= 2 && (
          <div className="mb-6">
            <div className="flex items-center">
              <TerminalPrompt />
              <Typewriter
                text="echo $MINDSET"
                delay={800}
                onComplete={() => setStep(3)}
              />
              {step === 2 && <BlinkingCursor />}
            </div>

            {step >= 3 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={outputVariants}
                className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
              >
                <p className="italic text-gray-400">{FILES["mindset.txt"]}</p>
              </motion.div>
            )}
          </div>
        )}

        {step >= 3 &&
          entries.map((entry, index) => (
            <div key={index} className="mb-6">
              <div className="flex items-center">
                <TerminalPrompt />
                <span className="text-gray-100">{entry.input}</span>
              </div>
              {entry.output && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={outputVariants}
                  className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
                >
                  {entry.output}
                </motion.div>
              )}
            </div>
          ))}

        {step >= 3 && (
          <div className="flex items-center">
            <TerminalPrompt />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-gray-100 font-mono p-0 m-0 focus:ring-0"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </div>
        )}

        <div ref={bottomRef} className="h-4 w-full" />
      </div>
    </div>
  );
};

export default About;