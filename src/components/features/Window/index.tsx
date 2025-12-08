"use client";

import { WindowProps } from "@/src/components/features/Window/interface";

const Window = ({ children, title }: WindowProps) => {
  return (
    <div className="absolute flex flex-col">
      <div
        className="
          rounded-t-lg font-mono flex
          bg-[var(--color-bg-header)]
          text-[var(--color-text-secondary)]
          text-xl top-0 left-0 px-6 py-3
          border-x-2 border-t-2 border-[color:var(--color-border)]
          "
      >
        <div className="flex grow flex-row justify-between">{title}</div>
      </div>

      <div
        className="
        flex flex-col justify-center items-center
        bg-[var(--color-bg-secondary)]
        border-2 border-[color:var(--color-border-secondary)]
        rounded-b-xl m-0 shadow-flat
        w-[var(--window-width)] h-[var(--window-height)]
        "
      >
        {children}
      </div>
    </div>
  );
};

export default Window;
