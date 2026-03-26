"use client";

import { useWindowManager } from "@/src/context/WindowManager";
import useClickSound from "@/src/hooks/useClickSound";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { AppProps } from "./interface";

const App = ({ title, icon, windowContent }: AppProps) => {
  const { playClick } = useClickSound(false, 1.5);
  const { openWindow, focusWindow, windows } = useWindowManager();
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const handleClick = () => {
    playClick();

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
      className="flex flex-col items-center cursor-pointer hover:scale-110 duration-250 active:scale-90 select-none"
      onClick={handleClick}
    >
      <div>
        <HugeiconsIcon
          icon={icon}
          size={70}
          color="color-text"
          strokeWidth={1.5}
        />
      </div>
      <span>{title}</span>
    </button>
  );
};

export default App;
