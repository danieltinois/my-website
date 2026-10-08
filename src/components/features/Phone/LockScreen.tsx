"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  FlashlightIcon,
  LockIcon,
  SquareTerminalIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { useClock } from "@/src/hooks/useClock";
import useSound from "@/src/hooks/useSound";

const KEY = "daniel:unlocked";

// tela de bloqueio: aparece na primeira visita da sessão, desliza pra cima pra entrar
const LockScreen = () => {
  const now = useClock();
  const [locked, setLocked] = useState(true);
  const { play } = useSound("/sounds/bubble.mp3", { speed: 1.3 });

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(KEY)) setLocked(false);
    } catch {}
  }, []);

  const unlock = () => {
    play();
    navigator.vibrate?.(10);
    setLocked(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          key="lock"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.9, bottom: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.y < -110 || info.velocity.y < -500) unlock();
          }}
          exit={{ y: "-100%", transition: { type: "spring", stiffness: 260, damping: 30 } }}
          className="fixed inset-0 z-50 flex touch-none flex-col items-center bg-(--color-bg)/80 px-6 pt-16 text-(--color-text) backdrop-blur-2xl select-none"
        >
          <HugeiconsIcon icon={LockIcon} size={22} strokeWidth={2} />
          <p className="mt-3 text-lg font-semibold first-letter:uppercase">
            {now?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) ?? ""}
          </p>
          <p className="font-mono text-8xl leading-none font-black tabular-nums [text-shadow:4px_4px_0_var(--color-cn-shadow)]">
            {now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--"}
          </p>

          {/* notificação */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.6, type: "spring" } }}
            className="mt-10 flex w-full items-start gap-3 rounded-[22px] border-4 border-(--color-cn-border) bg-(--color-bg-secondary) p-3 shadow-bump"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-(--color-cn-border) bg-[#1a1a1a] text-white">
              <HugeiconsIcon icon={SquareTerminalIcon} size={22} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-bold">daniel</span>
                <span className="text-xs opacity-60">agora</span>
              </span>
              <span className="block text-sm leading-snug opacity-85">
                oi! bem-vindo ao meu portfólio. desliza pra cima pra entrar — tem até um minecraft escondido aí dentro.
              </span>
            </span>
          </motion.div>

          <div className="mt-auto mb-[max(1.25rem,env(safe-area-inset-bottom))] flex w-full flex-col items-center gap-5">
            <div className="flex w-full justify-between px-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur">
                <HugeiconsIcon icon={FlashlightIcon} size={22} />
              </span>
              <span className="flex size-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur">
                <HugeiconsIcon icon={Camera01Icon} size={22} />
              </span>
            </div>
            <motion.button
              onClick={unlock}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-sm font-semibold opacity-80"
            >
              deslize pra cima pra abrir
            </motion.button>
            <span className="h-[5px] w-32 rounded-full bg-(--color-text) opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockScreen;
