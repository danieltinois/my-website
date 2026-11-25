import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import PatoDiagram from "@/src/components/PatoDiagram";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import snapshot from "@/src/data/contributions.json";
import { LINKS, PERFIL, PROJETOS, TRAJETORIA } from "@/src/data/site";
import { formatDate } from "@/src/lib/contributions";

const FIGURAS: Record<string, React.ReactNode> = {
  "pato-commit": <PatoDiagram />,
};

const [projetos, trajetoria, contato] = SECOES;

export default function Home() {
  return (
    <div className="mx-auto max-w-page px-6 lg:px-12">
      <SiteHeader />

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />

        <Section id={projetos.id} n={projetos.n} title={projetos.titulo}>
          <div className="space-y-24">
            {PROJETOS.map((p, i) => (
              <Project key={p.id} projeto={p} n={`${projetos.n}.${i + 1}`} figura={FIGURAS[p.id]} />
            ))}
          </div>
        </Section>

        <Section id={trajetoria.id} n={trajetoria.n} title={trajetoria.titulo}>
          <ol className="max-w-measure">
            {TRAJETORIA.map((t) => (
              <li key={`${t.quando}-${t.titulo}`} className="grid grid-cols-[6rem_1fr] items-baseline gap-4 border-t py-4 last:border-b">
                <span className="text-caption font-stretch-condensed tabular-nums text-muted">{t.quando}</span>
                <p>
                  <span className="font-semibold">{t.titulo}.</span> {t.texto}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id={contato.id} n={contato.n} title={contato.titulo}>
          <p className="max-w-measure text-lead">O caminho mais rápido é o e-mail.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <EmailCta />
            <a href={LINKS.github}>GitHub</a>
            <a href={LINKS.linkedin}>LinkedIn</a>
          </div>
        </Section>
      </main>

      <footer className="flex flex-wrap justify-between gap-4 border-t py-6 text-caption text-muted">
        <span>{PERFIL.nome}, São Paulo</span>
        <span className="font-stretch-condensed tabular-nums">Rev. {formatDate(snapshot.fetchedAt.slice(0, 10))}</span>
      </footer>
    </div>
  );
}
