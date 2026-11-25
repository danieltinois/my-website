// Contato: o corvo-mensageiro, a partir de uma imagem realista (public/cenas/corvo.webp)
// convertida em caracteres a cada quadro. Por cima, em código: nuvens cruzando a lua, estrelas,
// neblina rolando no vale, a árvore balançando ao vento, o lampião do poste tremulando com
// mariposas em volta e a história: um corvo feito de foto (public/cenas/figuras/corvo.webp) chega
// da direita batendo as asas (desce rápido, sobe devagar), vira em frente à lua como uma silhueta
// recortada, sobe até o alto do poste freando com as asas abertas e estica as pernas ao pousar.
// Fecha a asa, sacode a cauda, solta a carta do bico na caixa de correio e olha em volta aos
// trancos (uma vez por cima do ombro); então agacha, salta virando, abre a asa, recolhe as pernas
// e vai embora. Contra o céu escuro, a borda virada para a lua acende. Ciclo de 10s; um clique o
// faz levantar voo: na hora se já entregou a carta, ou logo depois de entregá-la se ainda chega.

import {
  acender,
  balancar,
  cada,
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
  type Campo,
  type Clique,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";
import { encaixar, figura, type Colocada, type OpcoesFigura, type Parte } from "../figura.ts";

type Pto = { x: number; y: number };

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 1200 / 514;
const LUA = { x: 0.346, y: 0.335, r: 0.146 };
const LAMPIAO = { x: 0.848, y: 0.29 };
const CHAMAS = [{ x: LAMPIAO.x, y: LAMPIAO.y + 0.02, alt: 0.06, larg: 0.008 }];
const POSTE = { x: 0.816, y: 0.139 }; // o meio do alto do poste, onde os pés do corvo agarram
const CAIXA = { x: 0.829, y: 0.44 }; // fenda da caixa de correio
const ARVORE = 0.27; // a árvore ocupa a esquerda até aqui
const CICLO = 10;

// a folha do corvo (1024×576, fundo verde), medida em pixels; na folha, x e y vão em alturas.
// Na folha ele olha para a esquerda e a asa dobrada já vem desenhada no corpo; a asa aberta é uma
// peça à parte, que só aparece no voo (por cima do corpo, cobrindo a dobrada)
const F = (x: number, y: number) => ({ x: x / 576, y: y / 576 });
const caixa = (x0: number, y0: number, x1: number, y1: number) => ({ x0: x0 / 576, y0: y0 / 576, x1: x1 / 576, y1: y1 / 576 });
const CENTRO = F(160, 270); // no corpo: o meio do tronco, que segue o caminho no voo
const PE = F(105, 472); // no corpo: entre os dedos, o que agarra o alto do poste
const PESCOCO = F(52, 112); // no corpo: o toco do pescoço, onde a cabeça se encaixa
const OMBRO = F(95, 190); // no corpo: o alto da asa dobrada, onde a asa aberta se prende
const RAIZ = F(225, 352); // no corpo: de onde sai a cauda
const QUADRIL = F(135, 400); // no corpo: onde as canelas saem das penas da barriga
// o corpo em três caixas (a da cabeça invade a coluna do corpo, mas não a sua altura): o tronco,
// as canelas com os dedos (crescem do quadril ao pousar e se recolhem no voo) e a cauda em leque,
// que gira na raiz
const CORPO: Parte = { caixa: caixa(15, 77, 322, 400), pivo: CENTRO };
const PERNAS: Parte = { caixa: caixa(15, 400, 196, 501), pivo: QUADRIL };
const CAUDA: Parte = { caixa: caixa(196, 330, 376, 501), pivo: RAIZ };
const CABECA: Parte = { caixa: caixa(320, 160, 551, 342), pivo: F(478, 296) }; // pende do pescoço
const ASA: Parte = { caixa: caixa(608, 47, 1018, 451), pivo: F(632, 212) }; // presa no ombro
const BICO = F(328, 218); // na cabeça: a ponta do bico, onde a carta fica presa
const ESC_CABECA = 0.8; // a cabeça veio grande na folha
const COMPRIMENTO = 1.1; // do bico à ponta da cauda, voando (em alturas da folha)
// tom: as penas com o brilho do luar e um contorno escuro em volta, que recorta a figura do céu;
// na frente da lua o corpo vira silhueta (SILHUETA); contra o céu escuro a borda virada para a lua
// acende (ARO, os outros lados FUNDO_ARO dela) e, no poste, a borda virada para o lampião esquenta
const GAMA = 0.8;
const BRILHO = 0.9;
const SILHUETA = 0.85;
const CONTORNO = 0.6;
const ARO = 0.7;
const ARO_LAMPIAO = 0.9;
const FUNDO_ARO = 0.35;
// poses (radianos, sentido horário, para ele olhando à esquerda)
const VOO = -0.77; // o corpo deitado no voo (pousado, fica de pé: 0)
const CABECA_VOO = -0.2; // a cabeça no voo (acompanha um pouco o corpo)
const ASA0 = 0; // a asa da folha já aponta para trás: a batida soma a partir daqui
const DOBRA = 0.85; // a asa aberta deitada sobre a dobrada, ao fechar
const OLHAR = 0.25; // inclinação da cabeça olhando em volta
const RABO = -0.25; // a cauda sacode para cima ao pousar
// a história, em segundos do ciclo
const VIRA = 1.9; // vira em frente à lua
const CHEGA = 3.2; // pousa
const SOLTA = 3.6; // solta a carta
const QUEDA = 0.8;
const PASSO_OLHAR = 1.3;
const PARTE = 7; // levanta voo
const ENTREGUE = SOLTA + QUEDA * 1.6; // a carta na caixa e o brilho dela apagado
const REPOUSO = 3.45; // com movimento reduzido: pousado, com a carta no bico

// a batida: desce rápido e sobe devagar (a fase anda mais depressa perto da descida)
const bate = (t: number) => {
  const f = t * 9;
  return -1.0 + 0.9 * (0.5 + 0.5 * Math.sin(f + 0.5 * Math.sin(f)));
};
// para onde a cabeça se inclina no passo n de olhar em volta (-1: a pose do voo)
const olhar = (n: number) => (n < 0 ? 0 : OLHAR * Math.sin(n * 2.4 + 4));
// a cabeça pousada, d segundos depois de pousar: a inclinação aos trancos (segura e vira) e `volta`,
// de 0 a 2, que vira a cabeça para trás por cima do ombro (perto de 1) e de volta
const cabecaPousado = (d: number) => {
  const n = Math.floor(d / PASSO_OLHAR);
  return {
    cabeca: olhar(n - 1) + (olhar(n) - olhar(n - 1)) * passo(0, 0.15, d - n * PASSO_OLHAR),
    volta: passo(1.3, 1.5, d) + passo(2.3, 2.5, d),
  };
};
// a cabeça ao partir no fim do ciclo (sem clique)
const SAIDA = cabecaPousado(PARTE - CHEGA);

interface Momento {
  centro: Pto; // onde fica o CENTRO do corpo (mundo)
  lado: 1 | -1; // 1 olha para a esquerda, como na folha
  giro: number; // 1 de perfil; perto de 0, virando
  corpo: number;
  asa: number | null; // null: fechada (só a dobrada, do corpo)
  abre: number; // escala da asa aberta (encolhe ao dobrar, cresce ao abrir)
  pernas: number; // escala das canelas (0 recolhidas, 1 no poste)
  cauda: number;
  cabeca: number;
  olha: number; // a cabeça sozinha virando para trás (1 de perfil)
  costas: boolean; // a cabeça virada para trás
}

// o corvo num instante do ciclo. Os ângulos são para ele olhando à esquerda (o desenho espelha).
// `de` é a entrada, `lua` a frente da lua, `pouso` o centro do corpo com os pés no poste, `ate` a
// saída; `h` é a altura da imagem no mundo e `perna` a do quadril aos dedos. `saida` é a cabeça no
// instante em que ele levanta voo (o clique o faz partir de qualquer pose pousada)
const momento = (
  c: number,
  t: number,
  parado: boolean,
  P: { de: Pto; lua: Pto; pouso: Pto; ate: Pto; h: number; perna: number },
  saida = SAIDA,
): Momento => {
  const pousado: Momento = { centro: P.pouso, lado: -1, giro: 1, corpo: 0, asa: null, abre: 1, pernas: 1, cauda: 0, cabeca: 0, olha: 1, costas: false };
  if (parado) return pousado;
  if (c < CHEGA) {
    // vem da direita desacelerando até a lua, vira ali e sobe até o poste, freando com as asas
    // erguidas e o corpo se endireitando
    let x: number;
    let y: number;
    let corpo = VOO;
    let asa = ASA0 + bate(t);
    let pernas = 0;
    if (c < VIRA) {
      const u = Math.sin(((c / VIRA) * Math.PI) / 2);
      x = P.de.x + (P.lua.x - P.de.x) * u;
      y = P.de.y + (P.lua.y - P.de.y) * u;
    } else {
      const u = (c - VIRA) / (CHEGA - VIRA);
      const k = passo(0, 1, u);
      x = P.lua.x + (P.pouso.x - P.lua.x) * k;
      y = P.lua.y + (P.pouso.y - P.lua.y) * k;
      corpo = VOO * (1 - passo(0.55, 1, u));
      asa += (ASA0 - 1 - asa) * passo(0.5, 0.85, u);
      // as canelas descem do quadril e se esticam inteiras quando os dedos tocam o poste
      pernas = passo(0.7, 1, u);
    }
    const v = passo(VIRA - 0.3, VIRA + 0.3, c);
    return { ...pousado, centro: { x, y }, lado: v < 0.5 ? 1 : -1, giro: Math.abs(Math.cos(Math.PI * v)), corpo, asa, pernas, cabeca: (corpo / VOO) * CABECA_VOO };
  }
  if (c < PARTE) {
    // pousado: fecha a asa (deita sobre a dobrada e encolhe até sumir nela), sacode a cauda uma
    // vez e olha em volta aos trancos, uma vez para trás por cima do ombro
    const d = c - CHEGA;
    const fecha = passo(0, 0.3, d);
    const { cabeca, volta } = cabecaPousado(d);
    return {
      ...pousado,
      asa: d < 0.3 ? ASA0 - 1 + (DOBRA - ASA0 + 1) * fecha : null,
      abre: 1 - 0.9 * fecha,
      cauda: RABO * Math.sin(Math.PI * Math.min(1, d / 0.45)) ** 2,
      cabeca,
      olha: Math.abs(Math.cos(Math.PI * volta)),
      costas: volta > 0.5 && volta < 1.5,
    };
  }
  // parte: agacha (as canelas dobram, os dedos ficam no poste), salta virando para a esquerda,
  // abre a asa (cresce do ombro, desdobrando de cima da dobrada), recolhe as canelas, cai um pouco
  // e vai embora subindo; a cabeça sai da pose em que estava
  const d = c - PARTE;
  const agacha = d < 0.25 ? Math.sin((Math.PI * d) / 0.25) : 0;
  const desce = P.h * 0.006 * agacha;
  const k = Math.max(0, d - 0.15) / (CICLO - PARTE - 0.15);
  const x = P.pouso.x + (P.ate.x - P.pouso.x) * k ** 1.7;
  const y = P.pouso.y + (P.ate.y - P.pouso.y) * k ** 1.3 + P.h * 0.04 * Math.sin(Math.PI * passo(0, 1 / 3, k)) + desce;
  const corpo = VOO * passo(0.1, 0.5, d) - 0.1 * agacha;
  const abre = passo(0, 0.3, d);
  const v = passo(0.2, 0.6, d);
  // a cabeça virada para trás volta para a frente (ou termina de voltar) nos primeiros 0,2s
  const volta = saida.volta + ((saida.volta < 1 ? 0 : 2) - saida.volta) * passo(0, 0.2, d);
  return {
    ...pousado,
    centro: { x, y },
    lado: v < 0.5 ? -1 : 1,
    giro: Math.abs(Math.cos(Math.PI * v)),
    corpo,
    asa: DOBRA + (ASA0 + bate(t) - DOBRA) * abre,
    abre: 0.1 + 0.9 * abre,
    // os dedos largam o poste quando ele começa a andar (0,15s): até lá as canelas dobram com a
    // agachada; depois se recolhem
    pernas: (1 - desce / P.perna) * (1 - passo(0.15, 0.45, d)),
    cabeca: saida.cabeca * (1 - passo(0, 0.3, d)) + (corpo / VOO) * CABECA_VOO,
    olha: Math.abs(Math.cos(Math.PI * volta)),
    costas: volta > 0.5 && volta < 1.5,
  };
};

// as peças do corvo no mundo para um momento: o corpo gira no CENTRO, a cauda na raiz, a cabeça
// no pescoço e a asa no ombro; devolve também a ponta do bico (já com o giro)
const montar = (m: Momento, esc: number, tom: Partial<OpcoesFigura>) => {
  const o: OpcoesFigura = { ...tom, esc, flip: m.lado < 0, giro: { x: m.centro.x, k: m.giro } };
  const corpo: Colocada = { parte: CORPO, em: m.centro, ang: m.lado * m.corpo };
  const cauda: Colocada = { parte: CAUDA, em: encaixar(corpo, RAIZ, o), ang: m.lado * (m.corpo + m.cauda) };
  const pernas: Colocada = { parte: PERNAS, em: encaixar(corpo, QUADRIL, o), ang: corpo.ang };
  const pescoco = encaixar(corpo, PESCOCO, o);
  // a cabeça vira sozinha (olhando para trás) em volta do pescoço; com o corpo virando, vai junto
  const lc = m.costas ? -m.lado : m.lado;
  const oc: OpcoesFigura = { ...o, esc: esc * ESC_CABECA, flip: lc < 0, giro: m.giro < 1 ? o.giro : { x: pescoco.x, k: m.olha } };
  const cabeca: Colocada = { parte: CABECA, em: pescoco, ang: lc * m.cabeca };
  const asa: Colocada | null = m.asa === null ? null : { parte: ASA, em: encaixar(corpo, OMBRO, o), ang: m.lado * m.asa };
  const g = oc.giro!;
  const ponta = encaixar(cabeca, BICO, oc);
  const bico = { x: g.x + (ponta.x - g.x) * g.k, y: ponta.y, lado: lc };
  return { o, oc, oa: { ...o, esc: esc * m.abre }, op: { ...o, esc: esc * m.pernas }, tronco: [cauda, corpo], pernas, cabeca, asa, bico };
};

// a luz na borda: as células da silhueta com uma vizinha de fora, do lado virado para uma luz,
// acendem (com `fundo`, os outros lados também, mais fraco), tanto mais quanto mais escuro o que
// está atrás (o contorno da figura já escureceu a volta: na lua conta a distância a ela). A lua
// acende a borda fria contra o céu; o lampião, a borda quente de baixo quando ele está no poste.
// Na frente da lua (e do halo dela) o corpo vira silhueta
interface Fonte {
  p: Pto;
  I: number;
  calor: number;
  fundo: number;
}
const aro = (T: Tela, centro: Pto, r: number, lua: Pto, rl: number, fontes: Fonte[]) => {
  const { cols, rows, mat, A } = T;
  const { lum, calor } = T.c;
  // a direção de cada luz em passos de célula (a célula é mais alta que larga)
  const dirs = fontes.map((f) => {
    const vx = ((f.p.x - centro.x) * cols) / A;
    const vy = (f.p.y - centro.y) * rows;
    const d = Math.hypot(vx, vy) || 1;
    return { ux: vx / d, uy: vy / d };
  });
  cada(
    T,
    (X, Y, i) => {
      if (mat[i] !== 5) return;
      const cx = i % cols;
      const cy = (i - cx) / cols;
      const naLua = passo(rl * 1.25, rl * 0.95, Math.hypot(X - lua.x, Y - lua.y));
      lum[i] *= 1 - SILHUETA * naLua;
      for (let k = 0; k < fontes.length; k++) {
        const f = fontes[k];
        if (f.I <= 0.01) continue;
        let borda = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const x = cx + dx;
            const y = cy + dy;
            if ((!dx && !dy) || x < 0 || y < 0 || x >= cols || y >= rows) continue;
            const j = y * cols + x;
            if (mat[j] === 5) continue;
            const voltada = Math.max(f.fundo, (dx * dirs[k].ux + dy * dirs[k].uy) / Math.hypot(dx, dy));
            borda = Math.max(borda, voltada * (1 - passo(0.35, 0.6, lum[j])));
          }
        const L = borda * f.I * (1 - naLua);
        if (L > lum[i]) lum[i] = L;
        if (L * f.calor > calor[i]) calor[i] = L * f.calor;
      }
    },
    { x0: centro.x - r, x1: centro.x + r, y0: centro.y - r, y1: centro.y + r },
  );
};

