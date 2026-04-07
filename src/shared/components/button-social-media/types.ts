import { IconSvgElement } from "@hugeicons/react";
import { MotionValue } from "motion-dom";
import { MotionStyle } from "framer-motion";

export default interface ButtonSocialMediaProps {
  link: string;
  icon: IconSvgElement;
  label: string;
  mouseX: MotionValue;
  hoverColor?: string;
  style?: MotionStyle & {
    "--hover-clr"?: string;
  };
}
