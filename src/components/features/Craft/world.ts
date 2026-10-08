// mundo do craft: blocos, geração procedural e texturas pixel-art (tudo em canvas)

export const AIR = 0;
export const GRASS = 1;
export const DIRT = 2;
export const STONE = 3;
export const LOG = 4;
export const LEAVES = 5;
export const BEDROCK = 6;
// minérios ocupam ORE_BASE + índice em ORES
export const ORE_BASE = 10;

export interface Ore {
  nome: string;
  lore: string;
  cor: string;
  // profundidade mínima (em blocos abaixo da superfície)
  fundo: number;
  veios: number;
}

// a stack do daniel, enterrada no mundo
export const ORES: Ore[] = [
  { nome: "Java", lore: "o primeiro item, desde 2020", cor: "#f89820", fundo: 1, veios: 10 },
  { nome: "Café", lore: "regenera +4 de foco", cor: "#d9a066", fundo: 1, veios: 10 },
  { nome: "TypeScript", lore: "tipo é documentação que compila", cor: "#3178c6", fundo: 4, veios: 8 },
  { nome: "React", lore: "encantado: re-render III", cor: "#61dafb", fundo: 4, veios: 8 },
  { nome: "Node.js", lore: "o lado de trás do balcão", cor: "#3c873a", fundo: 7, veios: 7 },
  { nome: "Next.js", lore: "este site roda nele", cor: "#ffffff", fundo: 9, veios: 6 },
  { nome: "PostgreSQL", lore: "onde os dados dormem", cor: "#9db8e8", fundo: 11, veios: 6 },
  { nome: "Flutter", lore: "web no bolso", cor: "#7c5cff", fundo: 12, veios: 6 },
  { nome: "Neovim", lore: "sim, eu sou desse tipo", cor: "#b4f000", fundo: 16, veios: 4 },
];

export const isOre = (id: number) => id >= ORE_BASE;

// golpes pra quebrar
export const hardness = (id: number) => {
  if (id === BEDROCK) return Infinity;
  if (isOre(id)) return 3;
  if (id === STONE || id === LOG) return 2;
  return 1;
};

// blocos que dá pra colocar (hotbar)
export const PLACEABLE = [
  { id: DIRT, nome: "terra" },
  { id: STONE, nome: "pedra" },
  { id: LOG, nome: "tronco" },
  { id: LEAVES, nome: "folhas" },
];

export const drop = (id: number) => (id === GRASS ? DIRT : id);

export interface World {
  w: number;
  h: number;
  tiles: Uint8Array;
  surface: Int16Array;
}

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const generate = (seed: number, w = 160, h = 64): World => {
  const rand = mulberry32(seed);
  const tiles = new Uint8Array(w * h);
  const surface = new Int16Array(w);
  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < w && y >= 0 && y < h) tiles[y * w + x] = id;
  };
  const get = (x: number, y: number) =>
    x >= 0 && x < w && y >= 0 && y < h ? tiles[y * w + x] : BEDROCK;

  // relevo: soma de senoides com fase aleatória
  const p = [rand() * 10, rand() * 10, rand() * 10];
  for (let x = 0; x < w; x++) {
    surface[x] = Math.round(
      20 + Math.sin(x * 0.05 + p[0]) * 4 + Math.sin(x * 0.13 + p[1]) * 2.2 + Math.sin(x * 0.31 + p[2]) * 0.9,
    );
    const s = surface[x];
    const dirt = s + 3 + Math.floor(rand() * 2);
    for (let y = s; y < h; y++) {
      set(x, y, y === s ? GRASS : y <= dirt ? DIRT : STONE);
    }
    set(x, h - 1, BEDROCK);
    if (rand() < 0.5) set(x, h - 2, BEDROCK);
  }

  // cavernas: minhocas aleatórias
  for (let c = 0; c < 9; c++) {
    let cx = rand() * w;
    let cy = 30 + rand() * (h - 38);
    let ang = rand() * Math.PI * 2;
    const len = 40 + rand() * 60;
    for (let i = 0; i < len; i++) {
      ang += (rand() - 0.5) * 0.6;
      cx += Math.cos(ang);
      cy += Math.sin(ang) * 0.5;
      const r = rand() < 0.3 ? 2 : 1;
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const tx = Math.round(cx + dx);
          const ty = Math.round(cy + dy);
          if (tx < 0 || tx >= w) continue;
          if (ty <= surface[tx] + 3 || ty >= h - 2) continue;
          set(tx, ty, AIR);
        }
    }
  }

  // minérios: veios em random walk, só substituem pedra
  ORES.forEach((ore, i) => {
    for (let v = 0; v < ore.veios; v++) {
      let x = Math.floor(rand() * w);
      const top = surface[x] + 4 + ore.fundo;
      if (top >= h - 3) continue;
      let y = top + Math.floor(rand() * (h - 3 - top));
      const size = 2 + Math.floor(rand() * 4);
      for (let k = 0; k < size; k++) {
        if (get(x, y) === STONE) set(x, y, ORE_BASE + i);
        x += Math.floor(rand() * 3) - 1;
        y += Math.floor(rand() * 3) - 1;
      }
    }
  });

  // árvores
  for (let x = 3; x < w - 3; x += 4 + Math.floor(rand() * 6)) {
    if (rand() < 0.35 || Math.abs(x - w / 2) < 3) continue;
    const s = surface[x];
    const tall = 4 + Math.floor(rand() * 2);
    for (let t = 1; t <= tall; t++) set(x, s - t, LOG);
    const top = s - tall;
    for (let dy = -2; dy <= 1; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const corner = Math.abs(dx) === 2 && (dy === -2 || dy === 1);
        if (corner && rand() < 0.7) continue;
        if (dy === -2 && Math.abs(dx) === 2) continue;
        if (get(x + dx, top + dy) === AIR) set(x + dx, top + dy, LEAVES);
      }
  }

  return { w, h, tiles, surface };
};

