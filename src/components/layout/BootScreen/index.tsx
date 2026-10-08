"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const KEY = "daniel:booted";

const LINES = [
  "daniel OS v2026.10 — bios terracota",
  "checando café.................. ok",
  "carregando plugins (desde 2020) ok",
  "montando ~/projects............ ok",
  "escondendo a stack no craft.... ok",
  "abrindo janelas................ ok",
];

// tela de boot do desktop: primeira visita da sessão, clique ou tecla pula
const BootScreen = () => {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(false);
        return;
      }
      sessionStorage.setItem(KEY, "1");
    } catch {}

    const timers = LINES.map((_, i) => window.setTimeout(() => setStep(i + 1), 220 + i * 230));
    timers.push(window.setTimeout(() => setShow(false), 220 + LINES.length * 230 + 500));
    const skip = () => setShow(false);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)", transition: { duration: 0.35 } }}
          className="fixed inset-0 z-[10000] hidden cursor-pointer flex-col justify-center bg-[#16100a] px-[12vw] font-mono text-[#f0e2c8] md:flex"
        >
          <pre className="mb-8 text-sm leading-tight text-[#fe8019] [text-shadow:2px_2px_0_#8a3a0f]">{`  ____              _      _    ___  ____
 |  _ \\  __ _ _ __ (_) ___| |  / _ \\/ ___|
 | | | |/ _\` | '_ \\| |/ _ \\ | | | | \\___ \\
 | |_| | (_| | | | | |  __/ | | |_| |___) |
 |____/ \\__,_|_| |_|_|\\___|_|  \\___/|____/`}</pre>
          <ul className="space-y-1 text-sm">
            {LINES.slice(0, step).map((l) => (
              <motion.li key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-[#fe8019]">&gt;</span> {l}
              </motion.li>
            ))}
          </ul>
          <div className="mt-8 h-3 w-full max-w-md border-2 border-[#e8d5b5]">
            <motion.div
              className="h-full bg-[#fe8019]"
              animate={{ width: `${(step / LINES.length) * 100}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <p className="mt-4 text-xs opacity-50">clique ou aperte qualquer tecla pra pular</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
