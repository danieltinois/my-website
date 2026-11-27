"use client";

import { useEffect, useRef } from "react";

// Botão flutuante de voltar ao topo: aparece no canto depois do hero e mostra quanto da página já
// foi lido numa barrinha em ASCII ([####····]). É um link para "#", então a Navegacao anima a
// subida (e o castelo se refaz no caminho). Some de novo perto do topo.

const CELULAS = 8;

const barra = (p: number) => {
  const cheias = Math.round(p * CELULAS);
  return `[${"#".repeat(cheias)}${"·".repeat(CELULAS - cheias)}]`;
};

const VoltarTopo = ({ rotulo }: { rotulo: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const barraRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const b = barraRef.current;
    if (!el || !b) return;
    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const total = document.documentElement.scrollHeight - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
      b.textContent = barra(p);
      if (scrollY > innerHeight * 1.2) el.dataset.visivel = "";
      else delete el.dataset.visivel;
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(atualizar);
    };
    atualizar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, []);

  return (
    <a
      ref={ref}
      href="#"
      aria-label={rotulo}
      className="voltar-topo fixed right-6 bottom-6 z-30 flex items-center gap-2 border bg-paper px-3 py-2 text-caption no-underline lg:right-12"
    >
      <span aria-hidden="true">↑</span>
      <span aria-hidden="true">{rotulo}</span>
      <span ref={barraRef} aria-hidden="true" className="font-stretch-condensed tabular-nums text-muted">
        {barra(0)}
      </span>
    </a>
  );
};

export default VoltarTopo;
