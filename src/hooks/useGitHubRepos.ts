"use client";

import { useEffect, useState } from "react";
import { PROJECTS, Project } from "@/src/data/projects";

const USER = "danieltinois";

// só os campos da api do github que a gente usa
interface GitHubRepo {
  name: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics?: string[];
  html_url: string;
  homepage: string | null;
}

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
      .then((list: GitHubRepo[]) => {
        if (!alive) return;
        const mapped: Project[] = list
          .filter((r) => !r.fork)
          .map((r) => ({
            name: r.name,
            description: r.description ?? "sem descrição — abre o repo",
            stack: [r.language, ...(r.topics ?? [])]
              .filter((s): s is string => Boolean(s))
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