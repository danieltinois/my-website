import ThemeToggle from "@/src/components/ThemeToggle";
import { PERFIL } from "@/src/data/site";

export const SECOES = [
  { id: "projetos", n: "1", titulo: "Projetos" },
  { id: "trajetoria", n: "2", titulo: "Trajetória" },
  { id: "contato", n: "3", titulo: "Contato" },
];

// cabeçalho corrido de ficha técnica: nome à esquerda, índice e tema à direita
const SiteHeader = () => (
  <header className="flex items-baseline justify-between gap-6 border-b py-4 text-caption">
    <a href="#" className="font-semibold no-underline hover:underline">
      {PERFIL.nome}
    </a>
    <div className="flex items-baseline gap-6">
      <nav aria-label="Seções" className="hidden md:block">
        <ol className="flex gap-6">
          {SECOES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="no-underline hover:underline">
                <span className="mr-2 font-stretch-condensed tabular-nums text-muted">{s.n}</span>
                {s.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <ThemeToggle />
    </div>
  </header>
);

export default SiteHeader;
