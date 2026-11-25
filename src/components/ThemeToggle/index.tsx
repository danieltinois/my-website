"use client";

import { useSyncExternalStore } from "react";

// Observa o data-theme que o script de src/lib/theme.ts escreve no <html> e grava a escolha.

type Theme = "light" | "dark";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

const getTheme = () => (document.documentElement.dataset.theme as Theme | undefined) ?? null;

const ThemeToggle = () => {
  // no servidor (e na hidratação) o tema é desconhecido: null
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // sem localStorage (modo privado restrito): o tema vale só para esta visita
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="link text-caption"
      aria-label={theme ? `Mudar para o tema ${next === "dark" ? "escuro" : "claro"}` : "Mudar tema"}
    >
      <span className={theme ? "" : "invisible"}>{next === "dark" ? "Tema escuro" : "Tema claro"}</span>
    </button>
  );
};

export default ThemeToggle;
