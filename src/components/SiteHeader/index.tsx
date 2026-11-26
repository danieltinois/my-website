import Clock from "@/src/components/Clock";
import ThemeToggle from "@/src/components/ThemeToggle";
import snapshot from "@/src/data/contributions.json";
import { PERFIL } from "@/src/data/site";
import { formatDate, formatNumber } from "@/src/lib/contributions";

export const SECOES = [
  { id: "projetos", n: "01", titulo: "Projetos" },
  { id: "trajetoria", n: "02", titulo: "Trajetória" },
  { id: "contato", n: "03", titulo: "Contato" },
];

// cabeçalho fixo: nome, índice e tema; embaixo, a faixa de status com dados ao vivo e reais
const SiteHeader = () => (
  <header className="sticky top-0 z-30 -mx-6 border-b bg-paper px-6 text-caption lg:-mx-12 lg:px-12">
    <div className="flex items-baseline justify-between gap-6 py-4">
      <a href="#" className="font-semibold no-underline hover:underline">
        {PERFIL.nome.toLowerCase()}
      </a>
      <div className="flex items-baseline gap-6">
        <nav aria-label="Seções" className="hidden md:block">
          <ol className="flex gap-6">
            {SECOES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="no-underline hover:underline">
                  <span className="mr-2 font-stretch-condensed tabular-nums text-muted" aria-hidden="true">
                    [{s.n}]
                  </span>
                  {s.titulo.toLowerCase()}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <ThemeToggle />
      </div>
    </div>
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t py-2 text-muted">
      <span className="flex items-center gap-2">
        <span className="size-2 animate-pulse bg-signal" aria-hidden="true" />
        são paulo <Clock />
      </span>
      <span className="hidden sm:inline">
        {formatNumber(snapshot.total)} contribuições em 12 meses
      </span>
      <span className="font-stretch-condensed tabular-nums">rev. {formatDate(snapshot.fetchedAt.slice(0, 10))}</span>
    </div>
  </header>
);

export default SiteHeader;
