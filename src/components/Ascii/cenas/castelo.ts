// O hero: o castelo à noite, a partir de uma imagem realista (public/cenas/castelo.webp)
// convertida em caracteres a cada quadro. O que se mexe é código por cima da imagem: água
// ondulando, janelas tremulando, cachoeira caindo com espuma, estrelas, estrela cadente, nuvens,
// névoa, a trilha de luar, morcegos em volta da torre, vaga-lumes na margem, o dragão a cada 18s
// e a interação (lampião, faíscas, ondas no lago).
//
// Revelação (p de 0 a 1, nos primeiros segundos depois que a imagem chega): o AsciiCanvas aumenta
// a resolução, e aqui o enquadramento abre do castelo para a paisagem e o limiar de luz baixa:
// primeiro só o que brilha (lua, janelas), depois a pedra, a floresta e o lago.

import {
  faiscas,
  fbm,
  fechar,
  fundoImagem,
  lampiao,
  limitar,
  luz,
  passo,
  pontoMundo,
  ruido,
  tela,
  traco,
  triangulo,
  type Campo,
  type DadosImagem,
  type Entrada,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 800 / 450;
const LAGO = 0.712;
const LUA = { x: 0.912, y: 0.127, r: 0.064 };
const CACHOEIRA = { x: 0.677, y0: 0.49, y1: 0.705, larg: 0.007 };
const FOCO = { x: 0.66, y: 0.36 }; // o castelo
const TORRE = { x: 0.66, y: 0.13 }; // a torre mais alta, onde os morcegos rondam

// a imagem é noturna (brilho mediano 0,07): níveis e gama abrem as sombras para a rampa
const tom = (l: number) => Math.pow(limitar((l - 0.01) / 0.5), 0.7);

export const castelo = ({ cols, rows, t, p, dados, parado, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const { A } = T;
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));

  const r = passo(0, 1, p);
  const largo = A > 1.5;
  const z = 1.35 - 0.35 * r;

  // ondas que o ponteiro e os cliques fazem na água (em coordenadas da imagem); o enquadramento
  // é o mesmo que o fundoImagem calcula, refeito aqui para converter o ponteiro antes do laço
  const vh = Math.min(1, ASPECTO / A) / z;
  const vw = (vh * A) / ASPECTO;
  const cx = Math.min(1 - vw / 2, Math.max(vw / 2, FOCO.x));
  const cy = Math.min(1 - vh / 2, Math.max(vh / 2, FOCO.y));
  const img = (u: number, v: number) => ({ x: cx + (u - 0.5) * vw, y: cy + (v - 0.5) * vh });
  const m = mouse ? img(mouse.u, mouse.v) : null;
  const naAgua = m && m.y > LAGO ? m : null;
  const aneis = cliques.map((q) => ({ ...img(q.u, q.v), idade: t - q.t })).filter((q) => q.y > LAGO && q.idade < 3);
  const perturba = (x: number, y: number) => {
    let o = 0;
    if (naAgua) {
      const d = Math.hypot(x - naAgua.x, (y - naAgua.y) * 2.5);
      o += Math.sin(d * 260 - t * 10) * Math.exp(-d * 30) * 0.006;
    }
    for (const a of aneis) {
      const d = Math.hypot(x - a.x, (y - a.y) * 2.5);
      const raio = a.idade * 0.12;
      o += Math.sin((d - raio) * 220) * Math.exp(-Math.abs(d - raio) * 60) * Math.exp(-a.idade) * 0.01;
    }
    // a queda da cachoeira agita a água logo abaixo dela
    const dq = Math.hypot((x - CACHOEIRA.x) * 1.5, (y - CACHOEIRA.y1) * 4);
    o += Math.sin(dq * 400 - t * 9) * Math.exp(-dq * 40) * 0.003;
    return o;
  };

  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    z,
    fx: FOCO.x,
    fy: FOCO.y,
    limiar: 0.45 * (1 - r),
    tom,
    calor: 0.4 + 0.6 * r,
    desloca: (ix, iy) => {
      if (iy <= LAGO) return 0;
      const prof = (iy - LAGO) / (1 - LAGO);
      return Math.sin(iy * 260 + t * 1.6 + fbm(ix * 8, iy * 30) * 3) * 0.0022 * (1 + prof * 2) + perturba(ix, iy);
    },
    ajuste: ({ i, X, Y, ix, iy, l, w, destaque }) => {
      const agua = iy > LAGO;
      const prof = agua ? (iy - LAGO) / (1 - LAGO) : 0;
      // janelas: luz de vela tremulando
      if (w > 0.2) l *= 0.82 + 0.3 * ruido(i * 0.37 + t * 2.5, 1.3);
      // cachoeira: faixas de água descendo, e espuma onde ela bate no lago
      if (Math.abs(ix - CACHOEIRA.x) < CACHOEIRA.larg && iy > CACHOEIRA.y0 && iy < CACHOEIRA.y1)
        l = Math.max(l, 0.3 + 0.55 * fbm(ix * 500, iy * 70 - t * 4, 2));
      const espuma = Math.hypot((ix - CACHOEIRA.x) * 2, (iy - CACHOEIRA.y1) * 6);
      if (espuma < 0.05) l += (0.05 - espuma) * 8 * passo(0.45, 0.8, fbm(ix * 300 + t * 3, iy * 200 - t * 2, 2));
      // estrelas (pontos bem mais claros que a vizinhança) piscando
      const ceu = iy < 0.42 && Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y) > LUA.r * 1.6;
      if (ceu && destaque > 0.08) l *= 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + (i % 7) * 0.4) + i));
      // nuvens finas correndo, mais claras perto da lua
      if (ceu && ix > 0.42) {
        const dens = passo(0.58, 0.85, fbm(ix * 5 - t * 0.012, iy * 12, 3));
        l += dens * (0.04 + 0.12 * Math.exp(-Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y) / 0.25));
      }
      // trilha de luar tremendo na água
      if (agua && Math.abs(ix - LUA.x) < 0.025 + prof * 0.04 && fbm(ix * 90 + t * 0.6, iy * 160 - t * 0.5, 2) > 0.6) l = Math.max(l, 0.75);
      // névoa rasteira: faixas que atravessam o lago e o pé do penhasco
      if (iy > LAGO - 0.06 && iy < LAGO + 0.1) {
        const faixa = Math.exp(-(((iy - LAGO - 0.01) / 0.05) ** 2));
        l += 0.09 * faixa * passo(0.45, 0.8, fbm(ix * 5 - t * 0.05, iy * 22 + t * 0.02, 3));
      }
      if (largo && X < A * 0.42 && Y < 0.62 && w < 0.2) l *= 0.3; // atrás do texto do hero
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));

  // morcegos: rondam a torre mais alta em elipses, batendo as asas
  const torre = para(TORRE.x, TORRE.y);
  for (let k = 0; k < 7; k++) {
    const ang = t * (0.5 + 0.08 * k) + k * 0.9;
    const bx = torre.x + Math.cos(ang) * (0.06 + 0.012 * k) * esc;
    const by = torre.y + Math.sin(ang * 1.3) * 0.025 * esc - 0.02 * esc;
    const asa = Math.sin(t * 16 + k * 2) * 0.006 * esc;
    const e = 0.007 * esc;
    traco(T, bx - e, by - asa, bx, by, 0.0018 * esc, 0.02);
    traco(T, bx, by, bx + e, by - asa, 0.0018 * esc, 0.02);
  }

  // estrela cadente a cada 11s no céu da esquerda
  const ce = t % 11;
  if (ce < 0.9) {
    const k = ce / 0.9;
    const sx = A * (0.15 + 0.35 * ruido(Math.floor(t / 11), 3));
    for (let n = 0; n < 14; n++) {
      const q = Math.max(0, k - n * 0.02);
      pontoMundo(T, sx + q * 0.35, 0.05 + q * 0.12, (1 - n / 14) * (1 - k * 0.6));
    }
  }

  // vaga-lumes: pontos quentes que piscam e flutuam na margem da floresta
  for (let k = 0; k < 26; k++) {
    const base = para(0.05 + 0.9 * ruido(k, 1.7), 0.6 + 0.1 * ruido(k, 4.2));
    // só aparecem com a cena já detalhada: na grade grossa viram letras enormes
    const brilho = passo(0.55, 0.95, Math.sin(t * (1.3 + (k % 5) * 0.3) + k * 1.7)) * passo(0.4, 0.8, r);
    if (brilho > 0) pontoMundo(T, base.x + Math.sin(t * 0.7 + k) * 0.02, base.y + Math.cos(t * 0.5 + k * 2) * 0.012, 0.5 + 0.45 * brilho, 1);
  }

  // o dragão: a cada 18s cruza o céu da direita para a esquerda, na frente da lua, e solta fogo
  const cd = t % 18;
  if (cd < 7) {
    const k2 = cd / 7;
    const lua = para(LUA.x, LUA.y);
    const e = (n: number) => (n * LUA.r * esc) / 0.075;
    const dxp = A + 0.2 - k2 * (A + 0.5);
    const dyp = lua.y + e(0.02) + Math.sin(k2 * Math.PI * 2) * 0.04;
    const asa = Math.sin(t * 7) * e(0.035);
    const escuro = 0.01;
    traco(T, dxp - e(0.02), dyp, dxp + e(0.05), dyp + e(0.006), e(0.008), escuro);
    traco(T, dxp - e(0.02), dyp, dxp - e(0.05), dyp - e(0.012), e(0.004), escuro);
    traco(T, dxp - e(0.05), dyp - e(0.012), dxp - e(0.066), dyp - e(0.008), e(0.005), escuro);
    traco(T, dxp + e(0.05), dyp + e(0.006), dxp + e(0.1), dyp - e(0.01) + Math.sin(t * 3) * e(0.008), e(0.003), escuro);
    triangulo(T, { x: dxp - e(0.012), y: dyp }, { x: dxp + e(0.035), y: dyp }, { x: dxp + e(0.012), y: dyp - e(0.045) - asa }, escuro);
    if (k2 > 0.35 && k2 < 0.55) {
      const hx = dxp - e(0.07);
      const hy = dyp - e(0.008);
      const forca = Math.sin(((k2 - 0.35) / 0.2) * Math.PI);
      luz(T, hx - e(0.05), hy, e(0.08), 0.8 * forca);
      for (let n = 0; n < 60; n++) {
        const ax = ruido(n, Math.floor(t * 12)) * forca;
        const ay = (ruido(n * 3, Math.floor(t * 12) + 1) - 0.5) * (0.01 + ax * 0.06);
        pontoMundo(T, hx - e(0.12) * ax, hy + e(ay), 0.95 - ax * 0.3, 1);
      }
    }
  }

  // interação: o cursor é um lampião e o clique solta faíscas
  lampiao(T, mouse, 0.45, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
