"use client";

import { WindowProps } from "@/src/components/features/Window/interface";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import useSound from "@/src/hooks/useSound";
import { motion } from "framer-motion";

const Window = ({
  children,
  title,
  onClose,
  onMinimize,
  disabled = false,
  onFocus,
  defaultPosition,
  style,
}: WindowProps) => {
  const nodeRef = useRef(null);
  const [maximized, setMaximized] = useState(false);
  const [pos, setPos] = useState(defaultPosition ?? { x: 0, y: 0 });

  const { play } = useSound("/sounds/bubble.mp3", {
    speed: 1,
    lowPassFreq: 18000,
  });

  const handleClose = () => {
    play();
    if (onClose) onClose();
  };

  const handleMinimize = () => {
    play();
    if (onMinimize) onMinimize();
  };

  const handleExpand = () => {
    if (disabled) return;
    play();
    onFocus?.();
    setMaximized((m) => !m);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      disabled={disabled || maximized}
      position={maximized ? { x: 0, y: 0 } : pos}
      onMouseDown={onFocus}
      onDrag={(_, d) => setPos({ x: d.x, y: d.y })}
      onStart={() => document.body.classList.add("grabbing-active")}
      onStop={() => document.body.classList.remove("grabbing-active")}
    >
      <div
        ref={nodeRef}
        className={maximized ? "fixed inset-x-5 top-5 bottom-24" : "flex flex-col"}
        style={style}
      >
        <motion.div
          className={maximized ? "shadow-bump w-full h-full" : "shadow-bump w-[var(--window-width)]"}
          initial={{ opacity: 0, scale: 0.6, y: -30, rotate: -2 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            transition: { type: "spring", stiffness: 380, damping: 17 },
          }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
            transition: { duration: 0.15, ease: "easeOut" },
          }}
        >
          <div
            className="
          handle
          select-none
          active:cursor-[var(--cursor-grabbing)]
          rounded-t-[22px] font-mono flex
          bg-[var(--color-bg-header)]
          text-[var(--color-text-secondary)]
          text-xl top-0 left-0 px-6 py-3
          border-6 border-[var(--color-cn-border)]
          "
          >
            <div className="flex grow flex-row justify-between items-center gap-4">
              <div className="flex flex-row items-center gap-1.5">
                <button
                  onClick={handleClose}
                  disabled={!onClose}
                  aria-label={onClose ? `fechar ${title}` : undefined}
                  className="size-3 rounded-full bg-[#ff5f57] border border-black/20
                  enabled:hover:brightness-110 enabled:hover:scale-110 active:translate-y-px
                  disabled:cursor-default cursor-pointer transition-transform"
                />
                <button
                  onClick={handleMinimize}
                  disabled={!onMinimize}
                  aria-label={onMinimize ? `minimizar ${title}` : undefined}
                  className="size-3 rounded-full bg-[#febc2e] border border-black/20
                  enabled:hover:scale-110 active:translate-y-px
                  disabled:cursor-default cursor-pointer transition-transform"
                />
                <button
                  onClick={handleExpand}
                  disabled={disabled}
                  aria-label={
                    disabled
                      ? undefined
                      : `${maximized ? "restaurar" : "expandir"} ${title}`
                  }
                  className="size-3 rounded-full bg-[#28c840] border border-black/20
                  enabled:hover:scale-110 active:translate-y-px
                  disabled:cursor-default cursor-pointer transition-transform"
                />
              </div>
              <div className="flex flex-col text-center">
                <span className="font-bold leading-tight">{title}</span>
                <span className="text-xs opacity-70 font-mono">
                  C:\daniel\portfolio\{title}
                </span>
              </div>
              <div aria-hidden="true" className="w-[76px]" />
            </div>
          </div>

          <div
            className={`
        flex flex-col
        bg-[var(--color-bg-secondary)]
        border-6 border-[var(--color-cn-border)]
        rounded-b-[22px] m-0 overflow-hidden
        w-full ${maximized ? "h-full" : "h-[var(--window-height)]"}
        `}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </Draggable>
  );
};

export default Window;