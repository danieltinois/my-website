// motor 3D do craft (carregado sob demanda: só baixa o three.js quando o jogo abre)

import * as THREE from "three";
import {
  AIR,
  TABLE,
  atlas,
  breakTime,
  crackStages,
  dropOf,
  isBlock,
} from "./blocks";
import { CHUNK, Hit, World, generate, get, raycast, set } from "./world";
import { buildChunk } from "./mesher";

const PW = 0.3; // meia largura do jogador
const PH = 1.8;
const EYE = 1.62;
const SPEED = 4.3;
const GRAVITY = 28;
const JUMP = 8.4;
const REACH = 5;

export interface EngineHooks {
  selected: () => number; // id do item na mão
  consumeSelected: () => void;
  give: (id: number) => void;
  broke: (id: number, drop: number | null, tool: number) => void;
  openTable: () => void;
  openInventory: () => void;
  select: (slot: number) => void;
  scroll: (dir: number) => void;
  lockChange: (locked: boolean) => void;
}

export interface Engine {
  dispose: () => void;
  setNight: (night: boolean) => void;
  setPaused: (paused: boolean) => void;
  lock: () => void;
  // controles de toque
  move: (x: number, z: number) => void;
  look: (dx: number, dy: number) => void;
  jump: (down: boolean) => void;
  breaking: (down: boolean) => void;
  interact: () => void;
}

const SKY_DAY = new THREE.Color("#78a7ff");
const SKY_NIGHT = new THREE.Color("#0c1230");

