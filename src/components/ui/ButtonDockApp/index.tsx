"use client";

import React, { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { TerminalIcon } from "@hugeicons/core-free-icons";
import { motion, MotionValue } from "framer-motion";
import useSound from "@/src/hooks/useSound";
import { useDockMagnet } from "@/src/hooks/useDockMagnet";

const ButtonDockApp = ({
  mouseX,
  title,
  onRestore,
}: {
  mouseX: MotionValue<number>;
  title: string;
  onRestore: () => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { size, iconSize } = useDockMagnet(mouseX, ref);
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });

  const handleClick = () => {
    play();
    onRestore();
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      aria-label={`restaurar ${title}`}
      title={title}
      style={{ width: size, height: size }}
      whileTap={{ filter: "brightness(0.5)", scale: 0.95 }}
      className="group relative flex shrink-0 aspect-square items-center justify-center text-(--color-docker-icon) cursor-pointer"
    >
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center"
      >
        <HugeiconsIcon icon={TerminalIcon} size="100%" strokeWidth={1.5} />
      </motion.div>
      <span className="absolute bottom-0 size-1.5 rounded-full bg-(--color-cn-highlight)" />
    </motion.button>
  );
};

export default ButtonDockApp;