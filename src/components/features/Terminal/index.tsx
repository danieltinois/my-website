"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { runCommand, TerminalEntry } from "./commands";
import { useGitHubRepos } from "@/src/hooks/useGitHubRepos";
import useSound from "@/src/hooks/useSound";
import { TerminalPrompt } from "@/src/components/ui/TerminalElements";

const outputVariants = {
  hidden: { opacity: 0, y: -5, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

const Terminal = () => {
  const { setTheme } = useTheme();
  const { repos } = useGitHubRepos();
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [inputValue, setInputValue] = useState("");

  const { play: playKey } = useSound("/sounds/click.mp3", { speed: 3 });
  const { play: playSubmit } = useSound("/sounds/bubble.mp3", { speed: 2 });

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      playSubmit();
    } else if (e.key.length === 1 || e.key === "Backspace") {
      // ponytail: imprimíveis + backspace — ignora shift/ctrl/etc
      playKey();
    } else {
      return;
    }

    if (e.key !== "Enter") return;

    const raw = inputValue;
    const cmd = raw.trim().split(/\s+/)[0] || "";

    if (cmd === "clear" || cmd === "cls") {
      setEntries([]);
      setInputValue("");
      return;
    }

    const entry = runCommand(raw, entries.map((en) => en.input), {
      setTheme,
      repos,
    });
    setEntries((prev) => [...prev, entry]);
    setInputValue("");
  };

  return (
    <div
      className="h-full w-full overflow-y-auto bg-black/80 p-6 font-mono text-sm text-gray-300 flex flex-col antialiased"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mb-4 select-none text-xs text-[var(--color-cn-highlight)]">
        <span className="font-bold">~/terminal</span>
        <span className="text-gray-500"> — digite help</span>
      </div>

      <div className="flex-1">
        {entries.map((entry, index) => (
          <div key={index} className="mb-4">
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

        <div ref={bottomRef} className="h-4 w-full" />
      </div>
    </div>
  );
};

export default Terminal;