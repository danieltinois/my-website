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
import useClickSound from "@/src/hooks/useClickSound";

const NavBar = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { playClick, isMuted, toggleMute } = useClickSound(false, 1.5);

  useEffect(() => {
    //desencorajar efeitos que só servem para “fixar hydration” Mas neste caso, é exatamente para isso que serve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleTheme = () => {
    playClick();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto] justify-start items-center px-6 h-20">
      <div className="grid grid-flow-col gap-4">
        <button
          className="cursor-pointer hover:scale-110 duration-250 active:scale-80"
          onClick={handleTheme}
        >
          <HugeiconsIcon
            icon={resolvedTheme === "dark" ? Moon01Icon : Sun01Icon}
            size={40}
            color="color-text"
            strokeWidth={1.5}
          />
        </button>
        <button
          className="cursor-pointer hover:scale-110 duration-250 active:scale-80"
          onClick={toggleMute}
        >
          <HugeiconsIcon
            icon={isMuted ? VolumeMute02Icon : VolumeMute01Icon}
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
        onClick={() => playClick()}
      >
        <h1 className="font-mono text-xl">@danieltinois</h1>
      </a>
    </div>
  );
};

export default NavBar;
