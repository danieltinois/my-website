"use client";

import { useEffect, useRef } from "react";
import { CENAS, type NomeCena } from "./cenas";
import { K, prepararFonte, RAMPA, type Campo, type DadosImagem } from "./denso";

// Desenha uma cena em ASCII num canvas, com a fonte do site e as cores do tema (lidas do
// próprio canvas). Só anima enquanto aparece na tela e a aba está visível; com reduced motion
// desenha um quadro só.
//
// Tamanho da grade: `grades` dá as colunas por media query, na ordem (a primeira que casar vale).
// As linhas seguem a proporção do contêiner, que já está reservada antes do JavaScript.
// Imagem: `imagem` é a URL da imagem-fonte; ela é decodificada aqui e chega à cena como
// `dados.fonte` (brilho e calor em tabelas de soma acumulada). `dados.chegou` é o instante t em
// que ela chegou (a cena faz a imagem surgir a partir daí). `fps` é a taxa de quadros.
// Revelação: com `revelar` (fração inicial, de 0 a 1), a grade vai dessa fração até a grade
// inteira conforme a pessoa rola pelo [data-cena] (um trecho mais alto que a tela, com a cena
// presa nele), e a cena recebe esse progresso em p.
// Interação: a cena recebe a posição do ponteiro (`mouse`, u e v de 0 a 1 na área do canvas) e os
// cliques recentes com o instante de cada um. Com reduced motion não há interação nem revelação: a
// cena aparece inteira e parada.
// Primeira interação: marca `data-tocado` no [data-cena] mais próximo. O evento `cena:acionar`
// nesse mesmo elemento faz o mesmo que um clique (no último ponto do ponteiro ou no centro).

interface Grade {
  mq: string;
  cols: number;
}

interface Props {
  cena: NomeCena;
  grades: Grade[];
  imagem: string;
  quadroParado?: number;
  className?: string;
  interativa?: boolean;
  fps?: number;
  revelar?: number;
}

export interface Ponto {
  u: number;
  v: number;
}
export interface Clique extends Ponto {
  t: number;
}

// começa rápido e assenta devagar: os primeiros passos da rolagem já mostram mudança
const passoSuave = (p: number) => 1 - (1 - p) * (1 - p);

