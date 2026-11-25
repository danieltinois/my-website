// DevClean: o porão, a partir de uma imagem realista (public/cenas/porao.webp) convertida em
// caracteres a cada quadro. Por cima, em código: as tochas tremulando (a luz nas paredes pulsa
// junto), fagulhas e fumaça subindo para a abóbada, poeira no feixe de luz, um rato que cruza o
// chão de vez em quando e a história: um varredor empurra os três sacos de cache seguros até a
// carroça da Lixeira, do mais perto ao mais longe, e o saco marcado "?" (review) fica onde está.
// Ciclo de 12s; a carga da carroça cresce a cada entrega.

import {
  acender,
  cada,
  chama,
  elipse,
  escrever,
  faiscas,
  fagulhas,
  fechar,
  fumaca,
  fundoImagem,
  lampiao,
  luz,
  passo,
  pessoa,
  poeira,
  pontoMundo,
  ruido,
  tela,
  traco,
  ultimo,
  balancar,
  type Campo,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const TOCHAS = [
  { x: 0.1975, y: 0.2 },
  { x: 0.754, y: 0.405 },
];
const CHAMAS = TOCHAS.map((k) => ({ x: k.x, y: k.y + 0.03, alt: 0.12, larg: 0.012 }));
const CHAO = 0.71; // linha do chão na profundidade da carroça
const CARROCA = { x0: 0.865, x1: 0.99, topo: 0.45, alca: 0.8 };
const SACOS = [0.42, 0.52, 0.6];
const REVIEW = 0.33;
const CASA = 0.25;
const ALTURA = 0.27; // altura de uma pessoa nessa profundidade, em alturas da imagem
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

// saco de pano amarrado, iluminado de cima
const saco = (T: Tela, x: number, pe: number, r: number, L: number) => {
  elipse(T, x, pe - r * 0.9, r, r * 0.95, (u, v) => L * (0.55 + 0.27 * (1 - v) + 0.3 * (1 - Math.abs(u))) * (0.85 + 0.3 * ruido(u * 9 + x * 40, v * 9)));
  traco(T, x, pe - r * 1.8, x, pe - r * 2.2, r * 0.22, L * 0.8);
  traco(T, x - r * 0.35, pe - r * 2.25, x + r * 0.35, pe - r * 2.15, r * 0.12, L);
};

// Interativa: o cursor é um lampião (o porão é escuro) e um clique recomeça a limpeza.
export const porao = ({ cols, rows, t, p, dados, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const f = dados?.fonte;
  if (!f) return T.c;

  // cada tocha tremula no seu ritmo; a luz quente das paredes pulsa com a tocha mais perto
  const tremor = TOCHAS.map((_k, n) => 0.75 + 0.25 * ruido(t * 9 + n * 5, 2) + 0.1 * Math.sin(t * 23 + n));
  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    fx: 0.6,
    limiar: 0.35 * (1 - passo(0, 1, p)),
    gama: 0.75,
    desloca: (ix, iy) => balancar(ix, iy, CHAMAS, t),
    ajuste: ({ ix, iy, l, w }) => {
      if (w > 0.05) {
        const n = Math.abs(ix - TOCHAS[0].x) < Math.abs(ix - TOCHAS[1].x) ? 0 : 1;
        const d = Math.hypot(ix - TOCHAS[n].x, (iy - TOCHAS[n].y) / ASPECTO);
        l *= 1 + (tremor[n] - 0.85) * 0.9 * Math.exp(-d * 6);
      }
      return l;
    },
  });
  const e = (n: number) => n * esc;
  const chao = para(0, CHAO).y;
  const X = (x: number) => para(x, 0).x;

  // tochas: chama viva, fagulhas e fumaça que sobe e se perde na abóbada
  TOCHAS.forEach((k, n) => {
    const m = para(k.x, k.y);
    luz(T, m.x, m.y, e(0.12) * tremor[n], 0.5 * tremor[n]);
    chama(T, m.x, m.y + e(0.02), e(0.07) * tremor[n], e(0.012), t, n * 30);
    fagulhas(T, m.x, m.y - e(0.03), t + n * 3, 6, e(0.18), e(0.03));
    fumaca(T, m.x + e(0.005), m.y - e(0.05), t + n * 7, e(0.17), e(0.03), 0.08);
  });
  // poeira girando no feixe da primeira tocha
  const p0 = para(TOCHAS[0].x, TOCHAS[0].y);
  poeira(T, p0.x - e(0.05), p0.x + e(0.35), p0.y, p0.y + e(0.45), t, 40, 0.35);

  // a história da limpeza
  const uc = ultimo(cliques);
  const c = uc && t - uc.t < CICLO ? t - uc.t : t % CICLO;
  const entrada = CARROCA.alca;
  const viagens = [
    { empurra: 1.6, entrega: 2.8 },
    { empurra: 4.2, entrega: 5.6 },
    { empurra: 7.2, entrega: 8.8 },
  ];
  const r = 0.045;
  const chaves: [number, number][] = [
    [0, CASA],
    [1.6, SACOS[0] - r * 1.8],
    [2.8, entrada - r * 1.8],
    [4.2, SACOS[1] - r * 1.8],
    [5.6, entrada - r * 1.8],
    [7.2, SACOS[2] - r * 1.8],
    [8.8, entrada - r * 1.8],
    [10.4, CASA],
  ];
  const vx = trilha(c, chaves);
  const indo = trilha(c + 0.05, chaves) >= vx;
  const parado = c > 10.4;

  // o saco de review, com o "?", fica onde está
  saco(T, X(REVIEW), chao, e(r), 0.6);
  escrever(T, X(REVIEW) - e(0.012), chao - e(r * 1.25), "?", 0.9, Math.max(1, Math.round(cols / 220)));

  // sacos: os entregues somem; o da vez desliza até a carroça levantando poeira
  let entregues = 0;
  viagens.forEach((v, k) => {
    if (c >= v.entrega) {
      entregues++;
      return;
    }
    let x = SACOS[k];
    if (c >= v.empurra) {
      x = SACOS[k] + (entrada - SACOS[k]) * ((c - v.empurra) / (v.entrega - v.empurra));
      for (let d = 0; d < 10; d++) {
        const idade = (t * 2 + d * 0.11) % 1;
        pontoMundo(T, X(x) - e(r) - idade * e(0.05), chao - e(0.005) - idade * e(0.04) - (d % 3) * e(0.006), 0.35 * (1 - idade), 0.5);
      }
    }
    saco(T, X(x), chao, e(r), 0.6);
  });

  // carga da carroça cresce a cada entrega
  if (entregues > 0) {
    const h = e(0.02 + entregues * 0.022);
    const topo = para(0, CARROCA.topo).y;
    const mx = X((CARROCA.x0 + CARROCA.x1) / 2);
    const rx = e(0.13);
    cada(
      T,
      (Xm, Ym, i) => {
        const u = (Xm - mx) / rx;
        const v = (topo - Ym) / h;
        if (v >= 0 && u * u + v * v <= 1) acender(T, i, (0.3 + 0.2 * (1 - Math.abs(u))) * (0.8 + 0.4 * ruido(Xm * 150, Ym * 150)));
      },
      { x0: mx - rx, x1: mx + rx, y0: topo - h, y1: topo },
    );
  }

  // o varredor com a vassoura, com a borda acesa pela tocha
  const dir = indo || parado ? 1 : -1;
  const mao = pessoa(T, X(vx), chao, e(ALTURA), parado ? 0 : t * 8, dir, 0.3, 0.75);
  const cabo = { x: mao.x + dir * e(0.05), y: chao - e(0.02) };
  traco(T, mao.x - dir * e(0.02), mao.y - e(0.03), cabo.x, cabo.y, e(0.004), 0.45);
  traco(T, cabo.x - e(0.016), chao - e(0.008), cabo.x + e(0.016), chao - e(0.008), e(0.008), 0.55);

  // um rato cruza o chão a cada 15s, da direita para a esquerda
  const cr = (t + 6) % 15;
  if (cr < 2.4) {
    const rx = X(0.95 - (cr / 2.4) * 0.9);
    const ry = chao + e(0.05);
    elipse(T, rx, ry, e(0.012), e(0.006), () => 0.1);
    traco(T, rx + e(0.01), ry, rx + e(0.03), ry + Math.sin(t * 20) * e(0.004), e(0.0015), 0.12);
  }

  lampiao(T, mouse, 0.6, 0.16);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
