import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tela } from "./denso.ts";
import { estrelasEspera } from "./estrelas.ts";
import { amostrarSprite, encaixar, figura, prepararSprite, type Colocada, type Parte } from "./figura.ts";

type Px = [number, number, number];

const imagem = (w: number, h: number, px: (x: number, y: number) => Px) => {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = px(x, y);
      d.set([r, g, b, 255], (y * w + x) * 4);
    }
  }
  return d;
};

const VERDE: Px = [0, 255, 0];
const BRANCO: Px = [255, 255, 255];

const maxLum = (T: ReturnType<typeof tela>) => Math.max(...T.c.lum);

describe("prepararSprite", () => {
  it("pure green is transparent, red is opaque", () => {
    const s = prepararSprite(imagem(2, 1, (x) => (x === 0 ? VERDE : [255, 0, 0])), 2, 1);
    // a folha tem largura 2 (normalizada pela altura)
    assert.ok(Math.abs(amostrarSprite(s, 0, 0, 2, 1).a - 0.5) < 0.01);
    const dir = amostrarSprite(s, 1, 0, 2, 1);
    assert.ok(dir.a > 0.95);
    assert.ok(dir.L > 0.2);
  });

  it("green spill is removed", () => {
    const um = (px: Px) => amostrarSprite(prepararSprite(imagem(1, 1, () => px), 1, 1), 0, 0, 1, 1);
    const sujo = um([120, 150, 110]);
    // g é cortado em max(r, b) + 0,04: o mesmo que um pixel já no limite
    const limite = um([120, 131, 110]);
    assert.ok(sujo.a > 0.5);
    assert.ok(sujo.L <= limite.L + 1e-9);
    assert.ok(sujo.L < 0.2126 * (120 / 255) + 0.7152 * (150 / 255) + 0.0722 * (110 / 255));
  });
});

describe("amostrarSprite", () => {
  it("un-premultiplies", () => {
    const s = prepararSprite(imagem(2, 1, (x) => (x === 0 ? [128, 128, 128] : VERDE)), 2, 1);
    const m = amostrarSprite(s, 0, 0, 2, 1);
    assert.ok(Math.abs(m.L - 128 / 255) < 0.02);
    assert.ok(Math.abs(m.a - 0.5) < 0.01);
  });
});

const quadrado: Parte = { caixa: { x0: 0, y0: 0, x1: 1, y1: 1 }, pivo: { x: 0.5, y: 0.5 } };
const folhaBranca = () => prepararSprite(imagem(10, 10, () => BRANCO), 10, 10);
const centro = (T: ReturnType<typeof tela>): Colocada["em"] => ({ x: T.A / 2, y: 0.5 });

describe("figura", () => {
  it("no sprite is a no-op", () => {
    const T = tela(40, 20);
    figura(T, undefined, [{ parte: quadrado, em: centro(T), ang: 0 }], { esc: 0.5 });
    assert.equal(maxLum(T), 0);
  });

  it("places an opaque square", () => {
    const T = tela(40, 20);
    figura(T, folhaBranca(), [{ parte: quadrado, em: centro(T), ang: 0 }], { esc: 0.5 });
    assert.ok(T.c.lum[10 * 40 + 20] > 0.9);
    assert.equal(T.c.lum[0], 0);
    assert.equal(T.mat[10 * 40 + 20], 5);
    assert.equal(T.mat[0], 0);
  });

  it("rotation maps through the pivot", () => {
    // branca só na metade direita da folha
    const s = prepararSprite(imagem(10, 10, (x) => (x >= 5 ? BRANCO : VERDE)), 10, 10);
    const T = tela(40, 20);
    figura(T, s, [{ parte: quadrado, em: centro(T), ang: Math.PI }], { esc: 0.5 });
    const meio = 10 * 40;
    assert.ok(T.c.lum[meio + 17] > 0.9);
    assert.equal(T.c.lum[meio + 23], 0);
  });

  it("half coverage gives half alpha", () => {
    const T = tela(4, 2);
    // a célula (1,0) vai de X = A/4 a A/2 e de Y = 0 a 0,5; a parte cobre a metade de baixo dela
    const parte: Parte = { caixa: { x0: 0, y0: 0, x1: 1, y1: 1 }, pivo: { x: 0, y: 0 } };
    const esc = 0.25;
    figura(T, folhaBranca(), [{ parte, em: { x: T.A / 4, y: 0.25 }, ang: 0 }], { esc, gama: 1 });
    const v = T.c.lum[1];
    assert.ok(v > 0.3 && v < 0.7, `lum ${v}`);
  });

  it("never samples outside its box", () => {
    const s = prepararSprite(imagem(20, 10, (x) => (x < 10 ? BRANCO : [0, 0, 0])), 20, 10);
    const preta: Parte = { caixa: { x0: 1, y0: 0, x1: 2, y1: 1 }, pivo: { x: 1.5, y: 0.5 } };
    const T = tela(40, 20);
    figura(T, s, [{ parte: preta, em: centro(T), ang: 0.8 }], { esc: 0.5 });
    assert.ok(maxLum(T) < 0.05, `max ${maxLum(T)}`);
  });
});

describe("encaixar", () => {
  it("chains", () => {
    const c: Colocada = { parte: quadrado, em: { x: 1, y: 1 }, ang: 0 };
    const p = encaixar(c, { x: 1, y: 0.5 }, { esc: 2 });
    assert.ok(Math.abs(p.x - 2) < 1e-9 && Math.abs(p.y - 1) < 1e-9);
    const f = encaixar(c, { x: 1, y: 0.5 }, { esc: 2, flip: true });
    assert.ok(Math.abs(f.x - 0) < 1e-9 && Math.abs(f.y - 1) < 1e-9);
  });
});

describe("estrelasEspera", () => {
  it("lights a sparse field", () => {
    const T = tela(120, 40);
    estrelasEspera(T, 3);
    const acesas = T.c.lum.filter((l) => l > 0).length;
    assert.ok(acesas >= 40 && acesas <= 160, `${acesas} células`);
    assert.ok(maxLum(T) <= 0.5, `max ${maxLum(T)}`);
  });
});
