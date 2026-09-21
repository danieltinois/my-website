import { buildSvg, dot, ink, lineStyle, solid } from "@/src/lib/roughSketch";

export const trashSvg = (size = 92) =>
  buildSvg((b) => {
    const t = ink("#5fa8d3");
    const lid = ink("#4e94c2");
    b.path("M94 56 Q94 32 107 32 Q120 32 120 56", lineStyle({ strokeWidth: 5 }));
    b.rectangle(50, 56, 100, 24, lid);
    b.path("M60 80 L68 182 L132 182 L140 80 Z", t);
    b.circle(86, 122, 6, dot);
    b.circle(114, 122, 6, dot);
    b.path("M90 140 Q100 152 110 140", lineStyle());
    b.line(76, 80, 82, 180, lineStyle());
    b.line(124, 80, 118, 180, lineStyle());
  }, size, 1);

export const mugSvg = (size = 130) =>
  buildSvg((b) => {
    const mug = ink("#d9c2a3");
    const steam = lineStyle({ strokeWidth: 5 });
    b.path("M170 108 C198 108 198 158 170 158", lineStyle({ strokeWidth: 5 }));
    b.rectangle(38, 108, 128, 66, mug);
    b.ellipse(102, 106, 132, 16, solid("#4a2c14"));
    b.circle(76, 132, 5, dot);
    b.circle(128, 132, 5, dot);
    b.path("M84 144 Q102 152 120 144", lineStyle());
    b.path("M84 88 q10 -14 0 -28 t0 -28", steam);
    b.path("M110 86 q10 -14 0 -28 t0 -28", steam);
    b.path("M136 88 q10 -14 0 -28 t0 -28", steam);
  }, size, 2);

export const duckSvg = (size = 120) =>
  buildSvg((b) => {
    const d = ink("#ffd23f");
    const wing = ink("#e6b82f");
    const beak = ink("#f57c00");
    b.path("M48 154 Q16 148 30 122 Q36 108 52 108 L64 140", d);
    b.ellipse(100, 162, 72, 52, d);
    b.ellipse(102, 164, 28, 18, wing);
    b.circle(154, 96, 34, d);
    b.path("M152 62 Q148 46 162 44 Q168 48 162 54 Q162 64 154 62 L152 62", d);
    b.path("M172 92 Q198 90 192 101 Q197 103 172 105 Z", beak);
    b.circle(160, 90, 5, dot);
  }, size, 3);

export const catSvg = (size = 140) =>
  buildSvg((b) => {
    const c = ink("#ffb347");
    const inner = ink("#ff8c42");
    b.path("M64 172 Q18 156 48 116", lineStyle({ strokeWidth: 6 }));
    b.ellipse(112, 158, 76, 52, c);
    b.circle(112, 102, 46, c);
    b.path("M86 80 L70 34 L112 58 Z", c);
    b.path("M138 80 L154 34 L112 58 Z", c);
    b.path("M92 72 L82 48 L106 62 Z", inner);
    b.path("M132 72 L142 48 L118 62 Z", inner);
    b.circle(97, 104, 6, dot);
    b.circle(127, 104, 6, dot);
    b.path("M104 116 L120 116 L112 126 Z", solid("#c0392b"));
    b.path("M104 126 Q112 134 120 126", lineStyle());
    b.line(84, 112, 52, 104, lineStyle());
    b.line(84, 120, 50, 118, lineStyle());
    b.line(140, 112, 172, 104, lineStyle());
    b.line(140, 120, 174, 118, lineStyle());
  }, size, 4);