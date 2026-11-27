"use client";

import { useEffect, useRef } from "react";

// O cursor é um lampião na página inteira, como já era dentro do castelo: uma luz quente e fraca
// que segue o ponteiro devagar (com atraso, como chama que balança) e aquece o que está por perto.
// Só com mouse (pointer: fine) e com movimento; some sobre a cena, que já tem o lampião dela, e
// quando o ponteiro sai da janela.
const SEGUE = 0.12; // quanto a luz anda até o ponteiro a cada quadro (0–1)

const Lampiao = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fino = matchMedia("(pointer: fine)");
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fino.matches || reduzir.matches) return;

    let alvo = { x: innerWidth / 2, y: innerHeight / 2 };
    let luz = { ...alvo };
    let raf = 0;
    let acesa = false;

    const passo = () => {
      luz = { x: luz.x + (alvo.x - luz.x) * SEGUE, y: luz.y + (alvo.y - luz.y) * SEGUE };
      el.style.setProperty("--x", `${luz.x}px`);
      el.style.setProperty("--y", `${luz.y}px`);
      raf = Math.hypot(alvo.x - luz.x, alvo.y - luz.y) > 0.5 ? requestAnimationFrame(passo) : 0;
    };
    const mover = (e: PointerEvent) => {
      alvo = { x: e.clientX, y: e.clientY };
      const sobreCena = (e.target as Element | null)?.closest?.("[data-cena]");
      const ligar = !sobreCena;
      if (ligar !== acesa) {
        acesa = ligar;
        if (ligar) el.dataset.acesa = "";
        else delete el.dataset.acesa;
      }
      if (!raf) raf = requestAnimationFrame(passo);
    };
    const sair = () => {
      acesa = false;
      delete el.dataset.acesa;
    };

    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", sair);
    };
  }, []);

  return <div ref={ref} className="lampiao pointer-events-none fixed inset-0 z-20" aria-hidden="true" />;
};

export default Lampiao;
