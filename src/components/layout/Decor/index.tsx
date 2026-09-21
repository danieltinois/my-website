"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import useSound from "@/src/hooks/useSound";
import { Cat, Ghost, Mug } from "react-kawaii";
import { useState } from "react";

const TRASH_SAYS = [
  "mais uma lixeira vazia...",
  "aí não, isso aqui é reciclável (ou não)",
  "vou guardar por 30 dias, depois sumo",
];

const Decor = () => {
  const { play } = useSound("/sounds/bubble.mp3", {
    speed: 1.4,
    lowPassFreq: 8000,
  });
  const [says, setSays] = useState<string | null>(null);

  const handleTrash = () => {
    play();
    setSays(TRASH_SAYS[Math.floor(Math.random() * TRASH_SAYS.length)]);
    window.setTimeout(() => setSays(null), 1600);
  };

  return (
    <>
      <button
        onClick={handleTrash}
        aria-label="lixeira de decoração"
        className="fixed bottom-24 left-6 z-10 flex flex-col items-center gap-1 cursor-pointer
          hover:scale-110 active:scale-90 transition-transform duration-200 group"
      >
        {says && (
          <span
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-1 rounded-full
              bg-white text-sm font-bold text-[#1a1a1a] shadow-bump-sm
              border-2 border-[var(--color-cn-border)]"
          >
            {says}
          </span>
        )}
        <div
          className="flex flex-col items-center gap-1 px-4 py-3 rounded-[18px]
            bg-[var(--color-bg-secondary)] border-4 border-(--color-cn-border) shadow-bump
            group-hover:-rotate-6 transition-transform duration-200"
        >
          <HugeiconsIcon
            icon={Delete02Icon}
            size={40}
            color="color-text"
            strokeWidth={1.5}
          />
          <span className="text-xs font-mono opacity-70">lixeira</span>
        </div>
      </button>

      <div
        className="fixed bottom-16 right-10 z-0 pointer-events-none select-none decor-wobble"
        title="café de produção (sempre quente)"
      >
        <Mug size={120} mood="happy" color="#c8b393" />
      </div>

      <div
        className="fixed top-24 right-10 z-0 pointer-events-none select-none decor-bob"
        title="planteria? é um fantasminha legal"
      >
        <Ghost size={110} mood="blissful" color="#f7e6ff" />
      </div>

      <div
        className="fixed top-28 left-8 z-0 pointer-events-none select-none decor-bob"
        style={{ animationDelay: "1.2s" }}
        title="mascote oficial do repo"
      >
        <Cat size={130} mood="lovestruck" color="#f39c12" />
      </div>
    </>
  );
};

export default Decor;