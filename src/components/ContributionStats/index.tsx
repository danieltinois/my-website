import snapshot from "@/src/data/contributions.json";
import { formatDate, formatNumber, toStats, toWeeks, type Snapshot } from "@/src/lib/contributions";

// Os números por trás das montanhas do castelo: legenda, quatro estatísticas e a tabela
// semana a semana (para leitor de tela e para quem quer conferir).
const ContributionStats = ({ data = snapshot as Snapshot }: { data?: Snapshot }) => {
  const days = data.days;
  if (days.length === 0) return null;
  const weeks = toWeeks(days);
  const stats = toStats(days, weeks);
  const first = days[0].date;
  const last = days.at(-1)!.date;

  return (
    <div>
      <p className="text-caption text-muted">
        As montanhas atrás do castelo são as minhas contribuições públicas no GitHub, uma por semana, de{" "}
        {formatDate(first)} a {formatDate(last)}. A fogueira marca a semana em que começaram os três projetos.
      </p>

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
    </div>
  );
};

export default ContributionStats;
