// resume-tailor: o escriba, em modo denso. À luz de uma vela, as experiências escritas no
// pergaminho desbotam e voltam reordenadas pela aderência à vaga (a que não serve fica
// apagada); depois a pena escreve o currículo gerado, traço a traço. Ciclo de 10s.

import {
  acender,
  cada,
  chama,
  copiar,
  elipse,
  expor,
  fbm,
  lampiao,
  luz,
  memoTela,
  ruido,
  tela,
  traco,
  triangulo,
  ultimo,
  type Campo,
  type Entrada,
  type Tela,
} from "../denso.ts";

const MESA = 0.8;

interface Base {
  T: Tela;
  vela: { x: number; y: number };
  perg: { x0: number; x1: number; y0: number; y1: number };
  linhas: number[]; // y de cada linha de texto
}

// três experiências: comprimento (fração da largura útil), posição no perfil e em cada vaga.
// Vaga 0: react, node, flutter. Vaga 1 (o clique troca): java, spring.
const EXP = [
  { comp: 0.62, de: 0, para: [2, 0], serve: [false, true] },
  { comp: 0.85, de: 1, para: [1, 2], serve: [true, false] },
  { comp: 0.74, de: 2, para: [0, 1], serve: [true, true] },
];

const montar = (cols: number, rows: number): Base => {
  const T = tela(cols, rows);
  const { A } = T;
  // parede de madeira escura ao fundo
  cada(T, (X, Y, i) => {
    T.c.lum[i] = 0.02 + 0.03 * fbm(X * 3, Y * 60) * (0.7 + 0.3 * Math.sin(X * 30));
    T.mat[i] = 4;
  });
  // mesa com veios
  cada(
    T,
    (X, Y, i) => {
      T.c.lum[i] = 0.1 + 0.08 * fbm(X * 4, Y * 90 + fbm(X * 2, Y) * 3) + (Y - MESA < 0.01 ? 0.15 : 0);
      T.mat[i] = 4;
    },
    { x0: 0, x1: A, y0: MESA, y1: 1 },
  );
  // pergaminho com fibras e bordas gastas, e os rolos em cima e embaixo
  const perg = { x0: A * 0.27, x1: A * 0.94, y0: 0.1, y1: 0.74 };
  cada(
    T,
    (X, Y, i) => {
      const borda = Math.min(X - perg.x0, perg.x1 - X, (Y - perg.y0) * 1.8, (perg.y1 - Y) * 1.8);
      if (borda < -0.004 + (fbm(X * 50, Y * 50) - 0.5) * 0.01) return;
      T.c.lum[i] = (0.36 + 0.1 * fbm(X * 40, Y * 120)) * (borda < 0.02 ? 0.75 : 1);
      T.mat[i] = 2;
    },
    perg,
  );
  for (const ry of [perg.y0, perg.y1])
    elipse(T, (perg.x0 + perg.x1) / 2, ry, (perg.x1 - perg.x0) / 2 + 0.02, 0.022, (_u, v) => 0.2 + 0.35 * (1 - Math.abs(v + 0.4)), 3);
  // tinteiro
  elipse(T, A * 0.97, MESA - 0.03, 0.03, 0.03, (u, v) => (v < -0.6 ? 0.25 : 0.05 + 0.12 * Math.max(0, u)));
  // vela: cilindro de cera num castiçal
  const vela = { x: A * 0.12, y: 0.42 };
  cada(
    T,
    (X, Y, i) => {
      const u = (X - vela.x) / 0.022;
      if (Math.abs(u) > 1) return;
      T.c.lum[i] = 0.35 + 0.3 * (1 - Math.abs(u)) - (Y - vela.y) * 0.4;
      T.mat[i] = 3;
    },
    { x0: vela.x - 0.022, x1: vela.x + 0.022, y0: vela.y, y1: MESA - 0.04 },
  );
  elipse(T, vela.x, MESA - 0.03, 0.06, 0.018, (u) => 0.2 + 0.15 * Math.max(0, u), 3);
  traco(T, vela.x, vela.y, vela.x, vela.y - 0.012, 0.0015, 0.05, 3);

  const passo = (perg.y1 - perg.y0 - 0.12) / 7;
  const linhas = Array.from({ length: 7 }, (_, k) => perg.y0 + 0.07 + k * passo);
  return { T, vela: { x: vela.x, y: vela.y - 0.012 }, perg, linhas };
};

const base$ = memoTela(montar);
const CICLO = 10;

