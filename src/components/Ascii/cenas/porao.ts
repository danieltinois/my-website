// DevClean: o porão, em modo denso. Abóbada de pedra iluminada por duas tochas; um varredor
// empurra os três sacos de cache seguros até a carroça da Lixeira, do mais perto ao mais
// longe, e o saco marcado "?" (review) fica onde está. Ciclo de 12s.

import {
  acender,
  cada,
  chama,
  copiar,
  elipse,
  escrever,
  expor,
  fbm,
  luz,
  memoTela,
  passo,
  pedra,
  pessoa,
  ruido,
  tela,
  traco,
  type Campo,
  type Tela,
  faiscas,
  lampiao,
  ultimo,
  type Entrada,
} from "../denso.ts";

const PISO = 0.8;

interface Base {
  T: Tela;
  tochas: { x: number; y: number }[];
  sacos: number[]; // x de cada saco seguro (do mais perto ao mais longe da carroça)
  carroca: { x0: number; x1: number; topo: number };
  casa: number; // onde o varredor descansa
}

// saco de pano amarrado: corpo redondo, pescoço e laço; a luz vem de cima
const saco = (T: Tela, x: number, pe: number, r: number, L: number) => {
  elipse(T, x, pe - r * 0.9, r, r * 0.95, (u, v) => L * (0.55 + 0.45 * (1 - v) * 0.6 + 0.3 * (1 - Math.abs(u))) * (0.85 + 0.3 * ruido(u * 9 + x * 40, v * 9)));
  traco(T, x, pe - r * 1.8, x, pe - r * 2.2, r * 0.22, L * 0.8);
  traco(T, x - r * 0.35, pe - r * 2.25, x + r * 0.35, pe - r * 2.15, r * 0.12, L);
};

const montar = (cols: number, rows: number): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  // parede de pedra e abóbada escura
  cada(T, (X, Y, i) => {
    const arco = 0.16 + 0.12 * ((X - A / 2) / (A / 2)) ** 2;
    let L = Y < arco ? 0.008 + 0.012 * fbm(X * 20, Y * 20) : 0.05 * pedra(X, Y, 0.045, 0.09);
    if (Math.abs(Y - arco) < 0.012) L = 0.12;
    T.c.lum[i] = L;
    T.mat[i] = 2;
  });
  // pilares
  for (const px of [0.05, A - 0.05])
    cada(
      T,
      (X, Y, i) => {
        if (Math.abs(X - px) > 0.045) return;
        T.c.lum[i] = (0.05 + 0.1 * passo(px - 0.045, px + 0.045, X)) * pedra(X, Y, 0.03, 0.09);
      },
      { x0: px - 0.05, x1: px + 0.05, y0: 0, y1: PISO },
    );
  // piso de lajotas
  cada(
    T,
    (X, Y, i) => {
      const junta = ((X + Math.floor((Y - PISO) / 0.05) * 0.06) / 0.12) % 1 < 0.05 || ((Y - PISO) / 0.05) % 1 < 0.12;
      T.c.lum[i] = junta ? 0.02 : 0.06 + 0.03 * fbm(X * 30, Y * 30);
      T.mat[i] = 4;
    },
    { x0: 0, x1: A, y0: PISO, y1: 1 },
  );
  // prateleira com potes e um barril
  const p0 = A * 0.35;
  const p1 = A * 0.72;
  traco(T, p0, 0.46, p1, 0.46, 0.006, 0.3, 4);
  for (let k = 0; k < 6; k++) {
    const x = p0 + 0.03 + k * ((p1 - p0 - 0.06) / 5);
    const h = 0.03 + 0.02 * ruido(k, 3);
    elipse(T, x, 0.455 - h / 2, 0.012 + 0.006 * ruido(k, 7), h / 2, (u) => 0.18 + 0.2 * Math.max(0, u));
  }
  elipse(T, A * 0.3, PISO - 0.07, 0.05, 0.07, (u, v) => (Math.abs(v * 10) % 3 < 0.6 ? 0.12 : 0.22 + 0.15 * u));
  // carroça da Lixeira: caixa de tábuas com rodas raiadas
  const carroca = { x0: A - 0.32, x1: A - 0.08, topo: PISO - 0.16 };
  cada(
    T,
    (X, Y, i) => {
      const inclina = (Y - carroca.topo) * 0.25;
      if (X < carroca.x0 + inclina || X > carroca.x1 - inclina || Y < carroca.topo || Y > PISO - 0.05) return;
      const tabua = ((Y - carroca.topo) / 0.025) % 1 < 0.15;
      T.c.lum[i] = tabua ? 0.08 : 0.2 + 0.08 * fbm(X * 60, Y * 10);
      T.mat[i] = 4;
    },
    { x0: carroca.x0, x1: carroca.x1, y0: carroca.topo, y1: PISO },
  );
  for (const rx of [carroca.x0 + 0.06, carroca.x1 - 0.06]) {
    elipse(T, rx, PISO - 0.035, 0.035, 0.035, (u, v) => (Math.hypot(u, v) > 0.75 ? 0.3 : Math.abs(u) < 0.15 || Math.abs(v) < 0.15 ? 0.25 : 0.05));
  }
  // o saco que fica: review
  saco(T, 0.17, PISO, 0.05, 0.3);
  escrever(T, 0.155, PISO - 0.08, "?", 0.75, 1);

  return {
    T,
    tochas: [
      { x: A * 0.2, y: 0.36 },
      { x: A - 0.2, y: 0.36 },
    ],
    sacos: [A * 0.62, A * 0.52, A * 0.42],
    carroca,
    casa: 0.27,
  };
};

