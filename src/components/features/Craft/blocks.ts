// blocos, itens, receitas e texturas do craft — sem three.js aqui (o hud usa sem carregar o motor)

export const AIR = 0;
export const GRASS = 1;
export const DIRT = 2;
export const STONE = 3;
export const COBBLE = 4;
export const LOG = 5;
export const LEAVES = 6;
export const PLANKS = 7;
export const TABLE = 8;
export const BEDROCK = 9;
export const FURNACE = 10;
// minérios da stack: ORE_BASE + índice em ORES
export const ORE_BASE = 20;
// itens que não são bloco
export const STICK = 100;
export const WOOD_PICK = 101;
export const STONE_PICK = 102;
export const TROPHY = 103;

export interface Ore {
  nome: string;
  lore: string;
  cor: string;
  fundo: number; // blocos abaixo da superfície
  veios: number;
}

export const ORES: Ore[] = [
  { nome: "Java", lore: "o primeiro item, desde 2020", cor: "#f89820", fundo: 2, veios: 14 },
  { nome: "Café", lore: "regenera +4 de foco", cor: "#e0a15e", fundo: 2, veios: 14 },
  { nome: "TypeScript", lore: "tipo é documentação que compila", cor: "#3178c6", fundo: 5, veios: 12 },
  { nome: "React", lore: "encantado: re-render III", cor: "#61dafb", fundo: 5, veios: 12 },
  { nome: "Node.js", lore: "o lado de trás do balcão", cor: "#5fa04e", fundo: 8, veios: 10 },
  { nome: "Next.js", lore: "este site roda nele", cor: "#f2f2f2", fundo: 9, veios: 10 },
  { nome: "PostgreSQL", lore: "onde os dados dormem", cor: "#7aa5e8", fundo: 10, veios: 9 },
  { nome: "Flutter", lore: "web no bolso", cor: "#8a6cff", fundo: 11, veios: 9 },
  { nome: "Neovim", lore: "sim, eu sou desse tipo", cor: "#b4f000", fundo: 14, veios: 7 },
];

export const isOre = (id: number) => id >= ORE_BASE && id < ORE_BASE + ORES.length;
export const isBlock = (id: number) => id > AIR && id < STICK;
export const isPick = (id: number) => id === WOOD_PICK || id === STONE_PICK;

export const NAMES: Record<number, string> = {
  [GRASS]: "Bloco de grama",
  [DIRT]: "Terra",
  [STONE]: "Pedra",
  [COBBLE]: "Pedregulho",
  [LOG]: "Tronco de carvalho",
  [LEAVES]: "Folhas de carvalho",
  [PLANKS]: "Tábuas de carvalho",
  [TABLE]: "Bancada de trabalho",
  [BEDROCK]: "Rocha matriz",
  [FURNACE]: "Fornalha",
  [STICK]: "Graveto",
  [WOOD_PICK]: "Picareta de madeira",
  [STONE_PICK]: "Picareta de pedra",
  [TROPHY]: "Troféu Full Stack",
};
ORES.forEach((o, i) => (NAMES[ORE_BASE + i] = `Minério de ${o.nome}`));

export const maxStack = (id: number) => (isPick(id) || id === TROPHY ? 1 : 64);

// ── quebrar ──
const HARD: Record<number, number> = {
  [GRASS]: 0.6,
  [DIRT]: 0.5,
  [STONE]: 1.5,
  [COBBLE]: 2,
  [LOG]: 2,
  [LEAVES]: 0.2,
  [PLANKS]: 2,
  [TABLE]: 2.5,
  [FURNACE]: 3.5,
};
export const needsPick = (id: number) =>
  id === STONE || id === COBBLE || id === FURNACE || isOre(id);

// segundos pra quebrar, dado o item na mão (regras simplificadas do minecraft)
export const breakTime = (id: number, tool: number) => {
  if (id === BEDROCK) return Infinity;
  const hard = isOre(id) ? 3 : (HARD[id] ?? 1);
  if (!needsPick(id)) return hard * 1.5;
  if (tool === STONE_PICK) return (hard * 1.5) / 4;
  if (tool === WOOD_PICK) return (hard * 1.5) / 2;
  return hard * 5;
};

