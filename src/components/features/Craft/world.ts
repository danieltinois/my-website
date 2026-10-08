// mundo voxel 3D do craft: geração procedural e acesso aos blocos

import {
  AIR,
  BEDROCK,
  DIRT,
  GRASS,
  LEAVES,
  LOG,
  ORES,
  ORE_BASE,
  STONE,
  mulberry32,
} from "./blocks";

export const CHUNK = 16;

export interface World {
  sx: number; // largura (x)
  sy: number; // altura (y)
  sz: number; // profundidade (z)
  data: Uint8Array;
  height: Int16Array; // altura da superfície em (x, z)
}

export const idx = (w: World, x: number, y: number, z: number) => (y * w.sz + z) * w.sx + x;

export const get = (w: World, x: number, y: number, z: number) => {
  if (x < 0 || z < 0 || x >= w.sx || z >= w.sz || y < 0) return BEDROCK; // borda do mundo é sólida
  if (y >= w.sy) return AIR;
  return w.data[idx(w, x, y, z)];
};

export const set = (w: World, x: number, y: number, z: number, id: number) => {
  if (x < 0 || z < 0 || y < 0 || x >= w.sx || y >= w.sy || z >= w.sz) return;
  w.data[idx(w, x, y, z)] = id;
};

// ruído de valor 2D suave (interpolação cúbica) + oitavas
const valueNoise = (seed: number) => {
  const r = mulberry32(seed);
  const N = 256;
  const perm = new Uint8Array(N * 2);
  const vals = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    perm[i] = i;
    vals[i] = r();
  }
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < N; i++) perm[N + i] = perm[i];
  const lat = (x: number, z: number) => vals[perm[(perm[x & 255] + z) & 255]];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const n = (x: number, z: number) => {
    const x0 = Math.floor(x), z0 = Math.floor(z);
    const tx = smooth(x - x0), tz = smooth(z - z0);
    const a = lat(x0, z0), b = lat(x0 + 1, z0), c = lat(x0, z0 + 1), d = lat(x0 + 1, z0 + 1);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * tz;
  };
  return (x: number, z: number) =>
    n(x / 24, z / 24) * 0.6 + n(x / 10, z / 10) * 0.3 + n(x / 4, z / 4) * 0.1;
};

