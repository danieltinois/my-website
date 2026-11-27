"use client";

import { useEffect } from "react";

// Navegação animada dentro da página: os links para âncoras (#projetos, #contato, # do topo)
// rolam com inércia em vez de pular, num tempo que cresce com a distância (0,6 a 1,6s, saindo e
// chegando devagar). Na volta ao topo o castelo se desfaz e se refaz junto com a rolagem, porque
// a revelação dele segue a rolagem. Ao chegar, o foco vai para o destino (teclado e leitor de
// tela continuam dali), o endereço ganha a âncora e o evento navegar:chegou faz o título da seção
// se decifrar de novo (Decifrar). Roda do mouse, toque ou tecla no meio do caminho devolvem o
// controle na hora. Com reduced motion, o pulo é direto.

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const Navegacao = () => {
  useEffect(() => {
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const parar = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const chegar = (id: string, alvo: HTMLElement) => {
      history.pushState(null, "", id === "inicio" ? location.pathname : `#${id}`);
      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      alvo.focus({ preventScroll: true });
      window.dispatchEvent(new CustomEvent("navegar:chegou", { detail: { id } }));
    };

    const clicar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1) || "inicio";
      // "#conteudo" é o pular para o conteúdo: fica com o comportamento padrão
      if (id === "conteudo") return;
      const alvo = document.getElementById(id);
      if (!alvo) return;
      e.preventDefault();

      const margem = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const destino = id === "inicio" ? 0 : Math.max(0, alvo.getBoundingClientRect().top + scrollY - margem);
      const origem = scrollY;
      const distancia = destino - origem;
      parar();
      if (reduzir.matches || Math.abs(distancia) < 2) {
        scrollTo(0, destino);
        chegar(id, alvo);
        return;
      }
      const duracao = Math.min(1600, Math.max(600, Math.abs(distancia) * 0.35));
      const inicio = performance.now();
      const quadro = (agora: number) => {
        const k = Math.min(1, (agora - inicio) / duracao);
        scrollTo(0, origem + distancia * easeInOut(k));
        if (k < 1) raf = requestAnimationFrame(quadro);
        else {
          raf = 0;
          chegar(id, alvo);
        }
      };
      raf = requestAnimationFrame(quadro);
    };

    document.addEventListener("click", clicar);
    // a pessoa assumiu: para a rolagem animada onde estiver
    for (const ev of ["wheel", "touchstart", "keydown"] as const) window.addEventListener(ev, parar, { passive: true });
    return () => {
      parar();
      document.removeEventListener("click", clicar);
      for (const ev of ["wheel", "touchstart", "keydown"] as const) window.removeEventListener(ev, parar);
    };
  }, []);

  return null;
};

export default Navegacao;
