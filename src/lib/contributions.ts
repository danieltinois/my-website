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

// Campo de caracteres da home: cada semana é uma coluna de `rows` células. A altura da
// coluna é proporcional às contribuições da semana (relativa à semana mais intensa); dentro
// dela, o caractere fica mais denso perto do topo, como um relevo. Acima, só pontos.
export const DENSIDADE = ["@", "#", "*", "+", "=", "-", ":"] as const;
export const VAZIO = ".";

export interface Coluna {
  week: Week;
  height: number; // células preenchidas, de 0 a rows
  cells: string[]; // de cima para baixo
}

export const toField = (weeks: Week[], rows: number): Coluna[] => {
  const peak = Math.max(1, ...weeks.map((w) => w.count));
  return weeks.map((week) => {
    const height = week.count === 0 ? 0 : Math.max(1, Math.round((week.count / peak) * rows));
    const cells = Array.from({ length: rows }, (_, r) => {
      const depth = r - (rows - height); // 0 no topo da coluna, negativo acima dela
      if (depth < 0) return VAZIO;
      // a semana mais intensa ganha o "@" no topo; as outras começam em "#"
      const offset = height === rows ? 0 : 1;
      return DENSIDADE[Math.min(depth + offset, DENSIDADE.length - 1)];
    });
    return { week, height, cells };
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
