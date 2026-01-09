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

interface WindowInstance {
  id: string;
  title: string;
  content: ReactNode;
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
    };
    setWindows((prev) => [...prev, newWindow]);
    return id;
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id));
  }, []);

  const closeWindowWithClick = useCallback((id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const windowIndex = prev.findIndex((window) => window.id === id);
      if (windowIndex === -1) return prev;

      const newWindows = [...prev];
      const [movedWindow] = newWindows.splice(windowIndex, 1);
      newWindows.push(movedWindow);
      return newWindows;
    });
  }, []);

  return (
    <WindowManagerContext.Provider
      value={{ windows, openWindow, closeWindow, focusWindow }}
    >
      {children}
      {windows.map((window) => (
        <div
          key={window.id}
          className="fixed flex mx-auto w-screen h-screen items-center justify-center -translate-y-16 z-10 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <Window
              title={window.title}
              onClose={() => closeWindowWithClick(window.id)}
            >
              {window.content}
            </Window>
          </div>
        </div>
      ))}
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    );
  }
  return context;
};
