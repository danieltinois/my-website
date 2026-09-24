// Worker principal do site (Cloudflare Workers Static Assets).
//
// O Cloudflare serve os arquivos de out/ (binding ASSETS) direto, sem rodar
// este Worker. O Worker so roda para paths que nao batem com nenhum asset —
// aqui, /api/github/contributions (mesmo path da antiga Pages Function/Route
// Handler; o componente Contributions.tsx continua fetchando /api/... sem
// mudanca).

interface DayCell {
  date: string;
  level: number;
}

// agrupa dias em colunas de semana (Sun..Sat), robusto a qualquer ordem do HTML
const buildWeeks = (cells: DayCell[]): DayCell[][] => {
  const weekOf = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    c.setDate(c.getDate() + 3 - ((c.getDay() + 6) % 7));
    const w1 = new Date(c.getFullYear(), 0, 4);
    return 1 + Math.round(((c.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  };

  const map = new Map<string, DayCell[]>();
  for (const cell of cells) {
    const d = new Date(cell.date + "T00:00:00");
    const key = `${d.getFullYear()}-${weekOf(d)}`;
    const col = map.get(key) ?? [];
    col.push(cell);
    map.set(key, col);
  }
  return [...map.values()].map((col) =>
    col.sort((a, b) => new Date(a.date).getDay() - new Date(b.date).getDay()),
  );
};

async function handleContributions(): Promise<Response> {
  try {
    const res = await fetch("https://github.com/users/danieltinois/contributions", {
      headers: { "User-Agent": "my-website" },
    });
    if (!res.ok) {
      return json({ error: `github: ${res.status}` }, 502);
    }
    const html = await res.text();

    const cells: DayCell[] = [];
    const bothOrders = [
      /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"/g,
      /data-level="([0-4])"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g,
    ];
    for (const re of bothOrders) {
      for (const m of html.matchAll(re)) {
        cells.push({ date: m[1], level: Number(m[2]) });
      }
    }
    // dedupe (regex duplo pode pegar o mesmo dia 2x)
    const byDate = new Map<string, number>();
    for (const c of cells) {
      byDate.set(c.date, Math.max(byDate.get(c.date) ?? 0, c.level));
    }
    const unique: DayCell[] = [...byDate].map(([date, level]) => ({ date, level }));

    const totalMatch = html.match(
      /(\d[\d,]*)\s+contributions?\s+in the last year/i,
    );
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : 0;

    return json({ weeks: buildWeeks(unique), total });
  } catch {
    return json({ error: "github indisponível" }, 502);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

interface Env {
  ASSETS: { fetch: (input: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/github/contributions") {
      return handleContributions();
    }
    return env.ASSETS.fetch(request);
  },
};