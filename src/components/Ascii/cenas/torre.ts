// Pato Commit: a torre do correio, em modo denso. Pombos chegam da direita com cartas (as
// entregas do webhook) e entram pela janela acesa, que pisca a cada entrega. A carta repetida
// (mesmo ID de entrega) não entra: cai no braseiro e vira labareda. Ciclo de 9s.

import {
  acender,
  cada,
  ceu,
  chama,
  copiar,
  elipse,
  estrelasDe,
  expor,
  fbm,
  lampiao,
  luz,
  memoTela,
  nevoa,
  passo,
  pedra,
  piscar,
  ruido,
  tela,
  traco,
  triangulo,
  type Campo,
  type Entrada,
  type Tela,
} from "../denso.ts";

const CHAO = 0.86;

interface Base {
  T: Tela;
  janela: { x: number; y: number };
  braseiro: { x: number; y: number };
  estrelas: number[];
  lua: { x: number; y: number; r: number };
}

const montar = (cols: number, rows: number): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  const lua = { x: A * 0.72, y: 0.2, r: 0.07 };
  ceu(T, lua);
  // colinas ao longe
  cada(T, (X, Y, i) => {
    const h = 0.7 - 0.05 * Math.sin(X * 3 + 1) - 0.03 * fbm(X * 5, 2);
    if (Y < h || Y >= CHAO) return;
    T.c.lum[i] = 0.04 + 0.04 * fbm(X * 20, Y * 20) + (Y - h < 0.008 ? 0.12 : 0);
    T.mat[i] = 7;
  });
  // chão com grama
  cada(
    T,
    (X, Y, i) => {
      T.c.lum[i] = 0.05 + 0.07 * fbm(X * 40, Y * 60) + (Y - CHAO < 0.008 ? 0.15 : 0);
      T.mat[i] = 4;
    },
    { x0: 0, x1: A, y0: CHAO, y1: 1 },
  );
  // torre redonda de pedra com telhado cônico; a lua acende o lado direito
  const tx = A * 0.22;
  const meia = 0.085;
  const topo = 0.3;
  cada(
    T,
    (X, Y, i) => {
      const u = (X - (tx - meia)) / (2 * meia);
      if (u < 0 || u > 1) return;
      const claro = 0.3 + 0.95 * u ** 1.3;
      let L = 0.3 * claro * pedra(X, Y, 0.025, 0.05);
      if (u > 0.94) L = Math.max(L, 0.55);
      T.c.lum[i] = L;
      T.mat[i] = 2;
    },
    { x0: tx - meia, x1: tx + meia, y0: topo, y1: CHAO },
  );
  triangulo(T, { x: tx - meia - 0.02, y: topo }, { x: tx + meia + 0.02, y: topo }, { x: tx, y: topo - 0.22 }, 0, 3);
  cada(
    T,
    (X, Y, i) => {
      if (T.mat[i] !== 3) return;
      const lado = passo(tx - meia, tx + meia, X);
      T.c.lum[i] = 0.22 * (0.4 + 0.9 * lado) * (0.7 + 0.4 * ((Y / 0.016) % 1));
      if (Math.abs(Y - (topo - 0.002)) < 0.006) T.c.lum[i] = 0.4;
    },
    { x0: tx - meia - 0.02, x1: tx + meia + 0.02, y0: topo - 0.23, y1: topo + 0.01 },
  );
  traco(T, tx, topo - 0.22, tx, topo - 0.27, 0.002, 0.45, 2);
  // janela em arco no alto (o brilho é dinâmico) e porta
  const janela = { x: tx + 0.01, y: topo + 0.1 };
  elipse(T, janela.x, janela.y, 0.02, 0.04, () => 0, 5);
  elipse(T, tx, CHAO - 0.04, 0.025, 0.05, (_u, v) => (v > 0.7 ? 0.2 : 0.04), 4);
  // braseiro: bacia de ferro num tripé
  const braseiro = { x: tx + meia + 0.12, y: CHAO - 0.09 };
  cada(
    T,
    (X, Y, i) => {
      const u = (X - braseiro.x) / 0.035;
      const v = (Y - braseiro.y - 0.005) / 0.018;
      if (v >= 0 && u * u + v * v <= 1) {
        T.c.lum[i] = 0.25 + 0.2 * u;
        T.mat[i] = 4;
      }
    },
    { x0: braseiro.x - 0.035, x1: braseiro.x + 0.035, y0: braseiro.y, y1: braseiro.y + 0.025 },
  );
  for (const d of [-0.025, 0, 0.025]) traco(T, braseiro.x + d * 0.6, braseiro.y + 0.02, braseiro.x + d, CHAO, 0.0025, 0.25, 4);

  return { T, janela, braseiro, estrelas: estrelasDe(T, 0.02, 0.6), lua };
};

const base$ = memoTela(montar);
const CICLO = 9;
const VOO = 3.2;
// a segunda entrega é a repetida (mesmo ID): vai para o braseiro
const REPETIDA = [false, true, false];

