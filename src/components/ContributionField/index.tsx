import type { CSSProperties } from "react";
import snapshot from "@/src/data/contributions.json";
import { MARCA } from "@/src/data/curva";
import { formatDate, formatNumber, toField, toStats, toWeeks, VAZIO, type Snapshot } from "@/src/lib/contributions";
import styles from "./field.module.css";

// A peça-assinatura: as contribuições públicas dos últimos 12 meses como um campo de
// caracteres. Componente de servidor: o campo sai pronto da build e a animação é só CSS.

const ROWS = 20;

const pct = (v: number) => `${Number(v.toFixed(3))}%`;

const ContributionField = ({ data = snapshot as Snapshot }: { data?: Snapshot }) => {
  const days = data.days;
  if (days.length === 0) return null;

  const weeks = toWeeks(days);
  const stats = toStats(days, weeks);
  const field = toField(weeks, ROWS);

  const markIndex = weeks.findIndex((w, i) => MARCA.de >= w.start && MARCA.de < (weeks[i + 1]?.start ?? "9999"));
  const mark =
    markIndex >= 0
      ? { x: (markIndex + 0.5) / weeks.length, y: (ROWS - field[markIndex].height) / ROWS }
      : null;
  const markTitle = `${formatDate(MARCA.de, false).split(" ")[0]}–${formatDate(MARCA.ate, false)}`;

  const first = days[0].date;
  const last = days.at(-1)!.date;

  return (
    <figure>
      <div className={`${styles.wrap} pt-16`}>
        <div
          className={styles.field}
          style={{ "--cols": weeks.length } as CSSProperties}
          role="img"
          aria-label={`Contribuições públicas no GitHub por semana, de ${formatDate(first)} a ${formatDate(last)}. Cada coluna é uma semana; a mais alta tem ${stats.peakWeek.count} contribuições, na semana de ${formatDate(stats.peakWeek.start)}.`}
        >
          {field.map((col, i) => {
            const top = ROWS - col.height;
            return (
              <span
                key={col.week.start}
                className={`${styles.col} ${i === markIndex ? styles.mark : ""}`}
                style={{ "--i": i } as CSSProperties}
                aria-hidden="true"
              >
                {col.cells.map((ch, r) => (
                  <span key={r} className={ch === VAZIO ? styles.empty : r === top ? styles.top : styles.body}>
                    {ch}
                  </span>
                ))}
              </span>
            );
          })}
        </div>

        {mark && (
          <div aria-hidden="true">
            {/* linha de chamada do rótulo até o topo da coluna marcada */}
            <span
              className="absolute top-12 w-0 border-l border-muted"
              style={{ left: pct(mark.x * 100), height: `calc(var(--spacing-4) + (100% - var(--spacing-16)) * ${mark.y.toFixed(4)})` }}
            />
            <span
              className="absolute top-0 w-max max-w-callout pr-2 text-right text-caption"
              style={{ right: pct((1 - mark.x) * 100) }}
            >
              <span className="block font-semibold">{markTitle}</span>
              <span className="block text-muted">{MARCA.texto}</span>
            </span>
          </div>
        )}
      </div>

      <figcaption className="mt-4 text-caption text-muted">
        Contribuições públicas no GitHub, uma coluna por semana, de {formatDate(first)} a {formatDate(last)}.
      </figcaption>

      <dl className="mt-6 grid grid-cols-2 border-t border-l md:grid-cols-4">
        {[
          { k: "contribuições em 12 meses", v: formatNumber(stats.total) },
          { k: "dias com contribuição", v: `${stats.activeDays}/${stats.totalDays}` },
          { k: "maior sequência", v: `${stats.longestStreak} dias` },
          { k: "semana mais intensa", v: `${stats.peakWeek.count}` },
        ].map(({ k, v }) => (
          <div key={k} className="border-r border-b p-4">
            <dt className="text-caption font-stretch-condensed text-muted">{k}</dt>
            <dd className="mt-1 text-h3 tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <details className="mt-4 text-caption">
        <summary className="link w-max text-muted">ver os dados por semana</summary>
        <table className="mt-3 w-full max-w-measure border-collapse text-left tabular-nums">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 font-regular text-muted">
                semana de
              </th>
              <th scope="col" className="py-2 text-right font-regular text-muted">
                contribuições
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

export default ContributionField;
