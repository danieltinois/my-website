import snapshot from "@/src/data/contributions.json";
import { MARCA } from "@/src/data/curva";
import {
  formatDate,
  formatNumber,
  monotoneSegments,
  monthLabel,
  niceMax,
  toStats,
  toWeeks,
  type Snapshot,
} from "@/src/lib/contributions";

// Figura 1: a curva característica. Componente de servidor, sem JavaScript no cliente:
// o SVG sai pronto do build e o desenho é só CSS (animate-draw / animate-mark).
// Linhas em SVG esticado (preserveAspectRatio="none" + non-scaling-stroke); textos e
// marcadores em HTML posicionado em %, para não deformarem em nenhuma largura.

const W = 1000;
const H = 250;

const pct = (v: number) => `${Number(v.toFixed(3))}%`;

const ContributionCurve = ({ data = snapshot as Snapshot }: { data?: Snapshot }) => {
  const days = data.days;
  if (days.length === 0) return null;

  const weeks = toWeeks(days);
  const stats = toStats(days, weeks);
  const { max, step } = niceMax(stats.peakWeek.count);

  const xOf = (i: number) => (i / (weeks.length - 1)) * W;
  const yOf = (count: number) => H - (count / max) * H;
  const points = weeks.map((w, i) => ({ x: xOf(i), y: yOf(w.count) }));
  const segments = monotoneSegments(points);

  // a semana em curso é parcial: o último trecho vai tracejado
  const ongoing = weeks.at(-1)!.days < 7;
  const solid = `M ${points[0].x} ${points[0].y} ${(ongoing ? segments.slice(0, -1) : segments).join(" ")}`;
  const dashed = ongoing ? `M ${points.at(-2)!.x} ${points.at(-2)!.y} ${segments.at(-1)}` : null;

  const gridValues = Array.from({ length: max / step + 1 }, (_, i) => i * step);

  // primeiro domingo de cada mês vira rótulo do eixo x
  const months = weeks
    .map((w, i) => ({ i, start: w.start }))
    .filter(({ i, start }) => i === 0 || start.slice(5, 7) !== weeks[i - 1].start.slice(5, 7))
    .filter(({ i }) => i > 0 && i < weeks.length - 2);

  const markIndex = weeks.findIndex((w, i) => {
    const next = weeks[i + 1]?.start ?? "9999";
    return MARCA.de >= w.start && MARCA.de < next;
  });
  const mark = markIndex >= 0 ? { x: xOf(markIndex) / W, y: yOf(weeks[markIndex].count) / H } : null;
  const markTitle = `${formatDate(MARCA.de, false).split(" ")[0]}–${formatDate(MARCA.ate, false)}`;

  const first = days[0].date;
  const last = days.at(-1)!.date;
  const summary = `Contribuições por semana de ${formatDate(first)} a ${formatDate(last)}: variam de 0 a ${stats.peakWeek.count}, com pico na semana de ${formatDate(stats.peakWeek.start)}.`;

  return (
    <figure>
      <div className="border bg-plate px-4 pt-24 pb-4 md:px-6">
        <div className="grid grid-cols-[2rem_1fr] gap-x-3">
          {/* eixo y */}
          <div className="relative" aria-hidden="true">
            {gridValues.map((v) => (
              <span
                key={v}
                className="absolute right-0 -translate-y-1/2 text-caption font-stretch-condensed tabular-nums text-muted"
                style={{ top: pct((1 - v / max) * 100) }}
              >
                {v}
              </span>
            ))}
          </div>

          {/* área do gráfico */}
          <div className="relative aspect-[2/1] md:aspect-[4/1]" role="img" aria-label={summary}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {gridValues.map((v) => (
                <line
                  key={v}
                  x1={0}
                  x2={W}
                  y1={yOf(v)}
                  y2={yOf(v)}
                  className="stroke-rule"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <g className="animate-draw">
                <path d={solid} fill="none" className="stroke-ink" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                {dashed && (
                  <path
                    d={dashed}
                    fill="none"
                    className="stroke-ink"
                    strokeWidth={1.5}
                    strokeDasharray="3 4"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            </svg>

            {mark && (
              <div className="animate-mark" aria-hidden="true">
                {/* linha de chamada: do rótulo, acima do gráfico, até o ponto */}
                <span
                  className="absolute -top-2 w-0 border-l border-muted"
                  style={{ left: pct(mark.x * 100), height: `calc(${pct(mark.y * 100)} + var(--spacing-2))` }}
                />
                <span
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 bg-signal"
                  style={{ left: pct(mark.x * 100), top: pct(mark.y * 100) }}
                />
                <span
                  className="absolute bottom-full mb-2 w-max max-w-callout pr-2 text-right text-caption"
                  style={{ right: pct((1 - mark.x) * 100) }}
                >
                  <span className="block font-semibold font-stretch-condensed tabular-nums">{markTitle}</span>
                  <span className="block text-muted">{MARCA.texto}</span>
                </span>
              </div>
            )}
          </div>

          {/* eixo x */}
          <div aria-hidden="true" />
          <div className="relative mt-2 h-6" aria-hidden="true">
            {months.map(({ i, start }, n) => (
              <span
                key={start}
                className={`absolute text-caption font-stretch-condensed text-muted ${n % 3 === 0 ? "" : "hidden md:inline"}`}
                style={{ left: pct((xOf(i) / W) * 100) }}
              >
                {monthLabel(start)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="mt-3 max-w-measure text-caption text-muted">
        Figura 1. Contribuições públicas no GitHub por semana, de {formatDate(first)} a {formatDate(last)}.
        {ongoing && " O trecho tracejado é a semana em curso."}
      </figcaption>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        {[
          { k: "Contribuições em 12 meses", v: formatNumber(stats.total) },
          { k: "Dias com contribuição", v: `${stats.activeDays} de ${stats.totalDays}` },
          { k: "Maior sequência", v: `${stats.longestStreak} dias` },
          { k: "Semana mais intensa", v: `${stats.peakWeek.count}, em ${formatDate(stats.peakWeek.start, false)}` },
        ].map(({ k, v }) => (
          <div key={k} className="border-t pt-3">
            <dt className="text-caption font-stretch-condensed text-muted">{k}</dt>
            <dd className="mt-1 text-h3 tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <details className="mt-6 text-caption">
        <summary className="cursor-pointer text-muted">Dados da figura 1</summary>
        <table className="mt-3 w-full max-w-measure border-collapse text-left tabular-nums">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 font-regular font-stretch-condensed text-muted">
                Semana de
              </th>
              <th scope="col" className="py-2 text-right font-regular font-stretch-condensed text-muted">
                Contribuições
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.start} className="border-b">
                <td className="py-1">
                  {formatDate(w.start)}
                  {w.days < 7 && " (em curso)"}
                </td>
                <td className="py-1 text-right">{w.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

export default ContributionCurve;
