"use client";

import { useWindowManager } from "@/src/context/WindowManager";
import useSound from "@/src/hooks/useSound";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { DesktopAppProps } from "./interface";

const DesktopApp = ({ title, icon, windowContent }: DesktopAppProps) => {
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });
  const { openWindow, focusWindow, windows } = useWindowManager();
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const handleClick = () => {
    play();

    if (windowContent) {
      const isWindowOpen =
        activeWindowId && windows.some((w) => w.id === activeWindowId);

      if (isWindowOpen) {
        focusWindow(activeWindowId);
      } else {
        const newWindowId = openWindow(windowContent, title);
        setActiveWindowId(newWindowId);
      }
    }
  };

  return (
    <button
      className="desktop-icon w-24 flex flex-col items-center gap-2 cursor-pointer hover:scale-125 hover:-rotate-3 active:scale-90 duration-200 select-none"
      onClick={handleClick}
    >
      <HugeiconsIcon
        icon={icon}
        size={70}
        color="color-text"
        strokeWidth={1.5}
      />
      <span className="px-2 py-0.5 rounded-xl bg-[var(--color-bg-secondary)] border-2 border-(--color-cn-border) shadow-bump-sm text-sm">
        {title}
      </span>
    </button>
  );
};

export default DesktopApp;