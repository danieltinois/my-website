"use client";

import React, { useRef } from "react";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { motion, MotionValue } from "framer-motion";
import useSound from "@/src/hooks/useSound";
import { useDockMagnet } from "@/src/hooks/useDockMagnet";

const ButtonDockApp = ({
  mouseX,
  title,
  icon,
  open,
  onClick,
}: {
  mouseX: MotionValue<number>;
  title: string;
  icon: IconSvgElement;
  open: boolean;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { size, iconSize } = useDockMagnet(mouseX, ref);
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });

  const handleClick = () => {
    play();
    onClick();
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      aria-label={open ? `ir para ${title}` : `abrir ${title}`}
      style={{ width: size, height: size }}
      whileTap={{ filter: "brightness(0.5)", scale: 0.95 }}
      className="group relative flex shrink-0 aspect-square items-center justify-center text-(--color-docker-icon) cursor-pointer"
    >
      {/* etiqueta estilo macOS em cima do ícone */}
      <span
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-(--color-cn-border)
        bg-(--color-bg-secondary) px-2 py-0.5 font-mono text-xs text-(--color-text) shadow-bump-sm
        opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {title}
      </span>
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center"
      >
        <HugeiconsIcon icon={icon} size="100%" strokeWidth={1.5} />
      </motion.div>
      {open && (
        <motion.span
          layoutId={`dock-dot-${title}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 size-1.5 rounded-full bg-(--color-cn-highlight)"
        />
      )}
    </motion.button>
  );
};

export default ButtonDockApp;
