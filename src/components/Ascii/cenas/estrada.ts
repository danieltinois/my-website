// Trajetória: a estrada, a partir de uma imagem realista (public/cenas/estrada.webp) convertida
// em caracteres a cada quadro. O céu tem o ponto de preto puxado (espaço escuro, só estrelas e a
// Via Láctea) e o chão, os meios-tons levantados (a estrada se vê até o castelo). Por cima, em
// código: a Via Láctea cintilando, nuvens lentas cruzando o céu, estrela cadente a cada 7s,
// névoa correndo nos vales, vaga-lumes na beira da estrada, as janelas do castelo tremulando e a
// história: um viajante encapuzado, feito de foto (public/cenas/figuras/viajante.webp), com
// cajado e uma lanterna pendurada na mão, anda de 2020 a 2026 conforme a página rola (p de 0 a
// 1). As pernas, o cajado e a lanterna balançam com a rolagem; parado na página, ele assenta,
// respira e a lanterna segue balançando de leve, iluminando a estrada em volta. Cada marco é um
// poste com lampião que acende com um clarão e fagulhas quando ele chega, e o ano em cima
// brilha. Passar o cursor (ou o foco) por uma linha da trajetória (data-foco) acende o poste
// daquele ano e um rastro de luz fraca pela estrada até ele (com movimento reduzido, não). No
// desktop cada poste tem o seu ano; em tela estreita o enquadramento acompanha o viajante e os
// anos repetidos aparecem uma vez só.

import { TRAJETORIA } from "../../../data/site.ts";
import {
  cada,
  chama,
  escrever,
  fagulhas,
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
  type Campo,
  type DadosImagem,
  type Entrada,
  type Tela,
} from "../denso.ts";
import { estrelasEspera } from "../estrelas.ts";
import { encaixar, figura, type Colocada, type OpcoesFigura, type Parte } from "../figura.ts";

const ANOS = [...TRAJETORIA].reverse().map((m) => m.quando.slice(0, 4));

// pontos da imagem (coordenadas normalizadas), medidos no arquivo
const ASPECTO = 3;
const meio = (ix: number) => 0.6725 + 0.0425 * ix; // centro da estrada
const CASTELO = { x: 0.942, y: 0.4 };
const INICIO = 0.06;
const FIM = 0.86;
const POSTE = 0.2; // altura de um poste, em alturas da imagem
const ALTURA = 0.16; // altura do viajante (o poste é 1,25 vez mais alto)
const ixPoste = (k: number) => INICIO + 0.03 + (k / (ANOS.length - 1)) * (FIM - INICIO - 0.03);
const ESTREITA = 2.6; // abaixo dessa proporção o quadro segue o viajante e os anos repetidos se juntam

// a folha do viajante (1024×576, fundo verde), medida em pixels; na folha, x e y vão em alturas
const F = (x: number, y: number) => ({ x: x / 576, y: y / 576 });
const caixa = (x0: number, y0: number, x1: number, y1: number) => ({ x0: x0 / 576, y0: y0 / 576, x1: x1 / 576, y1: y1 / 576 });
const QUADRIL = F(180, 262); // no corpo: logo abaixo do cinto, onde as pernas se prendem
const OMBRO = F(178, 140); // no corpo: atrás do broche, onde o alto da manga encosta
const MAO = F(812, 214); // no braço: embaixo do punho, no cajado, onde a argola da lanterna pende
const CORPO: Parte = { caixa: caixa(32, 11, 243, 525), pivo: QUADRIL };
const PERNA_TRAS: Parte = { caixa: caixa(314, 177, 420, 544), pivo: F(370, 205) };
const PERNA_FRENTE: Parte = { caixa: caixa(494, 182, 604, 544), pivo: F(543, 210) };
const BRACO: Parte = { caixa: caixa(663, 21, 834, 551), pivo: F(705, 108) }; // manga, mão e cajado
const LANTERNA: Parte = { caixa: caixa(897, 165, 978, 346), pivo: F(937, 172) }; // pende do alto da argola
const VELA = F(940, 286); // a chama dentro da lanterna
const PERNA = 330 / 576; // do quadril à sola
// na folha as pernas, o braço e a lanterna vieram maiores que o corpo: assim a sola fica a 53%
// da altura abaixo do quadril, a ponta do cajado toca o chão e a lanterna tem 1/5 da altura dele
const ESC_PERNAS = 0.85;
const ESC_BRACO = 0.92;
const ESC_LANTERNA = 0.6;
const ALTURA_FOLHA = (262 - 16) / 576 + PERNA * ESC_PERNAS; // do capuz à sola
// andar (radianos): pernas, braço com o cajado, a lanterna como pêndulo e o corpo um pouco à frente
const PASSADA = 0.45;
const BRACADA = 0.15;
const PENDULO = 0.35;
const INCLINA = 0.03;
const BALANCO = 0.08; // a lanterna balança sozinha (ritmo próprio) andando...
const BALANCO_PARADO = 0.06; // ...e parado
const FOLEGO = 0.008;
const SEGUE = 0.2; // a rolagem suavizada alcança a real com essa constante de tempo (s)
const PARA = 0.4; // segundos sem rolar até ele assentar
const ASSENTA = 0.25; // constante de tempo (s) com que ele passa de andando a parado e volta
// tom do viajante: a foto mais clara e quente da lanterna, com um contorno escuro em volta (separa
// a capa dos morros do mesmo tom atrás), um teto abaixo da lanterna (é ela que brilha) e o cajado
// engrossado para não sumir na grade
const BRILHO = 1.3;
const CONTORNO = 0.8;
const TETO = 0.7;
const BRILHO_LANTERNA = 1.6;
const COBERTURA = 0.55;
// céu: o brilho de fundo cresce do alto (0,3) até o horizonte; o ponto de preto acompanha esse
// fundo, então o céu vazio some e só ficam a Via Láctea, as nuvens e as estrelas (o destaque de
// cada célula sobre a vizinhança, que traz de volta as pequenas, apagadas pelo ponto de preto)
const PRETO = (iy: number) => 0.33 + 0.7 * iy;
const GANHO = 2;
const ESTRELAS = 2.5;
// clarão do poste ao acender
const CLARAO = 0.6;

