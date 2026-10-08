"use client";

import { motion } from "framer-motion";
import { useClock } from "@/src/hooks/useClock";
import RoadmapWidget from "@/src/components/ui/RoadmapWidget";

// widgets da área de trabalho, irmãos dos da tela inicial do celular
const DesktopWidgets = () => {
  const now = useClock();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      className="fixed right-6 top-28 z-0 hidden w-52 flex-col gap-5 select-none xl:flex"
    >
      <div className="rounded-[26px] border-4 border-(--color-cn-border) bg-(--color-bg-secondary) p-4 shadow-bump">
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-cn-highlight)">
          {now?.toLocaleDateString("pt-BR", { weekday: "long" }) ?? "hoje"}
        </p>
        <p className="font-mono text-5xl leading-none font-black tabular-nums text-(--color-text) [text-shadow:3px_3px_0_var(--color-cn-shadow)]">
          {now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--"}
        </p>
        <p className="mt-1 text-xs text-(--color-text) opacity-70">
          {now?.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) ?? ""}
        </p>
        <p className="mt-3 flex items-center gap-1.5 border-t-2 border-dashed border-(--color-cn-border)/40 pt-2 font-mono text-[11px] text-(--color-text) opacity-80">
          <span className="inline-block size-2 animate-pulse rounded-full bg-(--color-cn-green)" />
          online · são paulo
        </p>
      </div>

      <RoadmapWidget className="text-xs [&_li]:text-xs" />
    </motion.aside>
  );
};

export default DesktopWidgets;
