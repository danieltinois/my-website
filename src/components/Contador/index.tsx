"use client";

import { useEffect, useRef } from "react";

// Um número que conta do zero até o valor quando entra na tela, devagar no fim (1,4s), como um
// contador mecânico assentando. O HTML do servidor já traz o valor final (sem JavaScript, para
// buscador e leitor de tela, e com reduced motion, fica assim); `modelo` põe o número no texto
// ("{n} dias", "{n}/368"). Algarismos tabulares, então a largura não pula enquanto conta.
const DURACAO = 1400;

const formatar = (n: number, formato: string, modelo: string) => modelo.replace("{n}", Math.round(n).toLocaleString(formato));

const Contador = ({ valor, formato, modelo = "{n}" }: { valor: number; formato: string; modelo?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const contar = () => {
      const inicio = performance.now();
      const quadro = (agora: number) => {
        const k = Math.min(1, (agora - inicio) / DURACAO);
        el.textContent = formatar(valor * (1 - Math.pow(1 - k, 3)), formato, modelo);
        if (k < 1) raf = requestAnimationFrame(quadro);
      };
      raf = requestAnimationFrame(quadro);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          contar();
        } else el.textContent = formatar(0, formato, modelo); // fora da tela: espera no zero
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, formato, modelo]);

  return <span ref={ref}>{formatar(valor, formato, modelo)}</span>;
};

export default Contador;
