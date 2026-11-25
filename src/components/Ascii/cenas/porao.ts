// DevClean: o porão, a partir de uma imagem realista (public/cenas/porao.webp) convertida em
// caracteres a cada quadro. Por cima, em código: as tochas tremulando (a luz nas paredes pulsa
// junto), fagulhas e fumaça subindo para a abóbada, poeira no feixe de luz, um rato que cruza o
// chão de vez em quando e a história: um velho encurvado, feito de foto (public/cenas/figuras/
// velho.webp), varre devagar os três sacos de cache seguros até a carroça da Lixeira. A cada
// passada ele recolhe a vassoura e empurra, arrasta os pés um passo e levanta poeira, que esquenta
// perto das tochas; de tempos em tempos para e endireita as costas. Passa por trás do saco marcado
// "?" (review), que fica onde está. Na carroça os sacos tombam e a carga cresce; ele descansa, se
// vira e volta arrastando os pés. Ciclo de 70s; um clique recomeça a limpeza.

import {
  acender,
  cada,
  chama,
  elipse,
  escrever,
  faiscas,
  fagulhas,
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
  ultimo,
  balancar,
  type Campo,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";
import { encaixar, figura, type Colocada, type OpcoesFigura, type Parte } from "../figura.ts";

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const TOCHAS = [
  { x: 0.1975, y: 0.2 },
  { x: 0.754, y: 0.405 },
];
const CHAMAS = TOCHAS.map((k) => ({ x: k.x, y: k.y + 0.03, alt: 0.12, larg: 0.012 }));
const CHAO = 0.71; // linha do chão na profundidade da carroça
const CARROCA = { x0: 0.865, x1: 0.99, topo: 0.45 };
const BOCA = 0.84; // ao chegar aqui o saco tomba na carroça
const SACOS = [0.42, 0.52, 0.6];
const REVIEW = 0.33;
const CASA = 0.25;
const FIM = 0.745; // onde ele para: a palha chega à boca da carroça
const ALTURA = 0.3; // altura do velho nessa profundidade, em alturas da imagem
const R_SACO = 0.045;

// a folha do velho (1024×576, fundo verde), medida em pixels; na folha, x e y vão em alturas
const F = (x: number, y: number) => ({ x: x / 576, y: y / 576 });
const caixa = (x0: number, y0: number, x1: number, y1: number) => ({ x0: x0 / 576, y0: y0 / 576, x1: x1 / 576, y1: y1 / 576 });
const PE = F(150, 558); // sola, entre os dois pés: o corpo gira em volta dela, sem os pés escorregarem
const OMBRO = F(185, 110); // no corpo: onde o alto das mangas encosta
const MAOS = F(728, 529); // nos braços: a ponta de baixo do cabo, onde a palha é amarrada
const CORPO: Parte = { caixa: caixa(8, 5, 297, 566), pivo: PE };
const BRACOS: Parte = { caixa: caixa(329, 76, 741, 539), pivo: F(400, 105) };
const PALHA: Parte = { caixa: caixa(831, 269, 993, 546), pivo: F(849, 288) };
const FUNDO_PALHA = [F(890, 520), F(920, 539), F(940, 536), F(960, 527), F(980, 513)]; // contorno de baixo
const FRENTE_PALHA = F(975, 518); // o que encosta nos sacos
const ALTURA_FOLHA = 550 / 576; // do capuz à sola
const ESC_BRACOS = 0.85; // braços e vassoura vieram um pouco maiores que o corpo na folha
const DOBRA = -0.2; // a palha, um pouco dobrada para trás em relação ao cabo
const A0 = -0.25; // ângulo dos braços em repouso, com a palha no chão (para a contrarrotação)

// a história, em segundos do ciclo
const CICLO = 70;
const PASSADA = 2.8; // empurra (e dá um passo) e recolhe a vassoura
const BLOCOS = [4, 4, 4, 2]; // passadas entre uma pausa e outra
const PAUSA = 1.5; // endireita as costas
const INICIO = 1.3; // baixa a vassoura antes da primeira passada
const PASSADAS = BLOCOS.reduce((a, b) => a + b, 0);
const VARRE = INICIO + PASSADAS * PASSADA + (BLOCOS.length - 1) * PAUSA; // 45: chega na carroça
const DESCANSO = 52;
const GIRO = 1.2; // tempo para se virar
const VOLTA = CICLO - GIRO; // chega em casa e se vira de novo
const PASSOS_VOLTA = 11;
// amplitudes (radianos; alturas da folha para a vassoura; alturas do velho para o corpo)
const INCLINA = 0.08;
const BALANCO = 0.03;
const RETO = 0.08;
const ERGUE = 0.03; // a palha sai do chão ao recolher
const CARREGA = 0.07; // a vassoura no ar, quando ele anda sem varrer
const PASSO_ALTO = 0.006;
const FOLEGO = 0.008;
// poeira de cada passada
const GRAOS = 18;
const VIDA = 2.2;

const sen2 = (v: number) => Math.sin(v) ** 2;

// saco de pano amarrado, iluminado de cima
const saco = (T: Tela, x: number, pe: number, r: number, L: number) => {
  elipse(T, x, pe - r * 0.9, r, r * 0.95, (u, v) => L * (0.55 + 0.27 * (1 - v) + 0.3 * (1 - Math.abs(u))) * (0.85 + 0.3 * ruido(u * 9 + x * 40, v * 9)));
  traco(T, x, pe - r * 1.8, x, pe - r * 2.2, r * 0.22, L * 0.8);
  traco(T, x - r * 0.35, pe - r * 2.25, x + r * 0.35, pe - r * 2.15, r * 0.12, L);
};

// um grão de poeira no ar: soma luz à célula (brilha mais onde já há luz) e pega o calor dela
const grao = (T: Tela, x: number, y: number, L: number, calor: number) => {
  const cx = Math.round((x / T.A) * T.cols - 0.5);
  const cy = Math.round(y * T.rows - 0.5);
  if (cx < 0 || cy < 0 || cx >= T.cols || cy >= T.rows) return;
  const i = cy * T.cols + cx;
  T.c.lum[i] = Math.max(T.c.lum[i], Math.min(T.c.lum[i] + L, 0.7));
  if (calor > T.c.calor[i]) T.c.calor[i] = calor;
};

// calor da tocha mais perto num ponto da imagem: forte junto dela, some a ~0,15 de distância
const quente = (ix: number, iy: number, tremor = [1, 1]) =>
  Math.max(...TOCHAS.map((k, n) => Math.exp(-Math.hypot(ix - k.x, (iy - k.y) / ASPECTO) / 0.15) * tremor[n]));

// início da passada n (as pausas ficam entre os blocos)
const inicioPassada = (n: number) => {
  let b = 0;
  for (let s = BLOCOS[0]; n >= s && b < BLOCOS.length - 1; s += BLOCOS[++b]);
  return INICIO + n * PASSADA + b * PAUSA;
};

// onde a varrida está: passadas já começadas (n), fase da passada atual (ph, -1 fora dela) e
// fase da pausa (-1 fora dela)
const varrida = (c: number) => {
  let u = c - INICIO;
  let n = 0;
  if (u < 0) return { n, ph: -1, pausa: -1 };
  for (let b = 0; b < BLOCOS.length; b++) {
    const dur = BLOCOS[b] * PASSADA;
    if (u < dur) return { n: n + Math.floor(u / PASSADA), ph: (u % PASSADA) / PASSADA, pausa: -1 };
    u -= dur;
    n += BLOCOS[b];
    if (b < BLOCOS.length - 1) {
      if (u < PAUSA) return { n, ph: -1, pausa: u / PAUSA };
      u -= PAUSA;
    }
  }
  return { n, ph: -1, pausa: -1 };
};

// o momento do velho no ciclo: x do pé (imagem), para que lado olha, giro (1 de perfil, perto de
// 0 virando), inclinação do corpo (+ para a frente), quanto o corpo sobe (alturas dele) e quanto a
// palha está fora do chão (alturas da folha)
interface Momento {
  x: number;
  lado: 1 | -1;
  giro: number;
  inclina: number;
  sobe: number;
  ergue: number;
}
const momento = (c: number, parado: boolean): Momento => {
  const passo1 = (FIM - CASA) / PASSADAS;
  if (c < VARRE) {
    const { n, ph, pausa } = varrida(c);
    const empurra = ph >= 0 && ph < 0.5;
    const x = CASA + passo1 * (n + (empurra ? passo(0, 1, ph * 2) : ph >= 0.5 ? 1 : 0));
    if (parado) return { x, lado: 1, giro: 1, inclina: 0, sobe: 0, ergue: 0 };
    // empurra: inclina para a frente e arrasta um pé; recolhe: volta e tira a palha do chão
    const alterna = n % 2 ? 1 : -1; // um passo com cada pé
    const reto = pausa >= 0 ? passo(0, 0.4, pausa) * (1 - passo(0.6, 1, pausa)) : 0;
    return {
      x,
      lado: 1,
      giro: 1,
      inclina: (ph >= 0 ? INCLINA * sen2(Math.PI * ph) : 0) + (empurra ? BALANCO * alterna * sen2(Math.PI * 2 * ph) : 0) - RETO * reto,
      sobe: empurra ? PASSO_ALTO * sen2(Math.PI * 2 * ph) : 0,
      ergue: c < INICIO ? CARREGA * (1 - passo(0, INICIO, c)) : ph >= 0.5 ? ERGUE * sen2(Math.PI * (2 * ph - 1)) : 0,
    };
  }
  if (parado) return { x: c < DESCANSO ? FIM : CASA, lado: c < DESCANSO ? 1 : -1, giro: 1, inclina: 0, sobe: 0, ergue: 0 };
  // descansa apoiado na vassoura e a levanta para ir embora
  if (c < DESCANSO) return { x: FIM, lado: 1, giro: 1, inclina: 0, sobe: 0, ergue: CARREGA * passo(DESCANSO - 1, DESCANSO, c) };
  // vira no lugar (o perfil encolhe até quase sumir e abre do outro lado)
  const virar = (u: number, de: 1 | -1, x: number): Momento => {
    const k = passo(0, 1, u);
    return { x, lado: k < 0.5 ? de : (-de as 1 | -1), giro: Math.abs(Math.cos(Math.PI * k)), inclina: 0, sobe: 0, ergue: CARREGA };
  };
  if (c < DESCANSO + GIRO) return virar((c - DESCANSO) / GIRO, 1, FIM);
  if (c >= VOLTA) return virar((c - VOLTA) / GIRO, -1, CASA);
  // volta arrastando os pés, passo a passo, com a vassoura parada no ar
  const s = ((c - DESCANSO - GIRO) / (VOLTA - DESCANSO - GIRO)) * PASSOS_VOLTA;
  const k = Math.floor(s);
  const f = s - k;
  return {
    x: FIM + ((CASA - FIM) * (k + passo(0, 1, f))) / PASSOS_VOLTA,
    lado: -1,
    giro: 1,
    inclina: BALANCO * (k % 2 ? 1 : -1) * sen2(Math.PI * f),
    sobe: PASSO_ALTO * sen2(Math.PI * f),
    ergue: CARREGA,
  };
};

// Interativa: o cursor é um lampião (o porão é escuro) e um clique recomeça a limpeza.
export const porao = ({ cols, rows, t, p, dados, parado, mouse, cliques }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));

  // cada tocha tremula no seu ritmo; a luz quente das paredes pulsa com a tocha mais perto
  const tremor = TOCHAS.map((_k, n) => 0.75 + 0.25 * ruido(t * 9 + n * 5, 2) + 0.1 * Math.sin(t * 23 + n));
  const { v, para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    fx: 0.6,
    limiar: 0.35 * (1 - passo(0, 1, p)),
    gama: 0.75,
    desloca: (ix, iy) => balancar(ix, iy, CHAMAS, t),
    ajuste: ({ ix, iy, l, w }) => {
      if (w > 0.05) {
        const n = Math.abs(ix - TOCHAS[0].x) < Math.abs(ix - TOCHAS[1].x) ? 0 : 1;
        const d = Math.hypot(ix - TOCHAS[n].x, (iy - TOCHAS[n].y) / ASPECTO);
        l *= 1 + (tremor[n] - 0.85) * 0.9 * Math.exp(-d * 6);
      }
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));
  const e = (n: number) => n * esc;
  const chao = para(0, CHAO).y;
  const X = (x: number) => para(x, 0).x;

  // a história da limpeza
  const uc = ultimo(cliques);
  const c = uc && t - uc.t < CICLO ? t - uc.t : t % CICLO;

  // o velho num instante do ciclo: o corpo gira em volta dos pés; braços e vassoura são uma peça
  // só presa no ombro, num ângulo que deixa a palha no chão (ou na altura em que ele a segura);
  // a palha gira na ponta do cabo, na metade do sentido contrário dos braços
  const escCorpo = e(ALTURA) / ALTURA_FOLHA;
  const velho = (cc: number) => {
    const m = momento(cc, parado);
    // passa por trás do saco de review: o caminho sobe um pouco perto dele
    const pe = { x: X(m.x), y: chao - e(0.01) * (1 - passo(0.12, 0.15, Math.abs(m.x - REVIEW))) };
    const oc: OpcoesFigura = { esc: escCorpo, flip: m.lado < 0 };
    const ob: OpcoesFigura = { ...oc, esc: escCorpo * ESC_BRACOS };
    // o fôlego segue o relógio da página (contínuo na virada do ciclo e no clique)
    const folego = parado ? 0 : Math.sin((t - c + cc) * 2.2) * FOLEGO;
    const corpo: Colocada = { parte: CORPO, em: { x: pe.x, y: pe.y - e(ALTURA) * (m.sobe + folego) }, ang: m.lado * m.inclina };
    const ombro = encaixar(corpo, OMBRO, oc);
    const montar = (a: number) => {
      const bracos: Colocada = { parte: BRACOS, em: ombro, ang: m.lado * a };
      const palha: Colocada = { parte: PALHA, em: encaixar(bracos, MAOS, ob), ang: m.lado * (a + DOBRA - (a - A0) / 2) };
      return { bracos, palha };
    };
    const fundo = (palha: Colocada) => Math.max(...FUNDO_PALHA.map((q) => encaixar(palha, q, ob).y));
    // girar os braços para baixo desce a palha: busca binária pelo ângulo que a põe no alvo
    const alvo = pe.y - m.ergue * escCorpo;
    let lo = A0 - 0.6;
    let hi = A0 + 0.6;
    for (let k = 0; k < 18; k++) {
      const meio = (lo + hi) / 2;
      if (fundo(montar(meio).palha) > alvo) hi = meio;
      else lo = meio;
    }
    const { bracos, palha } = montar((lo + hi) / 2);
    return { m, pe, oc, ob, corpo, bracos, palha, frente: encaixar(palha, FRENTE_PALHA, ob) };
  };
  const agora = velho(c);

  // tochas: chama viva, fagulhas e fumaça que sobe e se perde na abóbada (atrás do velho)
  TOCHAS.forEach((k, n) => {
    const m = para(k.x, k.y);
    chama(T, m.x, m.y + e(0.02), e(0.07) * tremor[n], e(0.012), t, n * 30);
    fagulhas(T, m.x, m.y - e(0.03), t + n * 3, 6, e(0.18), e(0.03));
    fumaca(T, m.x + e(0.005), m.y - e(0.05), t + n * 7, e(0.17), e(0.03), 0.08);
  });

  // o velho fica na frente das tochas e antes da luz delas, que cai nele; mais claro e quente
  // perto do fogo
  const meio = v.paraImagem(agora.pe.x, agora.pe.y - e(ALTURA) * 0.6);
  const brasa = quente(meio.x, meio.y, tremor);
  const tom = { gama: 0.65, brilho: surgir * (0.8 + 0.45 * brasa), calor: 0.6 + 0.7 * brasa, giro: { x: agora.pe.x, k: agora.m.giro } };
  figura(T, dados.figuras?.velho, [agora.corpo], { ...agora.oc, ...tom });
  figura(T, dados.figuras?.velho, [agora.bracos, agora.palha], { ...agora.ob, ...tom });

  // a luz das tochas, pulsando com a chama, nas paredes e no velho
  TOCHAS.forEach((k, n) => {
    const m = para(k.x, k.y);
    luz(T, m.x, m.y, e(0.12) * tremor[n], 0.5 * tremor[n]);
  });
  // poeira girando no feixe da primeira tocha
  const p0 = para(TOCHAS[0].x, TOCHAS[0].y);
  poeira(T, p0.x - e(0.05), p0.x + e(0.35), p0.y, p0.y + e(0.45), t, 40, 0.35);

  // poeira de cada empurrão: sobe da palha, deriva e esquenta ao passar perto das tochas
  if (!parado && dados.figuras?.velho) {
    for (let n = 0; n < PASSADAS; n++) {
      const nasce = inicioPassada(n) + PASSADA * 0.3;
      if (c < nasce || c > nasce + VIDA + 0.5) continue;
      const o = velho(nasce).frente;
      for (let j = 0; j < GRAOS; j++) {
        const idade = c - nasce - ruido(j * 1.7, n) * 0.5;
        if (idade < 0 || idade > VIDA) continue;
        const k = idade / VIDA;
        const x = o.x + e(0.04) * (ruido(j, n * 3) - 0.4) + e(0.025) * idade * (0.4 + ruido(j, n + 9)) + e(0.03) * idade * (fbm(j * 0.7 + idade * 0.6, n * 1.3, 2) - 0.5);
        const y = o.y - e(0.005) - e(0.05) * (0.3 + 0.7 * ruido(j * 2, n)) * idade * (1 - k / 2);
        const q = v.paraImagem(x, y);
        grao(T, x, y, 0.25 * passo(0, 0.15, idade) * (1 - k) ** 1.5 * (0.6 + 0.4 * ruido(j, n * 7)), quente(q.x, q.y));
      }
    }
  }

  // o saco de review, com o "?", fica onde está
  saco(T, X(REVIEW), chao, e(R_SACO), 0.6);
  escrever(T, X(REVIEW) - e(0.012), chao - e(R_SACO * 1.25), "?", 0.9, Math.max(1, Math.round(cols / 220)));

  // sacos: só andam quando a palha os empurra (o mais longe que ela já chegou), um empurrando o
  // outro; na boca da carroça tombam para dentro.
  const { n, ph } = varrida(c);
  const empurroes = c >= VARRE ? PASSADAS : n + (ph >= 0.5 ? 1 : 0);
  const ultimoEmpurrao = empurroes > 0 ? velho(inicioPassada(empurroes - 1) + PASSADA / 2).frente.x : -Infinity;
  const alcance = ph >= 0 && ph < 0.5 ? Math.max(agora.frente.x, ultimoEmpurrao) : ultimoEmpurrao;
  const r = e(R_SACO);
  let sx = -Infinity;
  let entregues = 0;
  SACOS.forEach((s0, k) => {
    sx = Math.max(X(s0), k === 0 ? alcance + r : sx + r * 2);
    const tomba = passo(X(BOCA - 0.025), X(BOCA), sx);
    entregues += tomba;
    // o saco é pintado por cima (não some no escuro): tomba subindo e encolhendo, e os novos
    // crescem do chão no começo
    const tam = (1 - tomba) * passo(0, 1.2, c);
    if (tam > 0) saco(T, sx, chao - e(0.03) * tomba, r * tam, 0.6);
  });

  // carga da carroça cresce a cada entrega (e é esvaziada no fim do ciclo)
  const vazia = 1 - passo(CICLO - 5, CICLO - 0.5, c);
  if (entregues > 0 && vazia > 0) {
    const h = e(0.02 * Math.min(1, entregues) + 0.022 * entregues) * vazia;
    const topo = para(0, CARROCA.topo).y;
    const mx = X((CARROCA.x0 + CARROCA.x1) / 2);
    const rx = e(0.13);
    cada(
      T,
      (Xm, Ym, i) => {
        const u = (Xm - mx) / rx;
        const w = (topo - Ym) / h;
        if (w >= 0 && u * u + w * w <= 1) acender(T, i, (0.3 + 0.2 * (1 - Math.abs(u))) * (0.8 + 0.4 * ruido(Xm * 150, Ym * 150)));
      },
      { x0: mx - rx, x1: mx + rx, y0: topo - h, y1: topo },
    );
  }

  // um rato cruza o chão a cada 15s, da direita para a esquerda
  const cr = (t + 6) % 15;
  if (cr < 2.4) {
    const rx = X(0.95 - (cr / 2.4) * 0.9);
    const ry = chao + e(0.05);
    elipse(T, rx, ry, e(0.012), e(0.006), () => 0.1);
    traco(T, rx + e(0.01), ry, rx + e(0.03), ry + Math.sin(t * 20) * e(0.004), e(0.0015), 0.12);
  }

  lampiao(T, mouse, 0.6, 0.16);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
