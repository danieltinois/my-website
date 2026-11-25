// Modo denso: em vez de desenhar contornos com caracteres, a cena é uma imagem de luz
// (luminância 0–1 e calor 0–1 por célula) que vira caracteres por uma rampa de densidade.
// Módulo puro; o AsciiCanvas desenha com um atlas de glifos e o terminal com ANSI.

export interface Campo {
  cols: number;
  rows: number;
  lum: Float32Array; // 0 = vazio, 1 = máximo
  calor: Float32Array; // 0 = luz da lua (neutra), 1 = fogo (signal)
}

// da mais leve para a mais densa, medida no olho com a Martian Mono
export const RAMPA = " .,:;i1?7tPO09#@";

export const campo = (cols: number, rows: number): Campo => ({
  cols,
  rows,
  lum: new Float32Array(cols * rows),
  calor: new Float32Array(cols * rows),
});

// --- ruído ------------------------------------------------------------------------------

const h2 = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const suave = (t: number) => t * t * (3 - 2 * t);

// ruído de valor 2D, contínuo
export const ruido = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = suave(x - xi);
  const yf = suave(y - yi);
  const a = h2(xi, yi);
  const b = h2(xi + 1, yi);
  const c = h2(xi, yi + 1);
  const d = h2(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
};

export const fbm = (x: number, y: number, oitavas = 3) => {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oitavas; i++) {
    s += amp * ruido(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return s / (1 - 0.5 ** oitavas);
};

export const limitar = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const passo = (a: number, b: number, v: number) => {
  const t = limitar((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// --- prévia no terminal -----------------------------------------------------------------

export const ansiDenso = (c: Campo) => {
  let s = "";
  for (let y = 0; y < c.rows; y++) {
    for (let x = 0; x < c.cols; x++) {
      const i = y * c.cols + x;
      const l = limitar(c.lum[i]);
      const ch = RAMPA[Math.round(l * (RAMPA.length - 1))];
      const cinza = 232 + Math.round(l * 23);
      s += c.calor[i] > 0.35 ? `\x1b[38;5;${c.calor[i] > 0.7 ? 208 : 130}m${ch}\x1b[0m` : `\x1b[38;5;${cinza}m${ch}\x1b[0m`;
    }
    s += "\n";
  }
  return s;
};

// --- ferramentas para montar cenas densas -----------------------------------------------
// Uma Tela é um Campo com coordenadas de mundo: X de 0 a A (largura/altura), Y de 0 (topo)
// a 1 (base). `mat` marca o que é céu (0) ou superfície (>0), para a luz quente pegar mais
// nas superfícies que no ar.

export const K = 0.54; // largura/altura de uma célula (fonte mono, entrelinha 1,25)

export interface Tela {
  c: Campo;
  mat: Uint8Array;
  A: number;
  cols: number;
  rows: number;
}

export const tela = (cols: number, rows: number): Tela => ({
  c: campo(cols, rows),
  mat: new Uint8Array(cols * rows),
  A: (cols / rows) * K,
  cols,
  rows,
});

export const Xde = (T: Tela, x: number) => ((x + 0.5) / T.cols) * T.A;
export const Yde = (T: Tela, y: number) => (y + 0.5) / T.rows;

// percorre as células dentro de uma caixa de mundo (ou a tela toda)
export const cada = (
  T: Tela,
  f: (X: number, Y: number, i: number) => void,
  caixa?: { x0: number; x1: number; y0: number; y1: number },
) => {
  const x0 = caixa ? Math.max(0, Math.floor((caixa.x0 / T.A) * T.cols)) : 0;
  const x1 = caixa ? Math.min(T.cols - 1, Math.ceil((caixa.x1 / T.A) * T.cols)) : T.cols - 1;
  const y0 = caixa ? Math.max(0, Math.floor(caixa.y0 * T.rows)) : 0;
  const y1 = caixa ? Math.min(T.rows - 1, Math.ceil(caixa.y1 * T.rows)) : T.rows - 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) f(Xde(T, x), Yde(T, y), y * T.cols + x);
};

export const acender = (T: Tela, i: number, L: number, calor = 0) => {
  if (L > T.c.lum[i]) T.c.lum[i] = L;
  if (calor > T.c.calor[i]) T.c.calor[i] = calor;
};

// luz quente: clareia e esquenta em volta de um ponto, mais nas superfícies que no ar
export const luz = (T: Tela, x: number, y: number, r: number, I: number) =>
  cada(
    T,
    (X, Y, i) => {
      const g = I * Math.exp(-((X - x) ** 2 + (Y - y) ** 2) / (r * r));
      if (g < 0.02) return;
      const sup = T.mat[i] === 0 || T.mat[i] === 9 ? 0.25 : 0.7;
      T.c.lum[i] += g * 0.45 * sup;
      if (g * sup > T.c.calor[i]) T.c.calor[i] = g * sup;
    },
    { x0: x - r * 2, x1: x + r * 2, y0: y - r * 2, y1: y + r * 2 },
  );

// chama: língua de fogo que sobe de (x, y), feita de ruído
export const chama = (T: Tela, x: number, y: number, alt: number, larg: number, t: number, fase = 0) =>
  cada(
    T,
    (X, Y, i) => {
      const sobe = (y - Y) / alt;
      if (sobe < 0 || sobe > 1) return;
      const forma = 1 - Math.abs(X - x) / (larg * (1 - sobe * 0.8) + 1e-6);
      const f = forma * (0.6 + 0.6 * fbm((X - x) * 80 + fase, (y - Y) * 50 - t * 7, 2)) - sobe * 0.6;
      if (f > 0.15) acender(T, i, 0.55 + f * 0.6, 1);
    },
    { x0: x - larg, x1: x + larg, y0: y - alt, y1: y },
  );

// cápsula (segmento grosso): membros, cajado, cabo de vassoura, pernas
export const traco = (T: Tela, x0: number, y0: number, x1: number, y1: number, esp: number, L: number, mat = 7) =>
  cada(
    T,
    (X, Y, i) => {
      const vx = x1 - x0;
      const vy = y1 - y0;
      const k = limitar(((X - x0) * vx + (Y - y0) * vy) / (vx * vx + vy * vy || 1));
      if (Math.hypot(X - (x0 + vx * k), Y - (y0 + vy * k)) <= esp) {
        T.c.lum[i] = L;
        T.mat[i] = mat;
      }
    },
    { x0: Math.min(x0, x1) - esp, x1: Math.max(x0, x1) + esp, y0: Math.min(y0, y1) - esp, y1: Math.max(y0, y1) + esp },
  );

// elipse preenchida; `sombra` escolhe o brilho em função da posição normalizada (u, v) de -1 a 1
export const elipse = (
  T: Tela,
  x: number,
  y: number,
  rx: number,
  ry: number,
  sombra: (u: number, v: number) => number,
  mat = 7,
) =>
  cada(
    T,
    (X, Y, i) => {
      const u = (X - x) / rx;
      const v = (Y - y) / ry;
      if (u * u + v * v <= 1) {
        T.c.lum[i] = sombra(u, v);
        T.mat[i] = mat;
      }
    },
    { x0: x - rx, x1: x + rx, y0: y - ry, y1: y + ry },
  );

// dígitos e alguns sinais em pixel-font 3×5, desenhados com a própria luminância
const FONTE: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", ".##", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
  "?": ["###", "..#", ".##", "...", ".#."],
};

// escreve com pixels de `px` células de largura; (x, y) é o canto superior esquerdo, em mundo
export const escrever = (T: Tela, x: number, y: number, s: string, L: number, px = 1, calor = 0) => {
  const cw = T.A / T.cols;
  const ch = 1 / T.rows;
  [...s].forEach((letra, k) => {
    const g = FONTE[letra];
    if (!g) return;
    g.forEach((linha, gy) =>
      [...linha].forEach((p, gx) => {
        if (p !== "#") return;
        for (let a = 0; a < px; a++)
          for (let b = 0; b < px; b++) {
            const cx = Math.round(((x + ((k * 4 + gx) * px + a) * cw) / T.A) * T.cols - 0.5);
            const cy = Math.round((y + (gy * px + b) * ch) * T.rows - 0.5);
            if (cx >= 0 && cy >= 0 && cx < T.cols && cy < T.rows) acender(T, cy * T.cols + cx, L, calor);
          }
      }),
    );
  });
};

// figura humana em silhueta: cabeça, tronco, braços e pernas que alternam com `fase`.
// (x, pe) é o ponto entre os pés; `dir` 1 olha para a direita, -1 para a esquerda.
// Devolve a posição da mão da frente, para prender vassoura, cajado etc.
export const pessoa = (T: Tela, x: number, pe: number, alt: number, fase: number, dir: number, L: number, luzBorda = 0) => {
  const e = alt / 10;
  const quadril = pe - alt * 0.45;
  const ombro = pe - alt * 0.78;
  const passada = Math.sin(fase) * e * 1.6;
  traco(T, x, quadril, x + passada, pe, e * 0.45, L); // perna da frente
  traco(T, x, quadril, x - passada, pe, e * 0.45, L); // perna de trás
  traco(T, x, quadril, x + dir * e * 0.3, ombro, e * 0.75, L); // tronco
  const mao = { x: x + dir * e * 2.4, y: quadril - e * 0.6 };
  traco(T, x + dir * e * 0.3, ombro + e * 0.3, mao.x, mao.y, e * 0.35, L); // braço da frente
  traco(T, x + dir * e * 0.3, ombro + e * 0.3, x - dir * e * 1.2 - passada * 0.5, quadril - e * 0.2, e * 0.35, L); // braço de trás
  elipse(T, x + dir * e * 0.5, ombro - e * 1.3, e * 0.95, e * 1.05, () => L); // cabeça
  if (luzBorda > 0) {
    // contorno iluminado do lado da luz (dir oposto à sombra): uma linha fina nas costas
    traco(T, x - dir * e * 0.45, quadril, x - dir * e * 0.2, ombro, e * 0.18, luzBorda);
  }
  return mao;
};

// triângulo preenchido (asas, telhados, bicos)
export const triangulo = (
  T: Tela,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  L: number,
  mat = 7,
) =>
  cada(
    T,
    (X, Y, i) => {
      const s1 = (X - c.x) * (a.y - c.y) - (a.x - c.x) * (Y - c.y);
      const s2 = (X - a.x) * (b.y - a.y) - (b.x - a.x) * (Y - a.y);
      const s3 = (X - b.x) * (c.y - b.y) - (c.x - b.x) * (Y - b.y);
      if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)) {
        T.c.lum[i] = L;
        T.mat[i] = mat;
      }
    },
    { x0: Math.min(a.x, b.x, c.x), x1: Math.max(a.x, b.x, c.x), y0: Math.min(a.y, b.y, c.y), y1: Math.max(a.y, b.y, c.y) },
  );

