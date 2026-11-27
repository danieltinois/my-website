"use client";

import { useEffect, useRef } from "react";

// Faíscas do cursor: um movimento rápido do mouse solta poucas faíscas em ASCII (. , ' *) que
// saltam, caem e se apagam em menos de um segundo, como de um lampião sacudido. Movimento lento não
// solta nada, então o efeito só aparece quando a pessoa "balança" o cursor. Um canvas fixo por
// cima da página, desenhado só enquanto há faísca viva. Só com mouse e com movimento; sobre as
// cenas não sai faísca (elas têm as delas no clique).

const VELOCIDADE = 1.6; // px/ms a partir da qual o cursor solta faíscas
const MAXIMO = 36;
const VIDA = 0.9; // s
const GRAVIDADE = 900; // px/s²
const SINAIS = [".", ",", "'", "*", "·"];

interface Faisca {
  x: number;
  y: number;
  vx: number;
  vy: number;
  idade: number;
  c: string;
}

const Faiscas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const css = getComputedStyle(canvas);
    const cor = css.getPropertyValue("--color-signal").trim() || "#ff6a13";
    const familia = css.fontFamily;
    let dpr = 1;
    const medir = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
    };
    medir();

    let vivas: Faisca[] = [];
    let ultimo: { x: number; y: number; t: number } | null = null;
    let raf = 0;
    let antes = 0;

    const quadro = (agora: number) => {
      const dt = Math.min(0.05, (agora - antes) / 1000);
      antes = agora;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.font = `12px ${familia}`;
      ctx.fillStyle = cor;
      vivas = vivas.filter((f) => (f.idade += dt) < VIDA);
      for (const f of vivas) {
        f.vy += GRAVIDADE * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        ctx.globalAlpha = 1 - f.idade / VIDA;
        ctx.fillText(f.c, f.x, f.y);
      }
      ctx.globalAlpha = 1;
      raf = vivas.length ? requestAnimationFrame(quadro) : 0;
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const agora = performance.now();
      const antesPonto = ultimo;
      ultimo = { x: e.clientX, y: e.clientY, t: agora };
      if (!antesPonto || agora === antesPonto.t) return;
      const dx = e.clientX - antesPonto.x;
      const dy = e.clientY - antesPonto.y;
      const v = Math.hypot(dx, dy) / (agora - antesPonto.t);
      if (v < VELOCIDADE || (e.target as Element | null)?.closest?.("[data-cena]")) return;
      // mais rápido, mais faíscas (de 1 a 3), saindo para trás do movimento
      const n = Math.min(3, Math.floor(v / VELOCIDADE));
      for (let k = 0; k < n && vivas.length < MAXIMO; k++) {
        vivas.push({
          x: e.clientX,
          y: e.clientY,
          vx: -dx * (2 + Math.random() * 4) + (Math.random() - 0.5) * 120,
          vy: -dy * (2 + Math.random() * 3) - 80 - Math.random() * 160,
          idade: 0,
          c: SINAIS[Math.floor(Math.random() * SINAIS.length)],
        });
      }
      if (!raf) {
        antes = agora;
        raf = requestAnimationFrame(quadro);
      }
    };

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-20 h-full w-full" aria-hidden="true" />;
};

export default Faiscas;