// ── texturas 16x16 geradas proceduralmente ──

const PAL: Record<number, string[]> = {
  [DIRT]: ["#8b5a2b", "#7a4e24", "#9b6a38", "#6b4220"],
  [STONE]: ["#8a8a8a", "#7d7d7d", "#999999", "#6e6e6e"],
  [LEAVES]: ["#3f8f2a", "#2f7a20", "#4fa33a", "#26651a"],
  [BEDROCK]: ["#333333", "#555555", "#222222", "#444444"],
};

const noise = (
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  pal: string[],
  y0 = 0,
  y1 = 16,
) => {
  for (let y = y0; y < y1; y++)
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = pal[Math.floor(rand() * pal.length)];
      ctx.fillRect(x, y, 1, 1);
    }
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

export const makeTextures = () => {
  const rand = mulberry32(42);
  const tex: Record<number, HTMLCanvasElement> = {};
  const make = (id: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    paint(c.getContext("2d")!);
    tex[id] = c;
  };

  make(DIRT, (ctx) => noise(ctx, rand, PAL[DIRT]));
  make(STONE, (ctx) => noise(ctx, rand, PAL[STONE]));
  make(LEAVES, (ctx) => noise(ctx, rand, PAL[LEAVES]));
  make(BEDROCK, (ctx) => noise(ctx, rand, PAL[BEDROCK]));
  make(GRASS, (ctx) => {
    noise(ctx, rand, PAL[DIRT]);
    const greens = ["#5fbf3a", "#4ea52f", "#6fd04a"];
    for (let x = 0; x < 16; x++) {
      const drip = 3 + Math.floor(rand() * 3);
      for (let y = 0; y < drip; y++) {
        ctx.fillStyle = greens[Math.floor(rand() * 3)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  make(LOG, (ctx) => {
    const browns = ["#6b4a2b", "#5a3d22", "#7c5733"];
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = x % 4 === 0 ? "#4a321c" : browns[Math.floor(rand() * 3)];
        ctx.fillRect(x, y, 1, 1);
      }
  });
  ORES.forEach((ore, i) =>
    make(ORE_BASE + i, (ctx) => {
      noise(ctx, rand, PAL[STONE]);
      for (let b = 0; b < 5; b++) {
        const x = 1 + Math.floor(rand() * 12);
        const y = 1 + Math.floor(rand() * 12);
        ctx.fillStyle = shade(ore.cor, 0.6);
        ctx.fillRect(x, y + 1, 3, 2);
        ctx.fillStyle = ore.cor;
        ctx.fillRect(x, y, 2, 2);
      }
    }),
  );

  return tex;
};
