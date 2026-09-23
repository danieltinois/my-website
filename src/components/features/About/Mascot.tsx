"use client";

// Mascote — Golem de argila terracota (sprite REAL LPC "cutie golem":
// chifres + olhos creme, corpo atarracado, transparente, CC-BY-SA 3.0,
// sem recolor). Sprite-sheet idle 460x2088 (6 células de 348), animado
// com CSS steps() — retrô/pixel do site. Sem emojis no <img> principal.

const SHEET = "/mascot/golem_idle_sheet.png";
const FRAMES = 6;

type Mood = "idle" | "think" | "type" | "wave";

// espadada (bug) — sprite 5x6, lâmina clara W + guarda E (pixel art do site)
const SW = ["..W..", "..W..", "..W..", ".EWE.", ".E.E."];
// bug andando pra tomar a espadada (5x4, carapaça E + perninhas R)
const BG = ["EEEEE", "ERERE", "ERERE", "EEEEE"];

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
  const anim = sprint
    ? "mascot-run"
    : mood === "think"
      ? "mascot-think"
      : mood === "type"
        ? "mascot-type"
        : mood === "wave"
          ? "mascot-wave"
          : "mascot-bob";

  return (
    <div className={`relative mascot-pop ${className}`}>
      {/* sprite real: background-image do sheet + animação steps() vertical */}
      <div
        style={{
          backgroundImage: `url(${SHEET})`,
          backgroundSize: "100% 600%",
          backgroundRepeat: "no-repeat",
        }}
        className={`mascot-sprite h-full w-full ${anim}`}
        role="img"
        aria-label="golem de argila terracota — sprite do jogo (cc-by-sa)"
      />

      {/* espadada + bug continuam (sketch do design anterior) */}
      {bug && (
        <span className="mascot-sword absolute right-1 bottom-2 text-[var(--color-cn-highlight)]" aria-hidden>
          ⚔
        </span>
      )}
    </div>
  );
};

export default Mascot;
