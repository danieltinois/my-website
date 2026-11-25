// O hero: um castelo à noite sobre um penhasco, com cachoeira, floresta e um lago que reflete
// tudo. Renderizado como imagem de luz (modo denso). As montanhas do fundo são as
// contribuições reais, uma por semana, e uma fogueira marca a semana em que começaram os três
// projetos. De tempos em tempos um dragão cruza a lua.
//
// Mundo: X de 0 a A (largura/altura), Y de 0 (topo) a 1 (base). A lua ilumina pela direita.

import {
  acender,
  cada,
  ceu,
  chama,
  copiar,
  estrelasDe,
  expor,
  faiscas,
  fbm,
  lampiao,
  limitar,
  luz,
  passo,
  pedra,
  piscar,
  ruido,
  tela,
  traco,
  type Campo,
  type Entrada,
  type Tela,
} from "../denso.ts";

export interface DadosCastelo {
  semanas: number[]; // contribuições por semana, da mais antiga para a mais recente
  marca: number; // índice da semana marcada (fogueira), ou -1
}

const LAGO = 0.8; // linha d'água
// materiais: 0 céu, 1 montanha, 2 pedra do castelo, 3 telhado, 4 rocha, 5 janela, 6 água,
// 7 árvore e silhuetas, 8 estandarte, 9 lua

type Parte = { x0: number; x1: number; h: number; topo: "ameia" | "cone"; ponta?: number; redonda: boolean };
const PARTES: Parte[] = [
  { x0: -0.37, x1: -0.25, h: 0.33, topo: "cone", ponta: 0.5, redonda: true },
  { x0: -0.25, x1: -0.1, h: 0.17, topo: "ameia", redonda: false },
  { x0: -0.1, x1: 0.1, h: 0.44, topo: "ameia", redonda: false },
  { x0: -0.085, x1: -0.03, h: 0.52, topo: "cone", ponta: 0.62, redonda: true },
  { x0: 0.025, x1: 0.085, h: 0.56, topo: "cone", ponta: 0.7, redonda: true },
  { x0: 0.1, x1: 0.25, h: 0.17, topo: "ameia", redonda: false },
  { x0: 0.25, x1: 0.37, h: 0.29, topo: "cone", ponta: 0.45, redonda: true },
];
const JANELAS: [number, number][] = [
  [-0.31, 0.1],
  [-0.31, 0.19],
  [-0.31, 0.27],
  [-0.06, 0.1],
  [0.06, 0.1],
  [-0.06, 0.22],
  [0.06, 0.22],
  [0, 0.33],
  [-0.057, 0.47],
  [0.055, 0.5],
  [0.31, 0.11],
  [0.31, 0.2],
  [-0.18, 0.08],
  [0.18, 0.08],
];
const ESTANDARTES = [-0.17, 0.17];

const noCastelo = (dx: number, dy: number): { p: Parte; telhado: boolean } | null => {
  if (dy < 0 || dy > 0.72) return null;
  for (const p of PARTES) {
    const cx = (p.x0 + p.x1) / 2;
    const meia = (p.x1 - p.x0) / 2;
    if (dx >= p.x0 && dx <= p.x1 && dy <= p.h) return { p, telhado: false };
    if (p.topo === "ameia" && dy > p.h && dy <= p.h + 0.024 && dx >= p.x0 && dx <= p.x1 && Math.floor((dx - p.x0) / 0.024) % 2 === 0)
      return { p, telhado: false };
    if (p.topo === "cone" && dy > p.h && dy <= p.ponta!) {
      const larg = ((p.ponta! - dy) / (p.ponta! - p.h)) * (meia + 0.014);
      if (Math.abs(dx - cx) <= larg) return { p, telhado: true };
    }
  }
  return null;
};

// pinheiro: camadas de galhos, lado da lua e ponta mais claros
const pinheiro = (T: Tela, x: number, base: number, alt: number, larg: number) =>
  cada(
    T,
    (X, Y, i) => {
      const h = (base - Y) / alt;
      if (h < 0 || h > 1) return;
      const camada = (h * 4) % 1;
      const w = larg * (1 - h) * (0.65 + 0.35 * (1 - camada));
      if (Math.abs(X - x) > w) return;
      const ladoLuz = (X - x) / (w + 1e-6);
      T.c.lum[i] = 0.035 + (ladoLuz > 0.55 ? 0.12 : 0) + (h > 0.85 ? 0.1 : 0);
      T.mat[i] = 7;
    },
    { x0: x - larg, x1: x + larg, y0: base - alt, y1: base },
  );

