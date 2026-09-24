"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSound from "@/src/hooks/useSound";
import { useGitHubRepos } from "@/src/hooks/useGitHubRepos";
import Contributions from "./Contributions";

const PAGE_SIZE = 8;

const statusLabel = {
  live: "text-green-400",
  wip: "text-yellow-300",
  archived: "text-gray-400",
} as const;

const Projects = () => {
  const { repos, loading } = useGitHubRepos();
  const [page, setPage] = useState(1);
  const { play } = useSound("/sounds/click.mp3", { speed: 1.5 });

  const pages = Math.max(1, Math.ceil(repos.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const current = repos.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--color-bg-secondary)] p-6 font-mono text-sm">
      <header className="mb-5">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          ~/projects
        </h2>
        <p className="mt-1 text-[var(--color-cn-highlight)] text-xs">
          ls -la · danieltinois@{loading ? "carregando github…" : `${repos.length} projetos`}
        </p>
      </header>

      <div className="mb-5 rounded-2xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] p-4 shadow-bump-sm">
        <Contributions />
      </div>

      {repos.length === 0 ? (
        <p className="text-[var(--color-text)] opacity-70">
          diretório vazio. deploy em breve.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {current.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.25 }}
              className="flex flex-col gap-2 rounded-2xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] p-4 shadow-bump-sm"
            >
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {p.name}
                </h3>
                <span className={`text-xs font-bold ${statusLabel[p.status]}`}>
                  ● {p.status}
                </span>
              </header>

              <p className="leading-relaxed text-[var(--color-text)] opacity-80">
                {p.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border-2 border-(--color-cn-border) bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs font-bold text-[var(--color-cn-highlight)]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <footer className="flex gap-4 pt-2 text-xs font-bold text-[var(--color-cn-highlight)]">
                {p.links.github && (
                  <a
                    href={p.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:opacity-70"
                  >
                    github ↗
                  </a>
                )}
                {p.links.live && (
                  <a
                    href={p.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:opacity-70"
                  >
                    demo ↗
                  </a>
                )}
              </footer>
            </motion.article>
          ))}
          </div>

          <nav className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                play();
                setPage(safePage - 1);
              }}
              disabled={safePage <= 1}
              className="rounded-xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] px-3 py-1 font-bold text-[var(--color-text)] shadow-bump-sm transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none"
            >
              ← anterior
            </button>
            <span className="text-xs font-bold text-[var(--color-text)] opacity-70">
              {safePage} / {pages}
            </span>
            <button
              onClick={() => {
                play();
                setPage(safePage + 1);
              }}
              disabled={safePage >= pages}
              className="rounded-xl border-4 border-(--color-cn-border) bg-[var(--color-bg)] px-3 py-1 font-bold text-[var(--color-text)] shadow-bump-sm transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none"
            >
              próximo →
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

export default Projects;