// --- interação --------------------------------------------------------------------------
// O AsciiCanvas passa a posição do ponteiro (u, v de 0 a 1) e os cliques recentes.

export interface Ponto {
  u: number;
  v: number;
}
export interface Clique extends Ponto {
  t: number;
}
export interface Entrada<D = undefined> {
  cols: number;
  rows: number;
  t: number;
  p: number;
  dados: D;
  mouse: Ponto | null;
  cliques: Clique[];
  total: number; // cliques desde que a página abriu
}

export const noMundo = (T: Tela, q: Ponto) => ({ x: q.u * T.A, y: q.v });

// o cursor é um lampião: luz quente que segue o ponteiro e revela o escuro
export const lampiao = (T: Tela, mouse: Ponto | null, I = 0.5, r = 0.11) => {
  if (!mouse) return;
  const { x, y } = noMundo(T, mouse);
  luz(T, x, y, r, I);
};

// faíscas que estouram no ponto clicado e caem, por 1,4s
export const faiscas = (T: Tela, cliques: Clique[], t: number, n = 22) => {
  for (const c of cliques) {
    const idade = t - c.t;
    if (idade < 0 || idade > 1.4) continue;
    const { x, y } = noMundo(T, c);
    luz(T, x, y, 0.1 * (1 - idade / 1.4), 0.9 * (1 - idade / 1.4));
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2 + ruido(k, c.t) * 0.6;
      const vel = 0.12 + 0.18 * ruido(k * 3.1, c.t * 2);
      const fx = x + Math.cos(ang) * vel * idade;
      const fy = y + Math.sin(ang) * vel * idade * 0.8 + 0.25 * idade * idade;
      const cx = Math.round((fx / T.A) * T.cols - 0.5);
      const cy = Math.round(fy * T.rows - 0.5);
      if (cx >= 0 && cy >= 0 && cx < T.cols && cy < T.rows) acender(T, cy * T.cols + cx, 0.95 * (1 - idade / 1.6), 1);
    }
  }
};