interface Base {
  T: Tela;
  topo: number; // topo do penhasco (chão do castelo)
  lua: { x: number; y: number; r: number };
  estrelas: number[];
  luzes: { x: number; y: number; r: number; i: number; fase: number; janela: boolean }[];
  fogueira: { x: number; y: number } | null;
  cachoeira: { x: number; larg: number };
  chamine: { x: number; y: number };
  mastros: { x: number; y: number }[];
  texto: { x: number; y: number } | null;
}

const montar = (cols: number, rows: number, d: DadosCastelo): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  const largo = A > 1.6;
  const texto = largo ? { x: A * 0.4, y: 0.64 } : null;
  const lua = { x: largo ? A * 0.86 : A * 0.78, y: 0.15, r: largo ? 0.075 : 0.08 };
  ceu(T, lua);

  // montanhas ao fundo: as contribuições, suavizadas
  const sem = d.semanas;
  const pico = Math.max(1, ...sem);
  const cume = new Float32Array(cols);
  for (let c = 0; c < cols; c++) {
    const p = (c / (cols - 1)) * (sem.length - 1);
    let s = 0;
    let k = 0;
    for (let o = -1.5; o <= 1.5; o += 0.5) {
      const q = limitar(p + o, 0, sem.length - 1);
      const i = Math.floor(q);
      s += (sem[i] * (1 - (q - i)) + (sem[Math.min(i + 1, sem.length - 1)] ?? 0) * (q - i)) / pico;
      k++;
    }
    const X = ((c + 0.5) / cols) * A;
    cume[c] = 0.7 - (0.06 + 0.3 * (s / k)) + (fbm(X * 9, 3.1) - 0.5) * 0.03;
  }
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const Y = (y + 0.5) / rows;
      const r = cume[x];
      if (Y < r || Y >= LAGO) continue;
      const i = y * cols + x;
      const X = ((x + 0.5) / cols) * A;
      const inc = cume[Math.min(cols - 1, x + 2)] - cume[Math.max(0, x - 2)];
      const claro = limitar(0.45 + inc * 18, 0.12, 1);
      const prof = Y - r;
      let L = (0.045 + 0.17 * claro) * (0.8 + 0.4 * fbm(X * 25, Y * 25)) * (1 - limitar(prof * 2.5, 0, 0.8));
      if (r < 0.43 && prof < 0.022) L = 0.5 + 0.25 * fbm(X * 50, Y * 50); // neve
      T.c.lum[i] = L;
      T.mat[i] = 1;
    }
  const marcaX = d.marca >= 0 ? (d.marca / (sem.length - 1)) * A : -1;
  const fogueira = marcaX >= 0 ? { x: marcaX, y: cume[limitar(Math.round((marcaX / A) * cols - 0.5), 0, cols - 1)] - 0.005 } : null;

  // castelo: escala e posição (nunca cobre a fogueira)
  const s = Math.min(1, A / 1.05) * 0.78;
  let Xc = largo ? A * 0.62 : A * 0.5;
  if (fogueira && Math.abs(fogueira.x - Xc) < 0.42 * s) Xc = Math.max(0.42 * s, fogueira.x - 0.46 * s);
  const topo = 0.6;

  // colinas com floresta, na frente das montanhas
  const colina = (X: number) => 0.74 - 0.03 * Math.sin(X * 4.1 + 0.7) - 0.02 * fbm(X * 6, 1.3);
  cada(T, (X, Y, i) => {
    if (Y < colina(X) || Y >= LAGO) return;
    T.c.lum[i] = 0.05 + 0.05 * fbm(X * 30, Y * 30);
    T.mat[i] = 7;
  });
  for (let X = 0.01; X < A; X += 0.022 + 0.012 * ruido(X * 31, 2)) {
    const alt = 0.045 + 0.05 * ruido(X * 17, 5);
    pinheiro(T, X, colina(X) + 0.01, alt, alt * 0.38);
  }

  // penhasco: rocha com estratos e borda irregular; a aresta direita pega o luar
  const esq = (Y: number) => Xc - 0.46 * s - (Y - topo) * 0.35 + (fbm(Y * 25, 1) - 0.5) * 0.05;
  const dir = (Y: number) => Xc + 0.44 * s + (Y - topo) * 0.3 + (fbm(Y * 25, 4) - 0.5) * 0.05;
  cada(
    T,
    (X, Y, i) => {
      const e = esq(Y);
      const dd = dir(Y);
      if (X < e || X > dd) return;
      const u = (X - e) / (dd - e);
      const estrato = 0.75 + 0.35 * fbm(X * 8, Y * 60) * (0.7 + 0.3 * Math.sin(Y * 140 + fbm(X * 10, Y) * 6));
      let L = (0.1 + 0.26 * u ** 1.3) * estrato;
      if (dd - X < 0.012) L = Math.max(L, 0.4);
      if (Y - topo < 0.01) L = Math.max(L, 0.32);
      T.c.lum[i] = L;
      T.mat[i] = 4;
    },
    { x0: Xc - 0.8 * s, x1: Xc + 0.8 * s, y0: topo, y1: LAGO },
  );
  const cachoeira = { x: dir(topo + 0.02) - 0.05 * s, larg: 0.018 };

  // castelo em cima do penhasco
  const passoX = A / cols / s;
  cada(
    T,
    (X, Y, i) => {
      const dx = (X - Xc) / s;
      const dy = (topo - Y) / s;
      const aqui = noCastelo(dx, dy);
      if (!aqui) return;
      const { p, telhado } = aqui;
      const cx = (p.x0 + p.x1) / 2;
      const meia = (p.x1 - p.x0) / 2;
      const tx = limitar((dx - p.x0) / (p.x1 - p.x0));
      let L: number;
      if (telhado) {
        const lado = 0.4 + 0.9 * passo(0, 1, ((dx - cx) / (meia + 0.014)) * 0.5 + 0.5);
        L = 0.24 * lado * (0.7 + 0.4 * ((dy / 0.016) % 1)) * (0.85 + 0.3 * ruido(X * 90, Y * 90));
        T.mat[i] = 3;
      } else {
        const claro = p.redonda ? 0.35 + 0.95 * tx ** 1.3 : 0.5 + 0.5 * tx;
        L = 0.32 * claro * pedra(dx, dy);
        T.mat[i] = 2;
      }
      if (!noCastelo(dx + passoX, dy)) L = Math.max(L, 0.55);
      else if (!noCastelo(dx - passoX, dy)) L *= 0.35;
      if (!noCastelo(dx, dy + 1 / rows / s)) L = Math.max(L, telhado ? 0.4 : 0.45);
      // portão com grade levadiça
      if (Math.abs(dx) < 0.036 && dy < 0.09 + 0.02 * Math.sqrt(Math.max(0, 1 - (dx / 0.036) ** 2)))
        L = (dx * 1000) % 12 < 2.5 || (dy * 1000) % 12 < 2.5 ? 0.14 : 0.02;
      // estandartes pendurados nas muralhas (pano com dobras, ponta em V)
      for (const ex of ESTANDARTES) {
        const fim = 0.06 + Math.abs(dx - ex) * 1.2;
        if (Math.abs(dx - ex) < 0.018 && dy > fim && dy < 0.155) {
          L = 0.3 + 0.12 * Math.sin((dx - ex) * 400);
          T.mat[i] = 8;
          T.c.calor[i] = 0.6;
        }
      }
      for (const [wx, wy] of JANELAS)
        if (Math.abs(dx - wx) < 0.009 && dy >= wy && dy <= wy + 0.03) {
          L = 0;
          T.mat[i] = 5;
        }
      T.c.lum[i] = L;
    },
    { x0: Xc - 0.4 * s, x1: Xc + 0.4 * s, y0: topo - 0.72 * s, y1: topo },
  );

  // área do texto do hero: quase tudo apagado
  if (texto)
    cada(
      T,
      (_X, _Y, i) => {
        if (T.mat[i] !== 5 && T.mat[i] !== 9) T.c.lum[i] *= 0.22;
      },
      { x0: 0, x1: texto.x, y0: 0, y1: texto.y },
    );

  const luzes: Base["luzes"] = JANELAS.map(([wx, wy]) => ({
    x: Xc + wx * s,
    y: topo - (wy + 0.015) * s,
    r: 0.03,
    i: 0.55,
    fase: wx * 13 + wy * 7,
    janela: true,
  }));
  for (const tx of [-0.06, 0.06]) luzes.push({ x: Xc + tx * s, y: topo - 0.075 * s, r: 0.05, i: 0.9, fase: tx * 50, janela: false });

  const estrelas = estrelasDe(T, 0.02, 0.62).filter((i) => {
    if (!texto) return true;
    const X = ((i % cols) / cols) * A;
    const Y = Math.floor(i / cols) / rows;
    return X > texto.x || Y > texto.y || ruido(i, 9) < 0.2;
  });
  return {
    T,
    topo,
    lua,
    estrelas,
    luzes,
    fogueira,
    cachoeira,
    chamine: { x: Xc + 0.08 * s, y: topo - 0.47 * s },
    mastros: [
      { x: Xc + 0.055 * s, y: topo - 0.72 * s },
      { x: Xc - 0.057 * s, y: topo - 0.64 * s },
    ],
    texto,
  };
};

