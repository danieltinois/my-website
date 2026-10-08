"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquare02Icon, SquareIcon } from "@hugeicons/core-free-icons";
import { ROADMAP } from "@/src/data/trajetoria";

const RoadmapWidget = ({ className = "" }: { className?: string }) => (
  <div
    className={`rounded-[26px] border-4 border-(--color-cn-border) bg-(--color-bg-secondary) p-4 shadow-bump ${className}`}
  >
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-(--color-cn-highlight)">
      roadmap
    </p>
    <ul className="space-y-1.5 text-sm text-(--color-text)">
      {ROADMAP.map((r) => (
        <li key={r.item} className="flex items-center gap-2">
          <HugeiconsIcon
            icon={r.feito ? CheckmarkSquare02Icon : SquareIcon}
            size={18}
            strokeWidth={2}
            className={r.feito ? "shrink-0 text-(--color-cn-highlight)" : "shrink-0 opacity-50"}
          />
          <span className={r.feito ? "line-through opacity-60" : ""}>{r.item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default RoadmapWidget;
