"use client";

import { useEffect, useRef } from "react";
import { registrarTextoVivo } from "@/src/lib/textoVivo";

// Título vivo: quando entra na tela, cada letra passa por caracteres da rampa e assenta na certa,
// da esquerda para a direita, e de novo quando a navegação da página chega à seção dele
// (evento navegar:chegou, Navegacao); depois, as letras perto do cursor engordam e alargam
// (textoVivo).
// O texto real está no DOM desde o servidor (o leitor de tela e o buscador leem só ele); o que se
// vê é uma letra por <span>, para a animação trocar uma de cada vez. Com reduced motion, nada
// acontece.

const SINAIS = ".,:;i1?7tPO09#@";
const DURACAO = 600;

const Decifrar = ({ texto, atraso = 0 }: { texto: string; atraso?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const letras = [...texto];

  // as letras seguem o cursor
  useEffect(() => {
    const el = ref.current;
    return el ? registrarTextoVivo(el) : undefined;
  }, []);

  useEffect(() => {
    const el = ref.current;
    // só alfabeto latino: num caractere de largura dupla (japonês) a troca por um sinal ASCII
    // mudaria a largura da linha
    if (!el || /[^\u0000-\u024f\u2000-\u206f]/.test(texto) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = el.children as HTMLCollectionOf<HTMLElement>;
    const reais = [...texto];
    let raf = 0;
    const rodar = () => {
      const inicio = performance.now() + atraso;
      const quadro = (agora: number) => {
        const k = Math.max(0, (agora - inicio) / DURACAO);
        reais.forEach((c, i) => {
          const pronto = c === " " || k >= 1 || k * (reais.length + 6) - i >= 6;
          spans[i].textContent = pronto ? c : SINAIS[Math.floor(Math.random() * SINAIS.length)];
        });
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
    // a navegação chegou à seção deste título: decifra de novo
    const chegou = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id || !el.closest(`#${CSS.escape(id)}`)) return;
      cancelAnimationFrame(raf);
      rodar();
    };
    window.addEventListener("navegar:chegou", chegou);
    return () => {
      ativo = false;
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("navegar:chegou", chegou);
    };
  }, [texto, atraso]);

  return (
    <>
      <span className="sr-only">{texto}</span>
      <span ref={ref} aria-hidden="true">
        {letras.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>
    </>
  );
};

export default Decifrar;
