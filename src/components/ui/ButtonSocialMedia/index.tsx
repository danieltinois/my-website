"use client";

import React, { useRef } from "react";
import ButtonSocialMediaProps from "@/src/components/ui/ButtonSocialMedia/interface";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useSpring, useTransform } from "framer-motion";
import useClickSound from "@/src/hooks/useClickSound";

const ButtonSocialMedia = ({
  link,
  icon,
  label,
  mouseX,
  hoverColor = "white",
}: ButtonSocialMediaProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const { playClick } = useClickSound(false, 1.5);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(distance, [-100, 0, 100], [55, 100, 40]);

  const size = useSpring(sizeSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const iconSize = useTransform(size, [55, 100], [40, 65]);

  const handleClick = () => {
    playClick();
  };

  return (
    <motion.a
      ref={ref}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileTap={{
        filter: "brightness(0.5)",
        scale: 0.95,
      }}
      style={
        {
          width: size,
          height: size,
          "--hover-clr": hoverColor,
        } as ButtonSocialMediaProps["style"]
      }
      className="flex shrink-0 aspect-square items-center justify-center text-(--color-docker-icon) transition-colors duration-300 hover:text-(--hover-clr) cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center"
      >
        <HugeiconsIcon icon={icon} size="100%" />
      </motion.div>
    </motion.a>
  );
};

export default ButtonSocialMedia;
