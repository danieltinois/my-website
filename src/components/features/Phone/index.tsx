"use client";

import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  GitBranchIcon,
  GithubIcon,
  InboxIcon,
  Link04Icon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  Moon01Icon,
  Sun01Icon,
  VolumeHighIcon,
  VolumeMute02Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useRef, useState } from "react";
import useSound from "@/src/hooks/useSound";
import Trash from "@/src/components/features/Trash";
import RoadmapWidget from "@/src/components/ui/RoadmapWidget";
import { useClock } from "@/src/hooks/useClock";
import { useOpenAppListener } from "@/src/hooks/useOpenApp";
import { PhoneProps } from "./interface";

// cor do "squircle" de cada app — mesma paleta cartoon network do desktop
const TINTS: Record<string, string> = {
  about: "var(--color-cn-yellow)",
  terminal: "#1a1a1a",
  projects: "var(--color-cn-orange)",
  monitor: "var(--color-cn-green)",
  craft: "#5fbf3a",
};

const DOCK = [
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/danieltinois",
    icon: Linkedin01Icon,
    tint: "var(--color-linkdin)",
  },
  {
    label: "github",
    href: "https://github.com/danieltinois",
    icon: GithubIcon,
    tint: "var(--color-github)",
  },
  {
    label: "instagram",
    href: "https://www.instagram.com/daniel.tinois",
    icon: InstagramIcon,
    tint: "var(--color-instagram)",
  },
  {
    label: "e-mail",
    href: "mailto:me@danieltinois.dev",
    icon: Mail01Icon,
    tint: "var(--color-cn-cyan)",
  },
];

// página 2: side projects tratados como startup (ver README do github)
const SIDE_PROJECTS = [
  {
    label: "tinois.dev",
    href: "https://tinois.dev",
    icon: Link04Icon,
    tint: "var(--color-cn-cyan)",
    dark: true,
  },
  {
    label: "pato-commit",
    href: "https://github.com/danieltinois/pato-commit",
    icon: InboxIcon,
    tint: "var(--color-cn-yellow)",
    dark: true,
  },
  {
    label: "git-validator",
    href: "https://github.com/danieltinois/git-validator",
    icon: GitBranchIcon,
    tint: "var(--color-github)",
    dark: false,
  },
];

const buzz = () => navigator.vibrate?.(8);

const StatusBar = ({ now }: { now: Date | null }) => (
  <div className="relative z-20 flex h-11 shrink-0 items-center justify-between px-7 text-[15px] font-semibold text-(--color-text) select-none">
    <span className="w-14 tabular-nums">
      {now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "9:41"}
    </span>

    {/* dynamic island */}
    <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

    <div className="flex w-14 items-center justify-end gap-1.5" aria-hidden="true">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" />
      </svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
        <path d="M7.5 2.2c2 0 3.9.8 5.3 2.1l1.1-1.1A9 9 0 0 0 7.5.6 9 9 0 0 0 1.1 3.2l1.1 1.1a7.5 7.5 0 0 1 5.3-2.1Z" />
        <path d="M7.5 5.3c1.2 0 2.3.4 3.1 1.2l1.1-1.1a6 6 0 0 0-8.4 0l1.1 1.1c.8-.8 1.9-1.2 3.1-1.2Z" />
        <path d="M7.5 8.3c.4 0 .8.2 1 .4L7.5 10.8 6.5 8.7c.2-.2.6-.4 1-.4Z" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.4" />
        <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
        <path d="M23 4v4c.8-.3 1.5-1.1 1.5-2S23.8 4.3 23 4Z" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  </div>
);

const AppIcon = ({
  icon,
  tint,
  label,
  dark = true,
}: {
  icon: IconSvgElement;
  tint: string;
  label: string;
  dark?: boolean;
}) => (
  <span className="flex flex-col items-center gap-1.5">
    <span
      className="flex size-[60px] items-center justify-center rounded-[18px] border-3 border-(--color-cn-border) shadow-bump-sm transition-transform duration-150 group-active:scale-90"
      style={{ backgroundColor: tint }}
    >
      <HugeiconsIcon
        icon={icon}
        size={32}
        strokeWidth={1.8}
        color={dark ? "#1a120a" : "#ffffff"}
      />
    </span>
    {label && (
      <span className="max-w-[72px] truncate text-[11px] font-semibold text-(--color-text)">
        {label}
      </span>
    )}
  </span>
);

