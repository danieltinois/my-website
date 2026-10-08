"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import useSound from "@/src/hooks/useSound";
import { CONQUISTAS, INVENTARIO, ORIGEM } from "@/src/data/sobre";
import { LockIcon } from "@hugeicons/core-free-icons";

// primeiro plugin de minecraft — o "spawn" do daniel
const SPAWN = new Date(2020, 0, 1);

const h2 =
  "text-xl font-black uppercase tracking-widest text-(--color-cn-highlight) [text-shadow:2px_2px_0_var(--color-cn-shadow)]";
const box =
  "border-[3px] border-(--color-cn-border) bg-(--color-bg-secondary) shadow-[3px_3px_0_var(--color-cn-shadow)]";

// bloco de grama do minecraft no lugar de foto
const GrassBlock = () => (
  <div
    aria-hidden
    className="relative size-20 shrink-0 border-[3px] border-(--color-cn-border) shadow-[3px_3px_0_var(--color-cn-shadow)]"
    style={{
      backgroundColor: "#8b5a2b",
      backgroundImage: [
        // grama "escorrendo" pela borda de cima
        "linear-gradient(to bottom, #5fbf3a 0 22%, transparent 22%)",
        "repeating-linear-gradient(90deg, #4ea52f 0 6px, transparent 6px 12px)",
        // pedrinhas na terra
        "radial-gradient(#6b4220 18%, transparent 20%)",
        "radial-gradient(#a06b38 15%, transparent 17%)",
      ].join(","),
      backgroundSize: "100% 100%, 100% 30%, 14px 14px, 18px 18px",
      backgroundPosition: "0 0, 0 0, 3px 9px, 9px 4px",
      backgroundRepeat: "no-repeat, no-repeat, repeat, repeat",
      imageRendering: "pixelated",
    }}
  >
    <span className="absolute inset-0 flex items-center justify-center pt-3 text-2xl font-black text-white [text-shadow:2px_2px_0_#000]">
      DT
    </span>
  </div>
);