const AsciiCanvas = ({ cena, grades, imagem, quadroParado = 5, className = "", interativa = false, fps = 20, revelar }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const quadro = CENAS[cena] as (e: {
      cols: number;
      rows: number;
      t: number;
      p: number;
      dados: DadosImagem;
      mouse: Ponto | null;
      cliques: Clique[];
      total: number;
      parado: boolean;
    }) => Campo;

    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    let rgb = { paper: [0, 0, 0], ink: [255, 255, 255], signal: [255, 106, 19] };
    // atlas: cada caractere da rampa em cada tom (cinza × calor), já na escala da tela
    const atlas = document.createElement("canvas");
    const TONS = 16;
    const CALORES = 4;
    let tile = { w: 0, h: 0 };
    let familia = "";
    let m = { cols: 0, rows: 0, w: 0, h: 0, dpr: 1 };
    let visivel = false;
    let raf = 0;
    let ultimo = 0;
    const inicio = performance.now();
    const agoraT = () => (performance.now() - inicio) / 1000 + quadroParado;
    let mouse: Ponto | null = null;
    let cliques: Clique[] = [];
    let total = 0;
    let dados: DadosImagem = {};
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
    const bloco = canvas.closest("[data-cena]");
    // cliques e acionamentos de fora entram pelo mesmo caminho; o primeiro marca data-tocado
    const registrar = (q: Ponto, moverLuz = true) => {
      if (moverLuz) mouse = q;
      total++;
      const t = agoraT();
      cliques = [...cliques.filter((c) => t - c.t < 8), { ...q, t }];
      bloco?.setAttribute("data-tocado", "");
    };
    const clicar = (e: PointerEvent) => {
      const q = ponto(e);
      if (q) registrar(q);
    };
    const acionar = () => registrar(mouse ?? { u: 0.5, v: 0.5 }, false);

    const lerCores = () => {
      const css = getComputedStyle(canvas);
      const hex = (n: string) => {
        const x = css.getPropertyValue(n).trim().replace("#", "");
        return [0, 2, 4].map((k) => parseInt(x.slice(k, k + 2), 16) || 0);
      };
      rgb = { paper: hex("--color-paper"), ink: hex("--color-ink"), signal: hex("--color-signal") };
    };

    const montarAtlas = (fonte: number) => {
      const { w, h, cols, rows, dpr } = m;
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

    // revelação: o quanto já se rolou pelo trecho alto do [data-cena] (sem revelação, sempre 1)
    const revelacao = () => {
      if (revelar === undefined || reduzir.matches || !bloco) return 1;
      const r = bloco.getBoundingClientRect();
      return Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
    };
    const grade = () => grades.find((x) => matchMedia(x.mq).matches) ?? grades.at(-1)!;
    const colunas = () => {
      const g = grade();
      if (revelar === undefined) return g.cols;
      return Math.max(8, Math.round((g.cols * (revelar + (1 - revelar) * passoSuave(revelacao()))) / 4) * 4);
    };

    const medir = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.font = `100px ${familia}`;
      const proporcao = ctx.measureText("M").width / 100;
      const cols = colunas();
      const rows = Math.max(4, Math.round((cols * K * height) / width));
      const fonte = Math.min(width / cols / proporcao, (height / rows) * 0.92);
      m = { cols, rows, w: width, h: height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      montarAtlas(fonte);
    };

    const desenhar = (t: number) => {
      // na revelação a grade cresce com o tempo: refaz medidas e atlas quando muda
      if (m.cols && colunas() !== m.cols) medir();
      const { cols, rows, w, h, dpr } = m;
      if (!cols) return;
      // quadro parado (redimensionar, pausar): a imagem já inteira, sem refazer o surgir
      const quadroFixo = t === quadroParado;
      const g = quadro({ cols, rows, t, p: revelacao(), dados: quadroFixo ? { ...dados, chegou: -9 } : dados, mouse, cliques, total, parado: reduzir.matches });
      // copia do atlas o caractere e o tom de cada célula
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
        const q = Math.round(g.calor[i] * (CALORES - 1));
        ctx.drawImage(atlas, c * tile.w, (q * TONS + tom) * tile.h, tile.w, tile.h, (i % cols) * cw, Math.floor(i / cols) * chh, tile.w, tile.h);
      }
    };

    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      if (agora - ultimo < 1000 / fps) return;
      ultimo = agora;
      desenhar(agoraT());
    };

    const sincronizar = () => {
      cancelAnimationFrame(raf);
      if (reduzir.matches || !visivel || document.hidden) {
        desenhar(quadroParado);
        return;
      }
      raf = requestAnimationFrame(laco);
    };

    const tamanho = new ResizeObserver(() => {
      medir();
      desenhar(quadroParado);
    });
    const tela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      sincronizar();
    });

    let vivo = true;
    // a imagem-fonte decodifica fora da tela e vira brilho e calor; sem ela a cena fica no campo
    // de estrelas de espera, e o texto ao lado continua lá
    const carregar = async () => {
      const img = new Image();
      img.decoding = "async";
      img.src = imagem;
      await img.decode();
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.drawImage(img, 0, 0);
      const { data, width, height } = o.getImageData(0, 0, off.width, off.height);
      if (!vivo) return;
      dados = { fonte: prepararFonte(data, width, height), chegou: agoraT() };
      desenhar(reduzir.matches ? quadroParado : agoraT());
    };
    carregar().catch((erro) => console.warn("ascii: falha ao carregar", imagem, erro));

    document.fonts.ready.then(() => {
      if (!vivo) return;
      familia = getComputedStyle(canvas).fontFamily;
      lerCores();
      medir();
      desenhar(quadroParado);
      tamanho.observe(canvas);
      tela.observe(canvas);
      reduzir.addEventListener("change", sincronizar);
      document.addEventListener("visibilitychange", sincronizar);
      if (!reduzir.matches) {
        canvas.addEventListener("pointermove", mover);
        canvas.addEventListener("pointerleave", sair);
        if (interativa) {
          canvas.addEventListener("pointerdown", clicar);
          bloco?.addEventListener("cena:acionar", acionar);
        }
      }
    });

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      tamanho.disconnect();
      tela.disconnect();
      reduzir.removeEventListener("change", sincronizar);
      document.removeEventListener("visibilitychange", sincronizar);
      canvas.removeEventListener("pointermove", mover);
      canvas.removeEventListener("pointerleave", sair);
      canvas.removeEventListener("pointerdown", clicar);
      bloco?.removeEventListener("cena:acionar", acionar);
    };
  }, [cena, grades, imagem, quadroParado, interativa, fps, revelar]);

  return <canvas ref={ref} className={`block h-full w-full ${interativa ? "cursor-pointer touch-manipulation" : ""} ${className}`} aria-hidden="true" />;
};

export default AsciiCanvas;
