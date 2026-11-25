// O hero: o castelo à noite, a partir de uma imagem realista (public/cenas/castelo.webp)
// convertida em caracteres a cada quadro. O que se mexe é código por cima da imagem:
// água ondulando, janelas tremulando, cachoeira caindo, estrelas, nuvens, névoa, a trilha de luar,
// o dragão a cada 18s e a interação (lampião, faíscas, ondas no lago).
//
// Revelação pela rolagem (p de 0 a 1): o AsciiCanvas aumenta a resolução, e aqui o enquadramento
// abre do castelo para a paisagem e o limiar de luz baixa: primeiro só o que brilha (lua,
// janelas), depois a pedra, a floresta e o lago.

import {
  acender,
  amostrar,
  enquadrar,
  faiscas,
  fbm,
  lampiao,
  limitar,
  luz,
  passo,
  ruido,
  tela,
  traco,
  triangulo,
  type Campo,
  type Entrada,
  type Fonte,
} from "../denso.ts";

export interface DadosCastelo {
  fonte?: Fonte;
}

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 800 / 450;
const LAGO = 0.712;
const LUA = { x: 0.912, y: 0.127, r: 0.064 };
const CACHOEIRA = { x: 0.677, y0: 0.49, y1: 0.705, larg: 0.007 };
const FOCO = { x: 0.66, y: 0.36 }; // o castelo

// a imagem é noturna (brilho mediano 0,07): níveis e gama abrem as sombras para a rampa
const tom = (l: number) => Math.pow(limitar((l - 0.01) / 0.5), 0.7);

export const castelo = ({ cols, rows, t, p, dados, mouse, cliques }: Entrada<DadosCastelo>): Campo => {
  const T = tela(cols, rows);
  const { c, A } = T;
  const f = dados?.fonte;
  if (!f) return c;

  const r = passo(0, 1, p);
  const v = enquadrar(A, ASPECTO, 1.35 - 0.35 * r, FOCO.x, FOCO.y);
  const limiar = 0.45 * (1 - r);
  const largo = A > 1.5;
  const cw = v.vw / cols;
  const ch = v.vh / rows;

  // ondas que o ponteiro e os cliques fazem na água (em coordenadas da imagem)
  const m = mouse ? v.paraImagem(mouse.u * A, mouse.v) : null;
  const naAgua = m && m.y > LAGO ? m : null;
  const aneis = cliques
    .map((q) => ({ ...v.paraImagem(q.u * A, q.v), idade: t - q.t }))
    .filter((q) => q.y > LAGO && q.idade < 3);
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
    return o;
  };

  for (let y = 0; y < rows; y++) {
    const Y = (y + 0.5) / rows;
    for (let x = 0; x < cols; x++) {
      const X = ((x + 0.5) / cols) * A;
      const i = y * cols + x;
      const { x: ix, y: iy } = v.paraImagem(X, Y);
      let sx = ix;
      const agua = iy > LAGO;
      const prof = agua ? (iy - LAGO) / (1 - LAGO) : 0;
      if (agua) sx += Math.sin(iy * 260 + t * 1.6 + fbm(ix * 8, iy * 30) * 3) * 0.0022 * (1 + prof * 2) + perturba(ix, iy);
      const s = amostrar(f, sx - cw / 2, iy - ch / 2, sx + cw / 2, iy + ch / 2);
      // nitidez: compara a célula com a vizinhança (3×3) e reforça a diferença, como um unsharp
      const viz = tom(amostrar(f, sx - cw * 1.5, iy - ch * 1.5, sx + cw * 1.5, iy + ch * 1.5).L);
      const base = tom(s.L);
      const destaque = base - viz;
      let l = base + destaque * 0.8;
      const w = s.W;

      // janelas: luz de vela tremulando
      if (w > 0.2) l *= 0.82 + 0.3 * ruido(i * 0.37 + t * 2.5, 1.3);
      // cachoeira: faixas de água descendo
      if (Math.abs(ix - CACHOEIRA.x) < CACHOEIRA.larg && iy > CACHOEIRA.y0 && iy < CACHOEIRA.y1)
        l = Math.max(l, 0.3 + 0.55 * fbm(ix * 500, iy * 70 - t * 4, 2));
      // estrelas (pontos bem mais claros que a vizinhança) piscando
      const ceu = iy < 0.42 && Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y) > LUA.r * 1.6;
      if (ceu && destaque > 0.08) l *= 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + (i % 7) * 0.4) + i));
      // nuvens finas correndo, mais claras perto da lua
      if (ceu && ix > 0.42) {
        const dens = passo(0.58, 0.85, fbm(ix * 5 - t * 0.012, iy * 12, 3));
        l += dens * (0.04 + 0.12 * Math.exp(-Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y) / 0.25));
      }
      // trilha de luar tremendo na água
      if (agua && Math.abs(ix - LUA.x) < 0.025 + prof * 0.04 && fbm(ix * 90 + t * 0.6, iy * 160 - t * 0.5, 2) > 0.6)
        l = Math.max(l, 0.75);
      // névoa rasteira sobre o lago
      if (iy > LAGO - 0.03 && iy < LAGO + 0.08) l += 0.05 * passo(0.5, 0.85, fbm(ix * 6 - t * 0.04, iy * 30, 2));

      // revelação e exposição: abaixo do limiar some; o resto ganha contraste
      l = Math.max(0, (l - limiar) / (1 - limiar));
      l = limitar(l);
      if (largo && X < A * 0.42 && Y < 0.62 && w < 0.2) l *= 0.3; // atrás do texto do hero
      c.lum[i] = l;
      c.calor[i] = limitar(w * 1.6) * (0.4 + 0.6 * r);
      T.mat[i] = agua ? 6 : l > 0.1 ? 2 : 0;
    }
  }

  // o dragão: a cada 18s cruza o céu da direita para a esquerda, na frente da lua, e solta fogo
  const cd = t % 18;
  if (cd < 7) {
    const k2 = cd / 7;
    const lua = v.paraMundo(LUA.x, LUA.y);
    const esc = LUA.r / v.vh / 0.075;
    const dxp = A + 0.2 - k2 * (A + 0.5);
    const dyp = lua.Y + 0.02 * esc + Math.sin(k2 * Math.PI * 2) * 0.04;
    const asa = Math.sin(t * 7) * 0.035 * esc;
    const e = (n: number) => n * esc;
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
        const fx = hx - e(0.12) * ax;
        const fy = hy + e(ay);
        const cx = Math.round((fx / A) * cols - 0.5);
        const cy = Math.round(fy * rows - 0.5);
        if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) acender(T, cy * cols + cx, 0.95 - ax * 0.3, 1);
      }
    }
  }

  // interação: o cursor é um lampião e o clique solta faíscas
  lampiao(T, mouse, 0.45, 0.1);
  faiscas(T, cliques, t);
  for (let i = 0; i < c.lum.length; i++) c.lum[i] = limitar(c.lum[i]);
  return c;
};
