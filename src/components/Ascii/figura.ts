// Personagens feitos de foto: uma folha de sprites sobre fundo verde (chroma key) vira tabelas
// de soma acumulada de brilho, calor e opacidade, e cada parte (corpo, braço, perna...) é
// composta na grade girando em torno do seu pivô. Cada célula amostra a sua área exata da
// folha, então a figura fica nítida em qualquer resolução. Módulo puro, sem DOM.
// Coordenadas da folha: normalizadas pela ALTURA nos dois eixos (x de 0 a w/h, y de 0 a 1).

import { limitar, Xde, Yde, type Tela } from "./denso.ts";

export interface Sprite {
  w: number;
  h: number;
  satL: Float64Array; // (w+1)×(h+1), pré-multiplicadas pela opacidade
  satW: Float64Array;
  satA: Float64Array;
  // níveis automáticos, só dos pixels opacos (alpha > 0,5)
  lo: number;
  hi: number;
}

export const prepararSprite = (rgba: Uint8ClampedArray, w: number, h: number): Sprite => {
  const n = (w + 1) * (h + 1);
  const satL = new Float64Array(n);
  const satW = new Float64Array(n);
  const satA = new Float64Array(n);
  const hist = new Uint32Array(256);
  let opacos = 0;
  for (let y = 0; y < h; y++) {
    let somaL = 0;
    let somaW = 0;
    let somaA = 0;
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      const r = rgba[k] / 255;
      let g = rgba[k + 1] / 255;
      const b = rgba[k + 2] / 255;
      const m = Math.max(r, b);
      // o verde vira transparência; o que sobra de verde nas bordas é cortado (despill)
      const a = 1 - limitar((g - m - 0.06) * 5);
      g = Math.min(g, m + 0.04);
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      somaL += L * a;
      somaW += limitar((r - b - 0.1) * 2.6) * limitar((r - 0.25) * 2.5) * a;
      somaA += a;
      if (a > 0.5) {
        hist[Math.min(255, Math.floor(L * 256))]++;
        opacos++;
      }
      const j = (y + 1) * (w + 1) + (x + 1);
      satL[j] = satL[j - (w + 1)] + somaL;
      satW[j] = satW[j - (w + 1)] + somaW;
      satA[j] = satA[j - (w + 1)] + somaA;
    }
  }
  const percentil = (q: number) => {
    let acc = 0;
    for (let k = 0; k < 256; k++) if ((acc += hist[k]) >= q * opacos) return k / 255;
    return 1;
  };
  const lo0 = opacos ? percentil(0.01) : 0;
  const hi = opacos ? Math.min(1, Math.max(percentil(0.97), lo0 + 0.05)) : 1;
  return { w, h, satL, satW, satA, lo: Math.min(lo0, hi - 0.05), hi };
};

// médias no retângulo [x0,x1)×[y0,y1) da folha; L e W sem a pré-multiplicação, `a` é a opacidade média
export const amostrarSprite = (s: Sprite, x0: number, y0: number, x1: number, y1: number) => {
  const a = Math.max(0, Math.min(s.w - 1, Math.floor(x0 * s.h)));
  const b = Math.max(0, Math.min(s.h - 1, Math.floor(y0 * s.h)));
  const c = Math.max(a + 1, Math.min(s.w, Math.ceil(x1 * s.h)));
  const d = Math.max(b + 1, Math.min(s.h, Math.ceil(y1 * s.h)));
  const W = s.w + 1;
  const n = (c - a) * (d - b);
  const soma = (t: Float64Array) => t[d * W + c] - t[b * W + c] - t[d * W + a] + t[b * W + a];
  const A = soma(s.satA);
  return { L: A > 1e-9 ? soma(s.satL) / A : 0, W: A > 1e-9 ? soma(s.satW) / A : 0, a: A / n };
};

// --- composição -------------------------------------------------------------------------

