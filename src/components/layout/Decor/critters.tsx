"use client";

import Sketch, { SketchProps } from "@/src/components/ui/Sketch";

type Props = { size?: number; className?: string };

const INK = {
  stroke: "#241a12",
  strokeWidth: 4,
  roughness: 1.4,
};

const ink = (fill: string) => ({ ...INK, fill, fillStyle: "hachure" });

const solid = (fill: string) => ({
  ...INK,
  fill,
  fillStyle: "solid",
  strokeWidth: 2,
  roughness: 0.6,
});

const line = { ...INK, fill: "none" };
const dot = solid("#241a12");

const drawCat: SketchProps["draw"] = (rc) => {
  const c = ink("#ffb347");
  const inner = ink("#ff8c42");
  rc.path("M64 172 Q18 156 48 116", { ...line, strokeWidth: 6 });
  rc.ellipse(112, 158, 76, 52, c);
  rc.circle(112, 102, 46, c);
  rc.path("M86 80 L70 34 L112 58 Z", c);
  rc.path("M138 80 L154 34 L112 58 Z", c);
  rc.path("M92 72 L82 48 L106 62 Z", inner);
  rc.path("M132 72 L142 48 L118 62 Z", inner);
  rc.circle(97, 104, 6, dot);
  rc.circle(127, 104, 6, dot);
  rc.path("M104 116 L120 116 L112 126 Z", solid("#c0392b"));
  rc.path("M104 126 Q112 134 120 126", line);
  rc.line(84, 112, 52, 104, line);
  rc.line(84, 120, 50, 118, line);
  rc.line(140, 112, 172, 104, line);
  rc.line(140, 120, 174, 118, line);
};

const drawDuck: SketchProps["draw"] = (rc) => {
  const d = ink("#ffd23f");
  const wing = ink("#e6b82f");
  const beak = ink("#f57c00");
  rc.path("M48 154 Q16 148 30 122 Q36 108 52 108 L64 140", d);
  rc.ellipse(100, 162, 72, 52, d);
  rc.ellipse(102, 164, 28, 18, wing);
  rc.circle(154, 96, 34, d);
  rc.path(
    "M152 62 Q148 46 162 44 Q168 48 162 54 Q162 64 154 62 L152 62",
    d,
  );
  rc.path("M172 92 Q198 90 192 101 Q197 103 172 105 Z", beak);
  rc.circle(160, 90, 5, dot);
};

const drawMug: SketchProps["draw"] = (rc) => {
  const mug = ink("#d9c2a3");
  const steam = { ...line, strokeWidth: 5 };
  rc.path("M170 108 C198 108 198 158 170 158", {
    ...line,
    strokeWidth: 5,
  });
  rc.rectangle(38, 108, 128, 66, mug);
  rc.ellipse(102, 106, 132, 16, solid("#4a2c14"));
  rc.circle(76, 132, 5, dot);
  rc.circle(128, 132, 5, dot);
  rc.path("M84 144 Q102 152 120 144", line);
  rc.path("M84 88 q10 -14 0 -28 t0 -28", steam);
  rc.path("M110 86 q10 -14 0 -28 t0 -28", steam);
  rc.path("M136 88 q10 -14 0 -28 t0 -28", steam);
};

const drawTrash: SketchProps["draw"] = (rc) => {
  const t = ink("#5fa8d3");
  const lid = ink("#4e94c2");
  rc.path("M94 56 Q94 32 107 32 Q120 32 120 56", { ...line, strokeWidth: 5 });
  rc.rectangle(50, 56, 100, 24, lid);
  rc.path("M60 80 L68 182 L132 182 L140 80 Z", t);
  rc.circle(86, 122, 6, dot);
  rc.circle(114, 122, 6, dot);
  rc.path("M90 140 Q100 152 110 140", line);
  rc.line(76, 80, 82, 180, line);
  rc.line(124, 80, 118, 180, line);
};

export const SketchCat = (props: Props) => (
  <Sketch {...props} draw={drawCat} />
);

export const SketchDuck = (props: Props) => (
  <Sketch {...props} draw={drawDuck} />
);

export const SketchMug = (props: Props) => (
  <Sketch {...props} draw={drawMug} />
);

export const SketchTrash = (props: Props) => (
  <Sketch {...props} draw={drawTrash} />
);