export const generate = (seed: number, sx = 80, sy = 48, sz = 80): World => {
  const w: World = { sx, sy, sz, data: new Uint8Array(sx * sy * sz), height: new Int16Array(sx * sz) };
  const r = mulberry32(seed);
  const noise = valueNoise(seed);

  // relevo: colinas suaves, mais baixas perto das bordas
  for (let z = 0; z < sz; z++)
    for (let x = 0; x < sx; x++) {
      const h = Math.floor(18 + noise(x, z) * 14);
      w.height[z * sx + x] = h;
      const dirtDepth = 3 + (r() < 0.5 ? 1 : 0);
      for (let y = 0; y <= h; y++) {
        let id = STONE;
        if (y === h) id = GRASS;
        else if (y > h - dirtDepth) id = DIRT;
        if (y === 0 || (y === 1 && r() < 0.5)) id = BEDROCK;
        set(w, x, y, z, id);
      }
    }

  // cavernas: minhocas 3D
  for (let c = 0; c < 14; c++) {
    let cx = r() * sx, cy = 6 + r() * 12, cz = r() * sz;
    let yaw = r() * Math.PI * 2, pitch = 0;
    const len = 50 + r() * 70;
    for (let i = 0; i < len; i++) {
      yaw += (r() - 0.5) * 0.5;
      pitch = Math.max(-0.4, Math.min(0.4, pitch + (r() - 0.5) * 0.2));
      cx += Math.cos(yaw) * Math.cos(pitch);
      cz += Math.sin(yaw) * Math.cos(pitch);
      cy += Math.sin(pitch);
      const rad = 1.2 + r() * 1.3;
      for (let dy = -2; dy <= 2; dy++)
        for (let dz = -3; dz <= 3; dz++)
          for (let dx = -3; dx <= 3; dx++) {
            if (dx * dx + dy * dy * 2 + dz * dz > rad * rad) continue;
            const x = Math.round(cx + dx), y = Math.round(cy + dy), z = Math.round(cz + dz);
            if (y <= 1 || x < 0 || z < 0 || x >= sx || z >= sz) continue;
            if (y >= w.height[z * sx + x] - 2) continue; // não fura a superfície
            set(w, x, y, z, AIR);
          }
    }
  }

  // minérios da stack em veios, só onde é pedra
  ORES.forEach((ore, i) => {
    for (let v = 0; v < ore.veios; v++) {
      let x = Math.floor(r() * sx), z = Math.floor(r() * sz);
      const top = w.height[z * sx + x] - 4 - ore.fundo;
      if (top < 3) continue;
      let y = 2 + Math.floor(r() * (top - 2));
      const size = 3 + Math.floor(r() * 4);
      for (let k = 0; k < size; k++) {
        if (get(w, x, y, z) === STONE) set(w, x, y, z, ORE_BASE + i);
        const axis = Math.floor(r() * 3), dir = r() < 0.5 ? -1 : 1;
        if (axis === 0) x += dir;
        else if (axis === 1) y += dir;
        else z += dir;
      }
    }
  });

  // carvalhos (copa no formato do jogo: 5x5 em duas camadas + 3x3 + cruz no topo)
  const cxm = sx / 2, czm = sz / 2;
  for (let t = 0; t < 70; t++) {
    const x = 3 + Math.floor(r() * (sx - 6)), z = 3 + Math.floor(r() * (sz - 6));
    if (Math.abs(x - cxm) < 3 && Math.abs(z - czm) < 3) continue; // spawn livre
    const h = w.height[z * sx + x];
    if (get(w, x, h, z) !== GRASS || get(w, x, h + 1, z) !== AIR) continue;
    const tall = 4 + Math.floor(r() * 3);
    for (let k = 1; k <= tall; k++) set(w, x, h + k, z, LOG);
    const top = h + tall;
    for (let dy = -2; dy <= 1; dy++) {
      const rad = dy <= -1 ? 2 : 1;
      for (let dz = -rad; dz <= rad; dz++)
        for (let dx = -rad; dx <= rad; dx++) {
          const corner = Math.abs(dx) === rad && Math.abs(dz) === rad;
          if (corner && (dy === 1 || r() < 0.5)) continue;
          if (get(w, x + dx, top + dy, z + dz) === AIR) set(w, x + dx, top + dy, z + dz, LEAVES);
        }
    }
    set(w, x, top + 1, z, LEAVES);
  }

  return w;
};

// ── raycast voxel (Amanatides & Woo) ──
export interface Hit {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
}

export const raycast = (
  w: World,
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  maxDist: number,
): Hit | null => {
  let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
  const stepX = Math.sign(dx), stepY = Math.sign(dy), stepZ = Math.sign(dz);
  const tdx = Math.abs(1 / dx), tdy = Math.abs(1 / dy), tdz = Math.abs(1 / dz);
  let tmx = dx > 0 ? (x + 1 - ox) * tdx : (ox - x) * tdx;
  let tmy = dy > 0 ? (y + 1 - oy) * tdy : (oy - y) * tdy;
  let tmz = dz > 0 ? (z + 1 - oz) * tdz : (oz - z) * tdz;
  let nx = 0, ny = 0, nz = 0;
  let t = 0;
  while (t <= maxDist) {
    const id = y >= 0 && y < w.sy && x >= 0 && z >= 0 && x < w.sx && z < w.sz ? w.data[idx(w, x, y, z)] : AIR;
    if (id !== AIR) return { x, y, z, nx, ny, nz };
    if (tmx < tmy && tmx < tmz) {
      x += stepX; t = tmx; tmx += tdx; nx = -stepX; ny = 0; nz = 0;
    } else if (tmy < tmz) {
      y += stepY; t = tmy; tmy += tdy; nx = 0; ny = -stepY; nz = 0;
    } else {
      z += stepZ; t = tmz; tmz += tdz; nx = 0; ny = 0; nz = -stepZ;
    }
  }
  return null;
};