// o que cai (null = nada)
export const dropOf = (id: number, tool: number): number | null => {
  if (needsPick(id) && !isPick(tool)) return null;
  if (id === GRASS) return DIRT;
  if (id === STONE) return COBBLE;
  if (id === LEAVES) return Math.random() < 0.1 ? STICK : null;
  return id;
};

// ── receitas ──
export interface Recipe {
  out: number;
  n: number;
  shape?: string[];
  key?: Record<string, number>;
  shapeless?: number[];
}

const ORE_KEYS = "JCTRNXPFV";

export const RECIPES: Recipe[] = [
  { out: PLANKS, n: 4, shapeless: [LOG] },
  { out: STICK, n: 4, shape: ["P", "P"], key: { P: PLANKS } },
  { out: TABLE, n: 1, shape: ["PP", "PP"], key: { P: PLANKS } },
  { out: WOOD_PICK, n: 1, shape: ["PPP", " S ", " S "], key: { P: PLANKS, S: STICK } },
  { out: STONE_PICK, n: 1, shape: ["CCC", " S ", " S "], key: { C: COBBLE, S: STICK } },
  { out: FURNACE, n: 1, shape: ["CCC", "C C", "CCC"], key: { C: COBBLE } },
  // easter egg: a stack inteira vira o troféu
  { out: TROPHY, n: 1, shapeless: ORE_KEYS.split("").map((_, i) => ORE_BASE + i) },
];

// grade quadrada (2x2 ou 3x3) de ids (0 = vazio) → receita que bate
export const matchRecipe = (grid: number[], size: number): Recipe | null => {
  const filled = grid.filter((g) => g !== 0);
  if (!filled.length) return null;

  // recorta a grade até o retângulo ocupado
  let minX = size, minY = size, maxX = -1, maxY = -1;
  grid.forEach((g, i) => {
    if (!g) return;
    const x = i % size, y = Math.floor(i / size);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  });
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const at = (x: number, y: number) => grid[(minY + y) * size + minX + x];

  for (const r of RECIPES) {
    if (r.shapeless) {
      const need = [...r.shapeless].sort();
      const have = [...filled].sort();
      if (need.length === have.length && need.every((v, i) => v === have[i])) return r;
      continue;
    }
    const shape = r.shape!;
    if (shape.length !== h || shape[0].length !== w) continue;
    let ok = true;
    for (let y = 0; y < h && ok; y++)
      for (let x = 0; x < w && ok; x++) {
        const ch = shape[y][x];
        const want = ch === " " ? 0 : r.key![ch];
        if (at(x, y) !== want) ok = false;
      }
    if (ok) return r;
  }
  return null;
};

// ── texturas 16x16 no estilo do minecraft ──

export const TILES = [
  "grass_top", "grass_side", "dirt", "stone", "cobble", "log_side", "log_top", "leaves",
  "planks", "table_top", "table_side", "table_front", "bedrock", "furnace_front", "furnace_side", "furnace_top",
  ...ORES.map((_, i) => `ore_${i}`),
] as const;
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = Math.ceil(TILES.length / ATLAS_COLS);
const tile = (name: string) => TILES.indexOf(name as (typeof TILES)[number]);

// face: 0 +x, 1 -x, 2 topo, 3 base, 4 +z, 5 -z
export const faceTile = (id: number, face: number): number => {
  const side = face !== 2 && face !== 3;
  switch (id) {
    case GRASS:
      return face === 2 ? tile("grass_top") : face === 3 ? tile("dirt") : tile("grass_side");
    case DIRT: return tile("dirt");
    case STONE: return tile("stone");
    case COBBLE: return tile("cobble");
    case LOG: return side ? tile("log_side") : tile("log_top");
    case LEAVES: return tile("leaves");
    case PLANKS: return tile("planks");
    case TABLE:
      if (face === 2) return tile("table_top");
      if (face === 3) return tile("planks");
      return face === 4 || face === 5 ? tile("table_front") : tile("table_side");
    case BEDROCK: return tile("bedrock");
    case FURNACE:
      if (!side) return tile("furnace_top");
      return face === 4 ? tile("furnace_front") : tile("furnace_side");
    default:
      return isOre(id) ? tile(`ore_${id - ORE_BASE}`) : tile("stone");
  }
};

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, x: number, y: number, color: string) => {
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
};
const pick = (r: () => number, pal: string[]) => pal[Math.floor(r() * pal.length)];
const fillNoise = (c: Ctx, r: () => number, pal: string[], y0 = 0, y1 = 16) => {
  for (let y = y0; y < y1; y++) for (let x = 0; x < 16; x++) px(c, x, y, pick(r, pal));
};

