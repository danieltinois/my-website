// Pato Commit: a torre do correio, a partir de uma imagem realista (public/cenas/torre.webp)
// convertida em caracteres a cada quadro. Por cima, em código: nuvens correndo pela lua,
// estrelas piscando, a janela da torre e as janelas da vila tremulando, fumaça das chaminés, o
// braseiro com fagulhas e a história: pombos chegam da direita com cartas (as entregas do
// webhook) e entram pela janela acesa, que pisca a cada entrega. A carta repetida (mesmo ID de
// entrega) não entra: cai no braseiro e vira labareda. Ciclo de 9s.

import {
  balancar,
  cada,
  acender,
  chama,
  elipse,
  faiscas,
  fagulhas,
  fbm,
  fechar,
  fumaca,
  fundoImagem,
  lampiao,
  luz,
  passo,
  ruido,
  tela,
  triangulo,
  type Campo,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const JANELA = { x: 0.242, y: 0.27 };
const BRASEIRO = { x: 0.1375, y: 0.74 };
const LUA = { x: 0.889, y: 0.168, r: 0.068 };
const CHAMINES = [
  { x: 0.808, y: 0.69 },
  { x: 0.93, y: 0.73 },
];
const VILA = { x0: 0.74, x1: 0.99, y0: 0.66, y1: 0.9 };
const CHAMAS = [{ x: BRASEIRO.x, y: BRASEIRO.y, alt: 0.12, larg: 0.018 }];
const CICLO = 9;
const VOO = 3.2;
// a segunda entrega é a repetida (mesmo ID): vai para o braseiro
const REPETIDA = [false, true, false];

// pombo em voo: corpo, cabeça, cauda e asas batendo; a carta presa embaixo; `s` é a escala
const pombo = (T: Tela, x: number, y: number, t: number, fase: number, s: number) => {
  const asa = Math.sin(t * 14 + fase) * 0.022 * s;
  elipse(T, x, y, 0.016 * s, 0.008 * s, (u) => 0.55 + 0.25 * u);
  elipse(T, x - 0.017 * s, y - 0.004 * s, 0.006 * s, 0.006 * s, () => 0.65);
  triangulo(T, { x: x + 0.012 * s, y: y - 0.002 * s }, { x: x + 0.032 * s, y: y - 0.008 * s }, { x: x + 0.03 * s, y: y + 0.006 * s }, 0.45);
  triangulo(T, { x: x - 0.006 * s, y }, { x: x + 0.01 * s, y }, { x: x + 0.006 * s, y: y - 0.02 * s - asa }, 0.7);
  cada(T, (_X, _Y, i) => acender(T, i, 0.85), { x0: x - 0.004 * s, x1: x + 0.008 * s, y0: y + 0.008 * s, y1: y + 0.016 * s });
};

// Interativa: cada clique solta um pombo do ponto clicado. Um clique a menos de 1,5s do anterior
// é a mesma entrega chegando de novo (o GitHub entrega "pelo menos uma vez"): vai para o braseiro.
// Sem cliques recentes, a cena roda sozinha em ciclo.
export const torre = ({ cols, rows, t, p, dados, parado, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const { A } = T;
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));

  // as entregas deste quadro: dos cliques recentes ou, sem eles, do ciclo automático
  type Voo = { saida: number; de: { x: number; y: number } | null; repetida: boolean; k: number };
  const recentes = cliques.filter((q) => t - q.t < VOO + 2);
  const voos: Voo[] = recentes.length
    ? recentes.map((q, k) => ({ saida: q.t, de: { x: q.u * A, y: q.v }, repetida: k > 0 && q.t - recentes[k - 1].t < 1.5, k }))
    : REPETIDA.map((repetida, k) => ({ saida: t - (t % CICLO) + k * (CICLO / 3), de: null, repetida, k }));
  let flashJanela = 0;
  let labareda = 0;
  for (const v of voos) {
    const voo = t - v.saida;
    if (voo < VOO) continue;
    if (v.repetida) labareda = Math.max(labareda, 1 - (voo - VOO) / 1.4);
    else flashJanela = Math.max(flashJanela, 1 - (voo - VOO) / 0.9);
  }
  flashJanela = Math.max(0, flashJanela);
  const forte = Math.max(0, labareda);
  const tremor = 0.8 + 0.2 * ruido(t * 3, 1);
  const fogo = 0.75 + 0.25 * ruido(t * 9, 4);

  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    fx: 0.45,
    fy: 0.45,
    limiar: 0.35 * (1 - passo(0, 1, p)),
    gama: 0.72,
    desloca: (ix, iy) => balancar(ix, iy, CHAMAS, t),
    ajuste: ({ i, ix, iy, l, w, destaque }) => {
      // céu: estrelas piscando e nuvens correndo, mais claras perto da lua
      if (iy < 0.62) {
        const dl = Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y);
        if (destaque > 0.08 && dl > LUA.r * 1.5) l *= 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + (i % 7) * 0.4) + i));
        if (ix > 0.3) {
          const dens = passo(0.6, 0.86, fbm(ix * 6 - t * 0.02, iy * 10, 3));
          l += dens * (0.03 + 0.16 * Math.exp(-dl / 0.3));
        }
      }
      // janela da torre: vela tremulando, e um clarão quando uma carta entra
      const dj = Math.hypot((ix - JANELA.x) * ASPECTO, iy - JANELA.y);
      if (dj < 0.08 && w > 0.1) l *= tremor + 0.6 * flashJanela;
      // janelas da vila: cada uma no seu ritmo
      if (ix > VILA.x0 && iy > VILA.y0 && iy < VILA.y1 && w > 0.12) l *= 0.75 + 0.4 * ruido(Math.floor(ix * 300) + t * 1.5, Math.floor(iy * 200));
      // o braseiro ilumina a pedra da torre, pulsando
      const db = Math.hypot((ix - BRASEIRO.x) * ASPECTO, iy - BRASEIRO.y);
      if (db < 0.35) l *= 1 + (fogo - 0.85 + forte * 0.5) * Math.exp(-db * 6);
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));
  const e = (n: number) => n * esc;

  // fumaça das chaminés da vila
  CHAMINES.forEach((c, n) => {
    const m = para(c.x, c.y);
    fumaca(T, m.x, m.y, t + n * 5, e(0.22), e(0.02), 0.07);
  });

  // pombos: saem da direita (ou do ponto clicado) e vão à janela; o repetido, ao braseiro
  const janela = para(JANELA.x, JANELA.y);
  const braseiro = para(BRASEIRO.x, BRASEIRO.y);
  for (const v of voos) {
    const voo = t - v.saida;
    if (voo < 0) continue;
    const de = v.de ?? { x: A + 0.1, y: janela.y - e(0.12) };
    const alvo = v.repetida ? { x: braseiro.x, y: braseiro.y - e(0.06) } : { x: janela.x + e(0.03), y: janela.y };
    const dur = VOO * Math.min(1, 0.4 + Math.abs(de.x - alvo.x) / A);
    if (voo >= dur) continue;
    const q = voo / dur;
    const x = de.x + (alvo.x - de.x) * q;
    const y = de.y + (alvo.y - de.y) * q - e(0.2) * Math.sin(q * Math.PI) + Math.sin(voo * 5 + v.k) * e(0.012);
    pombo(T, x, y, t, v.k, e(1.1));
  }

  // janela: halo que cresce no clarão
  luz(T, janela.x, janela.y, e(0.08) * (1 + flashJanela), 0.35 * tremor + 0.5 * flashJanela);
  // braseiro: chama viva e fagulhas; a carta repetida vira labareda
  luz(T, braseiro.x, braseiro.y - e(0.04), e(0.14) * (1 + forte), 0.4 * fogo + 0.5 * forte);
  chama(T, braseiro.x, braseiro.y - e(0.01), e(0.08 + 0.14 * forte), e(0.025 + 0.015 * forte), t, 2);
  fagulhas(T, braseiro.x, braseiro.y - e(0.06), t, 10 + Math.round(forte * 30), e(0.35 + 0.3 * forte), e(0.06));

  lampiao(T, mouse, 0.4, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
