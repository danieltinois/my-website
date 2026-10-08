"use client";

import { useEffect, useRef } from "react";

// ponte entre o terminal e quem abre apps (dock no desktop, springboard no celular)
const EVENT = "daniel:open-app";

export const openApp = (title: string) =>
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: title }));

// `when` decide quem atende: só o layout visível (desktop ou mobile) abre o app
export const useOpenAppListener = (
  handler: (title: string) => void,
  when: string,
) => {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });

  useEffect(() => {
    const on = (e: Event) => {
      if (!window.matchMedia(when).matches) return;
      ref.current((e as CustomEvent<string>).detail);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [when]);
};