const DIRT_PAL = ["#966c4a", "#866043", "#79553a", "#966c4a", "#593d29", "#b9855c"];
const STONE_PAL = ["#7f7f7f", "#7a7a7a", "#8a8a8a", "#747474", "#686868", "#949494"];
const GRASS_PAL = ["#6ca530", "#5f9a2a", "#7cb83c", "#5b8e28", "#88c447"];
const PLANK_PAL = ["#b8945f", "#ad8a56", "#c29e68", "#a6824f"];

const paintPlanks = (c: Ctx, r: () => number) => {
  fillNoise(c, r, PLANK_PAL);
  for (let y = 0; y < 16; y++) {
    if (y % 4 === 3) for (let x = 0; x < 16; x++) px(c, x, y, "#7a5c34");
  }
  // emendas verticais, uma por tábua em posições diferentes
  [3, 11, 6, 14].forEach((sx, row) => {
    for (let y = row * 4; y < row * 4 + 3; y++) px(c, sx, y, "#8f6f42");
  });
};

const paintStone = (c: Ctx, r: () => number) => {
  fillNoise(c, r, STONE_PAL);
  for (let i = 0; i < 6; i++) {
    const y = Math.floor(r() * 16), x = Math.floor(r() * 12);
    for (let k = 0; k < 3 + Math.floor(r() * 3); k++) px(c, (x + k) % 16, y, "#6a6a6a");
  }
};