const useNivel = () => {
  const [nivel, setNivel] = useState<{ lvl: number; xp: number } | null>(null);

  useEffect(() => {
    // calculado no cliente: o build estático não sabe que dia é hoje
    const anos = (Date.now() - SPAWN.getTime()) / (365.25 * 24 * 3600 * 1000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNivel({ lvl: Math.floor(anos), xp: anos % 1 });
  }, []);

  return nivel;
};

const Sobre = () => {
  const nivel = useNivel();
  const [slot, setSlot] = useState(0);
  const { play } = useSound("/sounds/click.mp3", { speed: 2 });
  const item = INVENTARIO[slot];

  return (
    <div className="space-y-7">
      {/* ── ficha do personagem ── */}
      <section className={`${box} flex gap-4 p-4`}>
        <GrassBlock />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black uppercase leading-tight tracking-wide text-[var(--color-text)]">
            Daniel Tinois
          </h2>
          <p className="text-xs text-[var(--color-text)] opacity-75">
            classe: full stack pleno · guilda: verzel
          </p>
          <p className="text-xs text-[var(--color-text)] opacity-75">
            spawn: são paulo, br · online desde 2020
          </p>
          <p className="text-xs text-[var(--color-text)] opacity-75">
            academia: eng. de software @ fiap
          </p>

          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--color-text)]">
              <span>
                nível{" "}
                <span className="text-base text-[#80ff20] [text-shadow:1px_1px_0_#000]">
                  {nivel?.lvl ?? "…"}
                </span>
              </span>
              <span className="opacity-60">
                xp {nivel ? Math.round(nivel.xp * 100) : 0}% → nível {(nivel?.lvl ?? 0) + 1}
              </span>
            </div>
            {/* barra de xp segmentada, igual a do jogo */}
            <div className="relative h-3 border-2 border-black bg-black/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(nivel?.xp ?? 0) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-[#80ff20]"
              />
              <div className="absolute inset-0 grid grid-cols-10" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className="border-r-2 border-black/70 last:border-r-0" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── origem ── */}
      <section className="space-y-3">
        <h2 className={h2}>{"// origem"}</h2>
        <div className="space-y-3 leading-relaxed text-[var(--color-text)]">
          {ORIGEM.map((p, i) => (
            <p key={i} className={i === 0 ? "text-base" : "text-sm opacity-85"}>
              {p}
            </p>
          ))}
        </div>
        <p className="border-l-[3px] border-(--color-cn-highlight) bg-black/80 px-3 py-2 font-mono text-xs text-[#80ff20]">
          <span className="text-gray-400">[server]</span> daniel joined the game
          <br />
          <span className="text-gray-400">[server]</span> loaded plugin: curiosidade v2020
          <span className="retro-blink">_</span>
        </p>
      </section>

      {/* ── inventário ── */}
      <section className="space-y-3">
        <h2 className={h2}>{"// inventário"}</h2>
        <p className="text-xs text-[var(--color-text)] opacity-60">
          toca num slot pra inspecionar o item
        </p>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.nome}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="mb-2 inline-block border-2 border-[#2a0a5e] bg-[#100010]/95 px-2 py-1 text-xs"
            >
              <p className="font-bold text-white">{item.nome}</p>
              <p className="text-[#a8a8ff]">{item.lore}</p>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-9 border-[3px] border-[#373737] bg-[#8b8b8b] p-0.5 shadow-[3px_3px_0_var(--color-cn-shadow)]">
            {INVENTARIO.map((it, i) => (
              <button
                key={it.nome}
                aria-label={it.nome}
                onClick={() => {
                  play();
                  setSlot(i);
                }}
                className={`relative flex aspect-square items-center justify-center border-2 bg-[#8b8b8b] ${
                  i === slot
                    ? "z-10 scale-110 border-white bg-[#a0a0a0] shadow-[0_0_0_2px_#000]"
                    : "border-t-[#373737] border-l-[#373737] border-b-white border-r-white"
                } transition-transform`}
              >
                <HugeiconsIcon icon={it.icon} size={20} strokeWidth={2} color="#1a1a1a" />
                {it.qtd && (
                  <span className="absolute bottom-0 right-0.5 text-[10px] font-black leading-none text-white [text-shadow:1px_1px_0_#3f3f3f]">
                    {it.qtd}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── conquistas ── */}
      <section className="space-y-3">
        <h2 className={h2}>{"// conquistas"}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CONQUISTAS.map((c, i) => (
            <motion.li
              key={c.titulo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`flex items-center gap-3 border-[3px] p-2 ${
                c.feito
                  ? "border-(--color-cn-border) bg-[#212121] shadow-[3px_3px_0_var(--color-cn-shadow)]"
                  : "border-dashed border-(--color-cn-border) opacity-50"
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center border-2 ${
                  c.feito ? "border-[#ffe066] bg-[#3a3a3a]" : "border-current"
                }`}
              >
                <HugeiconsIcon
                  icon={c.feito ? c.icon : LockIcon}
                  size={20}
                  strokeWidth={2}
                  color={c.feito ? "#ffe066" : "currentColor"}
                  className={c.feito ? "" : "text-[var(--color-text)]"}
                />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[10px] font-bold uppercase tracking-wider ${
                    c.feito ? "text-[#ffe066]" : "text-[var(--color-text)]"
                  }`}
                >
                  {c.feito ? "conquista desbloqueada!" : "bloqueada"}
                </span>
                <span
                  className={`block text-sm font-bold leading-tight ${
                    c.feito ? "text-white" : "text-[var(--color-text)]"
                  }`}
                >
                  {c.titulo}
                </span>
                <span
                  className={`block text-[11px] ${
                    c.feito ? "text-gray-400" : "text-[var(--color-text)]"
                  }`}
                >
                  {c.desc}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </section>

      <p className="text-center text-xs text-[var(--color-text)] opacity-60">
        fun fact: meu terminal tem mais temas do que meu apartamento tem móveis.
      </p>
    </div>
  );
};

export default Sobre;
