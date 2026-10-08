"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "@/src/hooks/useSound";

const DELETADOS = [
  { nome: "node_modules/", info: "2,4 GB · de um projeto de 2023" },
  { nome: "curriculo_final_FINAL_v3.pdf", info: "o v4 é o que vale" },
  { nome: "css-que-funcionou-uma-vez.css", info: "nunca mais funcionou" },
  { nome: "ideia-de-startup-n47.md", info: "a n48 é melhor" },
  { nome: "TODO_ler_depois.pdf", info: "aberto 0 vezes" },
  { nome: "console.log('aqui').js", info: "debug profissional" },
];

const Trash = () => {
  const [itens, setItens] = useState(DELETADOS);
  const { play } = useSound("/sounds/bubble.mp3", { speed: 1.4 });

  const esvaziar = () => {
    play();
    navigator.vibrate?.([10, 40, 10]);
    setItens([]);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--color-bg-secondary)] p-6 font-mono text-sm">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">~/.trash</h2>
          <p className="mt-1 text-xs text-[var(--color-cn-highlight)]">
            {itens.length} {itens.length === 1 ? "item" : "itens"} · apagados automaticamente em 30 dias
          </p>
        </div>
        {itens.length > 0 && (
          <button
            onClick={esvaziar}
            className="shrink-0 rounded-xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] px-3 py-1 text-xs font-bold text-[var(--color-text)] shadow-bump-sm active:translate-y-0.5 active:shadow-none"
          >
            esvaziar
          </button>
        )}
      </header>

      <ul className="space-y-2">
        <AnimatePresence>
          {itens.map((item, i) => (
            <motion.li
              key={item.nome}
              exit={{ opacity: 0, x: 80, rotate: 6, transition: { delay: 0.04 * i } }}
              className="rounded-xl border-2 border-(--color-cn-border) bg-[var(--color-bg)] px-3 py-2 shadow-bump-sm"
            >
              <p className="truncate font-bold text-[var(--color-text)]">{item.nome}</p>
              <p className="text-xs text-[var(--color-text)] opacity-60">{item.info}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {itens.length === 0 && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
          className="mt-10 text-center text-[var(--color-text)] opacity-70"
        >
          mais uma lixeira vazia...
          <br />
          <span className="text-xs">(o node_modules volta amanhã)</span>
        </motion.p>
      )}
    </div>
  );
};

export default Trash;