const mod = (v: number) => ((v % CICLO) + CICLO) % CICLO;

// memória dos cliques entre quadros (há um corvo só na página): o ciclo corre deslocado de
// `desloca`, um salto pode esperar o pouso (`espera`) e `saida` guarda quando e com que cabeça
// ele partiu por um clique
const memoria = {
  t: -Infinity,
  visto: -Infinity,
  desloca: 0,
  espera: null as number | null, // quando o salto acontece
  saida: { t: -Infinity, ...SAIDA },
};

// o instante do ciclo, ouvindo os cliques: pousado depois de entregar a carta, ele levanta voo na
// hora; chegando (ou soltando a carta), termina a entrega e parte assim que ela cai na caixa;
// já indo embora, o clique não muda nada. Um salto do relógio para trás (outro canvas, quadro
// parado) recomeça a memória e relê os cliques
const ouvir = (t: number, cliques: Clique[]) => {
  const M = memoria;
  if (t < M.t - 1) {
    M.visto = -Infinity;
    M.desloca = 0;
    M.espera = null;
    M.saida = { t: -Infinity, ...SAIDA };
  }
  M.t = t;
  const partir = (quando: number, c: number) => {
    M.desloca = PARTE - quando;
    M.espera = null;
    M.saida = { t: quando, ...cabecaPousado(c - CHEGA) };
  };
  const vence = (ate: number) => {
    if (M.espera !== null && M.espera <= ate) partir(M.espera, ENTREGUE);
  };
  for (const q of cliques) {
    if (q.t <= M.visto || q.t > t) continue;
    M.visto = q.t;
    vence(q.t);
    const c = mod(q.t + M.desloca);
    if (c < ENTREGUE) M.espera = q.t + ENTREGUE - c;
    else if (c < PARTE) partir(q.t, c);
  }
  vence(t);
  return mod(t + M.desloca);
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
  const s = e(0.9 * 1.3); // escala da história (1,3 vez o corvo desenhado em código que havia antes)

  // mariposas em volta do lampião
  const lp = para(LAMPIAO.x, LAMPIAO.y);
  luz(T, lp.x, lp.y, e(0.12) * tremor, 0.4 * tremor);
  for (let k = 0; k < 5; k++) {
    const a = t * (2.2 + k * 0.5) + k * 1.3;
    pontoMundo(T, lp.x + Math.cos(a) * e(0.03 + 0.008 * k), lp.y + Math.sin(a * 1.7) * e(0.025), 0.6, 0.4);
  }

  // o corvo: chega da direita cruzando a lua, pousa no poste, solta a carta e vai embora. O clique
  // o faz levantar voo (veja `ouvir`), e a história segue dali
  const c = parado ? REPOUSO : ouvir(t, cliques);
  const pressa = !parado && c >= PARTE && Math.abs(t - (c - PARTE) - memoria.saida.t) < 1e-6;
  const sprite = dados.figuras?.corvo;
  const escAve = (s * 0.15) / COMPRIMENTO; // o comprimento do antigo (0,15 s), do bico à cauda
  const poste = para(POSTE.x, POSTE.y);
  const caixa = para(CAIXA.x, CAIXA.y);
  const lua = para(LUA.x, LUA.y);
  const pontos = {
    de: { x: A + e(0.15), y: e(0.1) },
    lua,
    // o centro do corpo com os pés no alto do poste (pousado ele olha para a direita: espelhado)
    pouso: { x: poste.x + (PE.x - CENTRO.x) * escAve, y: poste.y - (PE.y - CENTRO.y) * escAve },
    ate: { x: -e(0.3), y: e(0.03) },
    h: e(1),
    perna: (PE.y - QUADRIL.y) * escAve,
  };
  const m = momento(c, t, parado, pontos, pressa ? memoria.saida : SAIDA);
  const tom = { gama: GAMA, brilho: surgir * BRILHO, contorno: CONTORNO * surgir };
  const ave = montar(m, escAve, tom);
  figura(T, sprite, ave.tronco, ave.o);
  if (m.pernas > 0.05) figura(T, sprite, [ave.pernas], ave.op);
  figura(T, sprite, [ave.cabeca], ave.oc);
  if (ave.asa) figura(T, sprite, [ave.asa], ave.oa);
  if (sprite) {
    const perto = Math.exp(-((Math.hypot(lp.x - m.centro.x, lp.y - m.centro.y) / e(0.3)) ** 2));
    aro(T, m.centro, s * 0.12, lua, e(LUA.r), [
      { p: lua, I: ARO * surgir, calor: 0, fundo: FUNDO_ARO },
      { p: lp, I: ARO_LAMPIAO * tremor * perto * surgir, calor: 1, fundo: 0 },
    ]);
  }

  // a carta: presa no bico até SOLTA, depois cai de onde o bico estava até a fenda da caixa
  // (pende da ponta do bico, um pouco à frente; do tamanho da carta de antes)
  const sc = e(0.9);
  const preso = (b: { x: number; y: number; lado: number }) => ({ x: b.x - b.lado * 0.004 * sc, y: b.y + 0.008 * sc });
  if (c < SOLTA) {
    const b = preso(ave.bico);
    carta(T, b.x, b.y, sc);
  } else if (c < PARTE) {
    const b = preso(montar(momento(SOLTA, t, false, pontos), escAve, tom).bico);
    const kc = (c - SOLTA) / QUEDA;
    if (kc < 1) carta(T, b.x + (caixa.x - b.x) * kc, b.y + (caixa.y - b.y) * kc * kc, sc);
    else if (kc < 1.6) luz(T, caixa.x, caixa.y, e(0.05), 0.5 * (1.6 - kc));
  }

  lampiao(T, mouse, 0.35, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
