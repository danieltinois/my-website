"use client";

import { MotionValue, useSpring, useTransform } from "framer-motion";
import { RefObject } from "react";

export const useDockMagnet = (
  mouseX: MotionValue<number>,
  ref: RefObject<HTMLElement | null>,
) => {
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

  return { size, iconSize };
};