// pombo em voo: corpo, cabeça, cauda e asas batendo; a carta presa embaixo
const pombo = (T: Tela, x: number, y: number, t: number, fase: number) => {
  const asa = Math.sin(t * 14 + fase) * 0.022;
  elipse(T, x, y, 0.016, 0.008, (u) => 0.55 + 0.25 * u);
  elipse(T, x - 0.017, y - 0.004, 0.006, 0.006, () => 0.65);
  triangulo(T, { x: x + 0.012, y: y - 0.002 }, { x: x + 0.032, y: y - 0.008 }, { x: x + 0.03, y: y + 0.006 }, 0.45);
  triangulo(T, { x: x - 0.006, y }, { x: x + 0.01, y }, { x: x + 0.006, y: y - 0.02 - asa }, 0.7);
  cada(T, (_X, _Y, i) => acender(T, i, 0.85), { x0: x - 0.004, x1: x + 0.008, y0: y + 0.008, y1: y + 0.016 });
};

// Interativa: cada clique solta um pombo do ponto clicado. Um clique a menos de 1,5s do anterior
// é a mesma entrega chegando de novo (o GitHub entrega "pelo menos uma vez"): vai para o braseiro.
// Sem cliques recentes, a cena roda sozinha em ciclo.
export const torre = ({ cols, rows, t, mouse, cliques }: Entrada): Campo => {
  const b = base$<Base>(cols, rows);
  const T = copiar(b.T);
  const { A } = T;
  piscar(T, b.estrelas, t);
  // nuvens finas passando pela lua
  cada(
    T,
    (X, Y, i) => {
      if (T.mat[i] !== 0) return;
      const dens = passo(0.58, 0.82, fbm(X * 2.6 - t * 0.015, Y * 8, 3)) * passo(0.5, 0.3, Y);
      if (dens > 0) T.c.lum[i] = Math.max(T.c.lum[i], 0.03 + dens * (0.08 + 0.3 * Math.exp(-Math.hypot(X - b.lua.x, Y - b.lua.y) / 0.3)));
    },
    { x0: 0, x1: A, y0: 0, y1: 0.5 },
  );
  nevoa(T, CHAO - 0.12, t, 0.06);

  // as entregas deste quadro: dos cliques recentes ou, sem eles, do ciclo automático
  type Voo = { saida: number; de: { x: number; y: number }; repetida: boolean; k: number };
  const recentes = cliques.filter((q) => t - q.t < VOO + 2);
  const voos: Voo[] = recentes.length
    ? recentes.map((q, k) => ({
        saida: q.t,
        de: { x: q.u * A, y: q.v },
        repetida: k > 0 && q.t - recentes[k - 1].t < 1.5,
        k,
      }))
    : REPETIDA.map((repetida, k) => ({
        saida: t - (t % CICLO) + k * (CICLO / 3),
        de: { x: A + 0.05, y: b.janela.y - 0.05 },
        repetida,
        k,
      }));
  let flashJanela = 0;
  let labareda = 0;
  for (const v of voos) {
    const voo = t - v.saida;
    if (voo < 0) continue;
    const alvo = v.repetida ? { x: b.braseiro.x, y: b.braseiro.y - 0.03 } : { x: b.janela.x + 0.02, y: b.janela.y };
    const dur = VOO * Math.min(1, 0.4 + Math.abs(v.de.x - alvo.x) / A);
    if (voo < dur) {
      const q = voo / dur;
      const x = v.de.x + (alvo.x - v.de.x) * q;
      const y = v.de.y + (alvo.y - v.de.y) * q - 0.12 * Math.sin(q * Math.PI) + Math.sin(voo * 5 + v.k) * 0.01;
      pombo(T, x, y, t, v.k);
    } else if (v.repetida) labareda = Math.max(labareda, 1 - (voo - dur) / 1.4);
    else flashJanela = Math.max(flashJanela, 1 - (voo - dur) / 0.9);
  }
  lampiao(T, mouse, 0.4, 0.1);

  // janela acesa, que pisca forte quando uma carta entra
  const brilho = 0.6 + 0.15 * ruido(t * 3, 1) + 0.4 * Math.max(0, flashJanela);
  luz(T, b.janela.x, b.janela.y, 0.06 + 0.05 * Math.max(0, flashJanela), brilho);
  cada(
    T,
    (_X, _Y, i) => {
      if (T.mat[i] === 5) acender(T, i, 0.6 + 0.4 * brilho, 1);
    },
    { x0: b.janela.x - 0.03, x1: b.janela.x + 0.03, y0: b.janela.y - 0.05, y1: b.janela.y + 0.05 },
  );

  // braseiro: sempre aceso; a carta repetida vira labareda com faíscas
  const forte = Math.max(0, labareda);
  luz(T, b.braseiro.x, b.braseiro.y - 0.02, 0.12 + 0.12 * forte, 0.7 + 0.3 * forte);
  chama(T, b.braseiro.x, b.braseiro.y, 0.05 + 0.1 * forte, 0.025 + 0.015 * forte, t, 2);
  if (forte > 0)
    for (let k = 0; k < 10; k++) {
      const idade = (t * 1.5 + k * 0.1) % 1;
      const fx = b.braseiro.x + Math.sin(k * 2.1 + idade * 4) * 0.04 * idade;
      const fy = b.braseiro.y - 0.05 - idade * 0.2 * forte;
      cada(T, (_X, _Y, i) => acender(T, i, 0.9, 1), { x0: fx, x1: fx + 0.003, y0: fy, y1: fy + 0.008 });
    }
  return expor(T.c);
};