const Widget = ({ now }: { now: Date | null }) => (
  <div className="col-span-4 flex items-center justify-between gap-3 rounded-[26px] border-4 border-(--color-cn-border) bg-(--color-bg-secondary) p-4 shadow-bump">
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-(--color-cn-highlight)">
        {now?.toLocaleDateString("pt-BR", { weekday: "long" }) ?? "hoje"}
      </p>
      <p className="font-mono text-5xl leading-none font-black tabular-nums text-(--color-text) [text-shadow:3px_3px_0_var(--color-cn-shadow)]">
        {now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--"}
      </p>
      <p className="mt-1 text-xs text-(--color-text) opacity-70">
        {now?.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) ?? ""}
      </p>
    </div>
    <div className="min-w-0 text-right font-mono">
      <p className="text-lg leading-tight font-black uppercase text-(--color-text)">daniel</p>
      <p className="text-lg leading-tight font-black uppercase text-(--color-cn-highlight)">tinois</p>
      <p className="mt-1 text-[11px] text-(--color-text) opacity-70">full stack dev</p>
      <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-(--color-text) opacity-70">
        <span className="inline-block size-2 animate-pulse rounded-full bg-(--color-cn-green)" />
        online
      </p>
    </div>
  </div>
);

interface OpenApp {
  title: string;
  content: ReactNode;
  origin: { x: number; y: number };
}

