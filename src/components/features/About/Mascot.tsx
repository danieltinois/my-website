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

// bug pixelado (5x4) que aparece pra levar espadada
const BG = ["EEEEE", "ERERE", "ERERE", "EEEEE"];

// espada: lâmina clara + guarda escura, vista de frente
const SW = [".....", "..W..", "..W..", "..W..", ".EWE.", ".E.E."];

type Skit = "run" | "bug" | null;

const Mascot = ({
  mood = "idle",
  className = "w-24 md:w-28",
}: {
  mood?: "idle" | "think" | "type" | "wave";
  className?: string;
}) => {
  const [awake, setAwake] = useState(true);
  const [skit, setSkit] = useState<Skit>(null);

  useEffect(() => {
    const blink = setInterval(() => {
      setAwake(false);
      setTimeout(() => setAwake(true), 200);
    }, 3200);

    // esquetes aleatórias: corre ou ataca um bug, a cada ~4.2s
    const show = setInterval(() => {
      const s: NonNullable<Skit> = Math.random() < 0.5 ? "run" : "bug";
      setSkit(s);
      setTimeout(() => setSkit(null), s === "run" ? 2200 : 1400);
    }, 4200);

    return () => {
      clearInterval(blink);
      clearInterval(show);
    };
  }, []);

  // pensando = olhar pra cima (pupila na linha de cima)
  const eyeY = mood === "think" ? 4 : 5;
  const anim =
    skit === "run"
      ? "mascot-run"
      : skit === "bug"
        ? "mascot-lunge"
        : mood === "think"
          ? "mascot-think"
          : mood === "type"
            ? "mascot-type"
            : mood === "wave"
              ? "mascot-wave"
              : "retro-bob";

  return (
    <div className={`relative mascot-pop ${className}`}>
      <svg
        viewBox="0 0 10 11"
        shapeRendering="crispEdges"
        className={`w-full h-auto ${anim}`}
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

      {skit === "bug" && (
        <>
          {/* espada: sobe da mão e gira na hora do golpe */}
          <svg
            viewBox="0 0 5 6"
            shapeRendering="crispEdges"
            className="mascot-sword absolute right-1 bottom-1 w-4"
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
            className="mascot-bug absolute -right-1 bottom-0 w-4"
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