// Contato: o corvo-mensageiro, em modo denso. Uma lua enorme ao fundo; o corvo atravessa a
// lua em silhueta, pousa no poste com a placa do correio, deixa a carta e vai embora.
// Ciclo de 10s.

import {
  acender,
  cada,
  ceu,
  copiar,
  elipse,
  estrelasDe,
  expor,
  fbm,
  memoTela,
  passo,
  piscar,
  tela,
  traco,
  triangulo,
  type Campo,
  type Tela,
  lampiao,
  ultimo,
  type Entrada,
} from "../denso.ts";

interface Base {
  T: Tela;
  poste: { x: number; y: number }; // onde o corvo pousa
  placa: { x: number; y: number };
  lua: { x: number; y: number; r: number };
  estrelas: number[];
}

const montar = (cols: number, rows: number): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  const lua = { x: A * 0.62, y: 0.42, r: 0.34 };
  ceu(T, lua);
  // morro em silhueta com a borda ao luar
  cada(T, (X, Y, i) => {
    const h = 0.82 - 0.06 * Math.sin(X * 1.8 + 0.5) - 0.03 * fbm(X * 4, 1);
    if (Y < h) return;
    T.c.lum[i] = Y - h < 0.012 ? 0.3 : 0.03 + 0.04 * fbm(X * 30, Y * 30);
    T.mat[i] = 4;
  });
  // poste com travessa e a placa do correio (um envelope)
  const x = A * 0.3;
  const topo = 0.42;
  traco(T, x, topo, x, 0.9, 0.009, 0.1, 4);
  traco(T, x - 0.05, topo + 0.01, x + 0.05, topo + 0.01, 0.006, 0.12, 4);
  const placa = { x: x + 0.12, y: topo + 0.17 };
  traco(T, x, placa.y, placa.x - 0.06, placa.y, 0.004, 0.1, 4);
  cada(
    T,
    (X, Y, i) => {
      const u = (X - placa.x) / 0.06;
      const v = (Y - placa.y) / 0.04;
      if (Math.abs(u) > 1 || Math.abs(v) > 1) return;
      const borda = Math.abs(u) > 0.88 || Math.abs(v) > 0.82;
      const aba = Math.abs(v + 0.82 - (1 - Math.abs(u)) * 1.2) < 0.15;
      T.c.lum[i] = borda || aba ? 0.5 : 0.22;
      T.mat[i] = 4;
    },
    { x0: placa.x - 0.06, x1: placa.x + 0.06, y0: placa.y - 0.04, y1: placa.y + 0.04 },
  );
  return { T, poste: { x: x + 0.01, y: topo - 0.005 }, placa, lua, estrelas: estrelasDe(T, 0.02, 0.8) };
};

const base$ = memoTela(montar);
const CICLO = 10;
const ESCURO = 0.012;

// corvo: corpo, cabeça com bico, cauda em leque; `asa` de -1 a 1 bate a asa; olho brilhando
const ave = (T: Tela, x: number, y: number, asa: number, pousado: boolean) => {
  elipse(T, x, y, 0.035, 0.022, () => ESCURO);
  elipse(T, x - 0.035, y - 0.018, 0.015, 0.015, () => ESCURO);
  triangulo(T, { x: x - 0.048, y: y - 0.022 }, { x: x - 0.048, y: y - 0.012 }, { x: x - 0.075, y: y - 0.014 }, ESCURO);
  triangulo(T, { x: x + 0.03, y: y - 0.004 }, { x: x + 0.075, y: y - 0.02 }, { x: x + 0.075, y: y + 0.018 }, ESCURO);
  cada(T, (_X, _Y, i) => acender(T, i, 0.9), { x0: x - 0.04, x1: x - 0.036, y0: y - 0.024, y1: y - 0.018 });
  if (pousado) {
    triangulo(T, { x: x - 0.02, y: y - 0.01 }, { x: x + 0.04, y: y - 0.006 }, { x: x + 0.03, y: y + 0.016 }, 0.06);
    traco(T, x - 0.005, y + 0.02, x - 0.008, y + 0.04, 0.0025, ESCURO);
    traco(T, x + 0.008, y + 0.02, x + 0.006, y + 0.04, 0.0025, ESCURO);
  } else
    triangulo(T, { x: x - 0.02, y }, { x: x + 0.025, y }, { x: x + 0.01, y: y - 0.09 * asa }, ESCURO);
};

// Interativa: um clique faz o corvo levantar voo na hora; o cursor é um lampião.
export const corvo = ({ cols, rows, t, mouse, cliques }: Entrada): Campo => {
  const b = base$<Base>(cols, rows);
  const T = copiar(b.T);
  const { A } = T;
  piscar(T, b.estrelas, t);
  // nuvens passando pela lua
  cada(
    T,
    (X, Y, i) => {
      if (T.mat[i] !== 0 && T.mat[i] !== 9) return;
      const dens = passo(0.6, 0.85, fbm(X * 2 - t * 0.02, Y * 6, 3));
      if (dens > 0) T.c.lum[i] = T.c.lum[i] * (1 - dens * 0.6) + dens * 0.12;
    },
    { x0: 0, x1: A, y0: 0, y1: 0.85 },
  );

  const uc = ultimo(cliques);
  const c = uc && t - uc.t < CICLO ? (t - uc.t + 7) % CICLO : t % CICLO;
  const asa = Math.sin(t * 9);
  const pousoY = b.poste.y - 0.045;
  let entregue = false;
  if (c < 3.2) {
    // chegada: da direita, cruzando a lua, descendo até o poste
    const k = c / 3.2;
    const x = A + 0.1 + (b.poste.x - A - 0.1) * k;
    const y = 0.18 + (pousoY - 0.18) * Math.sin((k * Math.PI) / 2);
    ave(T, x, y, asa, false);
    cada(T, (_X, _Y, i) => acender(T, i, 0.9), { x0: x - 0.012, x1: x + 0.012, y0: y + 0.022, y1: y + 0.034 });
  } else if (c < 7) {
    ave(T, b.poste.x, pousoY, 0, true);
    entregue = true;
  } else {
    const k = (c - 7) / 3;
    ave(T, b.poste.x - k * (b.poste.x + 0.15), pousoY - k * 0.5, asa, false);
    entregue = true;
  }
  // a carta entregue, presa na placa, brilhando de leve
  if (entregue)
    cada(T, (_X, _Y, i) => acender(T, i, 0.9, 0.6), { x0: b.placa.x - 0.02, x1: b.placa.x + 0.02, y0: b.placa.y - 0.012, y1: b.placa.y + 0.012 });
  lampiao(T, mouse, 0.35, 0.1);
  return expor(T.c);
};
