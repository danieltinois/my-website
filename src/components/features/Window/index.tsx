"use client";

import { WindowProps } from "@/src/components/features/Window/interface";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";
import Draggable from "react-draggable";

const Window = ({
  children,
  title,
  onClose,
  disabled = false,
  onFocus,
  defaultPosition,
  style,
}: WindowProps) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      disabled={disabled}
      onMouseDown={onFocus}
      defaultPosition={defaultPosition}
    >
      <div ref={nodeRef} className="absolute flex flex-col" style={style}>
        <div
          className="
          handle
          select-none
          rounded-t-lg font-mono flex
          bg-[var(--color-bg-header)]
          text-[var(--color-text-secondary)]
          text-xl top-0 left-0 px-6 py-3
          border-x-2 border-t-2 border-[color:var(--color-border)]
          "
        >
          <div className="flex grow flex-row justify-between items-center gap-4">
            <span>{title}</span>
            {onClose && (
              <button
                onClick={onClose}
                className="hover:text-[var(--color-text-highlight)] cursor-pointer flex items-center hover:scale-110 duration-250 active:scale-90"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={25}
                  color="color-text"
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>

        <div
          className="
        flex flex-col
        bg-[var(--color-bg-secondary)]
        border-2 border-[color:var(--color-border-secondary)]
        rounded-b-xl m-0 shadow-flat
        w-[var(--window-width)] h-[var(--window-height)]
        "
        >
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
