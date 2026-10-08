// geometria de um chunk: só as faces visíveis, com sombreamento por face e ambient occlusion
// (o "smooth lighting" que dá a cara do minecraft). Sem alocação por vértice: roda bem no celular.

import * as THREE from "three";
import { AIR, ATLAS_COLS, ATLAS_ROWS, faceTile } from "./blocks";
import { CHUNK, World, idx } from "./world";

// ordem das faces = a de faceTile: +x, -x, +y, -y, +z, -z
// cada canto: [x, y, z, u, v]
const FACES = [
  { dir: [1, 0, 0], shade: 0.7, corners: [[1, 1, 1, 0, 1], [1, 0, 1, 0, 0], [1, 1, 0, 1, 1], [1, 0, 0, 1, 0]] },
  { dir: [-1, 0, 0], shade: 0.7, corners: [[0, 1, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 1, 1, 0]] },
  { dir: [0, 1, 0], shade: 1.0, corners: [[0, 1, 1, 1, 1], [1, 1, 1, 0, 1], [0, 1, 0, 1, 0], [1, 1, 0, 0, 0]] },
  { dir: [0, -1, 0], shade: 0.5, corners: [[1, 0, 1, 1, 0], [0, 0, 1, 0, 0], [1, 0, 0, 1, 1], [0, 0, 0, 0, 1]] },
  { dir: [0, 0, 1], shade: 0.85, corners: [[0, 0, 1, 0, 0], [1, 0, 1, 1, 0], [0, 1, 1, 0, 1], [1, 1, 1, 1, 1]] },
  { dir: [0, 0, -1], shade: 0.85, corners: [[1, 0, 0, 0, 0], [0, 0, 0, 1, 0], [1, 1, 0, 0, 1], [0, 1, 0, 1, 1]] },
];

const AO = [0.45, 0.62, 0.8, 1];

// pré-calcula, por face e canto, os deslocamentos dos 3 vizinhos usados no AO
// (2 laterais + diagonal, no plano à frente da face)
const AO_OFFSETS = FACES.map(({ dir, corners }) => {
  const axes = [0, 1, 2].filter((a) => dir[a] === 0);
  return corners.map((c) => {
    const t1 = [0, 0, 0], t2 = [0, 0, 0];
    t1[axes[0]] = c[axes[0]] * 2 - 1;
    t2[axes[1]] = c[axes[1]] * 2 - 1;
    return [
      t1[0], t1[1], t1[2],
      t2[0], t2[1], t2[2],
      t1[0] + t2[0], t1[1] + t2[1], t1[2] + t2[2],
    ];
  });
});

// buffers reaproveitados entre chunks (crescem sob demanda)
let cap = 0;
let pos = new Float32Array(0);
let uv = new Float32Array(0);
let col = new Float32Array(0);
let ind = new Uint32Array(0);
const ensure = (faces: number) => {
  if (faces <= cap) return;
  cap = Math.max(faces, cap * 2, 4096);
  const grow = <T extends Float32Array | Uint32Array>(old: T, size: number): T => {
    const n = new (old.constructor as { new (n: number): T })(size);
    n.set(old);
    return n;
  };
  pos = grow(pos, cap * 12);
  uv = grow(uv, cap * 8);
  col = grow(col, cap * 12);
  ind = grow(ind, cap * 6);
};

export const buildChunk = (w: World, cx: number, cz: number) => {
  const { sx, sy, sz, data } = w;
  // fora do mundo (laterais/fundo) conta como sólido: as bordas não geram faces
  const solid = (x: number, y: number, z: number) => {
    if (x < 0 || z < 0 || x >= sx || z >= sz || y < 0) return 1;
    if (y >= sy) return 0;
    return data[idx(w, x, y, z)] !== AIR ? 1 : 0;
  };

  const x0 = cx * CHUNK, z0 = cz * CHUNK;
  let faces = 0;
  ensure(4096);

  for (let y = 0; y < sy; y++)
    for (let z = z0; z < z0 + CHUNK; z++)
      for (let x = x0; x < x0 + CHUNK; x++) {
        const id = data[idx(w, x, y, z)];
        if (id === AIR) continue;
        for (let f = 0; f < 6; f++) {
          const face = FACES[f];
          const d = face.dir;
          const ax = x + d[0], ay = y + d[1], az = z + d[2];
          if (solid(ax, ay, az)) continue;

          ensure(faces + 1);
          const t = faceTile(id, f);
          const u0 = (t % ATLAS_COLS) / ATLAS_COLS;
          const v0 = 1 - (Math.floor(t / ATLAS_COLS) + 1) / ATLAS_ROWS;
          const vbase = faces * 4;
          const offs = AO_OFFSETS[f];
          let ao0 = 0, ao1 = 0, ao2 = 0, ao3 = 0;

          for (let k = 0; k < 4; k++) {
            const c = face.corners[k];
            const vi = vbase + k;
            pos[vi * 3] = x + c[0];
            pos[vi * 3 + 1] = y + c[1];
            pos[vi * 3 + 2] = z + c[2];
            uv[vi * 2] = u0 + (c[3] * 0.998 + 0.001) / ATLAS_COLS;
            uv[vi * 2 + 1] = v0 + (c[4] * 0.998 + 0.001) / ATLAS_ROWS;

            const o = offs[k];
            const s1 = solid(ax + o[0], ay + o[1], az + o[2]);
            const s2 = solid(ax + o[3], ay + o[4], az + o[5]);
            const cr = solid(ax + o[6], ay + o[7], az + o[8]);
            const level = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
            if (k === 0) ao0 = level;
            else if (k === 1) ao1 = level;
            else if (k === 2) ao2 = level;
            else ao3 = level;
            const b = face.shade * AO[level];
            col[vi * 3] = col[vi * 3 + 1] = col[vi * 3 + 2] = b;
          }

          // escolhe a diagonal que evita o "x" escuro do AO
          const ii = faces * 6;
          if (ao0 + ao3 > ao1 + ao2) {
            ind[ii] = vbase; ind[ii + 1] = vbase + 1; ind[ii + 2] = vbase + 3;
            ind[ii + 3] = vbase; ind[ii + 4] = vbase + 3; ind[ii + 5] = vbase + 2;
          } else {
            ind[ii] = vbase; ind[ii + 1] = vbase + 1; ind[ii + 2] = vbase + 2;
            ind[ii + 3] = vbase + 2; ind[ii + 4] = vbase + 1; ind[ii + 5] = vbase + 3;
          }
          faces++;
        }
      }

  const g = new THREE.BufferGeometry();
  // slice copia só o usado (os buffers globais continuam pro próximo chunk)
  g.setAttribute("position", new THREE.BufferAttribute(pos.slice(0, faces * 12), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv.slice(0, faces * 8), 2));
  g.setAttribute("color", new THREE.BufferAttribute(col.slice(0, faces * 12), 3));
  // índices de 16 bits quando cabem (metade da memória de vídeo)
  const used = ind.subarray(0, faces * 6);
  g.setIndex(new THREE.BufferAttribute(faces * 4 < 65536 ? Uint16Array.from(used) : used.slice(), 1));
  g.computeBoundingSphere();
  return g;
};
