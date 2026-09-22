"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Refresh01Icon,
  Coffee01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import useSound from "@/src/hooks/useSound";
import { FILES, SOCIALS } from "@/src/components/features/Terminal/commands";
import Mascot from "./Mascot";
import "./retro.css";

const PAGES = [
  { id: "inicio", label: "inicio" },
  { id: "sobre", label: "sobre" },
  { id: "stack", label: "stack" },
  { id: "contato", label: "contato" },
] as const;

type PageId = (typeof PAGES)[number]["id"];

const chip = "border-[3px] border-(--color-cn-shadow) bg-(--color-bg-secondary) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]";
const tabCls = (active: boolean) =>
  `border-[3px] px-3 py-1 font-bold uppercase tracking-widest text-xs transition-transform active:translate-y-0.5 cursor-pointer ${
    active
      ? "border-(--color-cn-border) bg-(--color-cn-highlight) text-[#1a120a] shadow-[2px_2px_0_var(--color-cn-shadow)]"
      : "border-(--color-cn-border) bg-[var(--color-bg)] text-[var(--color-text)] shadow-[2px_2px_0_var(--color-cn-shadow)] hover:bg-(--color-bg-secondary)"
  }`;

const About = () => {
  const [page, setPage] = useState<PageId>("inicio");
  const [loading, setLoading] = useState(false);
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });

  const go = (id: PageId) => {
    if (id === page) return;
    play();
    setPage(id);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 350);
  };

  return (
    <div className="retro-bg scanlines h-full w-full overflow-y-auto bg-[var(--color-bg)] font-mono">
      {/* ── chrome de browser falso: site dentro do site ── */}
      <div className="sticky top-0 z-10 border-b-[3px] border-(--color-cn-shadow) bg-(--color-bg-header)">
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <button
            aria-label="voltar"
            onClick={() => play()}
            className="border-[3px] border-(--color-cn-shadow) bg-[var(--color-bg)] px-1.5 font-bold leading-none text-[var(--color-text)] shadow-[2px_2px_0_var(--color-cn-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="color-text" strokeWidth={2} />
          </button>
          <button
            aria-label="avançar"
            onClick={() => play()}
            className="border-[3px] border-(--color-cn-shadow) bg-[var(--color-bg)] px-1.5 font-bold leading-none text-[var(--color-text)] shadow-[2px_2px_0_var(--color-cn-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="color-text" strokeWidth={2} />
          </button>
          <button
            aria-label="atualizar"
            onClick={() => {
              play();
              setLoading(true);
              window.setTimeout(() => setLoading(false), 350);
            }}
            className="border-[3px] border-(--color-cn-shadow) bg-[var(--color-bg)] px-1.5 font-bold leading-none text-[var(--color-text)] shadow-[2px_2px_0_var(--color-cn-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <HugeiconsIcon icon={Refresh01Icon} size={16} color="color-text" strokeWidth={2} />
          </button>
          <div className="flex flex-1 items-center gap-2 border-[3px] border-(--color-cn-shadow) bg-[var(--color-bg)] px-2 py-1 text-[11px] text-[var(--color-text)]">
            <HugeiconsIcon icon={Coffee01Icon} size={16} color="color-cn-highlight" strokeWidth={2} />
            <span className="truncate">
              http://tinois.dev/~daniel/{page}.html
            </span>
          </div>
        </div>
        {loading && <div className="retro-loader h-[3px] bg-(--color-cn-highlight)" />}
      </div>

      {/* ── menu do site ── */}
      <nav className="flex flex-wrap gap-2 px-4 pt-4">
        {PAGES.map((p) => (
          <button key={p.id} onClick={() => go(p.id)} className={tabCls(p.id === page)}>
            {p.label}
          </button>
        ))}
      </nav>

      {/* ── faixa marquee ── */}
      <div className="mt-4 overflow-hidden border-y-[3px] border-(--color-cn-shadow) bg-(--color-bg-secondary) py-1">
        <div className="retro-marquee flex w-max whitespace-nowrap">
          <span className="px-4 text-xs font-bold tracking-widest text-[var(--color-text)]">
            * bem-vindo ao meu site * site dentro do site * café &amp; código *
            full stack dev em são paulo *
          </span>
          <span aria-hidden className="px-4 text-xs font-bold tracking-widest text-[var(--color-text)]">
            * bem-vindo ao meu site * site dentro do site * café &amp; código *
            full stack dev em são paulo *
          </span>
        </div>
      </div>

      {/* ── conteúdo da página ── */}
      <div className="px-4 pb-6 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
          >
            {page === "inicio" && (
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                <Mascot />
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-black uppercase tracking-wide text-[var(--color-text)] [text-shadow:3px_3px_0_var(--color-cn-shadow)] sm:text-5xl">
                    Daniel
                  </h1>
                  <h1 className="-mt-1 text-4xl font-black uppercase tracking-wide text-(--color-cn-highlight) [text-shadow:3px_3px_0_var(--color-cn-shadow)] sm:text-5xl">
                    Tinois
                  </h1>
                  <p className="mt-3 text-sm text-[var(--color-text)] opacity-80">
                    full stack developer — são paulo, br
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text)] opacity-80">
                    status:{" "}
                    <span className="retro-blink inline-block size-2 bg-(--color-cn-highlight)" />{" "}
                    online &amp;&amp; coding
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    <button onClick={() => go("sobre")} className={tabCls(false)}>
                      ler sobre&nbsp;
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="color-text" strokeWidth={2} />
                    </button>
                    <button onClick={() => go("stack")} className={tabCls(false)}>
                      ver stack&nbsp;
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="color-text" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {page === "sobre" && (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="space-y-5 sm:flex-1">
                  <h2 className="text-xl font-black uppercase tracking-widest text-(--color-cn-highlight) [text-shadow:2px_2px_0_var(--color-cn-shadow)]">
                    // sobre
                  </h2>
                  <p className="leading-relaxed text-[var(--color-text)] opacity-90">
                    {FILES["bio.txt"]}
                  </p>
                  <blockquote className="border-l-[3px] border-(--color-cn-highlight) pl-3 text-sm italic text-[var(--color-text)] opacity-75">
                    {FILES["mindset.txt"]}
                    <span className="retro-blink text-(--color-cn-highlight)">_</span>
                  </blockquote>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className={chip}>user: daniel</div>
                    <div className={chip}>role: full stack</div>
                    <div className={chip}>loc: sp, br</div>
                    <div className={chip}>cafés hoje: 4+</div>
                  </div>
                </div>
                <Mascot mood="think" className="w-14 h-auto shrink-0 self-center" />
              </div>
            )}

            {page === "stack" && (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="space-y-5 sm:flex-1">
                  <h2 className="text-xl font-black uppercase tracking-widest text-(--color-cn-highlight) [text-shadow:2px_2px_0_var(--color-cn-shadow)]">
                    // stack
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "react",
                      "next.js",
                      "typescript",
                      "javascript",
                      "tailwind",
                      "node.js",
                      "postgresql",
                      "react native",
                      "dart",
                      "flutter",
                      "git",
                      "docker",
                      "linux (arch btw)",
                    ].map((t) => (
                      <span key={t} className={chip}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-text)] opacity-60">
                    extra: git rebase com orgulho, deploy às 22h sem medo
                  </p>
                </div>
                <Mascot mood="type" className="w-14 h-auto shrink-0 self-center" />
              </div>
            )}

            {page === "contato" && (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="space-y-5 sm:flex-1">
                  <h2 className="text-xl font-black uppercase tracking-widest text-(--color-cn-highlight) [text-shadow:2px_2px_0_var(--color-cn-shadow)]">
                    // contato
                  </h2>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {SOCIALS.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => play()}
                        className="border-[3px] border-(--color-cn-border) bg-[var(--color-bg)] px-4 py-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] shadow-[3px_3px_0_var(--color-cn-shadow)] transition-transform hover:bg-(--color-bg-secondary) active:translate-y-1 active:shadow-none"
                      >
                        {s.label} ↗
                      </a>
                    ))}
                    <a
                      href="mailto:danieltinois@gmail.com"
                      onClick={() => play()}
                      className="border-[3px] border-(--color-cn-border) bg-[var(--color-bg)] px-4 py-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] shadow-[3px_3px_0_var(--color-cn-shadow)] transition-transform hover:bg-(--color-bg-secondary) active:translate-y-1 active:shadow-none"
                    >
                      e-mail&nbsp;
                      <HugeiconsIcon icon={Mail01Icon} size={16} color="color-text" strokeWidth={2} />
                    </a>
                  </div>
                  <p className="text-xs text-[var(--color-text)] opacity-70">
                    resposta em até 1 café (~8h)
                  </p>
                </div>
                <Mascot mood="wave" className="w-16 h-auto shrink-0 self-center" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── barra de status ── */}
      <div className="border-t-[3px] border-(--color-cn-shadow) bg-(--color-bg-secondary) px-3 py-1 text-[10px] text-[var(--color-text)] opacity-70">
        feito com café em são paulo · {page}.html carregado · v2.4.1 ·{" "}
        <span className="retro-blink inline-block size-2 bg-(--color-cn-highlight)" />
      </div>
    </div>
  );
};

export default About;