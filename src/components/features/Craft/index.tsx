"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { VT323 } from "next/font/google";
import useSound from "@/src/hooks/useSound";
import {
  FURNACE,
  LOG,
  NAMES,
  ORES,
  ORE_BASE,
  PLANKS,
  RECIPES,
  Recipe,
  STICK,
  STONE_PICK,
  TABLE,
  TROPHY,
  WOOD_PICK,
  iconOf,
  isOre,
  isPick,
  matchRecipe,
  maxStack,
  needsPick,
} from "./blocks";
import type { Engine } from "./engine";

const pixel = VT323({ weight: "400", subsets: ["latin"] });

type Slot = { id: number; n: number } | null;
type Ui = null | "inv" | "table";

interface Toast {
  key: number;
  title: string;
  text: string;
  icon: number;
}

// guia passo a passo, igual aos tutoriais do jogo
const HINTS = [
  "Segure numa árvore pra pegar madeira",
  "Abra o inventário (E) e transforme o tronco em tábuas",
  "4 tábuas em quadrado = bancada de trabalho",
  "Coloque a bancada no chão e use ela",
  "Faça gravetos e uma picareta de madeira",
  "Agora dá pra minerar pedra: faça uma picareta de pedra",
  "Desça nas cavernas e ache os 9 minérios da stack",
  "Junte os 9 minérios na bancada...",
  "Você zerou o portfólio. Bem-vindo à equipe!",
];

const RECIPE_HINT: Record<number, string> = {
  [PLANKS]: "1 tronco",
  [STICK]: "2 tábuas em coluna",
  [TABLE]: "4 tábuas em quadrado",
  [WOOD_PICK]: "3 tábuas + 2 gravetos",
  [STONE_PICK]: "3 pedregulhos + 2 gravetos",
  [FURNACE]: "8 pedregulhos (bancada)",
  [TROPHY]: "os 9 minérios (bancada)",
};

const slotCls =
  "relative flex size-[clamp(28px,8.6vw,36px)] shrink-0 items-center justify-center border-2 border-t-[#373737] border-l-[#373737] border-b-white border-r-white bg-[#8b8b8b]";
const btnCls = "border-2 border-t-white border-l-white border-b-[#555] border-r-[#555] bg-[#c6c6c6] px-1.5 text-lg";

const ItemIcon = ({ slot }: { slot: Slot }) =>
  slot ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconOf(slot.id)} alt="" draggable={false} className="pointer-events-none size-[80%] [image-rendering:pixelated]" />
      {slot.n > 1 && (
        <span className="pointer-events-none absolute -bottom-0.5 right-0.5 text-lg leading-none text-white [text-shadow:2px_2px_0_#3f3f3f]">
          {slot.n}
        </span>
      )}
    </>
  ) : null;

const Heart = () => (
  <svg viewBox="0 0 9 9" className="size-[clamp(12px,3.6vw,16px)]" shapeRendering="crispEdges" aria-hidden>
    <path d="M1 1h3v1h1V1h3v1h1v3H8v1H7v1H6v1H5v1H4V8H3V7H2V6H1V5H0V2h1z" fill="#000" />
    <path d="M1 2h2v1h1v1h1V3h1V2h2v3H7v1H6v1H5v1H4V7H3V6H2V5H1z" fill="#e02020" />
    <path d="M2 2h1v1H2z" fill="#fff" />
  </svg>
);

