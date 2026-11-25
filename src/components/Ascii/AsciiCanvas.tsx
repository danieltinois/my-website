"use client";

import { useEffect, useRef } from "react";
import { CENAS, type NomeCena } from "./cenas";
import { RAMPA } from "./denso";

// Desenha uma cena em ASCII num canvas, com a fonte do site e as cores do tema (lidas do
// próprio canvas, então dentro de .noite valem as cores da noite). Só anima enquanto aparece
// na tela e a aba está visível; com reduced motion desenha um quadro só.
//
// Tamanho da grade:
// - `grades`: colunas e linhas por media query, na ordem (a primeira que casar vale). A altura
//   vem do aspect-ratio do contêiner, então já está reservada antes do JavaScript.
// - `celula`: em vez de grades fixas, a grade se ajusta ao tamanho (fundo da página).
// Rolagem: `rolagem` passa à cena o progresso p (0–1) da seção pela tela.
// Interação: a cena recebe a posição do ponteiro (`mouse`, u e v de 0 a 1 na área do canvas) e
// os cliques recentes com o instante de cada um. `global` escuta o ponteiro na janela toda (para
// o fundo, que não recebe eventos). Com reduced motion não há interação: a cena fica parada.

interface Grade {
  mq: string;
  cols: number;
  rows: number;
}

interface Props {
  cena: NomeCena;
  dados?: unknown;
  grades?: Grade[];
  celula?: { w: number; h: number };
  rolagem?: boolean;
  quadroParado?: number;
  className?: string;
  interativa?: boolean;
  global?: boolean;
}

export interface Ponto {
  u: number;
  v: number;
}
export interface Clique extends Ponto {
  t: number;
}

const FPS = 20;