const painters: Record<string, (c: Ctx, r: () => number) => void> = {
  dirt: (c, r) => fillNoise(c, r, DIRT_PAL),
  grass_top: (c, r) => fillNoise(c, r, GRASS_PAL),
  grass_side: (c, r) => {
    fillNoise(c, r, DIRT_PAL);
    for (let x = 0; x < 16; x++) {
      const d = 3 + (r() < 0.5 ? 1 : 0) + (r() < 0.25 ? 1 : 0);
      for (let y = 0; y < d; y++) px(c, x, y, pick(r, GRASS_PAL));
    }
  },
  stone: paintStone,
  cobble: (c, r) => {
    c.fillStyle = "#555555";
    c.fillRect(0, 0, 16, 16);
    const stones = [
      [0, 0, 6, 5], [7, 0, 5, 4], [13, 0, 3, 5], [0, 6, 4, 5], [5, 5, 6, 5],
      [12, 6, 4, 4], [0, 12, 7, 4], [8, 11, 4, 5], [13, 11, 3, 5],
    ];
    for (const [x, y, w, h] of stones) {
      for (let yy = y; yy < y + h; yy++)
        for (let xx = x; xx < x + w; xx++) {
          if (xx > 15 || yy > 15) continue;
          const edgeTL = xx === x || yy === y;
          const edgeBR = xx === x + w - 1 || yy === y + h - 1;
          px(c, xx, yy, edgeTL ? "#a5a5a5" : edgeBR ? "#5f5f5f" : pick(r, ["#8b8b8b", "#7e7e7e", "#959595"]));
        }
    }
  },
  log_side: (c, r) => {
    for (let x = 0; x < 16; x++) {
      const dark = x % 4 === 1 || r() < 0.15;
      for (let y = 0; y < 16; y++)
        px(c, x, y, dark ? pick(r, ["#4a3822", "#3f2f1c"]) : pick(r, ["#6b5333", "#5e482c", "#76603d"]));
    }
  },
  log_top: (c) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
        if (d > 7) px(c, x, y, "#5e482c");
        else px(c, x, y, Math.floor(d) % 2 ? "#a3845a" : "#b8945f");
      }
  },
  leaves: (c, r) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++)
        px(c, x, y, r() < 0.12 ? "#1f4210" : pick(r, ["#3b7a1e", "#4a9227", "#2f6418", "#55a42f"]));
  },
  planks: paintPlanks,
  table_top: (c, r) => {
    paintPlanks(c, r);
    c.fillStyle = "#5a4127";
    c.fillRect(0, 0, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16);
    c.fillRect(5, 1, 1, 14); c.fillRect(10, 1, 1, 14); c.fillRect(1, 5, 14, 1); c.fillRect(1, 10, 14, 1);
  },
  table_side: (c, r) => {
    paintPlanks(c, r);
    c.fillStyle = "#5a4127";
    c.fillRect(0, 0, 16, 3);
    // serrote
    c.fillStyle = "#9a9a9a"; c.fillRect(3, 6, 7, 2);
    c.fillStyle = "#6b4a2b"; c.fillRect(10, 5, 3, 4);
  },
  table_front: (c, r) => {
    paintPlanks(c, r);
    c.fillStyle = "#5a4127";
    c.fillRect(0, 0, 16, 3);
    // martelo e tesoura
    c.fillStyle = "#8a8a8a"; c.fillRect(3, 5, 4, 3);
    c.fillStyle = "#6b4a2b"; c.fillRect(4, 8, 2, 5);
    c.fillStyle = "#b0b0b0"; c.fillRect(10, 6, 1, 6); c.fillRect(12, 6, 1, 6);
  },
  bedrock: (c, r) => {
    for (let y = 0; y < 16; y += 2)
      for (let x = 0; x < 16; x += 2) {
        c.fillStyle = pick(r, ["#575757", "#2b2b2b", "#3d3d3d", "#7a7a7a", "#1e1e1e"]);
        c.fillRect(x, y, 2, 2);
      }
  },
  furnace_side: (c, r) => fillNoise(c, r, ["#7a7a7a", "#727272", "#838383", "#6c6c6c"]),
  furnace_top: (c, r) => {
    fillNoise(c, r, ["#7a7a7a", "#727272", "#838383"]);
    c.fillStyle = "#5a5a5a";
    c.fillRect(0, 0, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16);
  },
  furnace_front: (c, r) => {
    painters.cobble(c, r);
    c.fillStyle = "#1d1d1d"; c.fillRect(4, 8, 8, 5);
    c.fillStyle = "#3a3a3a"; c.fillRect(3, 7, 10, 1);
    c.fillStyle = "#4a4a4a"; c.fillRect(4, 3, 8, 2);
  },
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

ORES.forEach((ore, i) => {
  painters[`ore_${i}`] = (c, r) => {
    paintStone(c, r);
    // aglomerados irregulares, com sombra e brilho, igual aos minérios do jogo
    const spots = [[3, 2], [10, 3], [2, 9], [8, 8], [12, 11], [5, 13]];
    for (const [sx, sy] of spots) {
      if (r() < 0.2) continue;
      const cells = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [1, 2]].filter(() => r() < 0.8);
      for (const [dx, dy] of cells) px(c, sx + dx, sy + dy, ore.cor);
      px(c, sx + 1, sy + 2, shade(ore.cor, 0.55));
      px(c, sx, sy, shade(ore.cor, 1.35));
    }
  };
});

let texCache: Record<string, HTMLCanvasElement> | null = null;

export const textures = () => {
  if (texCache) return texCache;
  const out: Record<string, HTMLCanvasElement> = {};
  TILES.forEach((name, i) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 16;
    painters[name](cv.getContext("2d")!, mulberry32(1000 + i * 77));
    out[name] = cv;
  });
  texCache = out;
  return out;
};

export const atlas = () => {
  const tex = textures();
  const cv = document.createElement("canvas");
  cv.width = ATLAS_COLS * 16;
  cv.height = ATLAS_ROWS * 16;
  const c = cv.getContext("2d")!;
  TILES.forEach((name, i) => c.drawImage(tex[name], (i % ATLAS_COLS) * 16, Math.floor(i / ATLAS_COLS) * 16));
  return cv;
};

