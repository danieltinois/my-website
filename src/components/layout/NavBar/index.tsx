"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Moon01Icon,
  Sun01Icon,
  VolumeMute01Icon,
  VolumeMute02Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useSound from "@/src/hooks/useSound";

/* TODO - Adicionar botao de mudar linguagem, inicialmente PT-BR e EN
 *  Vai abrir um modal gamificado igual a window!
 */

const iconBtn =
  "cursor-pointer rounded-2xl border-3 border-[var(--color-cn-border)] p-2.5 shadow-bump-sm hover:scale-110 hover:rotate-6 active:scale-90 active:translate-y-1 active:shadow-none duration-200 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-(--color-cn-highlight)";

const NavBar = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { play, isMuted, toggleMute } = useSound("/sounds/click.mp3", {
    speed: 1.5,
  });

  useEffect(() => {
    //desencorajar efeitos que só servem para “fixar hydration” Mas neste caso, é exatamente para isso que serve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // antes de montar o tema e o som do usuário ainda não são conhecidos: mostra o padrão
  const dark = mounted && resolvedTheme === "dark";
  const muted = mounted && isMuted;

  const handleTheme = () => {
    play();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto] justify-start items-center h-16 relative z-50 select-none">
      <div className="grid grid-flow-col gap-4">
        <button
          className={iconBtn}
          onClick={handleTheme}
          aria-label={dark ? "usar tema claro" : "usar tema escuro"}
        >
          <HugeiconsIcon
            icon={dark ? Moon01Icon : Sun01Icon}
            size={40}
            color="color-text"
            strokeWidth={1.5}
          />
        </button>
        <button
          className={iconBtn}
          onClick={toggleMute}
          aria-label="som"
          aria-pressed={mounted ? !muted : undefined}
        >
          <HugeiconsIcon
            icon={muted ? VolumeMute02Icon : VolumeMute01Icon}
            size={40}
            color={"color-text"}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div></div>

      <a
        href="https://www.linkedin.com/in/danieltinois"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:scale-110 hover:underline duration-250 active:scale-80"
        onClick={() => play()}
      >
        <span className="font-mono text-xl">@danieltinois</span>
      </a>
    </div>
  );
};

export default NavBar;
