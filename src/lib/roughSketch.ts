import rough from "roughjs";
import type { Drawable, Options } from "roughjs/bin/core";

export type Builder = {
  path: (d: string, o?: Options) => void;
  line: (x1: number, y1: number, x2: number, y2: number, o?: Options) => void;
  rectangle: (x: number, y: number, w: number, h: number, o?: Options) => void;
  ellipse: (x: number, y: number, w: number, h: number, o?: Options) => void;
  circle: (cx: number, cy: number, r: number, o?: Options) => void;
};

export const INK = {
  stroke: "#241a12",
  strokeWidth: 4,
  roughness: 1.4,
};

export const ink = (fill: string): Options => ({ ...INK, fill, fillStyle: "hachure" });

export const solid = (fill: string): Options => ({
  ...INK,
  fill,
  fillStyle: "solid",
  strokeWidth: 2,
  roughness: 0.6,
});

export const lineStyle = (extra?: Options): Options => ({
  ...INK,
  fill: "none",
  ...extra,
});

export const dot: Options = solid("#241a12");

const pathHtml = (p: { d: string; stroke: string; strokeWidth: number; fill?: string }) =>
  `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}"${
    p.fill ? ` fill="${p.fill}"` : ` fill="none"`
  } />`;

export const buildSvg = (draw: (b: Builder) => void, size: number, seed = 7): string => {
  const gen = rough.generator({ options: { seed } });
  const out: string[] = [];
  const add = (d: Drawable) => {
    for (const p of gen.toPaths(d)) out.push(pathHtml(p));
  };
  const b: Builder = {
    path: (d, o) => add(gen.path(d, o)),
    line: (x1, y1, x2, y2, o) => add(gen.line(x1, y1, x2, y2, o)),
    rectangle: (x, y, w, h, o) => add(gen.rectangle(x, y, w, h, o)),
    ellipse: (x, y, w, h, o) => add(gen.ellipse(x, y, w, h, o)),
    circle: (cx, cy, r, o) => add(gen.circle(cx, cy, r, o)),
  };
  draw(b);
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">${out.join("")}</svg>`;
};