// ── ícones do inventário: cubo isométrico (blocos) ou sprite pixel-art (itens) ──

const SPRITES: Record<number, { map: string[]; pal: Record<string, string> }> = {
  [STICK]: {
    map: [
      "............Ss..",
      "...........Ss...",
      "..........Ss....",
      ".........Ss.....",
      "........Ss......",
      ".......Ss.......",
      "......Ss........",
      ".....Ss.........",
      "....Ss..........",
      "...Ss...........",
      "..Ss............",
      ".Ss.............",
    ],
    pal: { S: "#5e482c", s: "#8f6f42" },
  },
  [WOOD_PICK]: {
    map: [
      "...HHHHHHH......",
      "..HhhhhhhhH.....",
      "...HHHHhhhhH....",
      ".......SHhhH....",
      "......SsS.HhH...",
      ".....SsS...HhH..",
      "....SsS.....HH..",
      "...SsS..........",
      "..SsS...........",
      ".SsS............",
      "SsS.............",
      "sS..............",
    ],
    pal: { H: "#6b5333", h: "#b8945f", S: "#4a3822", s: "#8f6f42" },
  },
  [STONE_PICK]: {
    map: [
      "...HHHHHHH......",
      "..HhhhhhhhH.....",
      "...HHHHhhhhH....",
      ".......SHhhH....",
      "......SsS.HhH...",
      ".....SsS...HhH..",
      "....SsS.....HH..",
      "...SsS..........",
      "..SsS...........",
      ".SsS............",
      "SsS.............",
      "sS..............",
    ],
    pal: { H: "#4f4f4f", h: "#9a9a9a", S: "#4a3822", s: "#8f6f42" },
  },
  [TROPHY]: {
    map: [
      "..YYYYYYYYYYYY..",
      ".Y.YyyyyyyyyY.Y.",
      ".Y.YyyyyyyyyY.Y.",
      "..YYyyyyyyyyYY..",
      "....YyyyyyyY....",
      ".....YyyyyY.....",
      "......YyyY......",
      ".......YY.......",
      ".......YY.......",
      "......YYYY......",
      ".....DDDDDD.....",
      ".....DDDDDD.....",
    ],
    pal: { Y: "#c98a00", y: "#ffd83d", D: "#5e482c" },
  },
};

const iconCache = new Map<number, string>();

export const iconOf = (id: number): string => {
  const hit = iconCache.get(id);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 32;
  const c = cv.getContext("2d")!;
  c.imageSmoothingEnabled = false;

  const sprite = SPRITES[id];
  if (sprite) {
    sprite.map.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const col = sprite.pal[ch];
        if (col) {
          c.fillStyle = col;
          c.fillRect(x * 2, (y + 2) * 2, 2, 2);
        }
      }),
    );
  } else {
    const tex = textures();
    const t = (face: number) => tex[TILES[faceTile(id, face)]];
    const face = (img: HTMLCanvasElement, m: number[], dark: number) => {
      c.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      c.drawImage(img, 0, 0);
      if (dark) {
        c.fillStyle = `rgba(0,0,0,${dark})`;
        c.fillRect(0, 0, 16, 16);
      }
    };
    face(t(2), [1, -0.5, 1, 0.5, 0, 8], 0);
    face(t(4), [1, 0.5, 0, 1, 0, 8], 0.22);
    face(t(0), [1, -0.5, 0, 1, 16, 16], 0.4);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  const url = cv.toDataURL();
  iconCache.set(id, url);
  return url;
};

// rachaduras (10 estágios), desenhadas uma vez
export const crackStages = () =>
  Array.from({ length: 10 }, (_, s) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 16;
    const c = cv.getContext("2d")!;
    const r = mulberry32(7);
    c.fillStyle = "rgba(0,0,0,0.75)";
    const n = 6 + s * 9;
    for (let i = 0; i < n; i++) {
      // rachaduras partem do centro e se espalham
      const a = r() * Math.PI * 2;
      const d = r() * (2 + s * 0.7);
      c.fillRect(Math.round(7.5 + Math.cos(a) * d), Math.round(7.5 + Math.sin(a) * d), 1, 1);
    }
    return cv;
  });
