"use client";

import Window from "@/src/components/features/Window";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

interface WindowInstance {
  id: string;
  title: string;
  content: ReactNode;
  defaultPosition?: { x: number; y: number };
  zIndex: number;
  minimized: boolean;
}

interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface WindowManagerContextProps {
  windows: WindowInstance[];
  openWindow: (content: ReactNode, title: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

const WindowManagerContext = createContext<
  WindowManagerContextProps | undefined
>(undefined);

const POPS = [
  "bwoop!",
  "ó-ó-ó!",
  "boing!",
  "tatum!",
  "SKRRT!",
  "phssshh!",
  "wheee!",
  "puf-puf!",
];

const CLOSE_POPS = ["poom!", "aiaiai!", "chiau!", "pop!"];

export const WindowManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const spawnBubble = useCallback((text: string) => {
    const id =
      typeof crypto !== "undefined"
        ? crypto.randomUUID()
        : `b-${Date.now()}`;
    setBubbles((prev) => [
      ...prev,
      {
        id,
        text,
        x: window.innerWidth / 2 + (Math.random() * 240 - 120),
        y: window.innerHeight / 2 - 260 + (Math.random() * 60 - 30),
      },
    ]);
    window.setTimeout(
      () => setBubbles((prev) => prev.filter((b) => b.id !== id)),
      700,
    );
  }, []);

  const openWindow = useCallback((content: ReactNode, title: string) => {
    const id =
      typeof crypto !== "undefined" ? crypto.randomUUID() : `w-${Date.now()}`;
    const newWindow: WindowInstance = {
      id,
      title,
      content,
      defaultPosition: {
        x: Math.round(Math.random() * 40 - 20),
        y: Math.round(Math.random() * 40 - 20),
      },
      minimized: false,
      zIndex: 100,
    };
    setWindows((prev) => {
      const maxZ =
        prev.length > 0 ? Math.max(...prev.map((w) => w.zIndex)) : 99;
      newWindow.zIndex = maxZ + 1;
      return [...prev, newWindow];
    });
    spawnBubble(POPS[Math.floor(Math.random() * POPS.length)]);
    return id;
  }, [spawnBubble]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    spawnBubble(CLOSE_POPS[Math.floor(Math.random() * CLOSE_POPS.length)]);
  }, [spawnBubble]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w,
      );
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const targetWindow = prev.find((w) => w.id === id);
      if (!targetWindow) return prev;
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      if (targetWindow.zIndex === maxZ) return prev;
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        focusWindow,
      }}
    >
      {children}

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0.2, y: 16, rotate: -8 }}
            animate={{
              opacity: 1,
              scale: 1.15,
              y: -4,
              rotate: (bubble.id.charCodeAt(0) % 2 ? 1 : -1) * 5,
              transition: { type: "spring", stiffness: 300, damping: 12 },
            }}
            className="fixed font-black text-5xl select-none pointer-events-none
              text-[var(--color-cn-highlight)]"
            style={{
              left: bubble.x,
              top: bubble.y,
              zIndex: 9999,
              textShadow:
                "0 4px 0 var(--color-cn-shadow), 0 0 18px rgba(255,255,255,0.25)",
            }}
          >
            {bubble.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {windows.map((window) => (
            <div
              key={window.id}
              className="fixed flex mx-auto w-screen h-screen items-center justify-center pointer-events-none"
              style={{
                zIndex: window.zIndex,
                display: window.minimized ? "none" : undefined,
              }}
            >
              <div className="pointer-events-auto">
                <Window
                  title={window.title}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onFocus={() => focusWindow(window.id)}
                  defaultPosition={window.defaultPosition}
                >
                  {window.content}
                </Window>
              </div>
            </div>
          ))}
      </AnimatePresence>
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context)
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider",
    );
  return context;
};