const Phone = ({ apps }: PhoneProps) => {
  const now = useClock();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<OpenApp | null>(null);
  const { play, isMuted, toggleMute } = useSound("/sounds/click.mp3", { speed: 1.5 });
  const { play: playClose } = useSound("/sounds/bubble.mp3", { speed: 1.2 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const launch = (e: React.MouseEvent<HTMLElement>, title: string, content: ReactNode) => {
    play();
    buzz();
    const r = e.currentTarget.getBoundingClientRect();
    setOpen({
      title,
      content,
      origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    });
  };

  // terminal pediu pra abrir um app (ex.: `play` → craft)
  useOpenAppListener((title) => {
    const app = apps.find((a) => a.title === title);
    if (!app) return;
    setOpen({
      title: app.title,
      content: app.windowContent,
      origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }, "(max-width: 767.98px)");

  const close = () => {
    playClose();
    buzz();
    setOpen(null);
  };

  const pagerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const onPagerScroll = () => {
    const el = pagerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== page) {
      setPage(next);
      buzz();
    }
  };

  const goToPage = (i: number) => {
    const el = pagerRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 flex h-dvh flex-col overflow-hidden">
      <StatusBar now={now} />

      {/* ── tela inicial ── */}
      <motion.main
        animate={open ? { scale: 0.92, opacity: 0.4 } : { scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* páginas deslizando pro lado — scroll-snap nativo, igual ao springboard */}
        <div
          ref={pagerRef}
          onScroll={onPagerScroll}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <section aria-label="página 1" className="w-full shrink-0 snap-start px-6 pt-4">
            <div className="grid grid-cols-4 gap-x-4 gap-y-6">
              <Widget now={now} />

              {apps.map((app) => (
                <button
                  key={app.title}
                  onClick={(e) => launch(e, app.title, app.windowContent)}
                  className="group flex justify-center"
                  aria-label={`abrir ${app.title}`}
                >
                  <AppIcon
                    icon={app.icon}
                    tint={TINTS[app.title] ?? "var(--color-cn-highlight)"}
                    label={app.title}
                    dark={app.title !== "terminal"}
                  />
                </button>
              ))}

              <button
                onClick={() => {
                  play();
                  buzz();
                  setTheme(isDark ? "light" : "dark");
                }}
                className="group flex justify-center"
                aria-label="alternar tema"
              >
                <AppIcon
                  icon={isDark ? Moon01Icon : Sun01Icon}
                  tint={isDark ? "#3c3836" : "var(--color-cn-yellow)"}
                  label="tema"
                  dark={!isDark}
                />
              </button>

              <button
                onClick={() => {
                  buzz();
                  toggleMute();
                }}
                className="group flex justify-center"
                aria-label={isMuted ? "ativar som" : "silenciar"}
              >
                <AppIcon
                  icon={isMuted ? VolumeMute02Icon : VolumeHighIcon}
                  tint={isMuted ? "#9ca3af" : "var(--color-cn-pink)"}
                  label={isMuted ? "mudo" : "som"}
                />
              </button>
            </div>
          </section>

          <section aria-label="página 2" className="w-full shrink-0 snap-start px-6 pt-4">
            <div className="grid grid-cols-4 gap-x-4 gap-y-6">
              <RoadmapWidget className="col-span-4" />

              {SIDE_PROJECTS.map((p) => (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    play();
                    buzz();
                  }}
                  className="group flex justify-center"
                  aria-label={p.label}
                >
                  <AppIcon icon={p.icon} tint={p.tint} label={p.label} dark={p.dark} />
                </a>
              ))}

              <button
                onClick={(e) => launch(e, "lixeira", <Trash />)}
                className="group flex justify-center"
                aria-label="abrir lixeira"
              >
                <AppIcon icon={Delete02Icon} tint="#d1d5db" label="lixeira" />
              </button>
            </div>
          </section>
        </div>

        <div className="my-4 flex justify-center gap-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`ir para a página ${i + 1}`}
              className={`size-2 rounded-full bg-(--color-text) transition-opacity ${
                page === i ? "opacity-100" : "opacity-30"
              }`}
            />
          ))}
        </div>

        <div className="px-6">
        {/* ── dock ── */}
        <nav className="mb-[max(1rem,env(safe-area-inset-bottom))] flex justify-around rounded-[32px] border-4 border-(--color-cn-border) bg-(--color-docker-bg) p-3 shadow-bump backdrop-blur-xl">
          {DOCK.map((d) => (
            <a
              key={d.label}
              href={d.href}
              target={d.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={d.label}
              onClick={() => {
                play();
                buzz();
              }}
              className="group"
            >
              <AppIcon icon={d.icon} tint={d.tint} label="" dark={d.label === "e-mail"} />
            </a>
          ))}
        </nav>
        </div>
      </motion.main>

      {/* ── app aberto em tela cheia ── */}
      <AnimatePresence>
        {open && (
          <motion.section
            key={open.title}
            initial={{ opacity: 0, scale: 0.15, borderRadius: 60 }}
            animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
            exit={{ opacity: 0, scale: 0.15, borderRadius: 60 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ transformOrigin: `${open.origin.x}px ${open.origin.y}px` }}
            className="fixed inset-0 z-10 flex flex-col overflow-hidden bg-(--color-bg-secondary) pt-11"
          >
            <header className="flex h-12 shrink-0 items-center border-b-4 border-(--color-cn-border) bg-(--color-bg-header) px-2 text-(--color-text-secondary)">
              <button
                onClick={close}
                className="flex items-center gap-0.5 px-2 py-1 font-semibold active:opacity-60"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={22} strokeWidth={2.5} />
                início
              </button>
              <h1 className="flex-1 pr-20 text-center font-mono text-lg font-bold">
                {open.title}
              </h1>
            </header>

            <div className="min-h-0 flex-1 pb-7">{open.content}</div>

            {/* home indicator: toca ou arrasta pra cima pra fechar */}
            <motion.button
              aria-label="voltar para a tela inicial"
              onClick={close}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.6, bottom: 0 }}
              onDragEnd={(_, info) => info.offset.y < -40 && close()}
              className="absolute inset-x-0 bottom-0 z-20 flex h-7 touch-none items-end justify-center pb-2"
            >
              <span className="h-[5px] w-32 rounded-full bg-(--color-text) opacity-60" />
            </motion.button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Phone;
