"use client";

import { useEffect, useState } from "react";

// sprite do mascote — cavaleiro de argila (vibe metroidvania/hollow knight)
// 12 px de largura: cabeça com chifres + corpo esguio
// E contorno (sombra), H corpo, A ponta do chifre, W olhos
const ROWS = [
  "...A....A...", // 0 pontas dos chifres
  "..EH....HE..", // 1 chifres
  ".EHHHHHHHHE.", // 2 cabeça
  ".EHHHHHHHHE.", // 3
  ".EHHWHHWHHE.", // 4 olhos (blink no render)
  ".EHHHHHHHHE.", // 5 queixo
  "..EHHHHHHE..", // 6 pescoço
  "..EHHHHHHE..", // 7 ombros
  "..EHHHHHHE..", // 8 braços (x2/x9, animam)
  "..EHHHHHHE..", // 9 braços
  "...EHHHHE...", // 10 tronco
  "...EHHHHE...", // 11 cintura
  "....E.E.....", // 12 pernas
  "..EEE.EEE...", // 13 sapatos
];

const COLOR: Record<string, string> = {
  A: "#c1440e",
  H: "#3a2415",
  E: "#16100a",
  W: "#f0e2c8",
};

// bug (5x4) que aparece pra levar espadada
const BG = ["EEEEE", "ERERE", "ERERE", "EEEEE"];

// espada: lâmina clara + guarda escura
const SW = [".....", "..W..", "..W..", "..W..", ".EWE.", ".E.E."];

type Mood = "idle" | "think" | "type" | "wave";

// gaveta por lado para animar braços e pernas
const isLeftArm = (x: number, y: number) => x === 2 && (y === 8 || y === 9);
const isRightArm = (x: number, y: number) => x === 9 && (y === 8 || y === 9);
const isLeftLeg = (x: number, y: number) =>
  (y === 12 && x === 4) || (y === 13 && x >= 2 && x <= 4);
const isRightLeg = (x: number, y: number) =>
  (y === 12 && x === 6) || (y === 13 && x >= 6 && x <= 8);

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
  const eyeY = mood === "think" ? 3 : 4;

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
        viewBox={`0 0 12 ${ROWS.length}`}
        shapeRendering="crispEdges"
        className={`w-full h-auto ${bodyAnim}`}
        aria-label="mascote cavaleiro de argila"
        role="img"
      >
        {ROWS.map((row, y) =>
          [...row].map((ch, x) => {
            if (ch === ".") return null;
            // olhos (x4/x7 na linha eyeY): cream abertos, tom do corpo piscado
            const isEye = y === eyeY && (x === 4 || x === 7);
            const fill = isEye ? (awake ? COLOR.W : COLOR.H) : COLOR[ch];
            return (
              <rect
                key={`${x}-${y}`}
                className={partClass(x, y)}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={fill}
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
            className="mascot-sword absolute right-0 bottom-[42%] w-6"
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
                    fill={ch === "W" ? COLOR.W : COLOR.E}
                  />
                ),
              ),
            )}
          </svg>
          {/* bug caminhando pra tomar a espadada */}
          <svg
            viewBox="0 0 5 4"
            shapeRendering="crispEdges"
            className="mascot-bug absolute -right-1 bottom-0 w-6"
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