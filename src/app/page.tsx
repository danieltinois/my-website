import CopiarEmail from "@/src/components/CopiarEmail";
import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import Trajetoria from "@/src/components/Trajetoria";
import { CONTATO, LINKS, PERFIL, PROJETOS } from "@/src/data/site";

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
          <Trajetoria />
        </Section>

        <Section id={contato.id} n={contato.n} title={contato.titulo}>
          {/* o fechamento: uma frase, um botão (o único em signal) e os atalhos */}
          <div className="surgir border p-6 sm:p-12 lg:p-16">
            <p className="text-h2">{CONTATO.titulo}</p>
            <p className="mt-3 max-w-measure text-lead text-muted">{CONTATO.texto}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <EmailCta />
              <CopiarEmail />
              <a href={LINKS.github}>github</a>
              <a href={LINKS.linkedin}>linkedin</a>
            </div>
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
