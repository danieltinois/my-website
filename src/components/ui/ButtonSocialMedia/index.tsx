"use client";

import React, { useRef } from "react";
import ButtonSocialMediaProps from "@/src/components/ui/ButtonSocialMedia/interface";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import useSound from "@/src/hooks/useSound";
import { useDockMagnet } from "@/src/hooks/useDockMagnet";

const ButtonSocialMedia = ({
  link,
  icon,
  label,
  mouseX,
  hoverColor = "white",
}: ButtonSocialMediaProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });
  const { size, iconSize } = useDockMagnet(mouseX, ref);

  const handleClick = () => {
    play();
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
