// Modo de contorno: caracteres soltos com papel de cor, sem imagem de luz por baixo. Hoje só
// as brasas do fundo usam este modo; as cenas usam o modo denso (denso.ts). O AsciiCanvas
// desenha os dois.

// Papéis de cor; o canvas resolve cada um para a variável do tema
export const Cor = { Vazio: 0, Faint: 1, Muted: 2, Ink: 3, Signal: 4, SignalDim: 5 } as const;
export type Cor = (typeof Cor)[keyof typeof Cor];

export interface Grade {
  cols: number;
  rows: number;
  ch: string[];
  co: Uint8Array;
}

export interface Entrada<D> {
  cols: number;
  rows: number;
  t: number;
  p: number;
  dados: D;
  mouse?: { u: number; v: number } | null;
}

export type Quadro<D = undefined> = (e: Entrada<D>) => Grade;

// ruído por célula e tempo, para tremular sem guardar estado
export const hash = (x: number, y: number, z = 0) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const nova = (cols: number, rows: number): Grade => ({
  cols,
  rows,
  ch: new Array(cols * rows).fill(" "),
  co: new Uint8Array(cols * rows),
});

export const put = (g: Grade, x: number, y: number, c: string, cor: Cor) => {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= g.cols || y >= g.rows || c === " ") return;
  g.ch[y * g.cols + x] = c;
  g.co[y * g.cols + x] = cor;
};

// prévia no terminal com cores ANSI (scripts/preview-scene.mts)
export const ansi = (g: Grade) => {
  const tom = ["", "\x1b[38;5;238m", "\x1b[38;5;246m", "\x1b[38;5;255m", "\x1b[38;5;208m", "\x1b[38;5;130m"];
  let s = "";
  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      const i = y * g.cols + x;
      s += g.co[i] ? `${tom[g.co[i]]}${g.ch[i]}\x1b[0m` : g.ch[i];
    }
    s += "\n";
  }
  return s;
};
