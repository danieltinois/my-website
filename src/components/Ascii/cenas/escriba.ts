// resume-tailor: o escriba, a partir de uma imagem realista (public/cenas/escriba.webp)
// convertida em caracteres a cada quadro. Por cima, em código: a vela tremulando (a própria chama
// da foto balança e a luz da sala pulsa com ela), um fio de fumaça, poeira na luz, nuvens
// passando pela lua na janela e a história: as experiências escritas no pergaminho desbotam e
// voltam reordenadas pela aderência à vaga (a que não serve fica apagada); depois a pena sai do
// tinteiro e escreve o currículo gerado, traço a traço. Ciclo de 10s.

import {
  balancar,
  fbm,
  fechar,
  fumaca,
  fundoImagem,
  lampiao,
  luz,
  passo,
  poeira,
  ruido,
  tela,
  traco,
  triangulo,
  ultimo,
  type Campo,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const VELA = { x: 0.25, y: 0.2 }; // pavio
const CHAMAS = [{ x: VELA.x, y: VELA.y, alt: 0.11, larg: 0.012 }];
const JANELA = { x0: 0.1, x1: 0.172, y0: 0.02, y1: 0.33 };
// pergaminho em perspectiva: borda de cima mais estreita que a de baixo
const PERG = { y0: 0.6, y1: 0.86, topo: [0.335, 0.625], base: [0.32, 0.685] };
// a pena da foto, do tinteiro à ponta da pluma (some enquanto a pena de código escreve)
const PENA = { x0: 0.33, y0: 0.52, x1: 0.4, y1: 0.24 };
const CICLO = 10;

// linhas do pergaminho: título da vaga, separador, três experiências, separador, currículo
const LINHAS = [0.63, 0.665, 0.695, 0.73, 0.765, 0.795, 0.83];

// a ordem das experiências por vaga (react/node/flutter ↔ java/spring) e quais servem para ela
const EXP = [
  { comp: 0.62, de: 0, para: [2, 0], serve: [false, true] },
  { comp: 0.85, de: 1, para: [1, 2], serve: [true, false] },
  { comp: 0.74, de: 2, para: [0, 1], serve: [true, true] },
];

// borda esquerda e direita do pergaminho numa altura da imagem
const bordas = (iy: number) => {
  const k = (iy - PERG.y0) / (PERG.y1 - PERG.y0);
  return [PERG.topo[0] + (PERG.base[0] - PERG.topo[0]) * k, PERG.topo[1] + (PERG.base[1] - PERG.topo[1]) * k];
};

// uma linha manuscrita (em coordenadas da imagem): palavras de tinta com espaços, como rabiscos
interface Linha {
  y: number;
  ate: number; // fração da largura da linha
  forca: number;
  semente: number;
  feita: number; // quanto já foi escrito (0–1)
}
const tinta = (ix: number, iy: number, l: number, linhas: Linha[]) => {
  for (const ln of linhas) {
    if (ln.forca <= 0 || Math.abs(iy - ln.y) > 0.012) continue;
    const [a, b] = bordas(iy);
    const m = (b - a) * 0.08;
    const u = (ix - a - m) / (b - a - 2 * m);
    if (u < 0 || u > ln.ate * ln.feita) continue;
    const palavra = ruido(u * 40 + ln.semente * 13, ln.semente) > 0.25;
    const traco_ = Math.abs(iy - ln.y - Math.sin(u * 300 + ln.semente) * 0.0015) < 0.0055;
    if (palavra && traco_) return Math.min(l, l * (1 - 0.8 * ln.forca));
  }
  return l;
};

// pena de código: haste fina e pluma em leque, com a ponta em (x, y)
const pena = (T: Tela, x: number, y: number, e: (n: number) => number) => {
  traco(T, x, y, x + e(0.05), y - e(0.2), e(0.003), 0.8);
  triangulo(T, { x: x + e(0.025), y: y - e(0.1) }, { x: x + e(0.07), y: y - e(0.27) }, { x: x + e(0.085), y: y - e(0.16) }, 0.7);
  triangulo(T, { x: x + e(0.025), y: y - e(0.1) }, { x: x + e(0.07), y: y - e(0.27) }, { x: x + e(0.04), y: y - e(0.23) }, 0.5);
};

// Interativa: cada clique troca a vaga; as linhas se reordenam para ela e a pena reescreve.
export const escriba = ({ cols, rows, t, p, dados, mouse, cliques, total }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const f = dados?.fonte;
  if (!f) return T.c;

  const uc = ultimo(cliques);
  // depois de um clique a animação começa no desbotar e para com o currículo escrito
  const c = uc ? Math.min(t - uc.t + 2, 8.9) : t % CICLO;
  const vaga = total % 2;

  // experiências: desbotam (2–2.6s), voltam reordenadas (2.6–3.2s), e voltam ao início (9–10s)
  const reordenada = c >= 2.6 && c < 9.4;
  let forca = 1;
  if (c >= 2 && c < 2.6) forca = 1 - (c - 2) / 0.6;
  else if (c >= 2.6 && c < 3.2) forca = (c - 2.6) / 0.6;
  else if (c >= 9 && c < 9.4) forca = 1 - (c - 9) / 0.4;
  else if (c >= 9.4) forca = (c - 9.4) / 0.6;
  const escrito = passo(0, 1, (c - 3.6) / 4);
  const escrevendo = reordenada && escrito > 0 && escrito < 1;
  const linhas: Linha[] = [
    { y: LINHAS[0], ate: vaga ? 0.4 : 0.55, forca: 1, semente: 1 + vaga * 7, feita: 1 },
    ...EXP.map((x, k) => ({
      y: LINHAS[2 + (reordenada ? x.para[vaga] : x.de)],
      ate: x.comp,
      forca: forca * (reordenada && !x.serve[vaga] ? 0.3 : 1),
      semente: k + 2,
      feita: 1,
    })),
    { y: LINHAS[6], ate: 0.7, forca: reordenada ? 1 : 0, semente: 9, feita: escrito },
  ];

  const tremor = 0.8 + 0.2 * ruido(t * 7, 1) + 0.06 * Math.sin(t * 19);
  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    fx: 0.5,
    limiar: 0.35 * (1 - passo(0, 1, p)),
    gama: 0.68,
    desloca: (ix, iy) => balancar(ix, iy, CHAMAS, t),
    ajuste: ({ ix, iy, l, w }) => {
      // a luz da vela pulsa em tudo que ela ilumina, mais perto dela
      const dv = Math.hypot((ix - VELA.x) * ASPECTO, iy - VELA.y);
      l *= 1 + (tremor - 0.85) * 0.8 * Math.exp(-dv * 1.5) * (0.4 + w);
      // nuvens passando pela lua na janela
      if (ix > JANELA.x0 && ix < JANELA.x1 && iy > JANELA.y0 && iy < JANELA.y1)
        l += 0.12 * passo(0.55, 0.85, fbm(ix * 40 - t * 0.08, iy * 14, 3));
      // tinta no pergaminho
      if (iy > PERG.y0 && iy < PERG.y1) l = tinta(ix, iy, l, linhas);
      // a pena sai do tinteiro enquanto escreve: some da foto
      if (escrevendo) {
        const vx = PENA.x1 - PENA.x0;
        const vy = PENA.y1 - PENA.y0;
        const k = Math.max(0, Math.min(1, ((ix - PENA.x0) * vx * 9 + (iy - PENA.y0) * vy) / (vx * vx * 9 + vy * vy)));
        const d = Math.hypot((ix - PENA.x0 - vx * k) * ASPECTO, iy - PENA.y0 - vy * k);
        if (d < 0.035 && k > 0.08) l *= 0.12;
      }
      return l;
    },
  });
  const e = (n: number) => n * esc;

  // a pena de código escreve a linha do currículo
  if (escrevendo) {
    const [a, b] = bordas(LINHAS[6]);
    const m = (b - a) * 0.08;
    const ponta = para(a + m + (b - a - 2 * m) * 0.7 * escrito, LINHAS[6]);
    pena(T, ponta.x + Math.sin(t * 18) * e(0.004), ponta.y - e(0.004), e);
  }

  // vela: halo, fio de fumaça e poeira girando na luz
  const v = para(VELA.x, VELA.y);
  luz(T, v.x, v.y - e(0.05), e(0.14) * tremor, 0.3 * tremor);
  fumaca(T, v.x, v.y - e(0.13), t, e(0.25), e(0.015), 0.05);
  poeira(T, v.x - e(0.15), v.x + e(0.5), v.y - e(0.15), v.y + e(0.35), t, 30, 0.3);

  lampiao(T, mouse, 0.3, 0.1);
  return fechar(T.c);
};
