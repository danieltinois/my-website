"use client";

import { useEffect, useState } from "react";

// sprite do mascote — dev de argila de corpo completo, 10 px de largura
// C cap, H sombra do cap, S pele, E contorno/sombra, T camisa, W botão
const ROWS = [
  "..CCCCCC..", // 0 cap
  ".CHHHHHHC.",
  ".CHHHHHHC.",
  "..CCCCCC..", // 3 aba do cap
  ".CSSSSSSC.", // 4 cara
  ".CSSSSSSC.", // 5 olhos (injetados no render, blink)
  ".CSSEESSC.", // 6 boca
  ".TTTTTTTT.", // 7 ombros
  "ETTTTTTTTE", // 8 braços pra fora
  "E.TTTTTT.E", // 9 braços + tronco
  ".ETTTTTTE.", // 10 quadril
  "...E.E...", // 11 pernas
  "...E.E...", // 12
  "..EEE.EEE.", // 13 sapatos
];

const COLOR: Record<string, string> = {
  C: "#c1440e",
  H: "#7a3410",
  S: "#e8b07a",
  E: "#16100a",
  T: "#9c3a12",
  W: "#f0e2c8",
};

// bug (5x4) que aparece pra levar espadada
const BG = ["EEEEE", "ERERE", "ERERE", "EEEEE"];

// espada: lâmina clara + guarda escura
const SW = [".....", "..W..", "..W..", "..W..", ".EWE.", ".E.E."];

type Mood = "idle" | "think" | "type" | "wave";

// gaveta por lado para animar braços e pernas
const isLeftArm = (x: number, y: number) =>
  (x === 0 && y >= 8 && y <= 9) || (x === 1 && y === 9);
const isRightArm = (x: number, y: number) =>
  (x === 9 && y >= 8 && y <= 9) || (x === 8 && y === 9);
const isLeftLeg = (x: number, y: number) => y >= 11 && x <= 4;
const isRightLeg = (x: number, y: number) => y >= 11 && x >= 6;

const Mascot = ({
  mood = "idle",
  sprint = false,
  bug = false,
  className = "w-24 md:w-28",
}: {
  mood?: Mood;
  sprint?: boolean;
  bug?: boolean;
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

  const bodyAnim = sprint
    ? "mascot-run"
    : bug
      ? "mascot-lunge"
      : mood === "think"
        ? "mascot-think"
        : mood === "type"
          ? "mascot-type"
          : mood === "wave"
            ? "mascot-wave"
            : "retro-bob";

  const legAnim = sprint ? "run" : bug ? "stance" : "";

  const partClass = (x: number, y: number) => {
    if (legAnim === "run") {
      if (isLeftLeg(x, y)) return "leg-run-left";
      if (isRightLeg(x, y)) return "leg-run-right";
      if (isLeftArm(x, y)) return "arm-run-left";
      if (isRightArm(x, y)) return "arm-run-right";
    }
    if (legAnim === "stance") {
      if (isLeftLeg(x, y)) return "leg-stance-left";
      if (isRightLeg(x, y)) return "leg-stance-right";
    }
    return "";
  };

  return (
    <div className={`relative mascot-pop ${className}`}>
      <svg
        viewBox={`0 0 10 ${ROWS.length}`}
        shapeRendering="crispEdges"
        className={`w-full h-auto ${bodyAnim}`}
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
                className={partClass(x, y)}
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

      {bug && (
        <>
          {/* espada: sobe da mão e gira na hora do golpe */}
          <svg
            viewBox="0 0 5 6"
            shapeRendering="crispEdges"
            className="mascot-sword absolute right-1 bottom-3 w-5"
            aria-hidden
          >
            {SW.map((row, y) =>
              [...row].map((ch, x) =>
                ch === "." ? null : (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={COLOR[ch]}
                  />
                ),
              ),
            )}
          </svg>
          {/* bug caminhando pra tomar a espadada */}
          <svg
            viewBox="0 0 5 4"
            shapeRendering="crispEdges"
            className="mascot-bug absolute -right-1 bottom-0 w-5"
            aria-hidden
          >
            {BG.map((row, y) =>
              [...row].map((ch, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={ch === "E" ? COLOR.E : "#d65d0e"}
                />
              )),
            )}
          </svg>
        </>
      )}
    </div>
  );
};

export default Mascot;