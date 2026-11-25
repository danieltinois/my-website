// Atualiza src/data/contributions.json com as contribuições públicas do GitHub.
// Roda antes de cada build (prebuild). Se o GitHub falhar, mantém o snapshot anterior:
// o site continua publicando com o último dado bom em vez de quebrar o deploy.
//
//   node scripts/update-contributions.mts

import { readFile, writeFile } from "node:fs/promises";
import { parseContributionsHtml, type Snapshot } from "../src/lib/contributions.ts";

const USER = "danieltinois";
const OUT = new URL("../src/data/contributions.json", import.meta.url);

const keepPrevious = async (reason: string) => {
  const previous = JSON.parse(await readFile(OUT, "utf8")) as Snapshot;
  console.warn(`contributions: ${reason}; mantendo o snapshot de ${previous.fetchedAt.slice(0, 10)}`);
};

try {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "User-Agent": "my-website-build" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`github respondeu ${res.status}`);

  const { days, total } = parseContributionsHtml(await res.text());
  const sum = days.reduce((s, d) => s + d.count, 0);

  // o HTML do GitHub muda sem aviso: se o parser não reconhecer mais a página, não grava lixo
  if (days.length < 360) throw new Error(`só ${days.length} dias no HTML`);
  if (total !== null && total !== sum) throw new Error(`total ${total} ≠ soma dos dias ${sum}`);

  const snapshot: Snapshot = { user: USER, fetchedAt: new Date().toISOString(), total: sum, days };
  await writeFile(OUT, `${JSON.stringify(snapshot)}\n`);
  console.log(`contributions: ${days.length} dias, ${sum} contribuições, até ${days.at(-1)?.date}`);
} catch (err) {
  await keepPrevious(err instanceof Error ? err.message : String(err));
}
