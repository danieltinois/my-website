"use client";

import Window from "@/src/components/features/Window";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { AnimatePresence } from "framer-motion";

interface WindowInstance {
  id: string;
  title: string;
  content: ReactNode;
  defaultPosition?: { x: number; y: number };
  zIndex: number;
}

interface WindowManagerContextProps {
  windows: WindowInstance[];
  openWindow: (content: ReactNode, title: string) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

const WindowManagerContext = createContext<
  WindowManagerContextProps | undefined
>(undefined);

export const WindowManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);

  const openWindow = useCallback((content: ReactNode, title: string) => {
    const id = uuidv4();
    const newWindow: WindowInstance = {
      id,
      title,
      content,
      defaultPosition: {
        x: Math.random() * 350 - 600,
        y: Math.random() * 150 - 400,
      },
      zIndex: 100,
    };
    setWindows((prev) => {
      const maxZ =
        prev.length > 0 ? Math.max(...prev.map((w) => w.zIndex)) : 99;
      newWindow.zIndex = maxZ + 1;
      return [...prev, newWindow];
    });
    return id;
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
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
      value={{ windows, openWindow, closeWindow, focusWindow }}
    >
      {children}

      <AnimatePresence>
        {windows.map((window) => (
          <div
            key={window.id}
            className="fixed flex mx-auto w-screen h-screen items-center justify-center -translate-y-16 pointer-events-none"
            style={{ zIndex: window.zIndex }}
          >
            <div className="pointer-events-auto">
              <Window
                title={window.title}
                onClose={() => closeWindow(window.id)}
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
