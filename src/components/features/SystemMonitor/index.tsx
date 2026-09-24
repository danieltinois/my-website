"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const PROCESSES = [
  { name: "next dev --turbopack", cpu: 34, state: "RUNNING" },
  { name: "spotify — lo-fi p/ codar", cpu: 8, state: "PLAYING" },
  { name: "chrome (42 abas)", cpu: 62, state: "RUNNING" },
  { name: "impostor-syndrome.exe", cpu: 91, state: "ACTIVE" },
  { name: "yarn install", cpu: 99, state: "FOREVER" },
  { name: "café.rs", cpu: 5, state: "HOT" },
];

const Bar = ({ value }: { value: number }) => (
  <div className="h-3 w-full overflow-hidden rounded-full border-2 border-(--color-cn-border) bg-black/40">
    <motion.div
      animate={{ width: `${Math.min(100, Math.max(4, value))}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="h-full rounded-full bg-[var(--color-cn-highlight)]"
    />
  </div>
);

const SystemMonitor = () => {
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(57);
  const [uptime, setUptime] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(rand(15, 95));
      setRam((r) => Math.min(96, Math.max(20, r + rand(-8, 8))));
      setUptime((u) => u + 1);
      setNow(new Date());
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const fmtUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--color-bg-secondary)] p-6 font-mono text-sm">
      <header className="mb-5">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          system monitor
        </h2>
        <p className="mt-1 text-[var(--color-cn-highlight)] text-xs">
          pid {rand(1000, 9999)} · {now.toLocaleTimeString("pt-BR")}
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-4 rounded-2xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] p-4 shadow-bump-sm">
        <div>
          <div className="mb-1 flex justify-between font-bold text-[var(--color-text)]">
            <span>CPU · café-core</span>
            <span>{cpu}%</span>
          </div>
          <Bar value={cpu} />
        </div>
        <div>
          <div className="mb-1 flex justify-between font-bold text-[var(--color-text)]">
            <span>MEM · stack overflow</span>
            <span>{ram}%</span>
          </div>
          <Bar value={ram} />
        </div>
        <div>
          <div className="mb-1 flex justify-between font-bold text-[var(--color-text)]">
            <span>UPTIME</span>
            <span>{fmtUptime(uptime)}</span>
          </div>
          <Bar value={Math.min(100, uptime / 2)} />
        </div>
        <div>
          <div className="mb-1 flex justify-between font-bold text-[var(--color-text)]">
            <span>CAFÉ</span>
            <span>∞</span>
          </div>
          <Bar value={100} />
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4 rounded-2xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] p-4 shadow-bump-sm">
        <div className="h-16 w-16 shrink-0 rounded-full border-4 border-(--color-cn-border) bg-[conic-gradient(from_0deg,var(--color-cn-highlight),var(--color-cn-shadow),var(--color-cn-highlight))]" />
        <div className="min-w-0">
          <p className="truncate font-bold text-[var(--color-text)]">
            segredos-do-trabalho-final_v2.mp3
          </p>
          <p className="truncate text-[var(--color-text)] opacity-70">
            daniel e o café
          </p>
          <div className="mt-2 w-full">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <motion.div
                animate={{ width: ["10%", "90%"] }}
                transition={{ duration: 42, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                className="h-full rounded-full bg-[var(--color-cn-highlight)]"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {PROCESSES.map((p) => (
          <li
            key={p.name}
            className="flex items-center gap-3 rounded-xl border-2 border-(--color-cn-border) bg-[var(--color-bg)] px-3 py-2 font-bold text-[var(--color-text)] shadow-bump-sm"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-cn-highlight)]" />
            <span className="flex-1 truncate">{p.name}</span>
            <span className="text-xs opacity-60">{p.cpu}%</span>
            <span className="rounded-lg px-1.5 py-0.5 text-[10px] text-[var(--color-cn-highlight)]">
              {p.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemMonitor;