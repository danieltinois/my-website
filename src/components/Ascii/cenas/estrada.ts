// Trajetória: a estrada, a partir de uma imagem realista (public/cenas/estrada.webp) convertida
// em caracteres a cada quadro. Por cima, em código: a Via Láctea cintilando, estrela cadente,
// névoa correndo nos vales, vaga-lumes na beira da estrada, as janelas do castelo tremulando e a
// história: um viajante de capa, cajado e lanterna anda de 2020 a 2026 conforme a página rola
// (p de 0 a 1); cada marco é um poste com lampião que acende quando ele passa, e o ano fica
// escrito em cima. As pernas se mexem com a rolagem: parado na página, ele fica parado.

import { TRAJETORIA } from "../../../data/site.ts";
import {
  chama,
  escrever,
  faiscas,
  fbm,
  fechar,
  fundoImagem,
  lampiao,
  luz,
  passo,
  pessoa,
  pontoMundo,
  ruido,
  tela,
  traco,
  type Campo,
  type DadosImagem,
  type Entrada,
} from "../denso.ts";

const ANOS = [...TRAJETORIA].reverse().map((m) => m.quando.slice(0, 4));

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const meio = (ix: number) => 0.6725 + 0.0425 * ix; // centro da estrada
const CASTELO = { x: 0.942, y: 0.4 };
const INICIO = 0.06;
const FIM = 0.86;
const POSTE = 0.2; // altura de um poste, em alturas da imagem
const ALTURA = 0.13; // altura do viajante

// Interativa: anda com a rolagem; o cursor é um lampião e o clique solta faíscas.
export const estrada = ({ cols, rows, t, p, dados, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const { A } = T;
  const f = dados?.fonte;
  if (!f) return T.c;

  const q = Math.max(0, Math.min(1, p));
  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    fx: 0.5,
    fy: 0.5,
    gama: 0.68,
    ajuste: ({ i, ix, iy, l, w, destaque }) => {
      // céu: estrelas e a Via Láctea cintilando
      if (iy < 0.45 && destaque > 0.06) l *= 0.55 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1.2 + (i % 9) * 0.35) + i * 1.3));
      // névoa correndo nos vales
      if (iy > 0.45 && iy < 0.68) l += 0.1 * passo(0.5, 0.82, fbm(ix * 7 - t * 0.04, iy * 25, 3)) * passo(0.45, 0.55, iy);
      // janelas do castelo
      if (w > 0.15 && Math.abs(ix - CASTELO.x) < 0.06) l *= 0.75 + 0.4 * ruido(i * 0.3 + t * 2, 2);
      return l;
    },
  });
  const e = (n: number) => n * esc;
  const px = Math.max(1, Math.round(rows / 45)); // pixel da fonte dos anos, em células
  const largo = A > 3.5;

  // marcos: postes ao longo da estrada; em tela estreita o ano só aparece no primeiro marco de cada ano
  const vx = INICIO + q * (FIM - INICIO);
  ANOS.forEach((ano, k) => {
    const ix = INICIO + 0.03 + (k / (ANOS.length - 1)) * (FIM - INICIO - 0.03);
    const pe = para(ix, meio(ix) - 0.02);
    const topo = pe.y - e(POSTE);
    traco(T, pe.x, pe.y, pe.x, topo, e(0.004), 0.22);
    traco(T, pe.x, topo, pe.x + e(0.025), topo, e(0.003), 0.22);
    const lx = pe.x + e(0.025);
    const ly = topo + e(0.03);
    const aceso = ix <= vx + 0.005;
    if (aceso) {
      const tremor = 0.75 + 0.25 * ruido(t * 8 + k * 3, 1);
      luz(T, lx, ly, e(0.12) * tremor, 0.6 * tremor);
      chama(T, lx, ly + e(0.012), e(0.04), e(0.009), t, k * 20);
    } else pontoMundo(T, lx, ly, 0.2);
    if (largo || ANOS[k - 1] !== ano) escrever(T, pe.x - e(0.03), topo - e(0.08) - (5 * px) / rows, ano, aceso ? 0.95 : 0.35, px, aceso ? 0.3 : 0);
  });

  // estrela cadente a cada 9s
  const ce = t % 9;
  if (ce < 0.8) {
    const k = ce / 0.8;
    const sx = A * (0.3 + 0.4 * ruido(Math.floor(t / 9), 5));
    for (let n = 0; n < 16; n++) {
      const d = Math.max(0, k - n * 0.02);
      pontoMundo(T, sx + d * 0.5, 0.04 + d * 0.1, (1 - n / 16) * (1 - k * 0.5));
    }
  }

  // vaga-lumes na beira da estrada
  for (let k = 0; k < 30; k++) {
    const ix = ruido(k, 2.2);
    const base = para(ix, meio(ix) + 0.03 + 0.1 * ruido(k, 6.1));
    const brilho = passo(0.5, 0.95, Math.sin(t * (1.1 + (k % 4) * 0.35) + k * 2.1));
    if (brilho > 0) pontoMundo(T, base.x + Math.sin(t * 0.6 + k) * 0.03, base.y + Math.cos(t * 0.4 + k) * 0.02, 0.45 + 0.5 * brilho, 1);
  }

  // o viajante, de capa, com cajado e lanterna; as pernas andam com a rolagem
  const pe = para(vx, meio(vx) - 0.004);
  const mao = pessoa(T, pe.x, pe.y, e(ALTURA), q * 90, 1, 0.08, 0.55);
  traco(T, mao.x + e(0.006), mao.y - e(0.05), mao.x + e(0.012), pe.y, e(0.0025), 0.35); // cajado
  const capa = Math.sin(t * 3) * e(0.006);
  traco(T, pe.x - e(0.008), pe.y - e(0.11), pe.x - e(0.03) + capa, pe.y - e(0.04), e(0.009), 0.06); // capa ao vento
  const lanterna = { x: pe.x - e(0.02), y: pe.y - e(0.055) };
  const tl = 0.8 + 0.2 * ruido(t * 9, 3);
  luz(T, lanterna.x, lanterna.y, e(0.1) * tl, 0.7 * tl);
  pontoMundo(T, lanterna.x, lanterna.y, 0.95, 1);

  lampiao(T, mouse, 0.4, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