// o último clique (ou null)
export const ultimo = (cliques: Clique[]) => (cliques.length ? cliques[cliques.length - 1] : null);

// --- cenas a partir de imagem -----------------------------------------------------------
// Uma imagem (decodificada no navegador) vira dois mapas, brilho e calor (o laranja das janelas
// e do fogo), guardados como tabelas de soma acumulada: a média de qualquer retângulo sai em
// tempo constante, então cada célula amostra a sua área exata em qualquer resolução.

export interface Fonte {
  w: number;
  h: number;
  satL: Float64Array; // (w+1)×(h+1)
  satW: Float64Array;
  // níveis automáticos: brilho no percentil 1 e no 97 (as luzes estouram de leve, como foto)
  lo: number;
  hi: number;
}

export const prepararFonte = (rgba: Uint8ClampedArray, w: number, h: number): Fonte => {
  const satL = new Float64Array((w + 1) * (h + 1));
  const satW = new Float64Array((w + 1) * (h + 1));
  const hist = new Uint32Array(256);
  for (let y = 0; y < h; y++) {
    let somaL = 0;
    let somaW = 0;
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      const r = rgba[k] / 255;
      const g = rgba[k + 1] / 255;
      const b = rgba[k + 2] / 255;
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      somaL += L;
      hist[Math.min(255, Math.floor(L * 256))]++;
      // laranja: vermelho bem acima do azul, e claro o bastante para ser luz
      somaW += limitar((r - b - 0.1) * 2.6) * limitar((r - 0.25) * 2.5);
      const j = (y + 1) * (w + 1) + (x + 1);
      satL[j] = satL[j - (w + 1)] + somaL;
      satW[j] = satW[j - (w + 1)] + somaW;
    }
  }
  const percentil = (q: number) => {
    let acc = 0;
    for (let k = 0; k < 256; k++) if ((acc += hist[k]) >= q * w * h) return k / 255;
    return 1;
  };
  return { w, h, satL, satW, lo: percentil(0.01), hi: Math.max(percentil(0.97), percentil(0.01) + 0.05) };
};

