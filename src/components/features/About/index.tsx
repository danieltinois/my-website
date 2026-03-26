"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BlinkingCursor,
  TerminalPrompt,
} from "@/src/components/ui/TerminalElements";
import { Typewriter } from "@/src/components/ui/Typewriter";

const outputVariants = {
  hidden: {
    opacity: 0,
    y: -5,
    filter: "blur(2px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};
const About = () => {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 3 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commandHistory, step]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = inputValue.trim();

      if (trimmedInput.toLowerCase() === "clear") {
        setCommandHistory([]);
        setInputValue("");
        return;
      }

      setCommandHistory((prev) => [...prev, inputValue]);
      setInputValue("");
    }
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
              <ul className="space-y-2">
                <li>
                  <strong>User:</strong> Daniel Tinois
                </li>
                <li>
                  <strong>Role:</strong> Full Stack Developer
                </li>
                <li>
                  <strong>Location:</strong> São Paulo, BR
                </li>
                <li>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-400 animate-pulse">
                    Online & Coding
                  </span>
                </li>
              </ul>
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
                <p className="leading-relaxed">
                  Transformando café em código e ideias em interfaces
                  interativas. Especialista em construir ecossistemas digitais
                  robustos (Web & Mobile) com foco total na experiência do
                  usuário.
                </p>
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
                <p className="italic text-gray-400">
                  &#34;The best way to predict the future is to implement
                  it.&#34;
                </p>
              </motion.div>
            )}
          </div>
        )}

        {step >= 3 &&
          commandHistory.map((cmd, index) => (
            <div key={index} className="mb-6">
              <div className="flex items-center">
                <TerminalPrompt />
                <span className="text-gray-100">{cmd}</span>
              </div>
              {cmd.trim() !== "" && (
                <div className="mt-2 pl-4 border-l-2 border-red-500/50">
                  <p className="text-red-400">bash: {cmd}: command not found</p>
                  <p className="mt-1 text-yellow-400">
                    {index >= 10
                      ? "Você só pode estar brincando..."
                      : "Calma aí hacker, isso é só um terminal fake! >:D"}
                  </p>
                </div>
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