export const startEngine = (
  canvas: HTMLCanvasElement,
  box: HTMLElement,
  opts: { night: boolean; touch: boolean },
  hooks: EngineHooks,
): Engine => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.touch ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 200);
  camera.rotation.order = "YXZ";

  // ── mundo ──
  const world: World = generate(Math.floor(Math.random() * 1e9));
  const tex = new THREE.CanvasTexture(atlas());
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true });

  const chunks = new Map<string, THREE.Mesh>();
  const nx = world.sx / CHUNK, nz = world.sz / CHUNK;
  const rebuild = (cx: number, cz: number) => {
    if (cx < 0 || cz < 0 || cx >= nx || cz >= nz) return;
    const key = `${cx},${cz}`;
    const old = chunks.get(key);
    if (old) {
      old.geometry.dispose();
      old.geometry = buildChunk(world, cx, cz);
      return;
    }
    const mesh = new THREE.Mesh(buildChunk(world, cx, cz), material);
    chunks.set(key, mesh);
    scene.add(mesh);
  };
  for (let cz = 0; cz < nz; cz++) for (let cx = 0; cx < nx; cx++) rebuild(cx, cz);

  const edit = (x: number, y: number, z: number, id: number) => {
    set(world, x, y, z, id);
    const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK);
    rebuild(cx, cz);
    // vizinhos também (faces e AO na emenda)
    const lx = x - cx * CHUNK, lz = z - cz * CHUNK;
    if (lx === 0) rebuild(cx - 1, cz);
    if (lx === CHUNK - 1) rebuild(cx + 1, cz);
    if (lz === 0) rebuild(cx, cz - 1);
    if (lz === CHUNK - 1) rebuild(cx, cz + 1);
    if (lx === 0 && lz === 0) rebuild(cx - 1, cz - 1);
  };

  // ── céu: cor, neblina, sol/lua quadrados e nuvens chapadas ──
  scene.fog = new THREE.Fog(SKY_DAY, 24, 70);
  const sun = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshBasicMaterial({ color: "#fff6c2", fog: false }),
  );
  scene.add(sun);

  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = cloudCanvas.height = 64;
  {
    const c = cloudCanvas.getContext("2d")!;
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        const v = Math.sin(x * 0.35) + Math.cos(y * 0.28) + Math.sin((x + y) * 0.18);
        if (v > 1.1) {
          c.fillStyle = "rgba(255,255,255,0.85)";
          c.fillRect(x, y, 1, 1);
        }
      }
  }
  const cloudTex = new THREE.CanvasTexture(cloudCanvas);
  cloudTex.magFilter = THREE.NearestFilter;
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
  cloudTex.repeat.set(3, 3);
  const clouds = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }),
  );
  clouds.rotation.x = -Math.PI / 2;
  clouds.position.set(world.sx / 2, world.sy + 20, world.sz / 2);
  scene.add(clouds);

  let night = opts.night;
  const applySky = () => {
    const sky = night ? SKY_NIGHT : SKY_DAY;
    scene.background = sky;
    (scene.fog as THREE.Fog).color = sky;
    (sun.material as THREE.MeshBasicMaterial).color.set(night ? "#e8ecff" : "#fff6c2");
    (clouds.material as THREE.MeshBasicMaterial).opacity = night ? 0.25 : 1;
    material.color.set(night ? "#7d86b8" : "#ffffff");
  };
  applySky();

  // ── mira: contorno preto e rachaduras ──
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)),
    new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.6 }),
  );
  outline.visible = false;
  scene.add(outline);

  const crackTex = crackStages().map((cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  });
  const crackMat = new THREE.MeshBasicMaterial({ map: crackTex[0], transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  const crack = new THREE.Mesh(new THREE.BoxGeometry(1.002, 1.002, 1.002), crackMat);
  crack.visible = false;
  scene.add(crack);

  // ── jogador ──
  const spawnX = Math.floor(world.sx / 2), spawnZ = Math.floor(world.sz / 2);
  const spawn = () => {
    let y = world.sy - 1;
    while (y > 0 && get(world, spawnX, y - 1, spawnZ) === AIR) y--;
    return { x: spawnX + 0.5, y, z: spawnZ + 0.5 };
  };
  const p = { ...spawn(), vx: 0, vy: 0, vz: 0, ground: false };
  let yaw = Math.PI / 4, pitch = -0.2;

  const input = { f: 0, s: 0, jump: false, breaking: false };
  const keys = new Set<string>();
  let paused = false;
  let locked = false;
  let target: Hit | null = null;
  let progress = 0;
  let cooldown = 0;
  let progressKey = "";

  const collides = (x: number, y: number, z: number) => {
    for (let by = Math.floor(y); by <= Math.floor(y + PH - 1e-4); by++)
      for (let bz = Math.floor(z - PW); bz <= Math.floor(z + PW - 1e-4); bz++)
        for (let bx = Math.floor(x - PW); bx <= Math.floor(x + PW - 1e-4); bx++)
          if (get(world, bx, by, bz) !== AIR && by >= 0) return true;
    return false;
  };

  const moveAxis = (axis: "x" | "y" | "z", d: number) => {
    if (!d) return false;
    const steps = Math.ceil(Math.abs(d) / 0.25);
    const inc = d / steps;
    for (let i = 0; i < steps; i++) {
      const n = { x: p.x, y: p.y, z: p.z };
      n[axis] += inc;
      if (collides(n.x, n.y, n.z)) {
        // encosta exatamente na face do bloco em vez de parar no meio do passo
        const half = axis === "y" ? 0 : PW;
        const size = axis === "y" ? PH : PW;
        const snapped = inc > 0 ? Math.floor(n[axis] + size) - size - 1e-4 : Math.floor(n[axis] - half) + 1 + half;
        const s = { x: p.x, y: p.y, z: p.z };
        s[axis] = snapped;
        if (!collides(s.x, s.y, s.z) && Math.abs(snapped - p[axis]) <= Math.abs(inc)) p[axis] = snapped;
        return true;
      }
      p[axis] = n[axis];
    }
    return false;
  };

  const physics = (dt: number) => {
    // direção relativa à câmera
    let f = input.f, s = input.s;
    if (keys.has("w") || keys.has("arrowup")) f += 1;
    if (keys.has("s") || keys.has("arrowdown")) f -= 1;
    if (keys.has("d") || keys.has("arrowright")) s += 1;
    if (keys.has("a") || keys.has("arrowleft")) s -= 1;
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const sprint = keys.has("shift") ? 1.3 : 1;
    p.vx = (-sin * f + cos * s) * SPEED * sprint;
    p.vz = (-cos * f - sin * s) * SPEED * sprint;

    if ((input.jump || keys.has(" ")) && p.ground) p.vy = JUMP;
    p.vy = Math.max(p.vy - GRAVITY * dt, -40);

    const bx = moveAxis("x", p.vx * dt);
    const bz = moveAxis("z", p.vz * dt);
    // auto-pulo de 1 bloco no celular, como no bedrock
    if (opts.touch && (bx || bz) && p.ground && !collides(p.x + Math.sign(p.vx) * 0.4, p.y + 1.05, p.z + Math.sign(p.vz) * 0.4)) {
      p.vy = JUMP;
    }
    p.ground = false;
    if (moveAxis("y", p.vy * dt)) {
      if (p.vy < 0) p.ground = true;
      p.vy = 0;
    }
    if (p.y < -10) Object.assign(p, spawn(), { vy: 0 });
  };

  const updateTarget = () => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    target = raycast(world, camera.position.x, camera.position.y, camera.position.z, dir.x, dir.y, dir.z, REACH);
    if (target) {
      outline.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
      outline.visible = true;
    } else outline.visible = false;
  };

  const doBreak = (dt: number) => {
    cooldown = Math.max(0, cooldown - dt);
    if (!input.breaking || !target || paused || cooldown > 0) {
      progress = 0;
      crack.visible = false;
      return;
    }
    const key = `${target.x},${target.y},${target.z}`;
    if (key !== progressKey) {
      progressKey = key;
      progress = 0;
    }
    const id = get(world, target.x, target.y, target.z);
    const tool = hooks.selected();
    const time = breakTime(id, tool);
    if (!isFinite(time)) return;
    progress += dt / time;
    crack.visible = true;
    crack.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
    crackMat.map = crackTex[Math.min(9, Math.floor(progress * 10))];
    if (progress >= 1) {
      edit(target.x, target.y, target.z, AIR);
      const drop = dropOf(id, tool);
      if (drop !== null) hooks.give(drop);
      hooks.broke(id, drop, tool);
      progress = 0;
      cooldown = 0.18;
      crack.visible = false;
      navigator.vibrate?.(8);
    }
  };

  const interact = () => {
    if (paused || !target) return;
    const id = get(world, target.x, target.y, target.z);
    if (id === TABLE) {
      hooks.openTable();
      return;
    }
    const item = hooks.selected();
    if (!isBlock(item)) return;
    const x = target.x + target.nx, y = target.y + target.ny, z = target.z + target.nz;
    if (get(world, x, y, z) !== AIR || y >= world.sy) return;
    // não coloca bloco dentro do jogador
    if (x + 1 > p.x - PW && x < p.x + PW && z + 1 > p.z - PW && z < p.z + PW && y + 1 > p.y && y < p.y + PH) return;
    edit(x, y, z, item);
    hooks.consumeSelected();
  };

  // ── loop ──
  const resize = () => {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(box);
  resize();

  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (canvas.offsetParent === null) return; // janela minimizada

    if (!paused) physics(dt);
    camera.position.set(p.x, p.y + EYE, p.z);
    camera.rotation.set(pitch, yaw, 0);
    updateTarget();
    doBreak(dt);

    // sol acompanha o jogador lá longe, virado pra câmera
    sun.position.set(p.x + 60, p.y + 70, p.z - 50);
    sun.lookAt(camera.position);
    cloudTex.offset.x = (now / 1000) * 0.004;

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  // ── input desktop ──
  const onMouseMove = (e: MouseEvent) => {
    if (!locked) return;
    yaw -= e.movementX * 0.0025;
    pitch = Math.max(-1.55, Math.min(1.55, pitch - e.movementY * 0.0025));
  };
  const onMouseDown = (e: MouseEvent) => {
    if (opts.touch || paused) return;
    if (!locked) {
      canvas.requestPointerLock();
      return;
    }
    if (e.button === 0) input.breaking = true;
    if (e.button === 2) interact();
  };
  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) input.breaking = false;
  };
  const onWheel = (e: WheelEvent) => {
    if (!locked) return;
    hooks.scroll(Math.sign(e.deltaY));
  };
  const onLockChange = () => {
    locked = document.pointerLockElement === canvas;
    if (!locked) {
      keys.clear();
      input.breaking = false;
    }
    hooks.lockChange(locked);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!locked && !box.contains(document.activeElement)) return;
    const k = e.key.toLowerCase();
    if (k === "e") {
      hooks.openInventory();
      e.preventDefault();
      return;
    }
    if (/^[1-9]$/.test(k)) {
      hooks.select(Number(k) - 1);
      return;
    }
    if (paused) return;
    keys.add(k);
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const noMenu = (e: Event) => e.preventDefault();

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("wheel", onWheel, { passive: true });
  canvas.addEventListener("contextmenu", noMenu);
  document.addEventListener("pointerlockchange", onLockChange);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", noMenu);
      document.removeEventListener("pointerlockchange", onLockChange);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      chunks.forEach((m) => m.geometry.dispose());
      crackTex.forEach((t) => t.dispose());
      tex.dispose();
      cloudTex.dispose();
      material.dispose();
      renderer.dispose();
    },
    setNight: (n) => {
      night = n;
      applySky();
    },
    setPaused: (v) => {
      paused = v;
      keys.clear();
      input.breaking = false;
      if (v && document.pointerLockElement === canvas) document.exitPointerLock();
    },
    lock: () => {
      if (!opts.touch) canvas.requestPointerLock();
    },
    move: (x, z) => {
      input.s = x;
      input.f = z;
    },
    look: (dx, dy) => {
      yaw -= dx * 0.006;
      pitch = Math.max(-1.55, Math.min(1.55, pitch - dy * 0.006));
    },
    jump: (down) => (input.jump = down),
    breaking: (down) => (input.breaking = down),
    interact,
  };
};