// média de brilho e calor no retângulo [x0,x1)×[y0,y1) em coordenadas normalizadas da imagem
export const amostrar = (f: Fonte, x0: number, y0: number, x1: number, y1: number) => {
  const a = Math.max(0, Math.min(f.w - 1, Math.floor(x0 * f.w)));
  const b = Math.max(0, Math.min(f.h - 1, Math.floor(y0 * f.h)));
  const c = Math.max(a + 1, Math.min(f.w, Math.ceil(x1 * f.w)));
  const d = Math.max(b + 1, Math.min(f.h, Math.ceil(y1 * f.h)));
  const W = f.w + 1;
  const n = (c - a) * (d - b);
  const soma = (s: Float64Array) => s[d * W + c] - s[b * W + c] - s[d * W + a] + s[b * W + a];
  return { L: soma(f.satL) / n, W: soma(f.satW) / n };
};

// enquadramento "cover" da imagem numa cena de proporção A, com zoom z em torno do foco (fx, fy)
export const enquadrar = (A: number, aspecto: number, z: number, fx: number, fy: number) => {
  const vh = Math.min(1, aspecto / A) / z;
  const vw = (vh * A) / aspecto;
  const cx = Math.min(1 - vw / 2, Math.max(vw / 2, fx));
  const cy = Math.min(1 - vh / 2, Math.max(vh / 2, fy));
  return {
    // mundo (X de 0 a A, Y de 0 a 1) → imagem (0 a 1)
    paraImagem: (X: number, Y: number) => ({ x: cx + (X / A - 0.5) * vw, y: cy + (Y - 0.5) * vh }),
    // imagem → mundo
    paraMundo: (x: number, y: number) => ({ X: ((x - cx) / vw + 0.5) * A, Y: (y - cy) / vh + 0.5 }),
    vw,
    vh,
  };
};

