// geometria de um chunk: só as faces visíveis, com sombreamento por face e ambient occlusion
// (o "smooth lighting" que dá a cara do minecraft)

import * as THREE from "three";
import { AIR, ATLAS_COLS, ATLAS_ROWS, faceTile } from "./blocks";
import { CHUNK, World, get } from "./world";

// ordem das faces = a de faceTile: +x, -x, +y, -y, +z, -z
const FACES = [
  { dir: [1, 0, 0], shade: 0.7, corners: [[1, 1, 1, 0, 1], [1, 0, 1, 0, 0], [1, 1, 0, 1, 1], [1, 0, 0, 1, 0]] },
  { dir: [-1, 0, 0], shade: 0.7, corners: [[0, 1, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 1, 1, 0]] },
  { dir: [0, 1, 0], shade: 1.0, corners: [[0, 1, 1, 1, 1], [1, 1, 1, 0, 1], [0, 1, 0, 1, 0], [1, 1, 0, 0, 0]] },
  { dir: [0, -1, 0], shade: 0.5, corners: [[1, 0, 1, 1, 0], [0, 0, 1, 0, 0], [1, 0, 0, 1, 1], [0, 0, 0, 0, 1]] },
  { dir: [0, 0, 1], shade: 0.85, corners: [[0, 0, 1, 0, 0], [1, 0, 1, 1, 0], [0, 1, 1, 0, 1], [1, 1, 1, 1, 1]] },
  { dir: [0, 0, -1], shade: 0.85, corners: [[1, 0, 0, 0, 0], [0, 0, 0, 1, 0], [1, 1, 0, 0, 1], [0, 1, 0, 1, 1]] },
];

const AO = [0.45, 0.62, 0.8, 1];

export const buildChunk = (w: World, cx: number, cz: number) => {
  const pos: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const ind: number[] = [];
  // fora do mundo conta como sólido (get devolve rocha matriz): as bordas não geram faces
  const solid = (x: number, y: number, z: number) => (get(w, x, y, z) !== AIR ? 1 : 0);

  const x0 = cx * CHUNK, z0 = cz * CHUNK;
  for (let y = 0; y < w.sy; y++)
    for (let z = z0; z < z0 + CHUNK; z++)
      for (let x = x0; x < x0 + CHUNK; x++) {
        const id = get(w, x, y, z);
        if (id === AIR) continue;
        for (let f = 0; f < 6; f++) {
          const { dir, shade, corners } = FACES[f];
          const ax = x + dir[0], ay = y + dir[1], az = z + dir[2];
          if (solid(ax, ay, az)) continue;

          const t = faceTile(id, f);
          const u0 = (t % ATLAS_COLS) / ATLAS_COLS;
          const v0 = 1 - (Math.floor(t / ATLAS_COLS) + 1) / ATLAS_ROWS;
          const base = pos.length / 3;
          const ao: number[] = [];

          for (const [px, py, pz, u, v] of corners) {
            pos.push(x + px, y + py, z + pz);
            uv.push(u0 + (u * 0.998 + 0.001) / ATLAS_COLS, v0 + (v * 0.998 + 0.001) / ATLAS_ROWS);
            // ambient occlusion: 2 vizinhos laterais + diagonal no plano da face
            const off = [px * 2 - 1, py * 2 - 1, pz * 2 - 1];
            const t1 = [0, 0, 0], t2 = [0, 0, 0];
            const axes = [0, 1, 2].filter((a) => dir[a] === 0);
            t1[axes[0]] = off[axes[0]];
            t2[axes[1]] = off[axes[1]];
            const s1 = solid(ax + t1[0], ay + t1[1], az + t1[2]);
            const s2 = solid(ax + t2[0], ay + t2[1], az + t2[2]);
            const c = solid(ax + t1[0] + t2[0], ay + t1[1] + t2[1], az + t1[2] + t2[2]);
            const level = s1 && s2 ? 0 : 3 - (s1 + s2 + c);
            ao.push(level);
            const k = shade * AO[level];
            col.push(k, k, k);
          }
          // escolhe a diagonal que evita o "x" escuro do AO
          if (ao[0] + ao[3] > ao[1] + ao[2]) ind.push(base, base + 1, base + 3, base, base + 3, base + 2);
          else ind.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
        }
      }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(ind);
  g.computeBoundingSphere();
  return g;
};
