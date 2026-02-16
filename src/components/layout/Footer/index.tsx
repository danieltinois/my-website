"use client";

import React from "react";
import ButtonSocialMedia from "@/src/components/ui/ButtonSocialMedia";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@hugeicons/core-free-icons";
import { motion, useMotionValue } from "framer-motion";

const Footer = () => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto flex h-16 items-end gap-4 px-4 pb-3 rounded-2xl
      bg-(--color-docker-bg)
      backdrop-blur-xl
      border border-(--color-docker-border)
      shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
      overflow-visible"
    >
      <ButtonSocialMedia
        mouseX={mouseX}
        link="https://www.linkedin.com/in/danieltinois"
        icon={LinkedinIcon}
        hoverColor="var(--color-linkdin)"
        label="Acesse meu Linkedin"
      />
      <ButtonSocialMedia
        mouseX={mouseX}
        link="https://github.com/danieltinois"
        icon={GithubIcon}
        hoverColor="var(--color-github)"
        label="Acesse meu Github"
      />
      <ButtonSocialMedia
        mouseX={mouseX}
        link="https://www.instagram.com/daniel.tinois"
        icon={InstagramIcon}
        hoverColor="var(--color-instagram)"
        label="Acesse meu Instagram"
      />
    </motion.div>
  );
};

export default Footer;
