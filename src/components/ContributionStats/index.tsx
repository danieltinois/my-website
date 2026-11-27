import snapshot from "@/src/data/contributions.json";
import { idioma, preencher, TEXTOS, type Idioma } from "@/src/data/site";
import { formatDate, formatNumber, toStats, toWeeks, type Snapshot } from "@/src/lib/contributions";

// As contribuições no GitHub logo abaixo do castelo: legenda, quatro estatísticas e a tabela
// semana a semana (para leitor de tela e para quem quer conferir).
const ContributionStats = ({ lang, data = snapshot as Snapshot }: { lang: Idioma; data?: Snapshot }) => {
  const t = TEXTOS[lang].ui.stats;
  const { formato } = idioma(lang);
  const data_ = (d: string) => formatDate(d, true, formato);
  const days = data.days;
  if (days.length === 0) return null;
  const weeks = toWeeks(days);
  const stats = toStats(days, weeks);
  const first = days[0].date;
  const last = days.at(-1)!.date;

  return (
    <div>
      <p className="text-caption text-muted">
        {preencher(t.legenda, { de: data_(first), ate: data_(last) })}
      </p>

      <dl className="mt-6 grid grid-cols-2 border-t border-l md:grid-cols-4">
        {[
          { k: t.total, v: formatNumber(stats.total, formato) },
          { k: t.dias, v: `${stats.activeDays}/${stats.totalDays}` },
          { k: t.sequencia, v: preencher(t.unidadeDias, { n: stats.longestStreak }) },
          { k: t.semanaPico, v: `${stats.peakWeek.count}` },
        ].map(({ k, v }) => (
          <div key={k} className="border-r border-b p-4">
            <dt className="text-caption font-stretch-condensed text-muted">{k}</dt>
            <dd className="mt-1 text-h3 tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <details className="mt-4 text-caption">
        <summary className="link w-max text-muted">{t.ver}</summary>
        <table className="mt-3 w-full max-w-measure border-collapse text-left tabular-nums">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 font-regular text-muted">
                {t.semanaDe}
              </th>
              <th scope="col" className="py-2 text-right font-regular text-muted">
                {t.contribuicoes}
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.start} className="border-b">
                <td className="py-1">
                  {data_(w.start)}
                  {w.days < 7 && ` ${t.emCurso}`}
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
