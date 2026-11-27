// O fechamento da página: uma vela acesa numa mesa de madeira, à noite, ao lado da janela com a
// lua e do tinteiro com a pena, a partir de uma imagem realista (public/cenas/vela.webp, a mesma
// mesa do antigo escriba) convertida em caracteres a cada quadro, como o castelo. A câmera fica
// no canto da vela.
//
// O que se mexe é código por cima da imagem: a própria chama da foto tremula e se inclina
// (`balancar`), a luz da mesa e da parede pulsa com ela, um fio de fumaça sobe, poeira dourada
// flutua na luz e nuvens finas passam pela lua na janela.
//
// Revelação pela rolagem (p de 0 a 1, conforme o quadro sobe pela tela): a câmera começa fechada
// na chama, com só o que brilha, e abre para a mesa, a janela e o tinteiro.
// Interação: o clique é um sopro: a chama dança e se deita por uns segundos e solta faíscas.

import {
  balancar,
  faiscas,
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
  type Campo,
  type DadosImagem,
  type Entrada,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo (1200×400)
const ASPECTO = 3;
const PAVIO = { x: 0.25, y: 0.2 };
const CHAMA = { x: PAVIO.x, y: PAVIO.y, alt: 0.11, larg: 0.012 };
const JANELA = { x0: 0.1, x1: 0.172, y0: 0.02, y1: 0.35 };
const LUA = { x: 0.1225, y: 0.083 };
const FOCO = { x: 0.24, y: 0.42 }; // a vela e o castiçal

export const vela = ({ cols, rows, t, p, dados, parado, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));
  const r = passo(0, 1, p);

  // o sopro: cada clique agita a chama por uns segundos, mais forte logo depois
  let sopro = 0;
  for (const c of cliques) {
    const idade = t - c.t;
    if (idade >= 0) sopro = Math.max(sopro, Math.exp(-idade * 1.1));
  }
  const chama = { ...CHAMA, larg: CHAMA.larg * (1 + sopro) };
  // o brilho da vela respira devagar e treme um pouco; com o sopro, treme mais e cai
  const tremor = (0.8 + 0.2 * ruido(t * 7, 1) + 0.06 * Math.sin(t * 19)) * (1 - 0.35 * sopro * (0.5 + 0.5 * Math.sin(t * 23)));

  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    z: 1.7 - 0.7 * r,
    fx: FOCO.x,
    fy: FOCO.y,
    limiar: 0.45 * (1 - r),
    gama: 0.68,
    desloca: (ix, iy) => {
      const b = balancar(ix, iy, [chama], t);
      // o sopro deita a chama para a direita, mais na ponta
      const k = (CHAMA.y - iy) / CHAMA.alt;
      const deita = sopro > 0 && k > 0 && k < 1.2 && Math.abs(ix - CHAMA.x) < chama.larg * 1.5 ? -sopro * 0.01 * k : 0;
      return b * (1 + 2 * sopro) + deita;
    },
    ajuste: ({ ix, iy, l, w }) => {
      // a luz da vela pulsa em tudo que ela ilumina, mais perto dela
      const dv = Math.hypot((ix - PAVIO.x) * ASPECTO, iy - PAVIO.y);
      l *= 1 + (tremor - 0.85) * 0.9 * Math.exp(-dv * 1.5) * (0.4 + w);
      // nuvens finas passando pela lua na janela
      if (ix > JANELA.x0 && ix < JANELA.x1 && iy > JANELA.y0 && iy < JANELA.y1) {
        const perto = Math.exp(-Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y) / 0.12);
        l += (0.06 + 0.1 * perto) * passo(0.55, 0.85, fbm(ix * 40 - t * 0.08, iy * 14, 3));
      }
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));
  const e = (n: number) => n * esc;

  // halo da chama, fio de fumaça e poeira dourada girando na luz
  const v = para(PAVIO.x, PAVIO.y);
  luz(T, v.x, v.y - e(0.05), e(0.14) * tremor, 0.3 * tremor);
  fumaca(T, v.x, v.y - e(0.13), t, e(0.25), e(0.015) * (1 + 2 * sopro), 0.05 + 0.08 * sopro);
  // a poeira só aparece com a cena já detalhada: na grade grossa vira letras enormes
  if (r > 0.4) poeira(T, v.x - e(0.12), v.x + e(0.25), v.y - e(0.12), v.y + e(0.3), t, 24, 0.3 * passo(0.4, 0.8, r));

  // interação: o cursor é um lampião e o clique solta faíscas no ponto
  lampiao(T, mouse, 0.3, 0.1);
  faiscas(T, cliques, t, 14);
  return fechar(T.c);
};
