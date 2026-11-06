"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import useSound from "@/src/hooks/useSound";
import { openApp } from "@/src/hooks/useOpenApp";

const btn =
  "rounded-xl border-4 border-(--color-cn-border) px-4 py-1.5 font-mono text-sm font-bold shadow-bump-sm transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-(--color-cn-highlight)";

// quem é, o que faz e como falar: o que um recrutador procura nos primeiros segundos
const HomeHero = () => {
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });

  const open = (title: string) => {
    play();
    openApp(title);
  };

  return (
    <section className="max-w-[60ch] text-(--color-text)">
      <h1 className="font-mono text-[clamp(2.5rem,5.5vw,3.75rem)] font-black leading-[0.95] tracking-tight [text-shadow:4px_4px_0_var(--color-cn-shadow)]">
        Daniel Tinois
      </h1>
      <p className="mt-4 text-base leading-relaxed opacity-85">
        Dev full stack pleno na Verzel, em São Paulo. Faço web com React e Next, mobile com
        Flutter e APIs em Node. Penso no produto antes da feature.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => open("projects")}
          className={`${btn} bg-(--color-cn-highlight) text-[#1a120a]`}
        >
          Ver projetos
        </button>
        <button onClick={() => open("about")} className={`${btn} bg-(--color-bg)`}>
          Ler minha história
        </button>
        <a
          href="mailto:me@danieltinois.dev"
          onClick={() => play()}
          className="ml-1 inline-flex items-center gap-1.5 rounded-md font-mono text-sm underline decoration-2 underline-offset-4 hover:text-(--color-cn-highlight) focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-(--color-cn-highlight)"
        >
          <HugeiconsIcon icon={Mail01Icon} size={18} color="currentColor" strokeWidth={2} />
          me@danieltinois.dev
        </a>
      </div>
    </section>
  );
};

export default HomeHero;
