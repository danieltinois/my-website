"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useWindowManager } from "@/features/window-manager/WindowManagerProvider";
import useClickSound from "@/shared/hooks/useClickSound";
import { DesktopAppProps } from "./types";

const DesktopApp = ({ title, icon, windowContent }: DesktopAppProps) => {
  const { playClick } = useClickSound(1.5);
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

export default DesktopApp;
