"use client";

import React from "react";
import ButtonSocialMedia from "@/src/components/ui/ButtonSocialMedia";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons";
import { motion, useMotionValue } from "framer-motion";
import { useWindowManager } from "@/src/context/WindowManager";

const Footer = () => {
  const mouseX = useMotionValue(Infinity);
  const { windows, restoreWindow } = useWindowManager();
  const minimized = windows.filter((w) => w.minimized);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto flex h-16 items-end gap-4 px-4 pb-3 rounded-[22px]
      bg-(--color-docker-bg)
      backdrop-blur-xl
      border-4 border-(--color-cn-border)
      shadow-bump
      overflow-visible"
    >
      {minimized.map((w) => (
        <button
          key={w.id}
          onClick={() => restoreWindow(w.id)}
          aria-label={`restaurar ${w.title}`}
          title={w.title}
          className="flex size-11 flex-none items-center justify-center rounded-[14px]
            bg-(--color-docker-icon)/10 text-(--color-docker-icon)
            border-2 border-(--color-cn-border)/60
            hover:-translate-y-1 hover:bg-(--color-docker-icon)/20
            active:scale-95 cursor-pointer transition-all"
        >
          <HugeiconsIcon icon={TerminalIcon} size={22} strokeWidth={1.5} />
        </button>
      ))}
      {minimized.length > 0 && (
        <div
          aria-hidden="true"
          className="h-10 w-px bg-(--color-cn-border) opacity-50 self-center"
        />
      )}
      <ButtonSocialMedia
        mouseX={mouseX}
        link="https://www.linkedin.com/in/danieltinois"
        icon={Linkedin01Icon}
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