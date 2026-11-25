// Trajetória: a estrada, em modo denso. Um viajante de capa e cajado anda de 2020 a 2026
// conforme a página rola (p de 0 a 1); cada marco é um poste com lampião que acende quando
// ele passa, e o ano fica escrito em cima. No fim da estrada, um castelinho com janelas acesas.
// As pernas se mexem com a rolagem: parado na página, ele fica parado.

import { TRAJETORIA } from "../../../data/site.ts";
import {
  acender,
  cada,
  ceu,
  chama,
  copiar,
  escrever,
  estrelasDe,
  expor,
  fbm,
  luz,
  memoTela,
  pessoa,
  piscar,
  tela,
  traco,
  triangulo,
  type Campo,
  type Tela,
  faiscas,
  lampiao,
  type Entrada,
} from "../denso.ts";

const ANOS = [...TRAJETORIA].reverse().map((m) => m.quando.slice(0, 4));

interface Base {
  T: Tela;
  y: (X: number) => number;
  inicio: number;
  fim: number;
  marcos: { x: number; y: number; ano: string; mostra: boolean }[];
  estrelas: number[];
  janelas: { x: number; y: number }[];
}

const montar = (cols: number, rows: number): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  ceu(T, { x: A * 0.06, y: 0.2, r: 0.09 });
  // serras ao longe e colinas mais perto
  cada(T, (X, Y, i) => {
    const serra = 0.55 - 0.12 * fbm(X * 1.5, 1.7) - 0.05 * Math.abs(Math.sin(X * 2.2));
    const colina = 0.68 - 0.05 * Math.sin(X * 1.3 + 2) - 0.03 * fbm(X * 3, 4.1);
    if (Y > colina) {
      T.c.lum[i] = 0.05 + 0.04 * fbm(X * 25, Y * 25) + (Y - colina < 0.02 ? 0.1 : 0);
      T.mat[i] = 7;
    } else if (Y > serra) {
      T.c.lum[i] = 0.06 + 0.06 * fbm(X * 12, Y * 12) + (Y - serra < 0.02 ? 0.12 : 0);
      T.mat[i] = 1;
    }
  });
  // a estrada: faixa clara ondulada com cascalho e bordas
  const y = (X: number) => 0.8 + 0.04 * Math.sin((X / A) * Math.PI * 3 + 0.4);
  cada(T, (X, Y, i) => {
    const d = Y - y(X);
    if (d < -0.035 || d > 0.035) return;
    T.c.lum[i] = Math.abs(d) > 0.028 ? 0.3 : 0.14 + 0.1 * fbm(X * 90, Y * 90);
    T.mat[i] = 4;
  });
  // castelinho no fim da estrada
  const cx = A - 0.12;
  const base = y(cx) - 0.04;
  cada(
    T,
    (X, Y, i) => {
      const dentro = (Math.abs(X - cx) < 0.05 && Y > base - 0.12) || (Math.abs(X - cx - 0.035) < 0.015 && Y > base - 0.2);
      if (!dentro || Y > base) return;
      T.c.lum[i] = 0.12 + 0.12 * (X > cx ? 1 : 0);
      T.mat[i] = 2;
    },
    { x0: cx - 0.06, x1: cx + 0.06, y0: base - 0.25, y1: base },
  );
  triangulo(T, { x: cx + 0.015, y: base - 0.2 }, { x: cx + 0.055, y: base - 0.2 }, { x: cx + 0.035, y: base - 0.28 }, 0.25, 3);
  const janelas = [
    { x: cx - 0.02, y: base - 0.07 },
    { x: cx + 0.015, y: base - 0.07 },
    { x: cx + 0.035, y: base - 0.15 },
  ];
  // marcos: postes; em tela estreita o ano só aparece no primeiro marco de cada ano
  const inicio = 0.12;
  const fim = A - 0.3;
  const passo = (fim - inicio) / (ANOS.length - 1);
  const largo = A > 3.5;
  const marcos = ANOS.map((ano, k) => {
    const x = inicio + k * passo;
    const topo = y(x) - 0.2;
    traco(T, x, y(x) - 0.03, x, topo, 0.004, 0.22, 4);
    traco(T, x, topo, x + 0.02, topo, 0.003, 0.22, 4);
    return { x: x + 0.02, y: topo + 0.03, ano, mostra: largo || ANOS[k - 1] !== ano };
  });
  return { T, y, inicio, fim, marcos, estrelas: estrelasDe(T, 0.02, 0.5), janelas };
};

const base$ = memoTela(montar);

// Interativa: anda com a rolagem; o cursor é um lampião e o clique solta faíscas.
export const estrada = ({ cols, rows, t, p, mouse, cliques }: Entrada): Campo => {
  const b = base$<Base>(cols, rows);
  const T = copiar(b.T);
  piscar(T, b.estrelas, t);
  const vx = b.inicio + Math.max(0, Math.min(1, p)) * (b.fim - b.inicio);
  const px = 1.6 / T.rows; // altura de um "pixel" da fonte, em mundo

  // lampiões: acesos atrás do viajante; o ano acende junto
  for (const m of b.marcos) {
    const aceso = m.x - 0.02 <= vx + 0.01;
    if (aceso) {
      luz(T, m.x, m.y, 0.09, 0.7 + 0.2 * Math.sin(t * 6 + m.x * 9));
      chama(T, m.x, m.y + 0.01, 0.035, 0.008, t, m.x * 20);
    } else cada(T, (_X, _Y, i) => acender(T, i, 0.2), { x0: m.x - 0.006, x1: m.x + 0.006, y0: m.y - 0.01, y1: m.y + 0.01 });
    if (m.mostra) escrever(T, m.x - 0.04, m.y - 0.13 - 5 * px, m.ano, aceso ? 0.95 : 0.4, 1, aceso ? 0.3 : 0);
  }

  // janelas do castelinho
  for (const j of b.janelas) {
    luz(T, j.x, j.y, 0.03, 0.6);
    cada(T, (_X, _Y, i) => acender(T, i, 0.9, 1), { x0: j.x - 0.004, x1: j.x + 0.004, y0: j.y - 0.008, y1: j.y + 0.008 });
  }

  // o viajante, de capa, com cajado; as pernas andam com a rolagem
  const pe = b.y(vx) - 0.01;
  const mao = pessoa(T, vx, pe, 0.2, p * 90, 1, 0.5, 0.7);
  traco(T, mao.x + 0.01, mao.y - 0.06, mao.x + 0.02, pe, 0.003, 0.6);
  traco(T, vx - 0.012, pe - 0.17, vx - 0.03, pe - 0.06, 0.012, 0.3); // capa
  lampiao(T, mouse, 0.4, 0.1);
  faiscas(T, cliques, t);
  return expor(T.c);
};
