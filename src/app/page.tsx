import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import { LINKS, PERFIL, PROJETOS, TRAJETORIA } from "@/src/data/site";

const [projetos, trajetoria, contato] = SECOES;

export default function Home() {
  return (
    <div className="mx-auto max-w-page px-6 lg:px-12">
      <SiteHeader />

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />

        <Section id={projetos.id} n={projetos.n} title={projetos.titulo}>
          <div className="space-y-8">
            {PROJETOS.map((p, i) => (
              <Project key={p.id} projeto={p} n={`${Number(projetos.n)}.${i + 1}`} />
            ))}
          </div>
        </Section>

        <Section id={trajetoria.id} n={trajetoria.n} title={trajetoria.titulo}>
          <ol className="border-t border-l">
            {TRAJETORIA.map((t) => (
              <li
                key={`${t.quando}-${t.titulo}`}
                className="grid items-baseline gap-2 border-r border-b p-4 md:grid-cols-[10rem_1fr] md:gap-6"
              >
                <span className="text-caption font-stretch-condensed tabular-nums text-muted">{t.quando}</span>
                <p>
                  <span className="font-semibold">{t.titulo}.</span> <span className="text-muted">{t.texto}</span>
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id={contato.id} n={contato.n} title={contato.titulo}>
          <p className="max-w-measure text-lead">O caminho mais rápido é o e-mail.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <EmailCta />
            <a href={LINKS.github}>github</a>
            <a href={LINKS.linkedin}>linkedin</a>
          </div>
        </Section>
      </main>

      <footer className="flex flex-wrap justify-between gap-4 border-t py-6 text-caption text-muted">
        <span>{PERFIL.nome.toLowerCase()}, são paulo</span>
        <a href="#" className="no-underline hover:underline">
          voltar ao topo
        </a>
      </footer>
    </div>
  );
}
