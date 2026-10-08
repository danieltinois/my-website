"use client";

import React from "react";
import ButtonSocialMedia from "@/src/components/ui/ButtonSocialMedia";
import ButtonDockApp from "@/src/components/ui/ButtonDockApp";
import {
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";
import { motion, useMotionValue } from "framer-motion";
import { useWindowManager } from "@/src/context/WindowManager";
import { DesktopAppProps } from "@/src/components/features/DesktopApp/interface";
import { useOpenAppListener } from "@/src/hooks/useOpenApp";

const Footer = ({ apps }: { apps: DesktopAppProps[] }) => {
  const mouseX = useMotionValue(Infinity);
  const { windows, launchApp, restoreWindow, focusWindow } = useWindowManager();
  useOpenAppListener((title) => {
    const app = apps.find((a) => a.title === title);
    if (app) launchApp(app.windowContent, app.title, app.icon);
  }, "(min-width: 768px)");

  // janelas que não são apps fixos do dock (ex.: lixeira)
  const extras = windows.filter(
    (w) => w.icon && !apps.some((a) => a.title === w.title),
  );

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
      {apps.map((app) => (
        <ButtonDockApp
          key={app.title}
          mouseX={mouseX}
          title={app.title}
          icon={app.icon}
          open={windows.some((w) => w.title === app.title)}
          onClick={() => launchApp(app.windowContent, app.title, app.icon)}
        />
      ))}
      {extras.map((w) => (
        <ButtonDockApp
          key={w.id}
          mouseX={mouseX}
          title={w.title}
          icon={w.icon!}
          open
          onClick={() => (w.minimized ? restoreWindow(w.id) : focusWindow(w.id))}
        />
      ))}
      <div
        aria-hidden="true"
        className="h-10 w-px bg-(--color-cn-border) opacity-50 self-center"
      />
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