const AsciiCanvas = ({
  cena,
  dados,
  grades,
  celula,
  rolagem = false,
  quadroParado = 5,
  className = "",
  interativa = false,
  global = false,
}: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // a cena devolve contornos (ch/co) ou, no modo denso, uma imagem de luz (lum/calor)
    const quadro = CENAS[cena] as (e: {
      cols: number;
      rows: number;
      t: number;
      p: number;
      dados: unknown;
      mouse: Ponto | null;
      cliques: Clique[];
      total: number;
    }) => {
      ch?: string[];
      co?: Uint8Array;
      lum?: Float32Array;
      calor?: Float32Array;
    };

    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    let cores: string[] = [];
    let rgb = { paper: [0, 0, 0], ink: [255, 255, 255], signal: [255, 106, 19] };
    // atlas do modo denso: cada caractere da rampa em cada tom (cinza × calor), já na escala da tela
    const atlas = document.createElement("canvas");
    const TONS = 16;
    const CALORES = 4;
    let tile = { w: 0, h: 0 };
    let familia = "";
    let m = { cols: 0, rows: 0, w: 0, h: 0, fonte: 0, linha: 0, dpr: 1 };
    let visivel = false;
    let raf = 0;
    let ultimo = 0;
    const inicio = performance.now();
    const agoraT = () => (performance.now() - inicio) / 1000 + quadroParado;
    let mouse: Ponto | null = null;
    let cliques: Clique[] = [];
    let total = 0;
    const ponto = (e: PointerEvent): Ponto | null => {
      const r = canvas.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width;
      const v = (e.clientY - r.top) / r.height;
      return u < 0 || v < 0 || u > 1 || v > 1 ? null : { u, v };
    };
    const mover = (e: PointerEvent) => {
      mouse = ponto(e);
    };
    const sair = () => {
      mouse = null;
    };
    const clicar = (e: PointerEvent) => {
      const q = ponto(e);
      if (!q) return;
      mouse = q;
      total++;
      const t = agoraT();
      cliques = [...cliques.filter((c) => t - c.t < 8), { ...q, t }];
    };

    const lerCores = () => {
      const css = getComputedStyle(canvas);
      const v = (n: string) => css.getPropertyValue(n).trim();
      const signal = v("--color-signal");
      cores = ["", v("--color-faint"), v("--color-muted"), v("--color-ink"), signal, `color-mix(in srgb, ${signal} 55%, transparent)`];
      const hex = (h: string) => {
        const x = h.replace("#", "");
        return [0, 2, 4].map((k) => parseInt(x.slice(k, k + 2), 16) || 0);
      };
      rgb = { paper: hex(v("--color-paper")), ink: hex(v("--color-ink")), signal: hex(signal) };
    };

    const montarAtlas = () => {
      const { w, h, cols, rows, fonte, dpr } = m;
      if (!cols) return;
      tile = { w: Math.ceil((w / cols) * dpr), h: Math.ceil((h / rows) * dpr) };
      atlas.width = tile.w * RAMPA.length;
      atlas.height = tile.h * TONS * CALORES;
      const a = atlas.getContext("2d")!;
      a.clearRect(0, 0, atlas.width, atlas.height);
      a.font = `${fonte * dpr}px ${familia}`;
      a.textBaseline = "middle";
      const mix = (x: number[], y: number[], k: number) => x.map((v, j) => Math.round(v + (y[j] - v) * k));
      for (let q = 0; q < CALORES; q++)
        for (let g = 0; g < TONS; g++) {
          const luz = g / (TONS - 1);
          const cinza = mix(rgb.paper, rgb.ink, Math.pow(luz, 0.85));
          const quente = mix(rgb.signal.map((v) => v * (0.35 + 0.65 * luz)), [255, 214, 170], Math.max(0, luz - 0.75) * 2);
          const [r, gg, b] = mix(cinza, quente, q / (CALORES - 1));
          a.fillStyle = `rgb(${r},${gg},${b})`;
          const y = (q * TONS + g) * tile.h + tile.h / 2;
          for (let c = 1; c < RAMPA.length; c++) a.fillText(RAMPA[c], c * tile.w, y);
        }
    };

    const progresso = () => {
      if (!rolagem) return 1;
      const alvo = canvas.closest("section");
      // fora de uma seção (o fundo da página): o progresso é o da página inteira
      if (!alvo) return scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const r = alvo.getBoundingClientRect();
      // 0 quando a seção entra pela base da tela; 1 quando o fim dela chega a 60% da altura
      const p = (innerHeight - r.top) / (r.height + innerHeight * 0.4);
      return Math.max(0, Math.min(1, p));
    };

    const medir = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.font = `100px ${familia}`;
      const proporcao = ctx.measureText("M").width / 100;
      let cols: number;
      let rows: number;
      if (celula) {
        cols = Math.max(1, Math.round(width / celula.w));
        rows = Math.max(1, Math.round(height / celula.h));
      } else {
        const g = grades!.find((x) => matchMedia(x.mq).matches) ?? grades!.at(-1)!;
        cols = g.cols;
        rows = g.rows;
      }
      const fonte = Math.min(width / cols / proporcao, (height / rows) * 0.92);
      m = { cols, rows, w: width, h: height, fonte, linha: height / rows, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      montarAtlas();
    };

    const desenhar = (t: number, p = progresso()) => {
      const { cols, rows, w, h, fonte, linha, dpr } = m;
      if (!cols) return;
      const g = quadro({ cols, rows, t, p, dados, mouse, cliques, total });
      if (g.lum) {
        // modo denso: copia do atlas o caractere e o tom de cada célula
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cw = (w / cols) * dpr;
        const chh = (h / rows) * dpr;
        const n = RAMPA.length - 1;
        for (let i = 0; i < g.lum.length; i++) {
          const L = g.lum[i];
          const c = Math.round(L * n);
          if (c === 0) continue;
          const tom = Math.round(L * (TONS - 1));
          const q = Math.round(g.calor![i] * (CALORES - 1));
          ctx.drawImage(atlas, c * tile.w, (q * TONS + tom) * tile.h, tile.w, tile.h, (i % cols) * cw, Math.floor(i / cols) * chh, tile.w, tile.h);
        }
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${fonte}px ${familia}`;
      ctx.textBaseline = "middle";
      const larg = w / cols;
      for (let cor = 1; cor < cores.length; cor++) {
        ctx.fillStyle = cores[cor];
        for (let i = 0; i < g.ch!.length; i++) {
          if (g.co![i] !== cor) continue;
          ctx.fillText(g.ch![i], (i % cols) * larg, (Math.floor(i / cols) + 0.5) * linha);
        }
      }
    };

    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      if (agora - ultimo < 1000 / FPS) return;
      ultimo = agora;
      desenhar(agoraT());
    };

    const sincronizar = () => {
      cancelAnimationFrame(raf);
      if (reduzir.matches || !visivel || document.hidden) {
        desenhar(quadroParado, reduzir.matches && rolagem ? 1 : undefined);
        return;
      }
      raf = requestAnimationFrame(laco);
    };

    const tema = new MutationObserver(() => {
      lerCores();
      montarAtlas();
      desenhar(quadroParado);
    });
    const tamanho = new ResizeObserver(() => {
      medir();
      desenhar(quadroParado);
    });
    const tela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      sincronizar();
    });

    let vivo = true;
    document.fonts.ready.then(() => {
      if (!vivo) return;
      familia = getComputedStyle(canvas).fontFamily;
      lerCores();
      medir();
      desenhar(quadroParado);
      tema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      tamanho.observe(canvas);
      tela.observe(canvas);
      reduzir.addEventListener("change", sincronizar);
      document.addEventListener("visibilitychange", sincronizar);
      if (!reduzir.matches) {
        const alvo: Window | HTMLCanvasElement = global ? window : canvas;
        alvo.addEventListener("pointermove", mover as EventListener);
        if (!global) {
          canvas.addEventListener("pointerleave", sair);
          if (interativa) canvas.addEventListener("pointerdown", clicar);
        }
      }
    });

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      tema.disconnect();
      tamanho.disconnect();
      tela.disconnect();
      reduzir.removeEventListener("change", sincronizar);
      document.removeEventListener("visibilitychange", sincronizar);
      window.removeEventListener("pointermove", mover as EventListener);
      canvas.removeEventListener("pointermove", mover as EventListener);
      canvas.removeEventListener("pointerleave", sair);
      canvas.removeEventListener("pointerdown", clicar);
    };
  }, [cena, dados, grades, celula, rolagem, quadroParado, interativa, global]);

  return (
    <canvas
      ref={ref}
      className={`block h-full w-full ${interativa ? "cursor-pointer touch-manipulation" : ""} ${className}`}
      aria-hidden="true"
    />
  );
};

export default AsciiCanvas;
