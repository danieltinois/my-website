"use client";

import { useEffect, useState } from "react";

// sprite do mascote — dev de argila com boné, 10 px de largura
// C cap, H sombra do cap, S pele, E contorno/sombra, T camisa, W botão
const ROWS = [
  "..CCCCCC..", // 0 cap
  ".CHHHHHHC.",
  ".CHHHHHHC.",
  "..CCCCCC..", // 3 aba do cap
  ".CSSSSSSC.", // 4 cara
  ".CSSSSSSC.", // 5 olhos (injetados no render, blink)
  ".CSSEESSC.", // 6 boca
  ".CTTTTTTC.", // 7 camisa
  ".CTWTWTTC.", // 8 botões
  ".CTWTWTTC.", // 9
];

const HEAD = 7; // variants "head" mostram só as 7 primeiras linhas (cabeça)

// pernas (3 linhas, embaixo da camisa): esquerda x3, direita x6
const LEGS = [
  "...E.E...",
  "...E.E...",
  "..EEE.EEE.", // sapatos
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
type Variant = "head" | "full";

const Mascot = ({
  mood = "idle",
  variant = "full",
  sprint = false,
  bug = false,
  className = "w-24 md:w-28",
}: {
  mood?: Mood;
  variant?: Variant;
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
  const head = variant === "head";

  // cada tela tem UMA animação assinatura — sprint (dash) e bug (espadada)
  // são eventos pontuais disparados pela tela, não random daqui
  const bodyAnim = sprint
    ? "mascot-run"
    : bug
      ? "mascot-lunge"
      : head
        ? "retro-bob"
        : mood === "think"
          ? "mascot-think"
          : mood === "type"
            ? "mascot-type"
            : mood === "wave"
              ? "mascot-wave"
              : "retro-bob";

  const legAnim = sprint ? "run" : bug ? "stance" : "";

  return (
    <div className={`relative mascot-pop ${className}`}>
      <div className="flex flex-col">
        <svg
          viewBox={`0 0 10 ${head ? HEAD : ROWS.length}`}
          shapeRendering="crispEdges"
          className={`w-full h-auto ${bodyAnim}`}
          aria-label="mascote dev de argila"
          role="img"
        >
          {ROWS.slice(0, head ? HEAD : ROWS.length).map((row, y) =>
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

        {!head && (
          <svg
            viewBox="0 0 10 3"
            shapeRendering="crispEdges"
            className="w-full h-auto"
            aria-hidden
          >
            {LEGS.map((row, y) =>
              [...row].map((ch, x) => {
                if (ch !== "E") return null;
                const side = x <= 4 ? "left" : "right";
                const cls =
                  legAnim === "run"
                    ? `leg-run-${side}`
                    : legAnim === "stance"
                      ? `leg-stance-${side}`
                      : "";
                return (
                  <rect
                    key={`${x}-${y}`}
                    className={cls}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={COLOR.E}
                  />
                );
              }),
            )}
          </svg>
        )}
      </div>

      {bug && !head && (
        <>
          {/* espada: sobe da mão e gira na hora do golpe */}
          <svg
            viewBox="0 0 5 6"
            shapeRendering="crispEdges"
            className="mascot-sword absolute right-1 bottom-2 w-5"
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