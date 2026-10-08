"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  CubeIcon,
  PickaxeIcon,
} from "@hugeicons/core-free-icons";
import useSound from "@/src/hooks/useSound";
import {
  AIR,
  BEDROCK,
  LOG,
  ORE_BASE,
  ORES,
  PLACEABLE,
  STONE,
  World,
  drop,
  generate,
  hardness,
  isOre,
  makeTextures,
} from "./world";

const PW = 0.6; // largura do jogador (em blocos)
const PH = 1.8;
const SPEED = 5;
const GRAVITY = 32;
const JUMP = 9.4;
const REACH = 5;
const HIT_EVERY = 0.22; // segurando o clique, um golpe a cada 220ms

interface Toast {
  id: number;
  titulo: string;
  texto: string;
}

const Craft = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const nightRef = useRef(false);
  useEffect(() => {
    nightRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  const [counts, setCounts] = useState<Record<number, number>>({});
  const [slot, setSlot] = useState(0);
  const [found, setFound] = useState<number[]>(() => ORES.map(() => 0));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [touch, setTouch] = useState(false);
  const [mode, setMode] = useState<"mine" | "place">("mine");

  // refs espelham o estado que o game loop precisa ler sem re-render
  const slotRef = useRef(0);
  const modeRef = useRef<"mine" | "place">("mine");
  const countsRef = useRef<Record<number, number>>({});
  const keys = useRef({ left: false, right: false, jump: false });

  const { play: playHit } = useSound("/sounds/click.mp3", { speed: 2.4 });
  const { play: playBreak } = useSound("/sounds/bubble.mp3", { speed: 0.9, lowPassFreq: 3000 });
  const { play: playPlace } = useSound("/sounds/bubble.mp3", { speed: 1.8 });
  const sfx = useRef({ playHit, playBreak, playPlace });
  useEffect(() => {
    sfx.current = { playHit, playBreak, playPlace };
  }, [playHit, playBreak, playPlace]);

  const toast = useRef((titulo: string, texto: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, titulo, texto }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  });

  useEffect(() => {
    // matchMedia só existe no cliente
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const box = boxRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const tex = makeTextures();
    const world: World = generate(Math.floor(Math.random() * 1e9));
    const { w, h, tiles, surface } = world;
    const at = (x: number, y: number) => {
      if (x < 0 || x >= w || y >= h) return BEDROCK;
      if (y < 0) return AIR;
      return tiles[y * w + x];
    };
    const solid = (x: number, y: number) => at(x, y) !== AIR;

    const spawnX = Math.floor(w / 2);
    const p = { x: spawnX + 0.2, y: surface[spawnX] - PH - 0.1, vx: 0, vy: 0, ground: false, face: 1, walk: 0 };
    const hits = new Map<number, number>();
    const pointer = { down: false, x: 0, y: 0, inside: false, button: 0 };
    let hitTimer = 0;
    let T = 28;
    let vw = 0;
    let vh = 0;
    let cam = { x: 0, y: 0 };
    let raf = 0;
    let last = performance.now();
    const firsts = { mined: false, wood: false, placed: false, full: false };
    const foundLocal = ORES.map(() => 0);
    const stars = Array.from({ length: 50 }, () => [Math.random(), Math.random() * 0.6]);

    const resize = () => {
      // clientWidth ignora transform: a janela abre com animação de escala
      const dpr = window.devicePixelRatio || 1;
      vw = box.clientWidth;
      vh = box.clientHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      T = Math.max(18, Math.min(32, Math.floor(Math.min(vh / 17, vw / 20))));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    const tileAtPointer = () => ({
      tx: Math.floor((pointer.x + cam.x) / T),
      ty: Math.floor((pointer.y + cam.y) / T),
    });
    const inReach = (tx: number, ty: number) =>
      Math.hypot(tx + 0.5 - (p.x + PW / 2), ty + 0.5 - (p.y + PH / 2)) <= REACH;

    const addCount = (id: number, n: number) => {
      countsRef.current = { ...countsRef.current, [id]: (countsRef.current[id] ?? 0) + n };
      setCounts(countsRef.current);
    };

    const mine = (tx: number, ty: number) => {
      const id = at(tx, ty);
      if (id === AIR || id === BEDROCK || !inReach(tx, ty)) return;
      const key = ty * w + tx;
      const n = (hits.get(key) ?? 0) + 1;
      if (n < hardness(id)) {
        hits.set(key, n);
        sfx.current.playHit();
        return;
      }
      hits.delete(key);
      tiles[key] = AIR;
      sfx.current.playBreak();
      navigator.vibrate?.(6);

      if (isOre(id)) {
        const i = id - ORE_BASE;
        const first = foundLocal[i] === 0;
        foundLocal[i]++;
        setFound([...foundLocal]);
        if (first) toast.current(`${ORES[i].nome} encontrado!`, ORES[i].lore);
        if (!firsts.full && foundLocal.every((c) => c > 0)) {
          firsts.full = true;
          toast.current("Full stack!", "você achou a stack inteira do daniel");
        }
        return;
      }
      addCount(drop(id), 1);
      if (!firsts.mined) {
        firsts.mined = true;
        toast.current("Primeiro bloco", "é assim que começa");
      }
      if (id === LOG && !firsts.wood) {
        firsts.wood = true;
        toast.current("Pegando madeira", "todo mundo começa socando árvore");
      }
    };

    const place = (tx: number, ty: number) => {
      const block = PLACEABLE[slotRef.current].id;
      if ((countsRef.current[block] ?? 0) <= 0) return;
      if (at(tx, ty) !== AIR || ty < 0 || !inReach(tx, ty)) return;
      // não coloca bloco dentro do jogador
      if (tx + 1 > p.x && tx < p.x + PW && ty + 1 > p.y && ty < p.y + PH) return;
      tiles[ty * w + tx] = block;
      addCount(block, -1);
      sfx.current.playPlace();
      if (!firsts.placed) {
        firsts.placed = true;
        toast.current("Construtor", "colocou o primeiro bloco");
      }
    };

    const act = () => {
      const { tx, ty } = tileAtPointer();
      const placing = pointer.button === 2 || modeRef.current === "place";
      if (placing) place(tx, ty);
      else mine(tx, ty);
    };

    // ── física: eixo x e y resolvidos separadamente contra os blocos ──
    const collide = (axis: "x" | "y") => {
      const x0 = Math.floor(p.x);
      const x1 = Math.floor(p.x + PW - 1e-6);
      const y0 = Math.floor(p.y);
      const y1 = Math.floor(p.y + PH - 1e-6);
      for (let ty = y0; ty <= y1; ty++)
        for (let tx = x0; tx <= x1; tx++) {
          if (!solid(tx, ty)) continue;
          if (axis === "x") {
            // auto-pulo de 1 bloco, como no jogo (salva a vida no celular)
            const step = p.ground && ty === y1 && !solid(tx, ty - 1) && !solid(tx, ty - 2);
            if (p.vx > 0) p.x = tx - PW;
            else if (p.vx < 0) p.x = tx + 1;
            if (step) p.vy = -JUMP * 0.8;
            p.vx = 0;
          } else {
            if (p.vy > 0) {
              p.y = ty - PH;
              p.ground = true;
            } else if (p.vy < 0) p.y = ty + 1;
            p.vy = 0;
          }
          return;
        }
    };

    const update = (dt: number) => {
      const k = keys.current;
      const dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      p.vx = dir * SPEED;
      if (dir) p.face = dir;
      p.walk = dir && p.ground ? p.walk + dt * 10 : 0;
      if (k.jump && p.ground) p.vy = -JUMP;
      p.vy = Math.min(p.vy + GRAVITY * dt, 20);

      p.x += p.vx * dt;
      collide("x");
      p.ground = false;
      p.y += p.vy * dt;
      collide("y");

      // caiu do mundo? volta pro spawn
      if (p.y > h + 5) {
        p.x = spawnX + 0.2;
        p.y = surface[spawnX] - PH - 2;
        p.vy = 0;
      }

      if (pointer.down) {
        hitTimer -= dt;
        if (hitTimer <= 0) {
          act();
          hitTimer = HIT_EVERY;
        }
      }
    };

    const drawPlayer = (px: number, py: number) => {
      const u = T / 16; // 1 "pixel" do personagem
      const W = PW * T;
      const swing = Math.sin(p.walk) * 3 * u;
      // pernas
      ctx.fillStyle = "#3a4a8a";
      ctx.fillRect(px + W * 0.12, py + 18 * u, W * 0.36, 11 * u + swing * 0.3);
      ctx.fillRect(px + W * 0.52, py + 18 * u, W * 0.36, 11 * u - swing * 0.3);
      // corpo (camiseta terracota da marca)
      ctx.fillStyle = "#c1440e";
      ctx.fillRect(px, py + 8 * u, W, 10 * u);
      // braço balançando
      ctx.fillStyle = "#9c3a12";
      ctx.fillRect(px + W / 2 - 1.5 * u + swing * 0.6 * p.face, py + 9 * u, 3 * u, 8 * u);
      // cabeça
      ctx.fillStyle = "#e0ac69";
      ctx.fillRect(px + W * 0.1, py, W * 0.8, 8 * u);
      ctx.fillStyle = "#3b2a1a";
      ctx.fillRect(px + W * 0.1, py, W * 0.8, 2.5 * u);
      // olho do lado que está olhando
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(px + (p.face > 0 ? W * 0.62 : W * 0.25), py + 4 * u, 1.6 * u, 1.6 * u);
    };

    const draw = (time: number) => {
      const night = nightRef.current;
      // céu
      const g = ctx.createLinearGradient(0, 0, 0, vh);
      if (night) {
        g.addColorStop(0, "#0b1026");
        g.addColorStop(1, "#2a1f3d");
      } else {
        g.addColorStop(0, "#6fb7ff");
        g.addColorStop(1, "#cde8ff");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, vw, vh);

      if (night) {
        ctx.fillStyle = "#ffffff";
        for (const [sx, sy] of stars) ctx.fillRect(sx * vw, sy * vh, 2, 2);
        ctx.fillStyle = "#f0f0d0";
        ctx.fillRect(vw * 0.78, vh * 0.1, T * 1.4, T * 1.4);
      } else {
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(vw * 0.78, vh * 0.08, T * 1.6, T * 1.6);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (let c = 0; c < 4; c++) {
          const cx = ((c * 260 + time * 0.008) % (vw + 200)) - 100;
          ctx.fillRect(cx, vh * (0.12 + c * 0.05), T * 3, T * 0.7);
          ctx.fillRect(cx + T * 0.6, vh * (0.12 + c * 0.05) - T * 0.4, T * 1.6, T * 0.5);
        }
      }

      // câmera segue o jogador, presa nas bordas do mundo
      cam = {
        x: Math.max(0, Math.min(w * T - vw, (p.x + PW / 2) * T - vw / 2)),
        y: Math.max(0, Math.min(h * T - vh, (p.y + PH / 2) * T - vh / 2)),
      };
      const x0 = Math.floor(cam.x / T);
      const y0 = Math.floor(cam.y / T);
      const x1 = Math.min(w - 1, x0 + Math.ceil(vw / T) + 1);
      const y1 = Math.min(h - 1, y0 + Math.ceil(vh / T) + 1);

      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const id = tiles[y * w + x];
          const sx = Math.round(x * T - cam.x);
          const sy = Math.round(y * T - cam.y);
          if (id === AIR) {
            // parede de fundo nas cavernas e buracos
            if (y > surface[x] + 1) {
              ctx.drawImage(tex[STONE], sx, sy, T, T);
              ctx.fillStyle = "rgba(0,0,0,0.6)";
              ctx.fillRect(sx, sy, T, T);
            }
            continue;
          }
          ctx.drawImage(tex[id], sx, sy, T, T);
          // escurece com a profundidade
          const depth = y - surface[x];
          if (depth > 6) {
            ctx.fillStyle = `rgba(0,0,0,${Math.min(0.45, (depth - 6) * 0.02)})`;
            ctx.fillRect(sx, sy, T, T);
          }
        }

      // rachaduras
      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.lineWidth = Math.max(1, T / 12);
      hits.forEach((n, key) => {
        const tx = key % w;
        const ty = Math.floor(key / w);
        const frac = n / hardness(tiles[key]);
        const sx = tx * T - cam.x;
        const sy = ty * T - cam.y;
        ctx.beginPath();
        ctx.moveTo(sx + T * 0.5, sy + T * 0.5);
        ctx.lineTo(sx + T * (0.5 - 0.4 * frac), sy + T * (0.5 - 0.3 * frac));
        ctx.moveTo(sx + T * 0.5, sy + T * 0.5);
        ctx.lineTo(sx + T * (0.5 + 0.35 * frac), sy + T * (0.5 + 0.4 * frac));
        ctx.moveTo(sx + T * 0.5, sy + T * 0.5);
        ctx.lineTo(sx + T * (0.5 + 0.4 * frac), sy + T * (0.5 - 0.35 * frac));
        ctx.stroke();
      });

      drawPlayer(p.x * T - cam.x, p.y * T - cam.y);

      // contorno do bloco mirado
      if (pointer.inside) {
        const { tx, ty } = tileAtPointer();
        if (inReach(tx, ty)) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = night ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";
          ctx.strokeRect(tx * T - cam.x + 1, ty * T - cam.y + 1, T - 2, T - 2);
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // janela minimizada (display:none) não precisa rodar
      if (canvas.offsetParent !== null) {
        update(dt);
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ── input ──
    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      // compensa escala (animação da janela) entre tela e canvas
      pointer.x = ((e.clientX - r.left) * vw) / r.width;
      pointer.y = ((e.clientY - r.top) * vh) / r.height;
    };
    const onDown = (e: PointerEvent) => {
      box.focus();
      setPointer(e);
      pointer.down = true;
      pointer.inside = true;
      pointer.button = e.button;
      hitTimer = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      setPointer(e);
      pointer.inside = true;
    };
    const onUp = () => {
      pointer.down = false;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer.inside = false;
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const k = keys.current;
      switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          k.left = down;
          break;
        case "d":
        case "arrowright":
          k.right = down;
          break;
        case "w":
        case " ":
        case "arrowup":
          k.jump = down;
          break;
        default:
          if (down && /^[1-4]$/.test(e.key)) {
            slotRef.current = Number(e.key) - 1;
            setSlot(slotRef.current);
          }
          return;
      }
      e.preventDefault();
    };
    const keyDown = onKey(true);
    const keyUp = onKey(false);
    const noMenu = (e: Event) => e.preventDefault();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("contextmenu", noMenu);
    box.addEventListener("keydown", keyDown);
    box.addEventListener("keyup", keyUp);
    box.focus();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("contextmenu", noMenu);
      box.removeEventListener("keydown", keyDown);
      box.removeEventListener("keyup", keyUp);
    };
  }, []);

  const pick = (i: number) => {
    slotRef.current = i;
    setSlot(i);
  };

  const toggleMode = () => {
    const next = modeRef.current === "mine" ? "place" : "mine";
    modeRef.current = next;
    setMode(next);
  };

  const hold = (key: "left" | "right" | "jump") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current[key] = true;
    },
    onPointerUp: () => (keys.current[key] = false),
    onPointerLeave: () => (keys.current[key] = false),
    onPointerCancel: () => (keys.current[key] = false),
  });

  const pad =
    "flex size-14 items-center justify-center rounded-2xl border-[3px] border-black/70 bg-black/35 text-white backdrop-blur-sm active:bg-black/60 select-none touch-none";
  const total = found.filter((c) => c > 0).length;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      className="relative h-full w-full touch-none overflow-hidden bg-[#6fb7ff] font-mono outline-none select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* coleção da stack */}
      <div className="absolute left-2 top-2 rounded-lg border-2 border-black/60 bg-black/45 p-1.5 text-white backdrop-blur-sm">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider">
          stack {total}/{ORES.length}
        </p>
        <div className="grid grid-cols-9 gap-0.5">
          {ORES.map((o, i) => (
            <span
              key={o.nome}
              title={found[i] ? `${o.nome} — ${o.lore}` : "???"}
              className={`relative flex size-4 items-center justify-center bg-[#7d7d7d] ${found[i] ? "" : "opacity-30"}`}
            >
              <span className="size-2" style={{ backgroundColor: o.cor }} />
            </span>
          ))}
        </div>
      </div>

      {/* hotbar */}
      <div
        className={`absolute flex border-[3px] border-[#373737] bg-[#8b8b8b] p-0.5 ${
          touch ? "right-2 top-2" : "bottom-3 left-1/2 -translate-x-1/2"
        }`}
      >
        {PLACEABLE.map((b, i) => (
          <button
            key={b.id}
            onClick={() => pick(i)}
            aria-label={`${b.nome} (${counts[b.id] ?? 0})`}
            className={`relative flex size-10 items-center justify-center border-2 ${
              i === slot ? "z-10 border-white bg-[#a0a0a0]" : "border-t-[#373737] border-l-[#373737] border-b-white border-r-white"
            }`}
          >
            <BlockSwatch id={b.id} />
            <span className="absolute bottom-0 right-0.5 text-[11px] font-black leading-none text-white [text-shadow:1px_1px_0_#3f3f3f]">
              {counts[b.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {!touch && (
        <p className="pointer-events-none absolute bottom-3 left-3 max-w-[30%] text-[10px] leading-tight text-white [text-shadow:1px_1px_0_#000]">
          A/D andar · W pular · clique quebra · botão direito coloca · 1-4 bloco
        </p>
      )}

      {/* conquistas, estilo toast do jogo */}
      <div className="pointer-events-none absolute right-2 top-16 flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="w-56 border-2 border-[#555] bg-[#212121]/95 px-3 py-2"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#ffe066]">
                conquista desbloqueada!
              </p>
              <p className="text-sm font-bold text-white">{t.titulo}</p>
              <p className="text-[11px] text-gray-400">{t.texto}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {touch && (
        <>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button aria-label="andar pra esquerda" className={pad} {...hold("left")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} strokeWidth={2.5} />
            </button>
            <button aria-label="andar pra direita" className={pad} {...hold("right")}>
              <HugeiconsIcon icon={ArrowRight01Icon} size={28} strokeWidth={2.5} />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              aria-label={mode === "mine" ? "modo: quebrar" : "modo: colocar"}
              onClick={toggleMode}
              className={`${pad} ${mode === "place" ? "bg-[#c1440e]/80" : ""}`}
            >
              <HugeiconsIcon icon={mode === "mine" ? PickaxeIcon : CubeIcon} size={26} strokeWidth={2} />
            </button>
            <button aria-label="pular" className={pad} {...hold("jump")}>
              <HugeiconsIcon icon={ArrowUp01Icon} size={28} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// miniatura do bloco na hotbar (cores lisas, leve)
const SWATCH: Record<number, [string, string]> = {
  2: ["#8b5a2b", "#6b4220"],
  3: ["#8a8a8a", "#6e6e6e"],
  4: ["#7c5733", "#4a321c"],
  5: ["#3f8f2a", "#26651a"],
};

const BlockSwatch = ({ id }: { id: number }) => {
  const [a, b] = SWATCH[id];
  return (
    <span
      className="size-6 border border-black/40"
      style={{ background: `repeating-linear-gradient(45deg, ${a} 0 4px, ${b} 4px 6px)` }}
    />
  );
};

export default Craft;