let cache: { k: string; b: Base } | null = null;

export const castelo = ({ cols, rows, t, dados, mouse, cliques }: Entrada<DadosCastelo>): Campo => {
  const k = `${cols}x${rows}:${dados.semanas.join(",")}:${dados.marca}`;
  if (cache?.k !== k) cache = { k, b: montar(cols, rows, dados) };
  const b = cache.b;
  const T = copiar(b.T);
  const { A } = T;
  const c = T.c;
  const noTexto = (X: number, Y: number) => b.texto !== null && X < b.texto.x && Y < b.texto.y;

  // raios de luar e nuvens iluminadas
  cada(
    T,
    (X, Y, i) => {
      if (T.mat[i] !== 0) return;
      const dl = Math.hypot(X - b.lua.x, Y - b.lua.y);
      const ang = Math.atan2(Y - b.lua.y, X - b.lua.x);
      let L = c.lum[i] + 0.035 * Math.max(0, Math.sin(ang * 22 + fbm(ang * 3, t * 0.05) * 4)) * Math.exp(-dl / 0.5);
      const dens = passo(0.56, 0.82, fbm(X * 2.4 - t * 0.012, Y * 7 + 0.3, 3)) * passo(0.42, 0.25, Y) * passo(0, 0.06, Y);
      if (dens > 0) L = Math.max(L, 0.03 + dens * (0.08 + 0.32 * Math.exp(-dl / 0.35)));
      c.lum[i] = noTexto(X, Y) ? L * 0.25 : L;
    },
    { x0: 0, x1: A, y0: 0, y1: 0.5 },
  );
  piscar(T, b.estrelas, t);

  // cachoeira: faixas de água descendo e espuma no pé
  cada(
    T,
    (X, Y, i) => {
      const w = b.cachoeira.larg * (1 + (Y - b.topo) * 1.5);
      if (Math.abs(X - b.cachoeira.x) > w || Y < b.topo + 0.005) return;
      const fluxo = fbm((X - b.cachoeira.x) * 90, Y * 18 - t * 3.2, 2);
      c.lum[i] = 0.28 + 0.45 * fluxo * (1 - Math.abs(X - b.cachoeira.x) / w);
      T.mat[i] = 6;
    },
    { x0: b.cachoeira.x - 0.05, x1: b.cachoeira.x + 0.05, y0: b.topo, y1: LAGO },
  );
  cada(
    T,
    (X, Y, i) => {
      const n = fbm(X * 60 + t, Y * 40 - t * 2, 2);
      const d = Math.hypot((X - b.cachoeira.x) * 1.2, (Y - LAGO) * 2.5);
      if (d < 0.05 && n > 0.45) acender(T, i, 0.35 + 0.4 * (1 - d / 0.05) * n);
    },
    { x0: b.cachoeira.x - 0.06, x1: b.cachoeira.x + 0.06, y0: LAGO - 0.03, y1: LAGO + 0.03 },
  );

  // fumaça da chaminé
  for (let k2 = 0; k2 < 10; k2++) {
    const idade = (t * 0.25 + k2 * 0.1) % 1;
    const px = b.chamine.x + idade * 0.12 + Math.sin(idade * 6 + k2) * 0.01;
    const py = b.chamine.y - idade * 0.28;
    const raio = 0.007 + idade * 0.028;
    cada(
      T,
      (X, Y, i) => {
        const dd = Math.hypot(X - px, Y - py) / raio;
        if (dd < 1 && (T.mat[i] === 0 || T.mat[i] === 1))
          c.lum[i] = Math.max(c.lum[i], 0.2 * (1 - idade) * (1 - dd * dd) * (0.7 + 0.6 * ruido(X * 200 + t, Y * 200)));
      },
      { x0: px - raio, x1: px + raio, y0: py - raio, y1: py + raio },
    );
  }

  // bandeiras nos mastros
  for (const m of b.mastros) {
    traco(T, m.x, m.y, m.x, m.y + 0.06, 0.0015, 0.4, 2);
    cada(
      T,
      (X, Y, i) => {
        const fx = X - m.x;
        if (fx < 0 || fx > 0.045) return;
        const onda = Math.sin(fx * 90 - t * 6) * 0.005 * (fx / 0.045);
        if (Y > m.y + onda && Y < m.y + 0.02 + onda) acender(T, i, 0.6 - fx * 4);
      },
      { x0: m.x, x1: m.x + 0.05, y0: m.y - 0.01, y1: m.y + 0.03 },
    );
  }

  // janelas e tochas: brilho quente e núcleo aceso
  for (const l of b.luzes) {
    const tremor = l.janela ? 0.85 + 0.15 * ruido(t * 3 + l.fase, l.fase) : 0.65 + 0.35 * ruido(t * 9 + l.fase, l.fase * 2);
    luz(T, l.x, l.y, l.r * (0.9 + 0.2 * tremor), l.i * tremor);
    if (l.janela)
      cada(
        T,
        (_X, _Y, i) => {
          if (T.mat[i] === 5) acender(T, i, 0.7 + 0.3 * tremor, 1);
        },
        { x0: l.x - 0.02, x1: l.x + 0.02, y0: l.y - 0.03, y1: l.y + 0.03 },
      );
    else chama(T, l.x, l.y, 0.03, 0.008, t, l.fase);
  }

  // fogueira no pico marcado, com brasas
  if (b.fogueira) {
    luz(T, b.fogueira.x, b.fogueira.y, 0.12, 0.9 + 0.1 * ruido(t * 9, 3));
    chama(T, b.fogueira.x, b.fogueira.y, 0.07, 0.022, t, 1);
    for (let k2 = 0; k2 < 14; k2++) {
      const idade = (t * 0.5 + k2 * 0.071) % 1;
      const bx = b.fogueira.x + Math.sin(idade * 7 + k2 * 2.3) * 0.02 * (1 + idade);
      const by = b.fogueira.y - 0.05 - idade * 0.22;
      const x = Math.round((bx / A) * cols - 0.5);
      const y = Math.round(by * rows - 0.5);
      if (x >= 0 && y >= 0 && x < cols && y < rows) acender(T, y * cols + x, 0.9 * (1 - idade * 0.6), 1);
    }
  }

  // o dragão: a cada 18s cruza o céu da direita para a esquerda, na frente da lua, e solta fogo
  const cd = t % 18;
  if (cd < 7) {
    const k2 = cd / 7;
    const dxp = A + 0.2 - k2 * (A + 0.5);
    const dyp = b.lua.y + 0.02 + Math.sin(k2 * Math.PI * 2) * 0.04;
    const asa = Math.sin(t * 7) * 0.035;
    const escuro = 0.012;
    traco(T, dxp - 0.02, dyp, dxp + 0.05, dyp + 0.006, 0.008, escuro); // corpo
    traco(T, dxp - 0.02, dyp, dxp - 0.05, dyp - 0.012, 0.004, escuro); // pescoço
    traco(T, dxp - 0.05, dyp - 0.012, dxp - 0.066, dyp - 0.008, 0.005, escuro); // cabeça
    traco(T, dxp + 0.05, dyp + 0.006, dxp + 0.1, dyp - 0.01 + Math.sin(t * 3) * 0.008, 0.003, escuro); // cauda
    traco(T, dxp - 0.005, dyp + 0.008, dxp - 0.01, dyp + 0.022, 0.002, escuro); // patas
    traco(T, dxp + 0.03, dyp + 0.01, dxp + 0.028, dyp + 0.024, 0.002, escuro);
    // asa: triângulo do ombro até a ponta, batendo para cima e para baixo
    const a = { x: dxp - 0.012, y: dyp };
    const bb = { x: dxp + 0.035, y: dyp };
    const cc = { x: dxp + 0.012, y: dyp - 0.045 - asa };
    cada(
      T,
      (X, Y, i) => {
        const s1 = (X - cc.x) * (a.y - cc.y) - (a.x - cc.x) * (Y - cc.y);
        const s2 = (X - a.x) * (bb.y - a.y) - (bb.x - a.x) * (Y - a.y);
        const s3 = (X - bb.x) * (cc.y - bb.y) - (cc.x - bb.x) * (Y - bb.y);
        if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)) {
          c.lum[i] = escuro;
          T.mat[i] = 7;
        }
      },
      { x0: dxp - 0.02, x1: dxp + 0.04, y0: dyp - 0.09, y1: dyp + 0.04 },
    );
    // baforada de fogo no meio do voo
    if (k2 > 0.35 && k2 < 0.55) {
      const hx = dxp - 0.07;
      const hy = dyp - 0.008;
      const forca = Math.sin(((k2 - 0.35) / 0.2) * Math.PI);
      luz(T, hx - 0.05, hy, 0.08, 0.8 * forca);
      cada(
        T,
        (X, Y, i) => {
          const ax = (hx - X) / 0.12;
          if (ax < 0 || ax > forca) return;
          const abre = 0.004 + ax * 0.03;
          const f = 1 - Math.abs(Y - hy - ax * 0.01) / abre;
          const n = fbm(X * 70 + t * 9, Y * 70, 2);
          if (f > 0 && n * f > 0.18) acender(T, i, 0.5 + f * 0.5, 1);
        },
        { x0: hx - 0.13, x1: hx, y0: hy - 0.05, y1: hy + 0.05 },
      );
    }
  }

  // interação: o cursor é um lampião e o clique solta faíscas
  lampiao(T, mouse, 0.45, 0.1);
  faiscas(T, cliques, t);

  // ondas que o ponteiro e os cliques fazem na água
  const naAgua = mouse && mouse.v > LAGO ? { x: mouse.u * A, y: mouse.v } : null;
  const aneis = cliques.filter((q) => q.v > LAGO && t - q.t < 3).map((q) => ({ x: q.u * A, y: q.v, idade: t - q.t }));
  const perturba = (X: number, Y: number) => {
    let o = 0;
    if (naAgua) {
      const d = Math.hypot(X - naAgua.x, (Y - naAgua.y) * 3);
      o += Math.sin(d * 180 - t * 10) * Math.exp(-d * 14) * 3;
    }
    for (const a of aneis) {
      const d = Math.hypot(X - a.x, (Y - a.y) * 3);
      const r = a.idade * 0.25;
      o += Math.sin((d - r) * 150) * Math.exp(-Math.abs(d - r) * 30) * Math.exp(-a.idade) * 5;
    }
    return o;
  };

  // lago: reflexo de tudo que está acima, com ondulação, e a trilha de luar tremendo na água
  const yl = Math.floor(LAGO * rows);
  for (let y = yl; y < rows; y++) {
    const Y = (y + 0.5) / rows;
    const prof = (Y - LAGO) / (1 - LAGO);
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const X = ((x + 0.5) / cols) * A;
      const onda = Math.sin(Y * 160 + t * 1.6 + fbm(X * 6, Y * 20) * 3) * (1 + prof * 3) + perturba(X, Y);
      const ys = Math.round(2 * yl - y - 1 + onda * 0.6);
      const xs = Math.round(x + onda * 1.2);
      let L = 0.035;
      let w = 0;
      if (ys >= 0 && ys < yl && xs >= 0 && xs < cols) {
        const j = ys * cols + xs;
        L = 0.03 + c.lum[j] * (0.55 - prof * 0.25);
        w = c.calor[j] * 0.8;
      }
      if (Math.abs(X - b.lua.x) < 0.04 + prof * 0.12 && fbm(X * 40 + t * 0.6, Y * 90 - t * 0.5, 2) > 0.62) L = Math.max(L, 0.55);
      if (y === yl) L = Math.max(L, 0.25);
      c.lum[i] = noTexto(X, Y) ? L * 0.25 : L;
      c.calor[i] = w;
      T.mat[i] = 6;
    }
  }

  return expor(c);
};