export interface Caixa {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Parte {
  caixa: Caixa;
  pivo: { x: number; y: number };
}

// uma parte posta no mundo: `em` é onde fica o pivô, `ang` gira no sentido horário (radianos)
export interface Colocada {
  parte: Parte;
  em: { x: number; y: number };
  ang: number;
}

export interface OpcoesFigura {
  esc: number; // unidades de mundo por unidade da folha
  flip?: boolean;
  gama?: number;
  brilho?: number;
  calor?: number;
}

// posição no mundo de um ponto q da folha sobre uma parte colocada (para encadear as partes)
export const encaixar = (c: Colocada, q: { x: number; y: number }, o: OpcoesFigura) => {
  const dx = (q.x - c.parte.pivo.x) * o.esc * (o.flip ? -1 : 1);
  const dy = (q.y - c.parte.pivo.y) * o.esc;
  const cos = Math.cos(c.ang);
  const sin = Math.sin(c.ang);
  return { x: c.em.x + dx * cos - dy * sin, y: c.em.y + dx * sin + dy * cos };
};

export const figura = (T: Tela, s: Sprite | undefined, partes: Colocada[], o: OpcoesFigura) => {
  if (!s) return;
  const { cols, rows, A, c } = T;
  const gama = o.gama ?? 0.7;
  const brilho = o.brilho ?? 1;
  const calor = o.calor ?? 1;
  const sinal = o.flip ? -1 : 1;
  // meia célula no mundo
  const hx = A / cols / 2;
  const hy = 1 / rows / 2;
  for (const p of partes) {
    const { caixa, pivo } = p.parte;
    const cos = Math.cos(p.ang);
    const sin = Math.sin(p.ang);
    // caixa da parte no mundo, para só visitar as células sob ela
    let mx0 = Infinity;
    let mx1 = -Infinity;
    let my0 = Infinity;
    let my1 = -Infinity;
    for (const qx of [caixa.x0, caixa.x1]) {
      for (const qy of [caixa.y0, caixa.y1]) {
        const e = encaixar(p, { x: qx, y: qy }, o);
        mx0 = Math.min(mx0, e.x);
        mx1 = Math.max(mx1, e.x);
        my0 = Math.min(my0, e.y);
        my1 = Math.max(my1, e.y);
      }
    }
    const cx0 = Math.max(0, Math.floor((mx0 / A) * cols - 0.5));
    const cx1 = Math.min(cols - 1, Math.ceil((mx1 / A) * cols));
    const cy0 = Math.max(0, Math.floor(my0 * rows - 0.5));
    const cy1 = Math.min(rows - 1, Math.ceil(my1 * rows));
    // meia célula na folha, já girada (a célula vira um losango; usamos a caixa dele)
    const ex = (Math.abs(cos) * hx + Math.abs(sin) * hy) / o.esc;
    const ey = (Math.abs(sin) * hx + Math.abs(cos) * hy) / o.esc;
    for (let y = cy0; y <= cy1; y++) {
      for (let x = cx0; x <= cx1; x++) {
        // célula → folha: desfaz a rotação e o flip em torno do pivô
        const dx = Xde(T, x) - p.em.x;
        const dy = Yde(T, y) - p.em.y;
        const qx = pivo.x + ((dx * cos + dy * sin) / o.esc) * sinal;
        const qy = pivo.y + (-dx * sin + dy * cos) / o.esc;
        // nunca amostra fora da caixa da parte
        const ax = Math.max(caixa.x0, qx - ex);
        const bx = Math.min(caixa.x1, qx + ex);
        const ay = Math.max(caixa.y0, qy - ey);
        const by = Math.min(caixa.y1, qy + ey);
        if (bx <= ax || by <= ay) continue;
        const m = amostrarSprite(s, ax, ay, bx, by);
        // cobertura parcial da célula pela caixa
        const a = m.a * (((bx - ax) * (by - ay)) / (4 * ex * ey));
        if (a <= 0) continue;
        const i = y * cols + x;
        const tom = Math.pow(limitar((m.L - s.lo) / (s.hi - s.lo)), gama) * brilho;
        c.lum[i] = c.lum[i] * (1 - a) + tom * a;
        c.calor[i] = c.calor[i] * (1 - a) + limitar(m.W * 1.6) * calor * a;
        if (a > 0.5) T.mat[i] = 5;
      }
    }
  }
};