// memória entre quadros (há uma estrada só na página): a rolagem suavizada, quando ela mudou
// pela última vez, o quanto ele está andando (1) ou parado (0), quando cada poste acendeu e o
// rastro de luz do foco, que entra e sai devagar
const memoria = {
  t: -Infinity,
  p: -1,
  q: 0,
  mudou: -Infinity,
  anda: 0,
  acendeu: ANOS.map(() => -Infinity),
  aceso: ANOS.map(() => false),
  foco: null as number | null,
  rastro: 0,
};

// brilho fraco e quente em volta de um ponto, que vale também no fundo da imagem (a luz() quase
// não clareia o fundo, e a estrada já é o mais claro da cena: o rastro aparece pelo calor)
const brasa = (T: Tela, x: number, y: number, r: number, I: number) =>
  cada(
    T,
    (X, Y, i) => {
      const g = I * Math.exp(-((X - x) ** 2 + (Y - y) ** 2) / (r * r));
      if (g < 0.005) return;
      T.c.lum[i] += g;
      if (g * 4 > T.c.calor[i]) T.c.calor[i] = g * 4;
    },
    { x0: x - r * 2, x1: x + r * 2, y0: y - r * 2, y1: y + r * 2 },
  );

// Interativa: anda com a rolagem; o cursor é um lampião e o clique solta faíscas.
export const estrada = ({ cols, rows, t, p, dados, parado, mouse, cliques, foco: focoLinha }: Entrada<DadosImagem>): Campo => {
  const T = tela(cols, rows);
  const { A } = T;
  const f = dados?.fonte;
  if (!f) {
    estrelasEspera(T, t);
    return fechar(T.c);
  }
  const surgir = parado ? 1 : passo(0, 0.8, t - (dados?.chegou ?? -9));
  // com movimento reduzido a cena não responde ao ponteiro: o foco das linhas não acende nada
  const foco = parado ? null : focoLinha;

  // a rolagem chega aos saltos: o viajante a segue suavizada e, sem rolagem por PARA segundos,
  // assenta (anda vai a 0 devagar); um salto no relógio (aba escondida, primeiro quadro) recomeça
  const M = memoria;
  const alvo = Math.max(0, Math.min(1, p));
  const dt = t - M.t;
  if (parado || !(dt >= 0 && dt < 0.5)) {
    M.q = alvo;
    M.anda = 0;
    M.mudou = -Infinity;
    M.aceso = ANOS.map(() => true); // o que já está aceso ao chegar não dá clarão
  } else {
    if (alvo !== M.p) M.mudou = t;
    M.q += (alvo - M.q) * (1 - Math.exp(-dt / SEGUE));
    if (Math.abs(alvo - M.q) > 0.002) M.mudou = t;
    const anda = t - M.mudou < PARA ? 1 : 0;
    M.anda += (anda - M.anda) * (1 - Math.exp(-dt / ASSENTA));
  }
  M.t = t;
  M.p = alvo;
  const q = M.q;
  const anda = M.anda;
  const vx = INICIO + q * (FIM - INICIO);

  // rastro do foco: acende e apaga em ~0,3s; trocando de linha, o anterior apaga antes
  const passoRastro = parado ? 1 : Math.min(Math.max(dt, 0), 0.1) * 3.5;
  if (foco !== null && foco === M.foco) M.rastro = Math.min(1, M.rastro + passoRastro);
  else {
    M.rastro = Math.max(0, M.rastro - passoRastro);
    if (M.rastro === 0) M.foco = foco;
  }

  const estreita = A < ESTREITA;
  // em tela estreita a imagem não cabe inteira: o quadro acompanha o viajante e, com uma linha em
  // foco, desliza até o meio do caminho entre ele e o poste (enquadrar segura as bordas)
  const olhar = M.foco === null ? vx : vx + (ixPoste(M.foco) - vx) * 0.5 * passo(0, 1, M.rastro);

  const { para, esc } = fundoImagem(T, f, ASPECTO, {
    surgir,
    fx: estreita ? olhar : 0.5,
    fy: 0.5,
    gama: 0.68,
    ajuste: ({ i, ix, iy, l, w, destaque }) => {
      if (iy < 0.45) {
        // céu: ponto de preto que sobe com o brilho do horizonte (e some nele, sem cortar os
        // morros), estrelas e a Via Láctea cintilando, nuvens lentas
        const ceu = 1 - passo(0.36, 0.45, iy);
        l = l * (1 - ceu) + (Math.max(0, l - PRETO(iy)) * GANHO + Math.max(0, destaque - 0.02) * ESTRELAS) * ceu;
        if (destaque > 0.06) l *= 0.55 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1.2 + (i % 9) * 0.35) + i * 1.3));
        if (iy > 0.05 && iy < 0.35) l += 0.08 * passo(0.55, 0.8, fbm((ix - t * 0.01) * 5, iy * 14, 3)) * passo(0.05, 0.12, iy) * (1 - passo(0.28, 0.35, iy));
      }
      // chão: meios-tons levantados, a estrada aparece até o castelo
      if (iy > 0.55) l = Math.pow(Math.max(0, l), 0.85);
      // névoa correndo nos vales
      if (iy > 0.45 && iy < 0.68) l += 0.16 * passo(0.5, 0.82, fbm(ix * 7 - t * 0.04, iy * 25, 3)) * passo(0.45, 0.55, iy);
      // janelas do castelo
      if (w > 0.15 && Math.abs(ix - CASTELO.x) < 0.06) l *= 0.75 + 0.4 * ruido(i * 0.3 + t * 2, 2);
      return l;
    },
  });
  estrelasEspera(T, t, 0.35 * (1 - surgir));
  const e = (n: number) => n * esc;
  const px = Math.max(1, Math.round(rows / 45)); // pixel da fonte dos anos, em células

  // marcos: postes ao longo da estrada; acendem quando ele chega (ou quando a linha do ano está
  // em foco), com um clarão e fagulhas
  const postes = ANOS.map((ano, k) => {
    const ix = ixPoste(k);
    const pe = para(ix, meio(ix) - 0.02);
    const topo = pe.y - e(POSTE);
    const aceso = ix <= vx + 0.005 || foco === k;
    if (aceso && !M.aceso[k]) M.acendeu[k] = t;
    M.aceso[k] = aceso;
    const clarao = parado ? 0 : 1 - passo(0, 1, (t - M.acendeu[k]) / CLARAO);
    return { ano, ix, pe, topo, lx: pe.x + e(0.025), ly: topo + e(0.03), aceso, clarao };
  });
  postes.forEach(({ pe, topo, lx, ly, aceso, clarao }, k) => {
    traco(T, pe.x, pe.y, pe.x, topo, e(0.004), 0.22);
    traco(T, pe.x, topo, lx, topo, e(0.003), 0.22);
    if (aceso) chama(T, lx, ly + e(0.012), e(0.04) * (1 + clarao), e(0.009) * (1 + 0.5 * clarao), t, k * 20);
    else pontoMundo(T, lx, ly, 0.2);
  });

  // o rastro de luz pela estrada, do viajante até o poste em foco, com uma onda lenta indo até ele
  if (M.foco !== null && M.rastro > 0 && postes[M.foco]) {
    const de = vx;
    const ate = postes[M.foco].ix;
    const n = Math.max(1, Math.round(Math.abs(ate - de) / 0.02));
    for (let j = 0; j <= n; j++) {
      const ix = de + ((ate - de) * j) / n;
      const onda = 0.75 + 0.25 * Math.sin(j * 0.9 - t * 3);
      const r = para(ix, meio(ix) - 0.004);
      brasa(T, r.x, r.y, e(0.03), 0.12 * M.rastro * onda);
    }
  }

  // estrela cadente a cada 7s
  const ce = t % 7;
  if (ce < 0.8) {
    const k = ce / 0.8;
    const sx = A * (0.3 + 0.4 * ruido(Math.floor(t / 7), 5));
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

  // o viajante: pernas presas no quadril, que desce um pouco quando elas abrem (os pés ficam no
  // chão); o corpo pende para a frente andando e respira parado; braço e cajado no ombro; a
  // lanterna pende da mão como pêndulo
  const sprite = dados.figuras?.viajante;
  const fase = q * 90;
  const pe = para(vx, meio(vx) - 0.004);
  const escCorpo = e(ALTURA) / ALTURA_FOLHA;
  const op: OpcoesFigura = { esc: escCorpo * ESC_PERNAS };
  const oc: OpcoesFigura = { esc: escCorpo };
  const ob: OpcoesFigura = { esc: escCorpo * ESC_BRACO };
  const ol: OpcoesFigura = { esc: escCorpo * ESC_LANTERNA };
  const perna = PASSADA * Math.sin(fase) * anda;
  const folego = parado ? 0 : Math.sin(t * 2.2) * FOLEGO * e(ALTURA);
  const quadril = { x: pe.x, y: pe.y - PERNA * op.esc * Math.cos(perna) };
  const tras: Colocada = { parte: PERNA_TRAS, em: quadril, ang: perna };
  const frente: Colocada = { parte: PERNA_FRENTE, em: quadril, ang: -perna };
  const inclina = INCLINA * anda;
  const corpo: Colocada = { parte: CORPO, em: { x: quadril.x, y: quadril.y + folego }, ang: inclina };
  const braco: Colocada = { parte: BRACO, em: encaixar(corpo, OMBRO, oc), ang: inclina + BRACADA * Math.sin(fase) * anda };
  const sozinha = Math.sin(t * 2.1) * (BALANCO_PARADO + (BALANCO - BALANCO_PARADO) * anda);
  const lanterna: Colocada = { parte: LANTERNA, em: encaixar(braco, MAO, ob), ang: parado ? 0 : PENDULO * Math.sin(fase) * anda + sozinha };
  const tom = { gama: 0.65, brilho: surgir * BRILHO, contorno: CONTORNO * surgir };
  figura(T, sprite, [tras, frente], { ...op, ...tom });
  figura(T, sprite, [corpo], { ...oc, ...tom });
  figura(T, sprite, [braco], { ...ob, ...tom, cobertura: COBERTURA });
  // nada nele passa do teto (a lanterna e a luz dela é que brilham)
  const alt = e(ALTURA);
  cada(
    T,
    (_X, _Y, i) => {
      if (T.mat[i] === 5 && T.c.lum[i] > TETO) T.c.lum[i] = TETO;
    },
    { x0: pe.x - alt, x1: pe.x + alt, y0: pe.y - alt * 1.2, y1: pe.y + alt * 0.1 },
  );
  figura(T, sprite, [lanterna], { ...ol, ...tom, brilho: surgir * BRILHO_LANTERNA });

  // luzes, depois das figuras (caem nele também): os lampiões acesos, com o clarão de quem
  // acabou de acender, e a lanterna, tremendo com a vela
  postes.forEach(({ lx, ly, aceso, clarao }, k) => {
    if (!aceso) return;
    const tremor = 0.75 + 0.25 * ruido(t * 8 + k * 3, 1);
    luz(T, lx, ly, e(0.12) * tremor * (1 + 0.8 * clarao), 0.6 * tremor * (1 + clarao));
    if (clarao > 0) fagulhas(T, lx, ly, t, 8, e(0.06), e(0.02), clarao);
  });
  if (sprite) {
    const vela = encaixar(lanterna, VELA, ol);
    const tl = 0.8 + 0.2 * ruido(t * 9, 3);
    luz(T, vela.x, vela.y, e(0.1) * tl, 0.7 * tl);
  }

  // os anos em cima dos postes: no desktop cada poste tem o seu; em tela estreita só o primeiro
  // marco de cada ano, que acende (e brilha no clarão) com qualquer poste daquele ano
  postes.forEach(({ ano, pe, topo }, k) => {
    if (estreita && ANOS[k - 1] === ano) return;
    const acesos = (estreita ? postes.filter((o) => o.ano === ano) : [postes[k]]).filter((o) => o.aceso);
    const clarao = Math.max(0, ...acesos.map((o) => o.clarao));
    escrever(T, pe.x - e(0.03), topo - e(0.08) - (5 * px) / rows, ano, acesos.length ? 0.95 + 0.05 * clarao : 0.35, px, acesos.length ? 0.3 : 0);
  });

  lampiao(T, mouse, 0.4, 0.1);
  faiscas(T, cliques, t);
  return fechar(T.c);
};