// Fundo a partir da imagem: cada célula amostra a sua área exata da imagem (já enquadrada),
// passa pelos níveis e pela gama, ganha nitidez (diferença para a vizinhança 3×3) e então
// `ajuste` aplica os efeitos da cena (água, chama, céu...). Abaixo de `limiar` a célula some,
// para a revelação começar só pelo que brilha. Devolve o enquadramento e `para`, que leva um
// ponto da imagem ao mundo, e `esc`, quantas unidades de mundo vale a altura da imagem.
export interface Celula {
  i: number;
  X: number;
  Y: number;
  ix: number;
  iy: number;
  l: number;
  w: number;
  destaque: number;
}
export interface OpcoesImagem {
  z?: number;
  fx?: number;
  fy?: number;
  limiar?: number;
  gama?: number;
  nitidez?: number;
  tom?: (l: number) => number;
  desloca?: (ix: number, iy: number) => number;
  ajuste?: (c: Celula) => number;
  calor?: number;
}
export const fundoImagem = (T: Tela, f: Fonte, aspecto: number, o: OpcoesImagem = {}) => {
  const { cols, rows, A, c } = T;
  const v = enquadrar(A, aspecto, o.z ?? 1, o.fx ?? 0.5, o.fy ?? 0.5);
  const limiar = o.limiar ?? 0;
  const gama = o.gama ?? 0.7;
  const nitidez = o.nitidez ?? 0.8;
  const tom = o.tom ?? ((l: number) => Math.pow(limitar((l - f.lo) / (f.hi - f.lo)), gama));
  const cw = v.vw / cols;
  const ch = v.vh / rows;
  const cel: Celula = { i: 0, X: 0, Y: 0, ix: 0, iy: 0, l: 0, w: 0, destaque: 0 };
  for (let y = 0; y < rows; y++) {
    const Y = (y + 0.5) / rows;
    for (let x = 0; x < cols; x++) {
      const X = ((x + 0.5) / cols) * A;
      const i = y * cols + x;
      const p = v.paraImagem(X, Y);
      const sx = p.x + (o.desloca ? o.desloca(p.x, p.y) : 0);
      const a = amostrar(f, sx - cw / 2, p.y - ch / 2, sx + cw / 2, p.y + ch / 2);
      const base = tom(a.L);
      const viz = tom(amostrar(f, sx - cw * 1.5, p.y - ch * 1.5, sx + cw * 1.5, p.y + ch * 1.5).L);
      const destaque = base - viz;
      let l = base + destaque * nitidez;
      cel.i = i;
      cel.X = X;
      cel.Y = Y;
      cel.ix = p.x;
      cel.iy = p.y;
      cel.l = l;
      cel.w = a.W;
      cel.destaque = destaque;
      if (o.ajuste) l = o.ajuste(cel);
      l = Math.max(0, (l - limiar) / (1 - limiar));
      c.lum[i] = limitar(l);
      c.calor[i] = limitar(a.W * 1.6) * (o.calor ?? 1);
      T.mat[i] = 0;
    }
  }
  return {
    v,
    esc: 1 / v.vh,
    para: (x: number, y: number) => {
      const m = v.paraMundo(x, y);
      return { x: m.X, y: m.Y };
    },
  };
};

