"use client";

import useSound from "@/src/hooks/useSound";
import { useState } from "react";

type DecorProps = {
  trashSvg: string;
  mugSvg: string;
  duckSvg: string;
  catSvg: string;
};

const TRASH_SAYS = [
  "mais uma lixeira vazia...",
  "aí não, isso aqui é reciclável (ou não)",
  "vou guardar por 30 dias, depois sumo",
];

const Decor = ({ trashSvg, mugSvg, duckSvg, catSvg }: DecorProps) => {
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
        className="fixed bottom-16 left-6 z-10 flex flex-col items-center gap-1 cursor-pointer
          hover:scale-110 active:scale-90 transition-transform duration-200 group"
      >
        {says && (
          <span
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-1 rounded-full
              bg-white text-sm font-bold text-[#1a1a1a] shadow-bump-sm
              border-2 border-(--color-cn-border)"
          >
            {says}
          </span>
        )}
        <span
          className="group-hover:-rotate-6 transition-transform duration-200"
          dangerouslySetInnerHTML={{ __html: trashSvg }}
        />
      </button>

      <div
        className="fixed bottom-14 right-10 z-0 pointer-events-none select-none decor-wobble"
        title="café de produção (sempre quente)"
        dangerouslySetInnerHTML={{ __html: mugSvg }}
      />

      <div
        className="fixed top-24 right-10 z-0 pointer-events-none select-none decor-bob"
        title="planteria? é um patinho legal"
        dangerouslySetInnerHTML={{ __html: duckSvg }}
      />

      <div
        className="fixed top-28 left-8 z-0 pointer-events-none select-none decor-bob"
        style={{ animationDelay: "1.2s" }}
        title="mascote oficial do repo"
        dangerouslySetInnerHTML={{ __html: catSvg }}
      />
    </>
  );
};

export default Decor;