// uma linha manuscrita: palavras de tinta com espaços, como rabiscos
const tinta = (T: Tela, x0: number, x1: number, y: number, forca: number, semente: number, ate = 1) => {
  if (forca <= 0) return;
  const fim = x0 + (x1 - x0) * ate;
  cada(
    T,
    (X, Y, i) => {
      if (X > fim) return;
      const palavra = ruido(X * 45 + semente * 13, semente) > 0.28;
      const traco_ = Math.abs(Y - y - Math.sin(X * 300 + semente) * 0.003) < 0.007;
      if (palavra && traco_ && ruido(X * 400, Y * 400 + semente) > 0.2) T.c.lum[i] = Math.min(T.c.lum[i], 0.36 - 0.3 * forca);
    },
    { x0, x1: fim, y0: y - 0.012, y1: y + 0.012 },
  );
};

// Interativa: cada clique troca a vaga; as linhas se reordenam para ela e a pena reescreve.
export const escriba = ({ cols, rows, t, mouse, cliques, total }: Entrada): Campo => {
  const b = base$<Base>(cols, rows);
  const T = copiar(b.T);
  const { x0, x1 } = b.perg;
  const larg = x1 - x0 - 0.08;
  const esq = x0 + 0.04;
  const uc = ultimo(cliques);
  // depois de um clique a animação começa no desbotar e para com o currículo escrito
  const c = uc ? Math.min(t - uc.t + 2, 8.9) : t % CICLO;
  const vaga = total % 2;

  // título da vaga e as linhas separadoras
  tinta(T, esq, esq + larg * (vaga ? 0.4 : 0.55), b.linhas[0], 1, 1 + vaga * 7);
  traco(T, esq, b.linhas[1] - 0.012, esq + larg, b.linhas[1] - 0.012, 0.0015, 0.22, 2);
  traco(T, esq, b.linhas[5] - 0.012, esq + larg, b.linhas[5] - 0.012, 0.0015, 0.22, 2);

  // experiências: desbotam (2–2.6s), voltam reordenadas (2.6–3.2s), e voltam ao início (9–10s)
  const reordenada = c >= 2.6 && c < 9.4;
  let forca = 1;
  if (c >= 2 && c < 2.6) forca = 1 - (c - 2) / 0.6;
  else if (c >= 2.6 && c < 3.2) forca = (c - 2.6) / 0.6;
  else if (c >= 9 && c < 9.4) forca = 1 - (c - 9) / 0.4;
  else if (c >= 9.4) forca = (c - 9.4) / 0.6;
  EXP.forEach((e, k) => {
    const pos = reordenada ? e.para[vaga] : e.de;
    const f = forca * (reordenada && !e.serve[vaga] ? 0.35 : 1);
    tinta(T, esq, esq + larg * e.comp, b.linhas[2 + pos], f, k + 2);
  });

  // a pena escreve o currículo gerado (3.6–7.6s)
  const escrito = Math.max(0, Math.min(1, (c - 3.6) / 4));
  const yS = b.linhas[6];
  if (reordenada && escrito > 0) tinta(T, esq, esq + larg * 0.7, yS, 1, 9, escrito);
  const escrevendo = reordenada && escrito > 0 && escrito < 1;
  const px = escrevendo ? esq + larg * 0.7 * escrito : x1 - 0.06;
  const py = escrevendo ? yS : b.linhas[0] - 0.02;
  const balanco = escrevendo ? Math.sin(t * 18) * 0.004 : 0;
  // pena: haste fina e a pluma em leque
  traco(T, px + balanco, py, px + 0.06, py - 0.16, 0.0025, 0.75, 7);
  triangulo(T, { x: px + 0.03, y: py - 0.08 }, { x: px + 0.075, y: py - 0.2 }, { x: px + 0.085, y: py - 0.12 }, 0.6);
  triangulo(T, { x: px + 0.03, y: py - 0.08 }, { x: px + 0.075, y: py - 0.2 }, { x: px + 0.045, y: py - 0.18 }, 0.45);

  // vela: chama viva e luz quente que cai no pergaminho e na mesa
  const tremor = 0.75 + 0.25 * ruido(t * 7, 1);
  luz(T, b.vela.x, b.vela.y - 0.03, 0.55 * (0.92 + 0.08 * tremor), 0.75 * tremor);
  chama(T, b.vela.x, b.vela.y, 0.07, 0.014, t, 3);
  cada(T, (_X, _Y, i) => acender(T, i, 0.95, 1), { x0: b.vela.x - 0.003, x1: b.vela.x + 0.003, y0: b.vela.y - 0.03, y1: b.vela.y - 0.012 });
  lampiao(T, mouse, 0.3, 0.1);
  return expor(T.c);
};