const Craft = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const { resolvedTheme } = useTheme();
  const [, bump] = useReducer((x: number) => x + 1, 0);

  // inventário mutável (o motor lê a cada frame) + bump pra re-renderizar
  const slots = useRef<Slot[]>(Array(36).fill(null));
  const selected = useRef(0);
  const grid = useRef<Slot[]>(Array(9).fill(null));
  const cursor = useRef<Slot>(null);
  const uiRef = useRef<Ui>(null);

  const [ui, setUi] = useState<Ui>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [touch, setTouch] = useState(false);
  const [found, setFound] = useState<boolean[]>(() => ORES.map(() => false));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hint, setHint] = useState(0);
  const [nameTag, setNameTag] = useState<{ key: number; text: string } | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [book, setBook] = useState(false);
  const done = useRef(new Set<string>());

  const { play: playClick } = useSound("/sounds/click.mp3", { speed: 1.8 });
  const { play: playBreak } = useSound("/sounds/bubble.mp3", { speed: 0.8, lowPassFreq: 2500 });
  const { play: playPlace } = useSound("/sounds/bubble.mp3", { speed: 1.6, lowPassFreq: 4000 });
  const sfx = useRef({ playClick, playBreak, playPlace });
  useEffect(() => {
    sfx.current = { playClick, playBreak, playPlace };
  }, [playClick, playBreak, playPlace]);

  const toast = useCallback((title: string, text: string, icon: number) => {
    const key = Date.now() + Math.random();
    setToasts((t) => [...t, { key, title, text, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 3600);
  }, []);

  // conquista só uma vez
  const achieve = useCallback(
    (id: string, title: string, text: string, icon: number) => {
      if (done.current.has(id)) return;
      done.current.add(id);
      toast(title, text, icon);
    },
    [toast],
  );

  const advance = useCallback((step: number) => setHint((h) => Math.max(h, step)), []);

  // ── inventário ──
  const give = useCallback((id: number, n = 1) => {
    const s = slots.current;
    const max = maxStack(id);
    for (let i = 0; i < 36 && n > 0; i++) {
      const it = s[i];
      if (it && it.id === id && it.n < max) {
        const add = Math.min(n, max - it.n);
        s[i] = { id, n: it.n + add };
        n -= add;
      }
    }
    for (let i = 0; i < 36 && n > 0; i++) {
      if (!s[i]) {
        const add = Math.min(n, max);
        s[i] = { id, n: add };
        n -= add;
      }
    }
    bump();
  }, []);

  const select = useCallback((i: number) => {
    selected.current = ((i % 9) + 9) % 9;
    const it = slots.current[selected.current];
    if (it) setNameTag({ key: Date.now(), text: NAMES[it.id] });
    bump();
  }, []);

  const returnGrid = useCallback(() => {
    grid.current.forEach((g, i) => {
      if (g) give(g.id, g.n);
      grid.current[i] = null;
    });
    if (cursor.current) give(cursor.current.id, cursor.current.n);
    cursor.current = null;
  }, [give]);

  const closeUi = useCallback(() => {
    returnGrid();
    uiRef.current = null;
    setUi(null);
    setBook(false);
    engineRef.current?.setPaused(false);
    engineRef.current?.lock();
  }, [returnGrid]);

  const openUi = useCallback(
    (kind: "inv" | "table") => {
      uiRef.current = kind;
      setUi(kind);
      engineRef.current?.setPaused(true);
      if (kind === "table") advance(4);
    },
    [advance],
  );

  // ── motor (carregado sob demanda) ──
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setTouch(isTouch);
    let alive = true;
    let engine: Engine | null = null;

    import("./engine").then(({ startEngine }) => {
      if (!alive || !canvasRef.current || !boxRef.current) return;
      engine = startEngine(
        canvasRef.current,
        boxRef.current,
        { night: document.documentElement.dataset.theme === "dark", touch: isTouch },
        {
          selected: () => slots.current[selected.current]?.id ?? 0,
          consumeSelected: () => {
            const i = selected.current;
            const it = slots.current[i];
            if (!it) return;
            slots.current[i] = it.n > 1 ? { id: it.id, n: it.n - 1 } : null;
            if (it.id === TABLE) advance(3);
            sfx.current.playPlace();
            bump();
          },
          give: (id) => give(id),
          broke: (id, drop, tool) => {
            sfx.current.playBreak();
            if (id === LOG) {
              achieve("wood", "Pegando madeira", "todo mundo começa socando árvore", LOG);
              advance(1);
            }
            if (needsPick(id) && !isPick(tool)) {
              achieve("nopick", "Precisa de uma picareta", "na mão, pedra não dropa nada", WOOD_PICK);
            }
            if (drop !== null && isOre(drop)) {
              const i = drop - ORE_BASE;
              setFound((f) => {
                if (f[i]) return f;
                const next = [...f];
                next[i] = true;
                return next;
              });
              achieve(`ore${i}`, `${ORES[i].nome} encontrado!`, ORES[i].lore, drop);
            }
          },
          openTable: () => openUi("table"),
          openInventory: () => (uiRef.current ? closeUi() : openUi("inv")),
          select,
          scroll: (d) => select(selected.current + d),
          lockChange: setLocked,
        },
      );
      engineRef.current = engine;
      setReady(true);
    });

    return () => {
      alive = false;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [give, select, achieve, advance, openUi, closeUi]);

  // stack completa
  useEffect(() => {
    if (found.every(Boolean)) {
      achieve("full", "Full stack!", "você achou a stack inteira do daniel", TROPHY);
      advance(7);
    }
  }, [found, achieve, advance]);

  useEffect(() => {
    engineRef.current?.setNight(resolvedTheme === "dark");
  }, [resolvedTheme, ready]);

  useEffect(() => {
    if (!nameTag) return;
    const t = window.setTimeout(() => setNameTag(null), 1800);
    return () => clearTimeout(t);
  }, [nameTag]);

  useEffect(() => {
    if (!ui) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUi();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui, closeUi]);

  // ── crafting ──
  const size = ui === "table" ? 3 : 2;
  const gridIds = () => Array.from({ length: size * size }, (_, i) => grid.current[i]?.id ?? 0);
  const recipe = ui ? matchRecipe(gridIds(), size) : null;

  const onCrafted = (out: number) => {
    if (out === PLANKS) advance(2);
    if (out === TABLE) achieve("table", "Benchmarking", "fez uma bancada de trabalho", TABLE);
    if (out === WOOD_PICK) {
      achieve("wpick", "Hora de minerar!", "picareta de madeira na mão", WOOD_PICK);
      advance(5);
    }
    if (out === STONE_PICK) {
      achieve("spick", "Upgrade", "picareta de pedra: agora sim", STONE_PICK);
      advance(6);
    }
    if (out === FURNACE) achieve("furnace", "Esquentando", "fez uma fornalha", FURNACE);
    if (out === TROPHY) {
      achieve("trophy", "Contratado!", "a stack inteira virou um full stack dev", TROPHY);
      advance(8);
    }
  };

  const consumeGrid = () => {
    for (let i = 0; i < size * size; i++) {
      const g = grid.current[i];
      if (g) grid.current[i] = g.n > 1 ? { id: g.id, n: g.n - 1 } : null;
    }
  };

  const takeOutput = (shift: boolean) => {
    const r = matchRecipe(gridIds(), size);
    if (!r) return;
    playClick();
    if (shift) {
      // shift: crafta o máximo direto pro inventário
      let guard = 64;
      while (guard-- > 0 && matchRecipe(gridIds(), size) === r) {
        give(r.out, r.n);
        consumeGrid();
      }
    } else {
      const c = cursor.current;
      if (c && (c.id !== r.out || c.n + r.n > maxStack(r.out))) return;
      cursor.current = { id: r.out, n: (c?.n ?? 0) + r.n };
      consumeGrid();
    }
    onCrafted(r.out);
    bump();
  };

  // clique em slot com a mecânica do jogo: esquerdo pega/solta/troca, direito divide/solta 1
  const clickSlot = (arr: Slot[], i: number, right: boolean) => {
    playClick();
    const s = arr[i];
    const c = cursor.current;
    if (!c) {
      if (!s) return;
      if (right) {
        const take = Math.ceil(s.n / 2);
        cursor.current = { id: s.id, n: take };
        arr[i] = s.n - take > 0 ? { id: s.id, n: s.n - take } : null;
      } else {
        cursor.current = s;
        arr[i] = null;
      }
    } else if (!s) {
      if (right) {
        arr[i] = { id: c.id, n: 1 };
        cursor.current = c.n > 1 ? { id: c.id, n: c.n - 1 } : null;
      } else {
        arr[i] = c;
        cursor.current = null;
      }
    } else if (s.id === c.id) {
      const add = Math.min(maxStack(s.id) - s.n, right ? 1 : c.n);
      arr[i] = { id: s.id, n: s.n + add };
      cursor.current = c.n - add > 0 ? { id: c.id, n: c.n - add } : null;
    } else if (!right) {
      arr[i] = c;
      cursor.current = s;
    }
    bump();
  };

  // livro de receitas: preenche a grade com o que tem no inventário
  const count = (id: number) => slots.current.reduce((a, s) => a + (s?.id === id ? s.n : 0), 0);
  const takeOne = (id: number) => {
    const s = slots.current;
    for (let i = 35; i >= 0; i--) {
      const it = s[i];
      if (it?.id === id) {
        s[i] = it.n > 1 ? { id, n: it.n - 1 } : null;
        return true;
      }
    }
    return false;
  };
  const layout = (r: Recipe): number[] | null => {
    const cells: number[] = Array(size * size).fill(0);
    if (r.shapeless) {
      if (r.shapeless.length > size * size) return null;
      r.shapeless.forEach((id, i) => (cells[i] = id));
      return cells;
    }
    const shape = r.shape!;
    if (shape.length > size || shape[0].length > size) return null;
    shape.forEach((row, y) => [...row].forEach((ch, x) => (cells[y * size + x] = ch === " " ? 0 : r.key![ch])));
    return cells;
  };
  const canMake = (r: Recipe) => {
    const cells = layout(r);
    if (!cells) return false;
    const need = new Map<number, number>();
    cells.forEach((id) => id && need.set(id, (need.get(id) ?? 0) + 1));
    // conta também o que já está na grade (volta pro inventário antes de preencher)
    const inGrid = (id: number) => grid.current.reduce((a, g) => a + (g?.id === id ? g.n : 0), 0);
    return [...need].every(([id, n]) => count(id) + inGrid(id) >= n);
  };
  const autofill = (r: Recipe) => {
    if (!canMake(r)) return;
    returnGrid();
    const cells = layout(r)!;
    playClick();
    cells.forEach((id, i) => {
      if (id && takeOne(id)) grid.current[i] = { id, n: 1 };
    });
    bump();
  };

  // ── toque: joystick + arrastar pra olhar + segurar pra quebrar + tocar pra usar ──
  const joy = useRef<{ id: number; x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const lookTouch = useRef<{ id: number; x: number; y: number; t: number; moved: boolean; timer: number } | null>(null);

  const joyDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    joy.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const joyMove = (e: React.PointerEvent) => {
    const j = joy.current;
    if (!j || j.id !== e.pointerId) return;
    let dx = e.clientX - j.x, dy = e.clientY - j.y;
    const d = Math.hypot(dx, dy);
    if (d > 44) {
      dx = (dx / d) * 44;
      dy = (dy / d) * 44;
    }
    setKnob({ x: dx, y: dy });
    engineRef.current?.move(dx / 44, -dy / 44);
  };
  const joyUp = () => {
    joy.current = null;
    setKnob({ x: 0, y: 0 });
    engineRef.current?.move(0, 0);
  };

  const lookDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const timer = window.setTimeout(() => {
      if (lookTouch.current && !lookTouch.current.moved) engineRef.current?.breaking(true);
    }, 260);
    lookTouch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false, timer };
  };
  const lookMove = (e: React.PointerEvent) => {
    const l = lookTouch.current;
    if (!l || l.id !== e.pointerId) return;
    const dx = e.clientX - l.x, dy = e.clientY - l.y;
    if (!l.moved && Math.hypot(dx, dy) > 8) {
      l.moved = true;
      engineRef.current?.breaking(false);
    }
    if (l.moved) {
      engineRef.current?.look(dx, dy);
      l.x = e.clientX;
      l.y = e.clientY;
    }
  };
  const lookUp = () => {
    const l = lookTouch.current;
    if (!l) return;
    clearTimeout(l.timer);
    engineRef.current?.breaking(false);
    if (!l.moved && performance.now() - l.t < 250) engineRef.current?.interact();
    lookTouch.current = null;
  };

  const hotbar = slots.current.slice(0, 9);
  const total = found.filter(Boolean).length;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      onPointerMove={(e) => {
        if (!ui) return;
        const r = boxRef.current!.getBoundingClientRect();
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className={`${pixel.className} relative h-full w-full touch-none overflow-hidden bg-black text-white outline-none select-none`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* gerando mundo */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#3b2a1d] text-2xl">
          <p className="[text-shadow:2px_2px_0_#3f3f3f]">Gerando mundo...</p>
          <p className="mt-2 text-lg opacity-70">escondendo a stack nas cavernas</p>
        </div>
      )}

      {ready && (
        <>
          {/* mira */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 mix-blend-difference">
            <div className="absolute h-[18px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white" />
            <div className="absolute h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 bg-white" />
          </div>

          {/* celular: área de olhar fica embaixo do resto do hud */}
          {touch && !ui && (
            <div
              className="absolute inset-0"
              onPointerDown={lookDown}
              onPointerMove={lookMove}
              onPointerUp={lookUp}
              onPointerCancel={lookUp}
            />
          )}

          {/* stack encontrada */}
          <div className="pointer-events-none absolute left-2 top-2 border-2 border-black/70 bg-black/50 px-1.5 py-1">
            <p className="text-lg leading-none [text-shadow:2px_2px_0_#3f3f3f]">
              stack {total}/{ORES.length}
            </p>
            <div className="mt-1 flex gap-0.5">
              {ORES.map((o, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={o.nome}
                  src={iconOf(ORE_BASE + i)}
                  alt={o.nome}
                  className={`size-[clamp(14px,4vw,20px)] [image-rendering:pixelated] ${found[i] ? "" : "opacity-25 grayscale"}`}
                />
              ))}
            </div>
          </div>

          {/* dica do tutorial */}
          {hint < HINTS.length && (locked || touch) && !ui && (
            <motion.div
              key={hint}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute left-1/2 top-[clamp(56px,14vw,64px)] w-max max-w-[80%] -translate-x-1/2 border-2 border-[#555] bg-[#212121]/90 px-3 py-1 text-center text-lg leading-tight"
            >
              {hint === 1 && touch ? "Toque na mochila e transforme o tronco em tábuas" : HINTS[hint]}
            </motion.div>
          )}

          {/* conquistas */}
          <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-2">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80 }}
                  className="flex w-56 items-center gap-2 rounded-sm border-2 border-[#555] bg-[#212121]/95 px-2 py-1.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconOf(t.icon)} alt="" className="size-8 [image-rendering:pixelated]" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-base text-[#ffe066]">Conquista feita!</p>
                    <p className="text-lg">{t.title}</p>
                    <p className="text-sm text-gray-400">{t.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* hud inferior: nome do item, corações, xp e hotbar */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
            <AnimatePresence>
              {nameTag && (
                <motion.p
                  key={nameTag.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl leading-none [text-shadow:2px_2px_0_#3f3f3f]"
                >
                  {nameTag.text}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex w-full">
              {Array.from({ length: 10 }, (_, i) => (
                <Heart key={i} />
              ))}
            </div>
            <div className="relative h-[6px] w-full border border-black bg-[#2a2a2a]">
              <div className="h-full bg-[#80ff20]" style={{ width: `${(total / ORES.length) * 100}%` }} />
              {total > 0 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg leading-none text-[#80ff20] [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000]">
                  {total}
                </span>
              )}
            </div>
            <div className="pointer-events-auto flex border-2 border-black/80 bg-black/40 p-[2px]">
              {hotbar.map((s, i) => (
                <button
                  key={i}
                  onClick={() => select(i)}
                  aria-label={s ? `${NAMES[s.id]} (${s.n})` : `slot ${i + 1} vazio`}
                  className={`relative flex size-[clamp(28px,8.6vw,40px)] items-center justify-center border-2 ${
                    i === selected.current ? "z-10 scale-110 border-white bg-white/10" : "border-[#8b8b8b]/60 bg-black/20"
                  }`}
                >
                  <ItemIcon slot={s} />
                </button>
              ))}
            </div>
          </div>

          {/* desktop: clique pra jogar */}
          {!touch && !locked && !ui && (
            <button
              onClick={() => engineRef.current?.lock()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 px-6 text-center"
            >
              <span className="text-4xl [text-shadow:3px_3px_0_#3f3f3f]">Clique pra jogar</span>
              <span className="max-w-md text-lg leading-tight opacity-80">
                WASD andar · espaço pular · mouse olhar · segure o clique pra quebrar · botão direito coloca/usa · E inventário · 1-9 ou roda troca o item · Esc solta o mouse
              </span>
            </button>
          )}

          {/* celular: joystick, pulo e mochila */}
          {touch && !ui && (
            <>
              <div
                className="absolute bottom-[clamp(96px,26vw,112px)] left-4 size-28 rounded-full border-2 border-white/40 bg-black/25"
                onPointerDown={joyDown}
                onPointerMove={joyMove}
                onPointerUp={joyUp}
                onPointerCancel={joyUp}
              >
                <div
                  className="absolute left-1/2 top-1/2 size-12 rounded-full border-2 border-white/60 bg-white/30"
                  style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
                />
              </div>
              <button
                aria-label="pular"
                className="absolute bottom-[clamp(104px,28vw,120px)] right-4 flex size-16 items-center justify-center rounded-full border-2 border-white/50 bg-black/30 text-3xl"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  engineRef.current?.jump(true);
                }}
                onPointerUp={() => engineRef.current?.jump(false)}
                onPointerCancel={() => engineRef.current?.jump(false)}
              >
                ▲
              </button>
              <button
                aria-label="abrir inventário"
                onClick={() => openUi("inv")}
                className={`absolute bottom-[clamp(180px,48vw,200px)] right-4 ${btnCls} text-[#3f3f3f]`}
              >
                mochila
              </button>
            </>
          )}

          {/* inventário / bancada */}
          {ui && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/60 p-2"
              onPointerDown={(e) => e.target === e.currentTarget && closeUi()}
            >
              <div
                className="relative max-h-full overflow-y-auto rounded-sm border-2 border-black bg-[#c6c6c6] p-2 text-[#3f3f3f] shadow-[inset_2px_2px_0_#fff,inset_-2px_-2px_0_#555]"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xl">{ui === "table" ? "Criação" : "Inventário"}</p>
                  <div className="flex gap-1">
                    <button onClick={() => setBook((b) => !b)} className={btnCls}>
                      receitas
                    </button>
                    <button onClick={closeUi} aria-label="fechar" className={btnCls}>
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  {book && (
                    <div className="grid grid-cols-2 gap-1 md:w-60 md:grid-cols-1">
                      {RECIPES.map((r) => {
                        const fits = layout(r) !== null;
                        const ok = fits && canMake(r);
                        return (
                          <button
                            key={r.out}
                            onClick={() => autofill(r)}
                            disabled={!ok}
                            className={`flex items-center gap-1 border-2 px-1 py-0.5 text-left text-base leading-tight ${
                              ok ? "border-[#3f3f3f] bg-[#a0e080]" : "border-[#8b8b8b] bg-[#b0b0b0] opacity-60"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={iconOf(r.out)} alt="" className="size-6 shrink-0 [image-rendering:pixelated]" />
                            <span className="min-w-0">
                              {NAMES[r.out]}
                              <span className="block text-sm opacity-70">{RECIPE_HINT[r.out]}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div>
                  {/* grade + resultado */}
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, auto)` }}>
                      {Array.from({ length: size * size }, (_, i) => (
                        <button key={i} className={slotCls} onMouseDown={(e) => clickSlot(grid.current, i, e.button === 2)}>
                          <ItemIcon slot={grid.current[i]} />
                        </button>
                      ))}
                    </div>
                    <span className="text-3xl text-[#8b8b8b]">➜</span>
                    <button
                      className={`${slotCls} !size-[clamp(36px,11vw,48px)]`}
                      onMouseDown={(e) => takeOutput(e.shiftKey)}
                      aria-label={recipe ? `criar ${NAMES[recipe.out]}` : "resultado vazio"}
                    >
                      <ItemIcon slot={recipe ? { id: recipe.out, n: recipe.n } : null} />
                    </button>
                  </div>

                  {/* inventário 27 + hotbar 9 */}
                  <div className="grid w-max grid-cols-[repeat(9,auto)]">
                    {Array.from({ length: 27 }, (_, k) => k + 9).map((i) => (
                      <button key={i} className={slotCls} onMouseDown={(e) => clickSlot(slots.current, i, e.button === 2)}>
                        <ItemIcon slot={slots.current[i]} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid w-max grid-cols-[repeat(9,auto)]">
                    {Array.from({ length: 9 }, (_, i) => (
                      <button key={i} className={slotCls} onMouseDown={(e) => clickSlot(slots.current, i, e.button === 2)}>
                        <ItemIcon slot={slots.current[i]} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 max-w-[min(100%,360px)] text-base leading-tight opacity-70">
                    {touch
                      ? "toque pra pegar e soltar · use as receitas pra preencher a grade"
                      : "esquerdo pega/solta · direito divide/solta 1 · shift no resultado crafta tudo"}
                  </p>
                  </div>
                </div>
              </div>

              {/* item preso no cursor */}
              {cursor.current && (
                <div
                  className="pointer-events-none absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{ left: mouse.x, top: mouse.y }}
                >
                  <ItemIcon slot={cursor.current} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Craft;
