// Contribuições do GitHub: parser do HTML público e os cálculos da curva da home.
// Sem dependências: roda na build (scripts/update-contributions.ts), nos testes (node --test)
// e nos componentes de servidor.

export interface Day {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Week {
  start: string; // domingo, como no gráfico do GitHub
  count: number;
  days: number; // 7, exceto na semana em curso
}

export interface Snapshot {
  user: string;
  fetchedAt: string;
  total: number;
  days: Day[];
}

// github.com/users/<user>/contributions: cada <td data-date> tem um id, e o <tool-tip for=id>
// traz a contagem por extenso ("13 contributions on December 7th." / "No contributions on ...").
export const parseContributionsHtml = (html: string): { days: Day[]; total: number | null } => {
  const byId = new Map<string, Day>();
  for (const [tag] of html.matchAll(/<td\b[^>]*>/g)) {
    const date = tag.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (date && id) byId.set(id, { date, count: 0 });
  }

  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const day = byId.get(m[1]);
    const n = m[2].trim().match(/^(\d[\d,]*) contributions?\b/);
    if (day && n) day.count = Number(n[1].replace(/,/g, ""));
  }

  const days = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
  const totalText = html.match(/(\d[\d,]*)\s+contributions?\s+in the last year/i)?.[1];
  return { days, total: totalText ? Number(totalText.replace(/,/g, "")) : null };
};

const DAY_MS = 86_400_000;
const toUtc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const toWeeks = (days: Day[]): Week[] => {
  const weeks: Week[] = [];
  for (const day of days) {
    const ms = toUtc(day.date);
    const start = toIso(ms - new Date(ms).getUTCDay() * DAY_MS);
    const last = weeks.at(-1);
    if (last?.start === start) {
      last.count += day.count;
      last.days += 1;
    } else {
      weeks.push({ start, count: day.count, days: 1 });
    }
  }
  return weeks;
};

export interface Stats {
  total: number;
  activeDays: number;
  totalDays: number;
  longestStreak: number;
  peakWeek: Week;
}

export const toStats = (days: Day[], weeks: Week[]): Stats => {
  let longestStreak = 0;
  let streak = 0;
  for (const d of days) {
    streak = d.count > 0 ? streak + 1 : 0;
    longestStreak = Math.max(longestStreak, streak);
  }
  return {
    total: days.reduce((sum, d) => sum + d.count, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    totalDays: days.length,
    longestStreak,
    peakWeek: weeks.reduce((a, b) => (b.count > a.count ? b : a)),
  };
};

// teto "redondo" do eixo y: 4 divisões com passo de 1, 2, 2,5 ou 5 × 10^n
export const niceMax = (value: number, divisions = 4): { max: number; step: number } => {
  if (value <= 0) return { max: divisions, step: 1 };
  const raw = value / divisions;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * pow).find((s) => s >= raw) ?? 10 * pow;
  return { max: step * divisions, step };
};

export interface Point {
  x: number;
  y: number;
}

// Curva monotônica (Fritsch–Carlson): passa por todos os pontos sem inventar picos ou vales
// entre eles. Devolve um "C ..." por segmento, para a semana em curso poder ser tracejada à parte.
export const monotoneSegments = (pts: Point[]): string[] => {
  const n = pts.length;
  if (n < 2) return [];
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const slope = pts.slice(1).map((p, i) => (p.y - pts[i].y) / dx[i]);

  const tangent = pts.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    return slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }

  const f = (v: number) => Number(v.toFixed(2));
  return pts.slice(0, -1).map((p, i) => {
    const q = pts[i + 1];
    const h = dx[i] / 3;
    return `C ${f(p.x + h)} ${f(p.y + tangent[i] * h)} ${f(q.x - h)} ${f(q.y - tangent[i + 1] * h)} ${f(q.x)} ${f(q.y)}`;
  });
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const formatDate = (date: string, withYear = true): string => {
  const d = new Date(toUtc(date));
  const base = `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
  return withYear ? `${base} ${d.getUTCFullYear()}` : base;
};

export const monthLabel = (date: string): string => MESES[new Date(toUtc(date)).getUTCMonth()];

export const formatNumber = (n: number): string => n.toLocaleString("pt-BR");
