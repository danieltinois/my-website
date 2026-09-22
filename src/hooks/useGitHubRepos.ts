"use client";

import { useEffect, useState } from "react";
import { PROJECTS, Project } from "@/src/data/projects";

const USER = "danieltinois";

export const useGitHubRepos = (): { repos: Project[]; loading: boolean } => {
  const [repos, setRepos] = useState<Project[]>(PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`)
      .then((res) => {
        if (!res.ok) throw new Error(`github api: ${res.status}`);
        return res.json();
      })
      .then((list: unknown[]) => {
        if (!alive) return;
        const mapped: Project[] = (list as any[])
          .filter((r) => !r.fork)
          .map((r) => ({
            name: r.name,
            description: r.description ?? "sem descrição — abre o repo 👀",
            stack: [r.language, ...(r.topics ?? [])]
              .filter(Boolean)
              .slice(0, 4),
            status: r.archived ? "archived" : "live",
            links: {
              github: r.html_url,
              live: r.homepage || undefined,
            },
          }));
        setRepos(mapped.length ? mapped : PROJECTS);
      })
      .catch(() => alive && setRepos(PROJECTS))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { repos, loading };
};