const base$ = memoTela(montar);
const CICLO = 12;

// interpola quadros-chave [t, valor]
const trilha = (t: number, chaves: [number, number][]) => {
  if (t <= chaves[0][0]) return chaves[0][1];
  for (let i = 1; i < chaves.length; i++) {
    const [t1, v1] = chaves[i];
    const [t0, v0] = chaves[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  }
  return chaves.at(-1)![1];
};

// Interativa: o cursor é um lampião (o porão é escuro) e um clique recomeça a limpeza.
export const porao = ({ cols, rows, t, mouse, cliques }: Entrada): Campo => {
  const b = base$<Base>(cols, rows);
  const T = copiar(b.T);
  const uc = ultimo(cliques);
  const c = uc && t - uc.t < CICLO ? t - uc.t : t % CICLO;
  const entrada = b.carroca.x0 - 0.02;
  const viagens = [
    { empurra: 1.6, entrega: 2.8 },
    { empurra: 4.2, entrega: 5.6 },
    { empurra: 7.2, entrega: 8.8 },
  ];
  const chaves: [number, number][] = [
    [0, b.casa],
    [1.6, b.sacos[0] - 0.08],
    [2.8, entrada - 0.08],
    [4.2, b.sacos[1] - 0.08],
    [5.6, entrada - 0.08],
    [7.2, b.sacos[2] - 0.08],
    [8.8, entrada - 0.08],
    [10.4, b.casa],
  ];
  const vx = trilha(c, chaves);
  const indo = trilha(c + 0.05, chaves) >= vx;
  const parado = c > 10.4;

  // tochas: chama e luz que tremula nas paredes
  for (const k of b.tochas) {
    traco(T, k.x, k.y, k.x, k.y + 0.06, 0.006, 0.25, 4);
    const tremor = 0.7 + 0.3 * ruido(t * 8 + k.x * 10, 2);
    luz(T, k.x, k.y - 0.02, 0.22 * (0.9 + 0.1 * tremor), 0.7 * tremor);
    chama(T, k.x, k.y, 0.06, 0.016, t, k.x * 30);
  }

  // sacos: os entregues somem; o da vez desliza até a carroça levantando poeira
  let entregues = 0;
  viagens.forEach((v, k) => {
    if (c >= v.entrega) {
      entregues++;
      return;
    }
    let x = b.sacos[k];
    if (c >= v.empurra) {
      x = b.sacos[k] + (entrada - b.sacos[k]) * ((c - v.empurra) / (v.entrega - v.empurra));
      for (let d = 0; d < 6; d++) {
        const idade = (t * 2 + d * 0.17) % 1;
        const px = x - 0.06 - idade * 0.08;
        const py = PISO - 0.01 - idade * 0.05 - (d % 3) * 0.01;
        cada(T, (_X, _Y, i) => acender(T, i, 0.3 * (1 - idade)), { x0: px, x1: px + 0.004, y0: py, y1: py + 0.01 });
      }
    }
    saco(T, x, PISO, 0.05, 0.42);
  });

  // carga da carroça cresce a cada entrega
  if (entregues > 0) {
    const h = 0.02 + entregues * 0.025;
    const mx = (b.carroca.x0 + b.carroca.x1) / 2;
    cada(
      T,
      (X, Y, i) => {
        const u = (X - mx) / 0.09;
        const v = (b.carroca.topo - Y) / h;
        if (v >= 0 && u * u + v * v <= 1) {
          T.c.lum[i] = (0.3 + 0.2 * (1 - Math.abs(u))) * (0.8 + 0.4 * ruido(X * 150, Y * 150));
          T.mat[i] = 7;
        }
      },
      { x0: mx - 0.09, x1: mx + 0.09, y0: b.carroca.topo - h, y1: b.carroca.topo },
    );
  }

  // o varredor com a vassoura
  const dir = indo || parado ? 1 : -1;
  const mao = pessoa(T, vx, PISO, 0.2, parado ? 0 : t * 8, dir, 0.32, 0.5);
  const cabo = { x: mao.x + dir * 0.05, y: PISO - 0.02 };
  traco(T, mao.x - dir * 0.02, mao.y - 0.03, cabo.x, cabo.y, 0.004, 0.35);
  traco(T, cabo.x - 0.015, PISO - 0.008, cabo.x + 0.015, PISO - 0.008, 0.008, 0.45);

  lampiao(T, mouse, 0.6, 0.16);
  faiscas(T, cliques, t);
  return expor(T.c);
};
