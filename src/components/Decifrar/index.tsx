"use client";

import { useEffect, useRef } from "react";

// Texto que se decifra em ASCII: quando entra na tela, cada letra passa por caracteres da rampa
// e assenta na certa, da esquerda para a direita. O texto real está no DOM desde o servidor (o
// leitor de tela e o buscador leem só ele); a animação troca apenas o que se vê. Fonte mono,
// então a largura não muda (CLS 0). Com reduced motion, nada acontece.

const SINAIS = ".,:;i1?7tPO09#@";
const DURACAO = 600;

const Decifrar = ({ texto, atraso = 0 }: { texto: string; atraso?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const rodar = () => {
      const inicio = performance.now() + atraso;
      const quadro = (agora: number) => {
        const k = Math.max(0, (agora - inicio) / DURACAO);
        el.textContent = [...texto]
          .map((c, i) => {
            if (c === " " || k >= 1) return c;
            const pronto = k * (texto.length + 6) - i;
            if (pronto >= 6) return c;
            return SINAIS[Math.floor(Math.random() * SINAIS.length)];
          })
          .join("");
        if (k < 1) raf = requestAnimationFrame(quadro);
      };
      raf = requestAnimationFrame(quadro);
    };
    // só observa depois que as fontes carregaram: antes disso a medida e o quadro inicial mudam
    let io: IntersectionObserver | undefined;
    let ativo = true;
    document.fonts.ready.then(() => {
      if (!ativo) return;
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io?.disconnect();
          rodar();
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      io.observe(el);
    });
    return () => {
      ativo = false;
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [texto, atraso]);

  return (
    <>
      <span className="sr-only">{texto}</span>
      <span ref={ref} aria-hidden="true">
        {texto}
      </span>
    </>
  );
};

export default Decifrar;
