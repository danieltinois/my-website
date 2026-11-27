import Clock from "@/src/components/Clock";
import snapshot from "@/src/data/contributions.json";
import { IDIOMAS, idioma, NOME, preencher, TEXTOS, type Idioma } from "@/src/data/site";
import { formatDate, formatNumber } from "@/src/lib/contributions";

export const SECOES = [
  { id: "projetos", n: "01" },
  { id: "trajetoria", n: "02" },
  { id: "contato", n: "03" },
] as const;

// cabeçalho fixo: nome, índice e idioma; embaixo, a faixa de status com dados ao vivo e reais.
// O idioma é um link por língua (pt, en, es, ja) para a página estática dela; o atual não é link.
const SiteHeader = ({ lang }: { lang: Idioma }) => {
  const t = TEXTOS[lang];
  const { formato } = idioma(lang);

  return (
    <header className="sticky top-0 z-30 -mx-6 border-b bg-paper px-6 text-caption lg:-mx-12 lg:px-12">
      <div className="flex items-baseline justify-between gap-6 py-4">
        <a href="#" className="font-semibold no-underline hover:underline">
          {NOME.toLowerCase()}
        </a>
        <div className="flex items-baseline gap-6">
          <nav aria-label={t.ui.secoes} className="hidden md:block">
            <ol className="flex gap-6">
              {SECOES.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="no-underline hover:underline">
                    <span className="mr-2 font-stretch-condensed tabular-nums text-muted" aria-hidden="true">
                      [{s.n}]
                    </span>
                    {t.ui.titulos[s.id].toLowerCase()}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <nav aria-label={t.ui.idioma}>
            <ul className="flex gap-3">
              {IDIOMAS.map((i) => (
                <li key={i.id}>
                  {i.id === lang ? (
                    <span aria-current="page" title={i.nome} className="font-semibold">
                      {i.rotulo}
                    </span>
                  ) : (
                    <a href={i.caminho} hrefLang={i.html} lang={i.html} title={i.nome} className="text-muted hover:text-ink">
                      {i.rotulo}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t py-2 text-muted">
        <span className="flex items-center gap-2">
          <span className="size-2 animate-pulse bg-signal" aria-hidden="true" />
          {t.ui.cidade} <Clock />
        </span>
        <span className="hidden sm:inline">{preencher(t.ui.contribuicoes12m, { n: formatNumber(snapshot.total, formato) })}</span>
        <span className="font-stretch-condensed tabular-nums">
          {t.ui.revisao} {formatDate(snapshot.fetchedAt.slice(0, 10), true, formato)}
        </span>
      </div>
    </header>
  );
};

export default SiteHeader;
