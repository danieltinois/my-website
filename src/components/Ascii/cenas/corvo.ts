// Contato: o corvo-mensageiro, a partir de uma imagem realista (public/cenas/corvo.webp)
// convertida em caracteres a cada quadro. Por cima, em código: nuvens cruzando a lua, estrelas,
// neblina rolando no vale, a árvore balançando ao vento, o lampião do poste tremulando com
// mariposas em volta e a história: o corvo atravessa a lua, pousa no alto do poste, solta a carta
// na caixa de correio e vai embora. Ciclo de 10s.

import {
  acender,
  balancar,
  cada,
  elipse,
  faiscas,
  fbm,
  fechar,
  fundoImagem,
  lampiao,
  luz,
  passo,
  pontoMundo,
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
import { estrelasEspera } from "../estrelas.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 1200 / 514;
const LUA = { x: 0.346, y: 0.335, r: 0.146 };
const LAMPIAO = { x: 0.848, y: 0.29 };
const CHAMAS = [{ x: LAMPIAO.x, y: LAMPIAO.y + 0.02, alt: 0.06, larg: 0.008 }];
const POSTE = { x: 0.817, y: 0.135 }; // onde o corvo pousa
const CAIXA = { x: 0.829, y: 0.44 }; // fenda da caixa de correio
const ARVORE = 0.27; // a árvore ocupa a esquerda até aqui
const CICLO = 10;
const ESCURO = 0.012;

// corvo: corpo, cabeça com bico, cauda em leque; `asa` de -1 a 1 bate a asa; olho brilhando.
// `s` é a escala; `dir` -1 olha para a esquerda (voando da direita), 1 para a direita
const ave = (T: Tela, x: number, y: number, asa: number, pousado: boolean, s: number) => {
  const e = (n: number) => n * s;
  elipse(T, x, y, e(0.035), e(0.022), () => ESCURO);
  elipse(T, x - e(0.035), y - e(0.018), e(0.015), e(0.015), () => ESCURO);
  triangulo(T, { x: x - e(0.048), y: y - e(0.022) }, { x: x - e(0.048), y: y - e(0.012) }, { x: x - e(0.075), y: y - e(0.014) }, ESCURO);
  triangulo(T, { x: x + e(0.03), y: y - e(0.004) }, { x: x + e(0.075), y: y - e(0.02) }, { x: x + e(0.075), y: y + e(0.018) }, ESCURO);
  cada(T, (_X, _Y, i) => acender(T, i, 0.9), { x0: x - e(0.04), x1: x - e(0.036), y0: y - e(0.024), y1: y - e(0.018) });
  if (pousado) {
    triangulo(T, { x: x - e(0.02), y: y - e(0.01) }, { x: x + e(0.04), y: y - e(0.006) }, { x: x + e(0.03), y: y + e(0.016) }, 0.06);
    traco(T, x - e(0.005), y + e(0.02), x - e(0.008), y + e(0.04), e(0.0025), ESCURO);
    traco(T, x + e(0.008), y + e(0.02), x + e(0.006), y + e(0.04), e(0.0025), ESCURO);
  } else triangulo(T, { x: x - e(0.02), y }, { x: x + e(0.025), y }, { x: x + e(0.01), y: y - e(0.09) * asa }, ESCURO);
};

// carta: retângulo claro com o lacre quente
const carta = (T: Tela, x: number, y: number, s: number) => {
  cada(T, (_X, _Y, i) => acender(T, i, 0.85), { x0: x - 0.012 * s, x1: x + 0.012 * s, y0: y - 0.007 * s, y1: y + 0.007 * s });
  pontoMundo(T, x, y, 0.9, 1);
};

// Interativa: um clique faz o corvo levantar voo na hora; o cursor é um lampião.
export const corvo = ({ cols, rows, t, p, dados, parado, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const { A } = T;
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));

  const tremor = 0.78 + 0.22 * ruido(t * 8, 2);
  const vento = Math.sin(t * 0.9) * 0.6 + Math.sin(t * 2.3) * 0.4;
  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    fx: 0.55,
    limiar: 0.3 * (1 - passo(0, 1, p)),
    gama: 0.72,
    desloca: (ix, iy) => {
      // a árvore balança ao vento: mais na copa, nada no tronco de baixo
      if (ix < ARVORE && iy < 0.75) return vento * 0.004 * passo(0.75, 0.1, iy) * passo(0, 0.12, ix);
      return balancar(ix, iy, CHAMAS, t);
    },
    ajuste: ({ i, ix, iy, l, w, destaque }) => {
      const dl = Math.hypot((ix - LUA.x) * ASPECTO, iy - LUA.y);
      // estrelas piscando
      if (iy < 0.5 && destaque > 0.07 && dl > LUA.r * 1.3) l *= 0.55 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1 + (i % 7) * 0.4) + i));
      // nuvens cruzando a lua: escurecem o disco e brilham na borda
      if (iy < 0.55 && ix > ARVORE * 0.6) {
        const dens = passo(0.58, 0.85, fbm(ix * 5 - t * 0.03, iy * 9, 3));
        if (dl < LUA.r) l = l * (1 - dens * 0.5) + dens * 0.15;
        else l += dens * (0.03 + 0.2 * Math.exp(-(dl - LUA.r) / 0.12));
      }
      // neblina rolando no vale
      if (iy > 0.5 && iy < 0.85) l += 0.12 * passo(0.48, 0.8, fbm(ix * 4 - t * 0.05, iy * 14 + t * 0.03, 3)) * passo(0.5, 0.62, iy) * passo(0.85, 0.7, iy);
      // o lampião pulsa e ilumina o poste e a grama
      const dp = Math.hypot((ix - LAMPIAO.x) * ASPECTO, iy - LAMPIAO.y);
      if (dp < 0.4 && w > 0.04) l *= 1 + (tremor - 0.85) * 1.2 * Math.exp(-dp * 4);
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));
  const e = (n: number) => n * esc;
  const s = e(0.9);

  // mariposas em volta do lampião
  const lp = para(LAMPIAO.x, LAMPIAO.y);
  luz(T, lp.x, lp.y, e(0.12) * tremor, 0.4 * tremor);
  for (let k = 0; k < 5; k++) {
    const a = t * (2.2 + k * 0.5) + k * 1.3;
    pontoMundo(T, lp.x + Math.cos(a) * e(0.03 + 0.008 * k), lp.y + Math.sin(a * 1.7) * e(0.025), 0.6, 0.4);
  }

  // o corvo: chega da direita cruzando a lua, pousa no poste, solta a carta e vai embora
  const uc = ultimo(cliques);
  const c = uc && t - uc.t < CICLO ? (t - uc.t + 7) % CICLO : t % CICLO;
  const asa = Math.sin(t * 9);
  const pouso = para(POSTE.x, POSTE.y);
  const caixa = para(CAIXA.x, CAIXA.y);
  const lua = para(LUA.x, LUA.y);
  const py = pouso.y - e(0.04);
  if (c < 3.2) {
    // da direita, passando na frente da lua e descendo até o poste
    const k = c / 3.2;
    const x0 = A + 0.1;
    const x = k < 0.6 ? x0 + (lua.x - x0) * (k / 0.6) : lua.x + (pouso.x - lua.x) * ((k - 0.6) / 0.4);
    const y = k < 0.6 ? 0.1 + (lua.y - 0.1) * Math.sin(((k / 0.6) * Math.PI) / 2) : lua.y + (py - lua.y) * ((k - 0.6) / 0.4);
    ave(T, x, y, asa, false, s);
    carta(T, x, y + e(0.03), s);
  } else if (c < 7) {
    ave(T, pouso.x, py, 0, true, s);
    // a carta cai do bico até a fenda da caixa (3.6–4.4s)
    const kc = (c - 3.6) / 0.8;
    if (kc < 0) carta(T, pouso.x - e(0.06), py, s);
    else if (kc < 1) carta(T, pouso.x - e(0.06) * (1 - kc) + (caixa.x - pouso.x) * kc, py + (caixa.y - py) * kc * kc, s);
    else if (kc < 1.6) luz(T, caixa.x, caixa.y, e(0.05), 0.5 * (1.6 - kc));
  } else {
    const k = (c - 7) / 3;
    ave(T, pouso.x - k * (pouso.x + 0.2), py - k * 0.6 + Math.sin(k * 6) * 0.02, asa, false, s);
  }

  lampiao(T, mouse, 0.35, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