// limita a luminância final em 0–1 (depois de luzes e figuras somadas por cima)
export const fechar = (c: Campo) => {
  for (let i = 0; i < c.lum.length; i++) c.lum[i] = limitar(c.lum[i]);
  return c;
};

// --- partículas por cima das imagens ----------------------------------------------------

// acende a célula que contém o ponto (x, y) do mundo
export const pontoMundo = (T: Tela, x: number, y: number, L: number, calor = 0) => {
  const cx = Math.round((x / T.A) * T.cols - 0.5);
  const cy = Math.round(y * T.rows - 0.5);
  if (cx >= 0 && cy >= 0 && cx < T.cols && cy < T.rows) acender(T, cy * T.cols + cx, L, calor);
};

// fagulhas subindo de um fogo em (x, y): `alt` é até onde chegam, `larg` quanto se espalham
export const fagulhas = (T: Tela, x: number, y: number, t: number, n: number, alt: number, larg: number, forca = 1) => {
  for (let k = 0; k < n; k++) {
    const vida = (t * (0.35 + 0.3 * ruido(k, 7)) + ruido(k, 3)) % 1;
    const fx = x + (ruido(k, 5) - 0.5) * larg + Math.sin(t * 2 + k) * larg * 0.6 * vida;
    const fy = y - vida * alt;
    pontoMundo(T, fx, fy, (0.95 - 0.6 * vida) * forca, 1);
  }
};

// fumaça subindo de (x, y): coluna que alarga e se desfaz, arrastada pelo vento
export const fumaca = (T: Tela, x: number, y: number, t: number, alt: number, larg: number, I = 0.12) =>
  cada(
    T,
    (X, Y, i) => {
      const k = (y - Y) / alt;
      if (k < 0 || k > 1) return;
      const cx = x + k * k * larg * 1.5 + Math.sin(k * 5 - t * 0.8) * larg * 0.25 * k;
      const d = Math.abs(X - cx) / (larg * (0.25 + k));
      if (d > 1) return;
      const dens = passo(0.4, 0.75, fbm(X * 30, Y * 18 + t * 0.6, 3)) * (1 - d) * (1 - k);
      T.c.lum[i] += dens * I;
    },
    { x0: x - larg * 0.5, x1: x + larg * 2.5, y0: y - alt, y1: y },
  );

// poeira flutuando num feixe de luz: pontos fracos que derivam devagar dentro da caixa
export const poeira = (T: Tela, x0: number, x1: number, y0: number, y1: number, t: number, n: number, I = 0.4, calor = 0.6) => {
  for (let k = 0; k < n; k++) {
    const fx = x0 + ((ruido(k, 11) + t * 0.01 * (0.5 + ruido(k, 2))) % 1) * (x1 - x0);
    const fy = y0 + ((ruido(k, 13) + Math.sin(t * 0.3 + k) * 0.05 + 1) % 1) * (y1 - y0);
    const b = 0.5 + 0.5 * Math.sin(t * (0.8 + ruido(k, 4)) + k);
    pontoMundo(T, fx, fy, I * b, calor);
  }
};

// dados das cenas feitas de imagem: a fonte chega pelo AsciiCanvas
export interface DadosImagem {
  fonte?: Fonte;
}

// balanço de chama: desloca a amostragem da imagem dentro de uma chama (x, y é a base, alt a
// altura, em coordenadas da imagem), então a própria chama fotografada tremula e se inclina
export const balancar = (ix: number, iy: number, chamas: { x: number; y: number; alt: number; larg: number }[], t: number) => {
  for (const c of chamas) {
    const k = (c.y - iy) / c.alt;
    if (k < -0.1 || k > 1.2 || Math.abs(ix - c.x) > c.larg) continue;
    return (Math.sin(t * 11 + iy * 90 + c.x * 50) * 0.6 + Math.sin(t * 17 + c.x * 9) * 0.4) * c.larg * 0.35 * Math.max(0, k);
  }
  return 0;
};
