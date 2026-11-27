"use client";

import { useEffect, useRef } from "react";

// Texto escrito à pena: quando entra na tela, as palavras aparecem uma a uma, da esquerda para a
// direita, como tinta assentando (CSS em .escrita, globals.css). Cada palavra já ocupa o lugar
// dela desde o servidor, então nada se move; sem JavaScript ou com reduced motion, o texto já
// está inteiro. Japonês não tem espaço entre palavras: ali a unidade é cada trecho entre sinais.
const Escrita = ({ texto, className = "" }: { texto: string; className?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const pedacos = texto.split(/(\s+|(?<=[、。]))/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.pronto = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.dataset.visivel = "";
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = 0;
  return (
    <p ref={ref} className={`escrita ${className}`}>
      {pedacos.map((p, i) =>
        /^\s+$/.test(p) ? (
          p
        ) : (
          <span key={i} className="palavra" style={{ "--i": n++ } as React.CSSProperties}>
            {p}
          </span>
        ),
      )}
    </p>
  );
};

export default Escrita;
