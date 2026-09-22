"use client";

import { useEffect, useState } from "react";

// mascote 2d — dev de argila com boné, 10x11 px
// C cap, H sombra do cap, S pele, E contorno/sombra, T camisa, W botão
const ROWS = [
  "..CCCCCC..",
  ".CHHHHHHC.",
  ".CHHHHHHC.",
  "..CCCCCC..",
  ".CSSSSSSC.",
  ".CSSSSSSC.", // olhos injetados no render (blink)
  ".CSSEESSC.",
  ".CTTTTTTC.",
  ".CTWTWTTC.",
  ".CTWTWTTC.",
  "..EEEEEE..",
];

const COLOR: Record<string, string> = {
  C: "#c1440e",
  H: "#7a3410",
  S: "#e8b07a",
  E: "#16100a",
  T: "#9c3a12",
  W: "#f0e2c8",
};

const Mascot = ({
  mood = "idle",
  className = "w-24 h-auto md:w-28",
}: {
  mood?: "idle" | "think" | "type" | "wave";
  className?: string;
}) => {
  const [awake, setAwake] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setAwake(false);
      setTimeout(() => setAwake(true), 200);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // pensando = olhar pra cima (pupila na linha de cima)
  const eyeY = mood === "think" ? 4 : 5;
  const anim =
    mood === "think"
      ? "mascot-think"
      : mood === "type"
        ? "mascot-type"
        : mood === "wave"
          ? "mascot-wave"
          : "retro-bob";

  return (
    <svg
      viewBox="0 0 10 11"
      shapeRendering="crispEdges"
      className={`${anim} mascot-pop ${className}`}
      aria-label="mascote dev de argila"
      role="img"
    >
      {ROWS.map((row, y) =>
        [...row].map((ch, x) => {
          // olhos (colunas 3 e 6): escuros abertos, pele quando pisca
          const isEye = y === eyeY && (x === 3 || x === 6);
          if (ch === ".") return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={isEye && awake ? COLOR.E : COLOR[ch]}
            />
          );
        }),
      )}
    </svg>
  );
};

export default Mascot;