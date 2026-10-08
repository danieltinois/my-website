"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import useSound from "@/src/hooks/useSound";
import { useWindowManager } from "@/src/context/WindowManager";
import Trash from "@/src/components/features/Trash";

const Decor = () => {
  const { play } = useSound("/sounds/bubble.mp3", {
    speed: 1.4,
    lowPassFreq: 8000,
  });
  const { launchApp } = useWindowManager();

  const handleTrash = () => {
    play();
    launchApp(<Trash />, "lixeira", Delete02Icon);
  };

  return (
    <button
      onClick={handleTrash}
      aria-label="abrir lixeira"
      className="fixed bottom-24 left-6 z-10 flex flex-col items-center gap-1 cursor-pointer
        hover:scale-110 active:scale-90 transition-transform duration-200 group"
    >
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
  );
};

export default Decor;
